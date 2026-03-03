import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceSessionOptions {
  onTranscript: (text: string) => void;
  onSend: (text: string) => void;
  enabled: boolean;
}

export function useVoiceSession({ onTranscript, onSend, enabled }: UseVoiceSessionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micUnavailable, setMicUnavailable] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const isEnabledRef = useRef(enabled);

  const onTranscriptRef = useRef(onTranscript);
  const onSendRef = useRef(onSend);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onSendRef.current = onSend; }, [onSend]);
  useEffect(() => { isEnabledRef.current = enabled; }, [enabled]);

  const stopListening = useCallback(() => {
    console.log('[voice] stopListening called');
    isEnabledRef.current = false; // prevent auto-restart
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    try { recognitionRef.current?.abort(); } catch (_) {}
    recognitionRef.current = null;
    setIsListening(false);
    setTranscript('');
  }, []);

  const startListening = useCallback(() => {
    console.log('[voice] startListening called, enabled=' + isEnabledRef.current);
    if (!isEnabledRef.current) return;

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log('[voice] SpeechRecognition available:', !!SpeechRecognitionCtor);
    if (!SpeechRecognitionCtor) {
      setMicUnavailable(true);
      return;
    }

    // Explicitly request mic access first to trigger browser permission dialog
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(() => {
        console.log('[voice] mic permission granted');
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;

        recognition.onresult = (event: any) => {
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
            }, 1800);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('[voice] SpeechRecognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          console.log('[voice] recognition ended, isEnabled=' + isEnabledRef.current);
          setIsListening(false);
          if (isEnabledRef.current) {
            setTimeout(() => startListening(), 300);
          }
        };

        console.log('[voice] recognition.start()');
        recognition.start();
        setIsListening(true);
      })
      .catch((err) => {
        console.error('[voice] mic permission denied:', err);
        setMicUnavailable(true);
      });
  }, []);

  useEffect(() => {
    if (enabled) startListening();
    else stopListening();
    return () => stopListening();
  }, [enabled]);

  return { isListening, transcript, micUnavailable, startListening, stopListening };
}
