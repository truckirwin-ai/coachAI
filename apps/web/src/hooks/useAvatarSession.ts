/**
 * useAvatarSession — Standardized avatar session lifecycle for all coaches.
 *
 * ── Guaranteed startup order (identical for every coach) ──────────────────
 *
 *  1. session.start() → SDK connects LiveKit room + WebSocket
 *  2. SESSION_STATE_CHANGED → CONNECTED
 *     a. Apply sendCommandEvent patch (LiveKit route for speak commands)
 *     b. Start voiceChat (mic, defaultMuted: true)
 *     c. Schedule AEC warm-up unmute (2500ms)
 *     d. Send greeting
 *  3. SESSION_STREAM_READY → attach video element, play
 *
 *  Greeting never fires before the mic pipeline is ready.
 *  Video attach never blocks the greeting.
 *
 * ── Echo suppression — three layers ──────────────────────────────────────
 *
 *  Layer 1 — Hard mute during avatar speech
 *    AVATAR_SPEAK_STARTED → vc.mute() (fires via LiveKit in SDK 0.0.11)
 *    AVATAR_SPEAK_ENDED   → unmute after POST_SPEAK_MS cooldown
 *
 *  Layer 2 — AEC warm-up
 *    Mic starts defaultMuted=true. Unmutes after 2500ms.
 *
 *  Layer 3 — Word-overlap transcript filter
 *    ≥70% word overlap with last avatar utterance + >3 words → drop as echo.
 *
 * ── SDK patch (sdk 0.0.11 bug) ────────────────────────────────────────────
 *  sendCommandEvent routes to WebSocket when open. WebSocket path has no
 *  handler for avatar.speak_response / avatar.speak_text → silently dropped.
 *  Patch: force TEXT_SPEAK_COMMANDS through LiveKit data channel directly.
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
import { useUserStore } from '../store/userStore';

// ── Constants (same for every coach) ─────────────────────────────────────
const AEC_WARMUP_MS          = 2500;  // let Chrome AEC3 learn the audio path
const POST_SPEAK_MS          = 1000;  // cooldown after avatar stops speaking
const SESSION_TIMEOUT_MS     = 20000; // bail if CONNECTED never fires
const GREETING_RETRY_DELAY   = 5000; // retry greeting if SPEAK_STARTED never confirms
const GREETING_MAX_RETRIES   = 2;    // max retries (first send + 2 = 3 total)
const ECHO_OVERLAP_THRESHOLD = 0.70;
const ECHO_MIN_WORDS         = 3;

// SDK patch: these commands must route via LiveKit, not WebSocket
const TEXT_SPEAK_COMMANDS = new Set(['avatar.speak_response', 'avatar.speak_text']);
const LIVEKIT_COMMAND_TOPIC = 'agent-control';

// ── Helpers ───────────────────────────────────────────────────────────────
function wordOverlap(a: string, b: string): number {
  if (!a || !b) return 0;
  const setA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let hits = 0;
  setA.forEach(w => { if (setB.has(w)) hits++; });
  return hits / Math.max(setA.size, setB.size);
}

/**
 * Apply the LiveKit routing patch to a session instance.
 * Idempotent — safe to call multiple times (no-op if already patched).
 */
function patchSendCommandEvent(session: LiveAvatarSession) {
  const s = session as any;
  if (s.__patched) return;
  const orig = s.sendCommandEvent.bind(s);
  s.sendCommandEvent = (cmd: any) => {
    if (TEXT_SPEAK_COMMANDS.has(cmd.event_type) && s.room?.state === 'connected') {
      const data = new TextEncoder().encode(JSON.stringify(cmd));
      s.room.localParticipant.publishData(data, { reliable: true, topic: LIVEKIT_COMMAND_TOPIC });
    } else {
      orig(cmd);
    }
  };
  s.__patched = true;
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAvatarSession(initialHistory?: PersistedMessage[]) {
  const [sessionState,     setSessionState]    = useState<SessionState>(SessionState.INACTIVE);
  const [streamReady,      setStreamReady]     = useState(false);
  const [micState,         setMicState]        = useState<VoiceChatState>(VoiceChatState.INACTIVE);
  const [micError,         setMicError]        = useState<string | null>(null);
  const [error,            setError]           = useState<string | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isUserSpeaking,   setIsUserSpeaking]  = useState(false);

  // ── Refs (stable across renders) ─────────────────────────────────
  const sessionRef          = useRef<LiveAvatarSession | null>(null);
  const videoElRef          = useRef<HTMLVideoElement | null>(null);
  const coachRef            = useRef<CoachDef | null>(null);
  const historyRef          = useRef<ClaudeMessage[]>(initialHistory ?? []);
  const systemRef           = useRef<string>('');
  const skillRef            = useRef<string>('');
  const greetingRef         = useRef<string>('');
  const lastAvatarText      = useRef<string>('');
  const coachIdRef          = useRef<string>('');
  const topicIdRef          = useRef<string | undefined>(undefined);
  const topicLabelRef       = useRef<string>('');
  const processingRef       = useRef(false);
  const avatarSpeakingRef   = useRef(false);
  const greetingSentRef     = useRef(false);
  const greetingConfirmed   = useRef(false);
  const unmutTimer          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greetingRetryTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { saveSession } = useLastSessionStore();
  const userName = useUserStore(s => s.name);

  // ── Mic helpers ───────────────────────────────────────────────────
  const muteMic = useCallback(() => {
    try { sessionRef.current?.voiceChat?.mute(); } catch {}
  }, []);

  const unmuteMic = useCallback(() => {
    if (avatarSpeakingRef.current) return; // race guard
    try { sessionRef.current?.voiceChat?.unmute(); } catch {}
  }, []);

  const scheduleUnmute = useCallback((delayMs: number) => {
    if (unmutTimer.current) clearTimeout(unmutTimer.current);
    unmutTimer.current = setTimeout(unmuteMic, delayMs);
  }, [unmuteMic]);

  // ── Video attach helper ───────────────────────────────────────────
  const attachVideoToSession = useCallback(async (session: LiveAvatarSession) => {
    // Poll up to 2s for the video element to mount (autoStart re-renders React tree)
    const el = await new Promise<HTMLVideoElement | null>(resolve => {
      if (videoElRef.current) return resolve(videoElRef.current);
      let ms = 0;
      const t = setInterval(() => {
        ms += 50;
        if (videoElRef.current || ms >= 2000) { clearInterval(t); resolve(videoElRef.current); }
      }, 50);
    });

    if (!el) { console.warn('[Coach] Video element never mounted'); return; }
    session.attach(el);
    el.muted = true;
    el.play().then(() => { el.muted = false; }).catch(() => { el.muted = false; });
  }, []);

  // ── Core: start session ───────────────────────────────────────────
  const startSession = useCallback(async (
    coach: CoachDef,
    topic?: string,
    resumeHistory?: PersistedMessage[]
  ) => {
    // ── Reset all per-session state ───────────────────────────────
    coachRef.current          = coach;
    coachIdRef.current        = coach.id;
    topicIdRef.current        = topic;
    topicLabelRef.current     = coach.specialty;
    systemRef.current         = coach.systemPrompt;
    skillRef.current          = coach.specialty;
    processingRef.current     = false;
    avatarSpeakingRef.current = false;
    greetingSentRef.current   = false;
    greetingConfirmed.current = false;
    lastAvatarText.current    = '';

    if (greetingRetryTimer.current) { clearTimeout(greetingRetryTimer.current); greetingRetryTimer.current = null; }
    if (unmutTimer.current)         { clearTimeout(unmutTimer.current); unmutTimer.current = null; }

    // ── Seed history ──────────────────────────────────────────────
    const u = userName?.trim() || 'there';
    if (resumeHistory && resumeHistory.length > 0) {
      historyRef.current = [...resumeHistory];
      const lastAssistant = resumeHistory.filter(m => m.role === 'assistant').slice(-1)[0];
      const lastSnippet   = lastAssistant?.content?.split(/[.!?]/)[0]?.trim() ?? '';
      greetingRef.current = `Welcome back, ${u}. Last time we were on "${lastSnippet ? lastSnippet.slice(0, 60) + '…' : (topic ?? 'your session')}". Ready to pick up where we left off?`;
    } else {
      historyRef.current  = [];
      greetingRef.current = buildGreeting(coach, topic, userName);
    }

    setError(null);
    setStreamReady(false);

    async function init() {
      let session: LiveAvatarSession | null = null;
      try {
        setSessionState(SessionState.CONNECTING);
        const { session_token } = await createAvatarSession(coach);

        // Construct session — voiceChat: false = we control mic start manually
        session = new LiveAvatarSession(session_token, { voiceChat: false });
        sessionRef.current = session;

        // Apply LiveKit routing patch immediately after construction
        patchSendCommandEvent(session);

        // ── Hard connect timeout ─────────────────────────────────
        const connectTimeout = setTimeout(() => {
          if (sessionRef.current !== session) return;
          console.warn('[Coach] Session connect timed out');
          setError('Unable to connect — avatar service is taking too long. Try again in a moment.');
          setSessionState(SessionState.DISCONNECTED);
          try { session?.stop(); } catch {}
        }, SESSION_TIMEOUT_MS);

        // ── Greeting helper (with retry) ─────────────────────────
        // Uses session.repeat() → AVATAR_SPEAK_TEXT: direct TTS command.
        // Do NOT use session.message() for greetings — in FULL mode,
        // AVATAR_SPEAK_RESPONSE is treated as an LLM reply to user input,
        // which causes HeyGen's LLM to process it and generate its own
        // response, resulting in swapped names and wrong introductions.
        const sendGreeting = (retriesLeft: number) => {
          if (greetingConfirmed.current) return;
          const text = greetingRef.current;
          lastAvatarText.current = text;
          if (!greetingSentRef.current) {
            greetingSentRef.current = true;
            // Seed history with greeting so Claude has context
            if (historyRef.current.length === 0 || historyRef.current[0]?.content !== text) {
              historyRef.current = [{ role: 'assistant', content: text }, ...historyRef.current.filter(m => m.role !== 'assistant' || m.content !== text)];
            }
          }
          // interrupt() first — cuts any HeyGen auto-greeting that may have started
          try { session?.interrupt(); } catch {}
          session?.repeat(text);  // ← AVATAR_SPEAK_TEXT: speak directly, no LLM
          console.log(`[Coach:${coach.id}] Greeting sent (${GREETING_MAX_RETRIES - retriesLeft + 1}/${GREETING_MAX_RETRIES + 1})`);
          if (retriesLeft > 0) {
            greetingRetryTimer.current = setTimeout(() => sendGreeting(retriesLeft - 1), GREETING_RETRY_DELAY);
          }
        };

        // ── EVENT: Session state ─────────────────────────────────
        session.on(SessionEvent.SESSION_STATE_CHANGED, async (s: SessionState) => {
          setSessionState(s);

          if (s === SessionState.CONNECTED) {
            clearTimeout(connectTimeout);
            console.log(`[Coach:${coach.id}] Connected — starting mic then greeting`);

            // Step 1: Start mic (muted) — must happen before greeting
            try {
              await session!.voiceChat.start({ defaultMuted: true });
              scheduleUnmute(AEC_WARMUP_MS);
              console.log(`[Coach:${coach.id}] VoiceChat ready`);
            } catch (e: any) {
              const msg = String(e?.message ?? e);
              console.warn(`[Coach:${coach.id}] VoiceChat start failed:`, msg);
              setMicError(
                msg.includes('NotAllowed') || msg.includes('ermission')
                  ? 'Mic blocked — allow microphone access in browser settings'
                  : `Mic error: ${msg}`
              );
            }

            // Step 2: Send greeting (mic is now set up, muting will work)
            sendGreeting(GREETING_MAX_RETRIES);
          }
        });

        // ── EVENT: Stream ready → attach video ───────────────────
        session.on(SessionEvent.SESSION_STREAM_READY, async () => {
          setStreamReady(true);
          console.log(`[Coach:${coach.id}] Stream ready — attaching video`);
          await attachVideoToSession(session!);
        });

        // ── EVENT: Disconnected ──────────────────────────────────
        session.on(SessionEvent.SESSION_DISCONNECTED, (reason: SessionDisconnectReason) => {
          console.warn(`[Coach:${coach.id}] Disconnected:`, reason);
          setError(`Session disconnected: ${reason}`);
          setSessionState(SessionState.DISCONNECTED);
          setStreamReady(false);
          if (unmutTimer.current) clearTimeout(unmutTimer.current);
        });

        // ── EVENT: Avatar speak start → mute mic ─────────────────
        session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
          if (!greetingConfirmed.current) {
            greetingConfirmed.current = true;
            if (greetingRetryTimer.current) { clearTimeout(greetingRetryTimer.current); greetingRetryTimer.current = null; }
            console.log(`[Coach:${coach.id}] Greeting confirmed`);
          }
          avatarSpeakingRef.current = true;
          setIsAvatarSpeaking(true);
          if (unmutTimer.current) clearTimeout(unmutTimer.current);
          muteMic();
        });

        // ── EVENT: Avatar speak end → schedule unmute ────────────
        session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
          avatarSpeakingRef.current = false;
          setIsAvatarSpeaking(false);
          scheduleUnmute(POST_SPEAK_MS);
        });

        // ── EVENT: User speech indicators (UI only) ──────────────
        session.on(AgentEventsEnum.USER_SPEAK_STARTED, () => setIsUserSpeaking(true));
        session.on(AgentEventsEnum.USER_SPEAK_ENDED,   () => setIsUserSpeaking(false));

        // ── EVENT: User transcription → Claude → avatar speaks ───
        session.on(AgentEventsEnum.USER_TRANSCRIPTION, async (event: any) => {
          const text = event?.text?.trim();
          if (!text) return;

          // Layer 3 echo filter — check BEFORE interrupt
          const words = text.split(/\s+/).filter(Boolean);
          if (greetingSentRef.current && words.length > ECHO_MIN_WORDS) {
            const overlap = wordOverlap(text, lastAvatarText.current);
            if (overlap >= ECHO_OVERLAP_THRESHOLD) {
              if (!greetingConfirmed.current) {
                greetingConfirmed.current = true;
                if (greetingRetryTimer.current) { clearTimeout(greetingRetryTimer.current); greetingRetryTimer.current = null; }
              }
              console.log(`[Coach:${coach.id}] Echo suppressed (${Math.round(overlap * 100)}%): "${text}"`);
              return;
            }
          }

          if (processingRef.current) return;

          // Genuine user speech — cut HeyGen's built-in LLM response
          try { session?.interrupt(); } catch {}

          console.log(`[Coach:${coach.id}] User: "${text}"`);
          processingRef.current = true;
          historyRef.current.push({ role: 'user', content: text });

          try {
            let response = '';
            await sendCoachMessage(
              historyRef.current,
              skillRef.current,
              'Avatar Voice Session',
              (token: string) => { response += token; },
              systemRef.current,
            );
            if (response) {
              lastAvatarText.current = response;
              historyRef.current.push({ role: 'assistant', content: response });
              saveSession(coachIdRef.current, topicIdRef.current, topicLabelRef.current, historyRef.current);
              session?.message(response);
            }
          } catch (e) {
            console.error(`[Coach:${coach.id}] Claude error:`, e);
          } finally {
            processingRef.current = false;
          }
        });

        // ── VoiceChat state sync ──────────────────────────────────
        session.voiceChat.on(VoiceChatEvent.STATE_CHANGED, (s: VoiceChatState) => {
          setMicState(s);
          if (s === VoiceChatState.ACTIVE) setMicError(null);
        });
        session.voiceChat.on(VoiceChatEvent.MUTED,   () => setMicState(VoiceChatState.INACTIVE));
        session.voiceChat.on(VoiceChatEvent.UNMUTED, () => setMicState(VoiceChatState.ACTIVE));

        // ── GO ────────────────────────────────────────────────────
        session.start();

      } catch (e: any) {
        console.error('[Coach] Session init error:', e);
        setError(e.message || 'Failed to initialize session');
        setSessionState(SessionState.DISCONNECTED);
      }
    }

    init();
  }, [muteMic, scheduleUnmute, attachVideoToSession, saveSession]);

  // ── Topic change: coach speaks the handoff ────────────────────────
  const changeTopic = useCallback((fromTopicLabel: string, toTopicLabel: string, toTopicId: string) => {
    const session = sessionRef.current;
    const coach   = coachRef.current;
    if (!session || !coach) return;

    const text = buildTopicTransition(coach, fromTopicLabel, toTopicLabel);
    skillRef.current       = toTopicLabel;
    topicIdRef.current     = toTopicId;
    topicLabelRef.current  = toTopicLabel;
    lastAvatarText.current = text;
    historyRef.current.push({ role: 'user',      content: `[Topic changed to: ${toTopicLabel}]` });
    historyRef.current.push({ role: 'assistant', content: text });
    // repeat() = AVATAR_SPEAK_TEXT: direct TTS, not processed by HeyGen's LLM
    try { session.interrupt(); } catch {}
    session.repeat(text);
  }, []);

  // ── Manual barge-in ───────────────────────────────────────────────
  const interrupt = useCallback(() => {
    try { sessionRef.current?.interrupt(); } catch {}
  }, []);

  // ── Attach video element from outside ────────────────────────────
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el;
    if (el && sessionRef.current && streamReady) {
      sessionRef.current.attach(el);
      el.play().catch(() => {});
    }
  }, [streamReady]);

  // ── Mic device / retry ────────────────────────────────────────────
  const setMicDevice = useCallback(async (deviceId: string) => {
    return sessionRef.current?.voiceChat.setDevice(deviceId) ?? false;
  }, []);

  const retryMic = useCallback(async () => {
    if (!sessionRef.current) return;
    setMicError(null);
    try {
      sessionRef.current.voiceChat.stop();
      await sessionRef.current.voiceChat.start({ defaultMuted: false });
    } catch (e: any) {
      setMicError(e?.message || 'Mic failed to start');
    }
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (unmutTimer.current)         clearTimeout(unmutTimer.current);
      if (greetingRetryTimer.current) clearTimeout(greetingRetryTimer.current);
      try { sessionRef.current?.stop(); } catch {}
      sessionRef.current = null;
    };
  }, []);

  return {
    sessionState, streamReady, micState, micError,
    isAvatarSpeaking, isUserSpeaking, error,
    startSession, attachVideo, sendMessage: (t: string) => sessionRef.current?.message(t),
    changeTopic, interrupt, setMicDevice, retryMic, sessionRef,
  };
}
