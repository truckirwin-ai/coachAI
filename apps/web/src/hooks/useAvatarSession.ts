/**
 * useAvatarSession — Full conversation management for LiveAvatar coaching sessions
 *
 * Audio architecture (echo suppression — three layers):
 *
 * Layer 1 — Hard mute during avatar speech
 *   AVATAR_SPEAK_STARTED → vc.mute() immediately (no state guard)
 *   AVATAR_SPEAK_ENDED   → unmute after POST_SPEAK_MS (1000ms) cooldown
 *   Unmute is blocked if avatarSpeakingRef is still true (race guard)
 *
 * Layer 2 — AEC warm-up
 *   Mic starts defaultMuted. Unmutes after AEC_WARMUP_MS (2500ms).
 *   Gives Chrome AEC3 time to learn the audio path before any playback.
 *
 * Layer 3 — Word-overlap transcript filter
 *   If a transcript arrives that is ≥70% word-overlap with the last avatar
 *   utterance AND is longer than 3 words → it's echo. Drop it.
 *
 * USER_SPEAK_STARTED is never used for interrupt() — UI indicator only.
 * Barge-in is manual (interrupt button in footer).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LiveAvatarSession,
  SessionState,
  SessionEvent,
  VoiceChatEvent,
  VoiceChatState,
  AgentEventsEnum,
} from '@heygen/liveavatar-web-sdk';
import type { SessionDisconnectReason } from '@heygen/liveavatar-web-sdk';
import { createAvatarSession } from '../api/liveavatar';
import { sendCoachMessage } from '../api/claude';
import type { ClaudeMessage } from '../api/claude';
import type { CoachDef } from '../data/coaches';
import { buildGreeting, buildTopicTransition } from '../data/coaches';
import { useLastSessionStore } from '../store/lastSessionStore';
import type { PersistedMessage } from '../store/lastSessionStore';

const AEC_WARMUP_MS = 2500; // let Chrome AEC3 adapt before first unmute
const POST_SPEAK_MS = 1000; // cooldown after avatar stops — echo dies out
const ECHO_OVERLAP_THRESHOLD = 0.70; // word overlap ratio to flag as echo
const ECHO_MIN_WORDS = 3;             // ignore overlap check on short phrases

function wordOverlap(a: string, b: string): number {
  if (!a || !b) return 0;
  const setA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;
  let matches = 0;
  setA.forEach(w => { if (setB.has(w)) matches++; });
  return matches / Math.max(setA.size, setB.size);
}

export function useAvatarSession(initialHistory?: PersistedMessage[]) {
  const [sessionState,     setSessionState]     = useState<SessionState>(SessionState.INACTIVE);
  const [streamReady,      setStreamReady]       = useState(false);
  const [micState,         setMicState]          = useState<VoiceChatState>(VoiceChatState.INACTIVE);
  const [micError,         setMicError]          = useState<string | null>(null);
  const [error,            setError]             = useState<string | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking]  = useState(false);
  const [isUserSpeaking,   setIsUserSpeaking]    = useState(false);

  const sessionRef         = useRef<LiveAvatarSession | null>(null);
  const videoElRef         = useRef<HTMLVideoElement | null>(null);
  const historyRef         = useRef<ClaudeMessage[]>(initialHistory ?? []);
  const coachIdRef         = useRef<string>('');
  const topicIdRef         = useRef<string | undefined>(undefined);
  const topicLabelRef      = useRef<string>('');
  const processingRef      = useRef(false);
  const unmutTimer         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatarSpeakingRef  = useRef(false);       // synchronous version for race guard
  const lastAvatarText     = useRef('');          // for word-overlap echo filter

  const systemRef   = useRef<string>('You are a professional coach. Be concise and Socratic.');
  const skillRef    = useRef<string>('Coaching');
  const greetingRef = useRef<string>("Hi! I'm your coach. What are you working through today?");
  const { saveSession } = useLastSessionStore();
  const greetingSentRef    = useRef<boolean>(false); // prevents echo-suppressing the greeting
  const greetingConfirmed  = useRef<boolean>(false); // set true when AVATAR_SPEAK_STARTED fires
  const greetingRetryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Mute/unmute — no state guards, always attempt ─────────────────
  // In SDK 0.0.11, AVATAR_SPEAK_STARTED/ENDED now fire via LiveKit data channel,
  // so muting the mic here reliably prevents HeyGen's STT from hearing the
  // avatar's own voice and echoing it back as user speech ("Hi Denise" bug).
  const muteMic = useCallback(() => {
    try { sessionRef.current?.voiceChat?.mute(); } catch {}
  }, []);

  const unmuteMic = useCallback(() => {
    // Don't unmute if avatar is still talking (race condition guard)
    if (avatarSpeakingRef.current) return;
    try { sessionRef.current?.voiceChat?.unmute(); } catch {}
  }, []);

  const scheduleUnmute = useCallback((delayMs: number) => {
    if (unmutTimer.current) clearTimeout(unmutTimer.current);
    unmutTimer.current = setTimeout(unmuteMic, delayMs);
  }, [unmuteMic]);

  // ── Start session (must be called from a user click for AudioContext) ──
  const startSession = useCallback(async (coach: CoachDef, topic?: string, resumeHistory?: PersistedMessage[]) => {
    // Track for persistence + topic transitions
    coachRef.current      = coach;
    coachIdRef.current    = coach.id;
    topicIdRef.current    = topic;
    topicLabelRef.current = coach.specialty;

    // Seed conversation history — resume if provided, else fresh
    if (resumeHistory && resumeHistory.length > 0) {
      historyRef.current = resumeHistory;
      const lastExchange = resumeHistory.filter(m => m.role === 'assistant').slice(-1)[0];
      const lastLine = lastExchange?.content?.split(/[.!?]/)[0]?.trim() ?? '';
      greetingRef.current = `Welcome back. Last time we were on ${lastLine ? `"${lastLine.slice(0, 60)}…"` : topic ?? 'your coaching session'}. Ready to pick up where we left off?`;
    } else {
      historyRef.current   = [];
      greetingRef.current  = buildGreeting(coach, topic);
    }

    systemRef.current        = coach.systemPrompt;
    skillRef.current         = coach.specialty;
    greetingSentRef.current  = false;
    greetingConfirmed.current = false;
    if (greetingRetryTimer.current) clearTimeout(greetingRetryTimer.current);

    async function init() {
      try {
        setSessionState(SessionState.CONNECTING);
        const { session_token } = await createAvatarSession(coach);
        const session = new LiveAvatarSession(session_token, { voiceChat: false });
        sessionRef.current = session;

        // ── Patch: force text-speak commands through LiveKit, not WebSocket ────
        // SDK bug: sendCommandEvent prefers WebSocket when open, but
        // sendCommandEventToWebSocket has no handler for avatar.speak_response
        // or avatar.speak_text — they fall to default: {} and are silently dropped.
        // Interrupt and listen commands still go through WebSocket (they are handled).
        const TEXT_SPEAK_COMMANDS = new Set(['avatar.speak_response', 'avatar.speak_text']);
        const _origSend = (session as any).sendCommandEvent.bind(session);
        (session as any).sendCommandEvent = (cmd: any) => {
          if (TEXT_SPEAK_COMMANDS.has(cmd.event_type) && (session as any).room?.state === 'connected') {
            const data = new TextEncoder().encode(JSON.stringify(cmd));
            (session as any).room.localParticipant.publishData(data, { reliable: true, topic: 'agent-control' });
          } else {
            _origSend(cmd);
          }
        };
        // ─────────────────────────────────────────────────────────────────────

        // ── Hard timeout: if CONNECTED hasn't fired within 20s, bail out ──
        const startTimeout = setTimeout(() => {
          if (sessionRef.current === session) {
            console.warn('[Coach] Session start timed out after 20s');
            setError('Unable to connect — avatar service is taking too long. Try again in a moment.');
            setSessionState(SessionState.DISCONNECTED);
            try { session.stop(); } catch {}
          }
        }, 20000);

        // ── Greeting with retry ───────────────────────────────────────
        const attemptGreeting = (attemptsLeft: number) => {
          if (greetingConfirmed.current) return; // AVATAR_SPEAK_STARTED already confirmed
          lastAvatarText.current = greetingRef.current;
          if (!greetingSentRef.current) {
            greetingSentRef.current = true;
            historyRef.current = [{ role: 'assistant', content: greetingRef.current }];
          }
          session.message(greetingRef.current);
          console.log(`[Coach] Greeting attempt ${4 - attemptsLeft}/3`);
          if (attemptsLeft > 0) {
            greetingRetryTimer.current = setTimeout(() => attemptGreeting(attemptsLeft - 1), 5000);
          }
        };

        // ── Lifecycle ────────────────────────────────────────────────
        session.on(SessionEvent.SESSION_STATE_CHANGED, (s: SessionState) => {
          setSessionState(s);
          if (s === SessionState.CONNECTED) {
            clearTimeout(startTimeout); // cancel the hard timeout — we made it
            if (!greetingSentRef.current) {
              attemptGreeting(3); // up to 3 retries every 5s until confirmed
            }
          }
        });

        session.on(SessionEvent.SESSION_DISCONNECTED, (reason: SessionDisconnectReason) => {
          setError(`Session disconnected: ${reason}`);
          setSessionState(SessionState.DISCONNECTED);
          setStreamReady(false);
          if (unmutTimer.current) clearTimeout(unmutTimer.current);
        });

        session.on(SessionEvent.SESSION_STREAM_READY, async () => {
          setStreamReady(true);

          // Video element might not be in the DOM yet if autoStart triggered a React re-render
          // Poll up to 2s to wait for it to mount
          const waitForVideoEl = (): Promise<HTMLVideoElement | null> =>
            new Promise(resolve => {
              if (videoElRef.current) return resolve(videoElRef.current);
              let elapsed = 0;
              const t = setInterval(() => {
                elapsed += 50;
                if (videoElRef.current || elapsed >= 2000) {
                  clearInterval(t);
                  resolve(videoElRef.current);
                }
              }, 50);
            });

          const el = await waitForVideoEl();
          if (el) {
            session.attach(el);
            // Play muted first — guaranteed autoplay in all browsers
            // Unmute immediately after so the user hears the avatar
            el.muted = true;
            el.play()
              .then(() => { el.muted = false; })
              .catch(() => { el.muted = false; });
            console.log('[Coach] Video attached and playing');
          } else {
            console.warn('[Coach] Video element never mounted — audio may not play');
          }

          // Start mic (separate from video attach)
          try {
            await session.voiceChat.start({ defaultMuted: true });
            scheduleUnmute(AEC_WARMUP_MS);
            console.log('[Coach] VoiceChat started');
          } catch (e: any) {
            const msg = e?.message ?? String(e);
            console.warn('[Coach] VoiceChat start failed:', msg);
            setMicError(
              msg.includes('NotAllowed') || msg.includes('ermission')
                ? 'Mic blocked — allow microphone access in browser settings'
                : `Mic error: ${msg}`
            );
          }

          // Greeting is sent from SESSION_STATE_CHANGED → CONNECTED (deterministic)
        });

        // ── Layer 1: Mute during avatar speech ───────────────────────
        session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
          // Cancel greeting retry loop — avatar is speaking, it worked
          if (!greetingConfirmed.current) {
            greetingConfirmed.current = true;
            if (greetingRetryTimer.current) clearTimeout(greetingRetryTimer.current);
            console.log('[Coach] Greeting confirmed by AVATAR_SPEAK_STARTED');
          }
          avatarSpeakingRef.current = true;
          setIsAvatarSpeaking(true);
          if (unmutTimer.current) clearTimeout(unmutTimer.current);
          muteMic();
        });

        session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
          avatarSpeakingRef.current = false;
          setIsAvatarSpeaking(false);
          scheduleUnmute(POST_SPEAK_MS);
        });

        // ── User speech — UI indicator only ─────────────────────────
        session.on(AgentEventsEnum.USER_SPEAK_STARTED, () => setIsUserSpeaking(true));
        session.on(AgentEventsEnum.USER_SPEAK_ENDED,   () => setIsUserSpeaking(false));

        // ── Layer 3: Transcript + word-overlap echo filter ───────────
        session.on(AgentEventsEnum.USER_TRANSCRIPTION, async (event: any) => {
          const text = event?.text?.trim();
          if (!text) return;

          // ── Echo filter FIRST — before anything else ─────────────
          // If this transcript is the avatar's own speech echoed through the mic,
          // suppress it and DO NOT call interrupt() (that would kill the greeting/response).
          const words = text.split(/\s+/).filter(Boolean);
          if (greetingSentRef.current && words.length > ECHO_MIN_WORDS) {
            const overlap = wordOverlap(text, lastAvatarText.current);
            if (overlap >= ECHO_OVERLAP_THRESHOLD) {
              if (!greetingConfirmed.current) {
                greetingConfirmed.current = true;
                if (greetingRetryTimer.current) clearTimeout(greetingRetryTimer.current);
                console.log('[Coach] Greeting confirmed via echo suppression');
              }
              console.log(`[Coach] Echo suppressed (${Math.round(overlap * 100)}% overlap): "${text}"`);
              return; // ← exit before interrupt — never kill our own audio
            }
          }

          if (processingRef.current) return;

          // Kill HeyGen's built-in LLM — only fires for genuine user speech, never echoes
          try { session.interrupt(); } catch {}

          console.log('[Coach] User:', text);
          processingRef.current = true;
          historyRef.current.push({ role: 'user', content: text });

          try {
            let response = '';
            await sendCoachMessage(
              historyRef.current,
              skillRef.current,
              'Avatar Voice Session',
              (token) => { response += token; },
              systemRef.current,
            );
            if (response) {
              lastAvatarText.current = response;
              historyRef.current.push({ role: 'assistant', content: response });
              // Persist session so dashboard always shows latest and resume works
              saveSession(coachIdRef.current, topicIdRef.current, topicLabelRef.current, historyRef.current);
              session.message(response);
            }
          } catch (e) {
            console.error('[Coach] Claude error:', e);
          } finally {
            processingRef.current = false;
          }
        });

        // ── VoiceChat state ──────────────────────────────────────────
        session.voiceChat.on(VoiceChatEvent.STATE_CHANGED, (s: VoiceChatState) => {
          setMicState(s);
          if (s === VoiceChatState.ACTIVE) setMicError(null);
        });
        session.voiceChat.on(VoiceChatEvent.MUTED,   () => setMicState(VoiceChatState.INACTIVE));
        session.voiceChat.on(VoiceChatEvent.UNMUTED, () => setMicState(VoiceChatState.ACTIVE));

        session.start();
      } catch (e: any) {
        setError(e.message || 'Failed to initialize session');
        setSessionState(SessionState.DISCONNECTED);
      }
    }

    init();
  }, [muteMic, scheduleUnmute]);

  // ── Manual barge-in button ───────────────────────────────────────
  const interrupt = useCallback(() => {
    sessionRef.current?.interrupt();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (unmutTimer.current) clearTimeout(unmutTimer.current);
      if (greetingRetryTimer.current) clearTimeout(greetingRetryTimer.current);
      sessionRef.current?.stop();
      sessionRef.current = null;
    };
  }, []);

  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el;
    if (el && sessionRef.current && streamReady) {
      sessionRef.current.attach(el);
      el.play().catch(() => {});
    }
  }, [streamReady]);

  const sendMessage  = useCallback((text: string) => { sessionRef.current?.message(text); }, []);

  // ── Topic change: coach wraps current thread and opens new one ────
  const coachRef = useRef<CoachDef | null>(null);
  const changeTopic = useCallback((fromTopicLabel: string, toTopicLabel: string, toTopicId: string) => {
    if (!sessionRef.current || !coachRef.current) return;
    const transitionText = buildTopicTransition(coachRef.current, fromTopicLabel, toTopicLabel);
    // Update skill context so subsequent Claude responses use the new topic
    skillRef.current = toTopicLabel;
    topicIdRef.current = toTopicId;
    topicLabelRef.current = toTopicLabel;
    // Push topic shift into history so Claude has context
    historyRef.current.push({
      role: 'user',
      content: `[Topic changed to: ${toTopicLabel}]`,
    });
    historyRef.current.push({
      role: 'assistant',
      content: transitionText,
    });
    lastAvatarText.current = transitionText;
    sessionRef.current.message(transitionText);
  }, []);
  const setMicDevice = useCallback(async (deviceId: string) => sessionRef.current?.voiceChat.setDevice(deviceId) ?? false, []);
  const retryMic     = useCallback(async () => {
    if (!sessionRef.current) return;
    setMicError(null);
    try {
      sessionRef.current.voiceChat.stop();
      await sessionRef.current.voiceChat.start({ defaultMuted: false });
    } catch (e: any) { setMicError(e?.message || 'Mic failed to start'); }
  }, []);

  return {
    sessionState, streamReady, micState, micError,
    isAvatarSpeaking, isUserSpeaking, error,
    greetingSent: greetingSentRef.current, greetingConfirmed: greetingConfirmed.current,
    startSession, attachVideo, sendMessage, changeTopic,
    interrupt, setMicDevice, retryMic, sessionRef,
  };
}
