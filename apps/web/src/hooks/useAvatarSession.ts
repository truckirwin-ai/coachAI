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
import { buildGreeting } from '../data/coaches';

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

export function useAvatarSession() {
  const [sessionState,     setSessionState]     = useState<SessionState>(SessionState.INACTIVE);
  const [streamReady,      setStreamReady]       = useState(false);
  const [micState,         setMicState]          = useState<VoiceChatState>(VoiceChatState.INACTIVE);
  const [micError,         setMicError]          = useState<string | null>(null);
  const [error,            setError]             = useState<string | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking]  = useState(false);
  const [isUserSpeaking,   setIsUserSpeaking]    = useState(false);

  const sessionRef         = useRef<LiveAvatarSession | null>(null);
  const videoElRef         = useRef<HTMLVideoElement | null>(null);
  const historyRef         = useRef<ClaudeMessage[]>([]);
  const processingRef      = useRef(false);
  const unmutTimer         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatarSpeakingRef  = useRef(false);       // synchronous version for race guard
  const lastAvatarText     = useRef('');          // for word-overlap echo filter

  const systemRef   = useRef<string>('You are a professional coach. Be concise and Socratic.');
  const skillRef    = useRef<string>('Coaching');
  const greetingRef = useRef<string>("Hi! I'm your coach. What are you working through today?");
  const greetingSentRef = useRef<boolean>(false); // prevents echo-suppressing the greeting

  // ── Mute/unmute — no state guards, always attempt ─────────────────
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
  const startSession = useCallback(async (coach: CoachDef, topic?: string) => {
    greetingRef.current   = buildGreeting(coach, topic);
    systemRef.current     = coach.systemPrompt;
    skillRef.current      = coach.specialty;
    greetingSentRef.current = false;

    async function init() {
      try {
        setSessionState(SessionState.CONNECTING);
        const { session_token } = await createAvatarSession(coach);
        const session = new LiveAvatarSession(session_token, { voiceChat: false });
        sessionRef.current = session;

        // ── Lifecycle ────────────────────────────────────────────────
        session.on(SessionEvent.SESSION_STATE_CHANGED, (s: SessionState) => {
          setSessionState(s);
          // Send greeting exactly once when session reaches CONNECTED state
          if (s === SessionState.CONNECTED && !greetingSentRef.current) {
            greetingSentRef.current = true;
            lastAvatarText.current = greetingRef.current;
            historyRef.current = [{ role: 'assistant', content: greetingRef.current }];
            setTimeout(() => session.message(greetingRef.current), 400);
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

          if (videoElRef.current) {
            session.attach(videoElRef.current);
            videoElRef.current.play().catch(() => {});
          }

          // Start mic first — greeting fires after voiceChat is confirmed ready
          try {
            await session.voiceChat.start({ defaultMuted: true });
            scheduleUnmute(AEC_WARMUP_MS);
          } catch (e: any) {
            const msg = e?.message ?? String(e);
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
          if (!text || processingRef.current) return;

          // Kill HeyGen's built-in LLM response before it speaks — we'll use Claude instead
          try { session.interrupt(); } catch {}

          // Drop transcript if it's likely the avatar's own echo
          // Exception: never suppress during greeting window (first 8s after session starts)
          const words = text.split(/\s+/).filter(Boolean);
          if (greetingSentRef.current && words.length > ECHO_MIN_WORDS) {
            const overlap = wordOverlap(text, lastAvatarText.current);
            if (overlap >= ECHO_OVERLAP_THRESHOLD) {
              console.log(`[Coach] Echo suppressed (${Math.round(overlap * 100)}% overlap): "${text}"`);
              return;
            }
          }

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
    startSession, attachVideo, sendMessage,
    interrupt, setMicDevice, retryMic, sessionRef,
  };
}
