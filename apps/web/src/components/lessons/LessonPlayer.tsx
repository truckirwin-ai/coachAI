import { useState, useEffect, useRef, useCallback } from 'react';
import type { Lesson, LessonSegment } from '../../data/lessons';
import { generateSpeech, playAudio, stopCurrentAudio, pauseCurrentAudio, resumeCurrentAudio, VOICE_IDS } from '../../api/elevenlabs';

const domainColors: Record<string, string> = {
  Leadership: '#1B3A5C',
  Communication: '#17A589',
  Career: '#8E44AD',
  Management: '#E67E22',
  Strategy: '#2980B9',
  Influence: '#C0392B',
};

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

interface LessonPlayerProps {
  lesson: Lesson;
  onClose: () => void;
}

export function LessonPlayer({ lesson, onClose }: LessonPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stopRequestedRef = useRef(false);
  const pauseRequestedRef = useRef(false);

  const totalMs = lesson.durationMins * 60 * 1000;
  const currentMs = lesson.script[currentSegment]?.timeMs ?? 0;
  const progress = Math.min((currentMs / totalMs) * 100, 100);
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const isTedTalk = lesson.format === 'ted-talk';
  const domainColor = domainColors[lesson.domain] || '#1B3A5C';

  // Stop everything on unmount
  useEffect(() => {
    return () => {
      stopRequestedRef.current = true;
      stopCurrentAudio();
    };
  }, []);

  const handleClose = () => {
    stopRequestedRef.current = true;
    stopCurrentAudio();
    setIsPlaying(false);
    setIsPaused(false);
    onClose();
  };

  // Auto-scroll transcript to active segment
  useEffect(() => {
    const el = segmentRefs.current[currentSegment];
    if (el && transcriptRef.current) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentSegment]);

  // ── Prefetch next segment while current plays ─────────────────────────────
  const prefetchNext = useCallback((idx: number) => {
    const next = lesson.script[idx + 1];
    if (next) generateSpeech(next.text, getVoiceId(next, lesson.id)).catch(() => {});
  }, [lesson.script, lesson.id]);

  // ── Unified playback loop (ElevenLabs for both formats) ───────────────────
  const playFrom = useCallback(async (startIdx: number) => {
    stopRequestedRef.current = false;
    pauseRequestedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);

    let idx = startIdx;
    while (idx < lesson.script.length) {
      if (stopRequestedRef.current) break;

      const seg = lesson.script[idx];
      const voiceId = getVoiceId(seg, lesson.id);
      setCurrentSegment(idx);
      setIsGenerating(true);

      let audioUrl: string;
      try {
        audioUrl = await generateSpeech(seg.text, voiceId);
      } catch (e) {
        console.error('TTS failed for segment', idx, e);
        setIsGenerating(false);
        break;
      }

      if (stopRequestedRef.current) break;
      setIsGenerating(false);
      prefetchNext(idx);

      try {
        await playAudio(audioUrl);
      } catch {
        // skip on audio error
      }

      if (stopRequestedRef.current || pauseRequestedRef.current) break;
      idx++;
    }

    if (!pauseRequestedRef.current) {
      setIsPlaying(false);
      setIsGenerating(false);
      if (!stopRequestedRef.current) setCurrentSegment(0);
    }
  }, [lesson.script, lesson.id, prefetchNext]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handlePlay = () => {
    if (isPlaying && !isPaused) {
      pauseRequestedRef.current = true;
      pauseCurrentAudio();
      setIsPaused(true);
      setIsPlaying(false);
    } else if (isPaused) {
      pauseRequestedRef.current = false;
      resumeCurrentAudio();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      stopCurrentAudio();
      playFrom(currentSegment);
    }
  };

  const handleSkipBack = () => {
    const wasPlaying = isPlaying;
    stopRequestedRef.current = true;
    stopCurrentAudio();
    setIsPlaying(false);
    setIsPaused(false);
    const newIdx = Math.max(0, currentSegment - 1);
    setCurrentSegment(newIdx);
    if (wasPlaying) setTimeout(() => playFrom(newIdx), 50);
  };

  const handleSkipForward = () => {
    const wasPlaying = isPlaying;
    stopRequestedRef.current = true;
    stopCurrentAudio();
    setIsPlaying(false);
    setIsPaused(false);
    const newIdx = Math.min(lesson.script.length - 1, currentSegment + 1);
    setCurrentSegment(newIdx);
    if (wasPlaying) setTimeout(() => playFrom(newIdx), 50);
  };

  const handleChapterClick = (chapterTimeMs: number) => {
    const idx = lesson.script.findIndex(s => s.timeMs >= chapterTimeMs);
    const targetIdx = idx === -1 ? 0 : idx;
    const wasPlaying = isPlaying;
    stopRequestedRef.current = true;
    stopCurrentAudio();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegment(targetIdx);
    if (wasPlaying) setTimeout(() => playFrom(targetIdx), 50);
  };

  const handleSegmentClick = (i: number) => {
    const wasPlaying = isPlaying;
    stopRequestedRef.current = true;
    stopCurrentAudio();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegment(i);
    if (wasPlaying) setTimeout(() => playFrom(i), 50);
  };

  // Current chapter for TED talks
  const currentChapter = lesson.chapters
    ? [...lesson.chapters].reverse().find(c => c.timeMs <= currentMs)
    : null;

  const activeSeg = lesson.script[currentSegment];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000,
    }} onClick={handleClose}>
      <div style={{
        background: 'white', borderRadius: 16,
        width: '100%', maxWidth: 680,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #eee',
          display: 'flex', alignItems: 'center', gap: 12,
          background: isTedTalk ? '#fafafa' : '#faf8ff',
          flexShrink: 0,
        }}>
          <button onClick={handleClose} style={{
            background: 'none', border: 'none', fontSize: 20,
            cursor: 'pointer', color: '#666', lineHeight: 1, padding: 0,
          }}>✕</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {lesson.title}
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isTedTalk ? '🎤 TED Talk' : '🎙 Podcast'} · {lesson.durationMins} min
              {isGenerating && (
                <span style={{ color: '#17A589', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#17A589', animation: 'pulse 1s infinite' }} />
                  Generating…
                </span>
              )}
            </div>
          </div>
          <span style={{
            background: domainColor, color: 'white',
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, flexShrink: 0,
          }}>{lesson.domain}</span>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {isTedTalk ? (
            /* ── TED TALK LAYOUT ─────────────────────────────────────────── */
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px 24px 0' }}>

              {/* Now Playing card */}
              <div style={{
                background: isPlaying ? '#e8f8f5' : '#f4f4f4',
                border: `1.5px solid ${isPlaying ? '#17A589' : '#e0e0e0'}`,
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                transition: 'all 0.3s',
                flexShrink: 0,
              }}>
                {/* Speaker avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: domainColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 15,
                  boxShadow: isPlaying ? `0 0 0 3px ${domainColor}44` : 'none',
                  transition: 'box-shadow 0.3s',
                }}>
                  {activeSeg?.speakerName ? getInitials(activeSeg.speakerName) : '▶'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: domainColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                    {currentChapter?.title || activeSeg?.speakerName || 'Introduction'}
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#333', margin: 0, fontStyle: 'italic' }}>
                    "{activeSeg?.text.slice(0, 180)}{(activeSeg?.text.length ?? 0) > 180 ? '…' : ''}"
                  </p>
                </div>
              </div>

              {/* Chapters */}
              {lesson.chapters && (
                <div style={{ marginBottom: 12, flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 6 }}>Chapters</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {lesson.chapters.map((ch, i) => {
                      const isCurrent = currentChapter?.title === ch.title;
                      const isPast = currentMs > ch.timeMs;
                      return (
                        <button
                          key={i}
                          onClick={() => handleChapterClick(ch.timeMs)}
                          style={{
                            fontSize: 11, padding: '4px 10px', borderRadius: 20,
                            border: `1px solid ${isCurrent ? domainColor : '#ddd'}`,
                            background: isCurrent ? domainColor : 'white',
                            color: isCurrent ? 'white' : isPast ? '#555' : '#aaa',
                            cursor: 'pointer', fontWeight: isCurrent ? 600 : 400,
                            transition: 'all 0.15s',
                          }}
                        >{ch.title}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Transcript */}
              <div ref={transcriptRef} style={{
                flex: 1, overflowY: 'auto',
                border: '1px solid #eee', borderRadius: 8,
                marginBottom: 8,
              }}>
                {lesson.script.map((seg, i) => (
                  <div
                    key={i}
                    ref={el => { segmentRefs.current[i] = el; }}
                    onClick={() => handleSegmentClick(i)}
                    style={{
                      padding: '10px 14px',
                      background: i === currentSegment ? '#e8f8f5' : 'transparent',
                      borderLeft: `3px solid ${i === currentSegment ? '#17A589' : 'transparent'}`,
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: 13,
                      color: i === currentSegment ? '#0d6e5a' : '#555',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 10, color: '#bbb', marginRight: 8 }}>{formatTime(seg.timeMs)}</span>
                    {seg.text.slice(0, 100)}{seg.text.length > 100 ? '…' : ''}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── PODCAST LAYOUT ──────────────────────────────────────────── */
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px 24px 0' }}>
              {/* Hosts */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 16, flexShrink: 0 }}>
                {(lesson.hosts || []).map((host, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: avatarColors[i % avatarColors.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 18,
                      boxShadow: activeSeg?.speakerName === host.name && isPlaying
                        ? `0 0 0 4px ${avatarColors[i % avatarColors.length]}55`
                        : 'none',
                      transition: 'box-shadow 0.3s',
                    }}>{getInitials(host.name)}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{host.name}</div>
                    <div style={{ fontSize: 10, color: '#999' }}>{host.role}</div>
                  </div>
                ))}
              </div>

              {/* Transcript */}
              <div ref={transcriptRef} style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
                {lesson.script.map((seg, i) => {
                  const isHost = seg.speaker === 'host';
                  const isCurrent = i === currentSegment;
                  const hostIdx = (lesson.hosts || []).findIndex(h => h.name === seg.speakerName);
                  const color = avatarColors[hostIdx === -1 ? 0 : hostIdx % avatarColors.length];
                  return (
                    <div
                      key={i}
                      ref={el => { segmentRefs.current[i] = el; }}
                      onClick={() => handleSegmentClick(i)}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: isHost ? 'flex-start' : 'flex-end',
                        marginBottom: 12, cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        {seg.speakerName}
                      </div>
                      <div style={{
                        maxWidth: '75%', padding: '10px 14px',
                        background: isCurrent ? (isHost ? '#e8f8f5' : '#f0ebff') : '#f5f5f5',
                        borderRadius: isHost ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                        border: `2px solid ${isCurrent ? color : 'transparent'}`,
                        fontSize: 13, color: '#333', lineHeight: 1.5,
                        transition: 'all 0.15s',
                      }}>
                        {seg.text}
                      </div>
                      <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>{formatTime(seg.timeMs)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{
          padding: '14px 24px 18px',
          borderTop: '1px solid #eee',
          background: '#fafafa',
          flexShrink: 0,
        }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 4, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: '#17A589', borderRadius: 4, transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999' }}>
              <span>{formatTime(currentMs)}</span>
              <span>{formatTime(totalMs)}</span>
            </div>
          </div>

          {/* Playback buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
            <button onClick={handleSkipBack} style={{
              background: '#f0f0f0', border: 'none', borderRadius: '50%',
              width: 36, height: 36, cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>◀</button>
            <button
              onClick={handlePlay}
              disabled={isGenerating && !isPlaying}
              style={{
                background: '#17A589', border: 'none', borderRadius: '50%',
                width: 52, height: 52, cursor: isGenerating && !isPlaying ? 'not-allowed' : 'pointer',
                fontSize: 22, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(23,165,137,0.4)',
                opacity: isGenerating && !isPlaying ? 0.65 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {isGenerating && !isPlaying ? '…' : isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={handleSkipForward} style={{
              background: '#f0f0f0', border: 'none', borderRadius: '50%',
              width: 36, height: 36, cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>▶▶</button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 10, color: '#ccc', letterSpacing: '0.05em' }}>ElevenLabs AI Voices</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
