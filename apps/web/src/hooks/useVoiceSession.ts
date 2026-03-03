import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceSessionOptions {
  onTranscript: (text: string) => void;
  onSend: (text: string) => void;
  onBargeIn?: () => void;
  enabled: boolean;
  isSpeaking?: boolean;
}

// Energy threshold for barge-in (0–1). Echo bleed after cancellation is ~0.02–0.05.
// Real voice is typically 0.08+. Tune this if too sensitive or not sensitive enough.
const BARGE_IN_THRESHOLD = 0.07;

export function useVoiceSession({
  onTranscript, onSend, onBargeIn, enabled, isSpeaking = false,
}: UseVoiceSessionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micUnavailable, setMicUnavailable] = useState(false);

  const recognitionRef  = useRef<any>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const isEnabledRef    = useRef(enabled);
  const isSpeakingRef   = useRef(isSpeaking);
  const bargeInFiredRef = useRef(false); // prevent repeated barge-in fires

  // Audio energy detection
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const analyserRef   = useRef<AnalyserNode | null>(null);
  const energyRafRef  = useRef<number | null>(null);
  const micStreamRef  = useRef<MediaStream | null>(null);

  const onTranscriptRef = useRef(onTranscript);
  const onSendRef       = useRef(onSend);
  const onBargeInRef    = useRef(onBargeIn);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onSendRef.current = onSend; }, [onSend]);
  useEffect(() => { onBargeInRef.current = onBargeIn; }, [onBargeIn]);
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
    if (!isSpeaking) bargeInFiredRef.current = false; // reset after coach finishes
  }, [isSpeaking]);

  // ── Energy polling loop ──────────────────────────────────────────────────
  const startEnergyMonitor = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);

    function tick() {
      energyRafRef.current = requestAnimationFrame(tick);
      if (!isSpeakingRef.current || bargeInFiredRef.current) return;

      analyser.getByteFrequencyData(data);
      const energy = data.reduce((a, b) => a + b, 0) / data.length / 255;

      if (energy > BARGE_IN_THRESHOLD) {
        bargeInFiredRef.current = true;
        onBargeInRef.current?.();
      }
    }
    energyRafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopEnergyMonitor = useCallback(() => {
    if (energyRafRef.current !== null) {
      cancelAnimationFrame(energyRafRef.current);
      energyRafRef.current = null;
    }
  }, []);

  // ── Teardown ─────────────────────────────────────────────────────────────
  const teardown = useCallback(() => {
    stopEnergyMonitor();
    try { recognitionRef.current?.abort(); } catch (_) {}
    recognitionRef.current = null;
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    analyserRef.current = null;
    setIsListening(false);
    setTranscript('');
  }, [stopEnergyMonitor]);

  const stopListening = useCallback(() => {
    isEnabledRef.current = false;
    teardown();
  }, [teardown]);

  // ── Start ────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!isEnabledRef.current) return;

    // Abort existing recognition (don't re-create AudioContext if already have one)
    try { recognitionRef.current?.abort(); } catch (_) {}
    recognitionRef.current = null;

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) { setMicUnavailable(true); return; }

    const micPromise = micStreamRef.current
      ? Promise.resolve(micStreamRef.current)
      : navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        });

    micPromise
      .then((stream) => {
        if (!isEnabledRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

        // Store stream for reuse on recognition restarts
        micStreamRef.current = stream;

        // Set up Web Audio energy detector (only once)
        if (!audioCtxRef.current) {
          const ctx = new AudioContext();
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.6;
          source.connect(analyser);
          audioCtxRef.current = ctx;
          analyserRef.current = analyser;
          startEnergyMonitor();
        }

        // Build SpeechRecognition using the SAME mic stream
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;

        recognition.onresult = (event: any) => {
          // Discard transcript results while coach is speaking —
          // energy monitor handles barge-in detection separately
          if (isSpeakingRef.current) return;

          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) final += t;
            else interim += t;
          }
          const current = final || interim;
          setTranscript(current);
          onTranscriptRef.current(current);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          if (final) {
            silenceTimerRef.current = window.setTimeout(() => {
              if (final.trim()) {
                onSendRef.current(final.trim());
                setTranscript('');
              }
            }, 1400);
          }
        };

        recognition.onerror = (e: any) => {
          // 'no-speech' is normal — Chrome fires this after silence timeout, not a real error
          if (e.error === 'aborted' || e.error === 'no-speech') return;
          console.error('[voice] error:', e.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          // Small backoff prevents hammering mic on rapid restart cycles
          if (isEnabledRef.current) setTimeout(() => startListening(), 400);
        };

        recognition.start();
        setIsListening(true);
      })
      .catch((err) => {
        console.error('[voice] mic denied:', err);
        setMicUnavailable(true);
      });
  }, [startEnergyMonitor]);

  // ── Effect ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (enabled) {
      isEnabledRef.current = true;
      startListening();
    } else {
      stopListening();
    }
    return () => {
      if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
      try { recognitionRef.current?.abort(); } catch (_) {}
      recognitionRef.current = null;
      setIsListening(false);
    };
  }, [enabled]);

  // Full teardown on unmount
  useEffect(() => () => teardown(), []);

  return { isListening, transcript, micUnavailable, startListening, stopListening };
}
