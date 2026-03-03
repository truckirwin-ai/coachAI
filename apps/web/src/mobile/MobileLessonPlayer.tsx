import { useState, useEffect, useRef, useCallback } from 'react';
import type { Lesson, LessonSegment } from '../data/lessons';
import { generateSpeech, playAudio, stopCurrentAudio, pauseCurrentAudio, resumeCurrentAudio, VOICE_IDS } from '../api/elevenlabs';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = ['#17A589', '#8E44AD', '#E67E22', '#2980B9', '#C0392B'];

function getVoiceId(segment: LessonSegment, lessonId: string): string {
  if (segment.speaker === 'narrator') {
    if (lessonId === 'l2') return VOICE_IDS.narrator_ted2;
    if (lessonId === 'l5') return VOICE_IDS.narrator_ted3;
    return VOICE_IDS.narrator;
  }
  if (segment.speaker === 'host') {
    if (lessonId === 'l4') return VOICE_IDS.Alex_sarah;
    if (lessonId === 'l6') return VOICE_IDS.Alex_liam;
    return VOICE_IDS.Alex_bella;
  }
  return VOICE_IDS[segment.speakerName] || VOICE_IDS.Jordan;
}

interface Props {
  lesson: Lesson;
  onClose: () => void;
}

export function MobileLessonPlayer({ lesson, onClose }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wavePhase, setWavePhase] = useState(0);
  const stopRequestedRef = useRef(false);
  const pauseRequestedRef = useRef(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const totalMs = lesson.durationMins * 60 * 1000;
  const currentMs = lesson.script[currentSegment]?.timeMs ?? 0;
  const progress = Math.min((currentMs / totalMs) * 100, 100);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  // Waveform animation
  useEffect(() => {
    if (!isPlaying || isPaused) return;
    const id = setInterval(() => setWavePhase(p => p + 1), 120);
    return () => clearInterval(id);
  }, [isPlaying, isPaused]);

  const playSequence = useCallback(async (startIdx: number) => {
    stopRequestedRef.current = false;
    pauseRequestedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);

    for (let i = startIdx; i < lesson.script.length; i++) {
      if (stopRequestedRef.current) break;
      setCurrentSegment(i);
      const segment = lesson.script[i];
      try {
        setIsGenerating(true);
        const voiceId = getVoiceId(segment, lesson.id);
        const audio = await generateSpeech(segment.text, voiceId);
        setIsGenerating(false);
        if (stopRequestedRef.current) break;

        await playAudio(audio);
      } catch {
        setIsGenerating(false);
      }
    }

    if (!stopRequestedRef.current) {
      setIsPlaying(false);
      setCurrentSegment(0);
    }
  }, [lesson]);

  const handlePlay = () => {
    if (isPaused) {
      resumeCurrentAudio();
      setIsPaused(false);
    } else {
      playSequence(currentSegment);
    }
  };

  const handlePause = () => {
    pauseCurrentAudio();
    pauseRequestedRef.current = true;
    setIsPaused(true);
  };

  const handleStop = () => {
    stopRequestedRef.current = true;
    stopCurrentAudio();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegment(0);
  };

  const handleClose = () => {
    handleStop();
    onClose();
  };

  const isTED = lesson.format === 'ted-talk';
  const speakers = lesson.hosts ?? [];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: '#000', zIndex: 50,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 16px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {isTED ? 'TED Talk' : 'Podcast'}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginTop: 2 }}>{lesson.title}</div>
        </div>
        <button onClick={handleClose} style={{ background: '#2C2C2E', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'white', fontSize: 16 }}>✕</button>
      </div>

      {/* Avatars */}
      {isTED ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0', flexShrink: 0 }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1B3A5C, #17A589)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white',
            border: isPlaying && !isPaused ? '3px solid #17A589' : '3px solid transparent',
            transition: 'border-color 0.3s',
          }}>
            🎤
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '12px 0', flexShrink: 0 }}>
          {speakers.slice(0, 2).map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: 70, height: 70, borderRadius: '50%',
                background: avatarColors[i],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: 'white',
                border: isPlaying && !isPaused ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                margin: '0 auto 6px',
              }}>
                {getInitials(s.name)}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{s.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Current text / waveform */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {isTED ? (
          <div>
            <div style={{
              fontSize: 17, color: 'white', lineHeight: 1.6, fontStyle: 'italic',
              textAlign: 'center', marginBottom: 20,
            }}>
              "{lesson.script[currentSegment]?.text}"
            </div>

            {/* Waveform */}
            {isPlaying && !isPaused && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 40, alignItems: 'center', marginBottom: 16 }}>
                {[3,5,7,5,8,4,6,3,7,5].map((h, i) => (
                  <div key={i} style={{
                    width: 4, borderRadius: 2, background: '#17A589',
                    height: Math.max(4, h * Math.abs(Math.sin((wavePhase + i) * 0.8)) + 4),
                    transition: 'height 0.12s',
                  }} />
                ))}
              </div>
            )}

            {/* Chapter list */}
            {lesson.chapters && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Chapters</div>
                {lesson.chapters.map((ch, i) => (
                  <div key={i} style={{
                    padding: '10px 0',
                    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 11, color: '#17A589', fontWeight: 700, minWidth: 36 }}>
                      {formatTime(ch.timeMs)}
                    </span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{ch.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div ref={transcriptRef}>
            {lesson.script.map((seg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: seg.speaker === 'guest' ? 'row-reverse' : 'row',
                gap: 8, marginBottom: 10,
                opacity: i === currentSegment && isPlaying ? 1 : 0.6,
                transition: 'opacity 0.3s',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: avatarColors[seg.speaker === 'host' ? 0 : 1],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: 'white',
                }}>
                  {getInitials(seg.speakerName)}
                </div>
                <div style={{
                  maxWidth: '75%', background: '#1C1C1E',
                  borderRadius: seg.speaker === 'guest' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '8px 12px',
                  fontSize: 12, color: 'white', lineHeight: 1.5,
                }}>
                  {seg.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress + Controls */}
      <div style={{ padding: '12px 16px', flexShrink: 0, background: '#0a0a0a' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 3, background: '#2C2C2E', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ height: '100%', background: '#17A589', width: `${progress}%`, transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{formatTime(currentMs)}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{lesson.durationMins}:00</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'center' }}>
          <button onClick={handleStop} style={{ background: '#2C2C2E', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>■</button>
          <button
            onClick={isPlaying && !isPaused ? handlePause : handlePlay}
            disabled={isGenerating}
            style={{
              background: isGenerating ? '#2C2C2E' : '#17A589',
              border: 'none', borderRadius: '50%', width: 60, height: 60,
              cursor: isGenerating ? 'wait' : 'pointer',
              color: 'white', fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isGenerating ? '⋯' : isPlaying && !isPaused ? '⏸' : '▶'}
          </button>
          <div style={{ width: 44, height: 44 }} />
        </div>
      </div>
    </div>
  );
}
