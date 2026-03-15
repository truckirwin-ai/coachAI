
import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import {
  LiveAvatarSession,
  SessionState,
  SessionEvent,
  AgentEventsEnum,
} from '@heygen/liveavatar-web-sdk';
import { createAvatarSession } from '../../api/liveavatar';
import type { Lesson, LessonSegment } from '../../data/lessons';
import type { CoachDef } from '../../data/coaches';

const ACCENT_COLOR = '#17A589';

export function AvatarLessonPlayer({ lesson, coach, onClose }: {
  lesson: Lesson;
  coach: CoachDef;
  onClose: () => void;
}) {
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.INACTIVE);
  const [streamReady, setStreamReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);

  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentSegmentRef = useRef(0);
  const stopRef = useRef(false);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  const totalDurationMs = lesson.script.reduce((sum, seg) => sum + (seg.timeMs || 0), 0);

  useEffect(() => {
    // Scroll to active segment
    if (transcriptContainerRef.current) {
      const activeEl = transcriptContainerRef.current.children[currentSegment] as HTMLDivElement;
      if (activeEl) {
        transcriptContainerRef.current.scrollTo({
          top: activeEl.offsetTop - transcriptContainerRef.current.offsetTop - 100,
          behavior: 'smooth',
        });
      }
    }
  }, [currentSegment]);


  const startSession = async () => {
    if (sessionRef.current) return;
    setSessionState(SessionState.CONNECTING);
    try {
      const { session_token } = await createAvatarSession(coach);
      // Token is a positional string arg, not an options object
      const session = new LiveAvatarSession(session_token, { voiceChat: false });
      sessionRef.current = session;

      session.on(SessionEvent.SESSION_STATE_CHANGED, (state: SessionState) => setSessionState(state));

      session.on(SessionEvent.SESSION_STREAM_READY, async () => {
        if (videoRef.current) {
          session.attach(videoRef.current);
          setStreamReady(true);
          // Short warmup so WebRTC path is ready before first message
          await new Promise(res => setTimeout(res, 600));
          stopRef.current = false;
          currentSegmentRef.current = 0;
          setCurrentSegment(0);
          setIsPlaying(true);
          session.message(lesson.script[0].text);
        }
      });

      session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => setIsAvatarSpeaking(true));
      session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
        setIsAvatarSpeaking(false);
        if (!stopRef.current) {
          const nextSegment = currentSegmentRef.current + 1;
          if (nextSegment < lesson.script.length) {
            setTimeout(() => {
              currentSegmentRef.current = nextSegment;
              setCurrentSegment(nextSegment);
              session.message(lesson.script[nextSegment].text);
            }, 300);
          } else {
            setIsPlaying(false);
          }
        }
      });

      session.on(SessionEvent.SESSION_DISCONNECTED, () => {
        setSessionState(SessionState.DISCONNECTED);
        setStreamReady(false);
        setIsPlaying(false);
        setIsAvatarSpeaking(false);
        sessionRef.current = null;
      });

      session.start();

    } catch (error) {
      console.error("Failed to start avatar session:", error);
      setSessionState(SessionState.DISCONNECTED);
    }
  };

  useEffect(() => {
    return () => {
      stopRef.current = true;
      sessionRef.current?.close();
    };
  }, []);

  const handlePlayPause = () => {
    if (!sessionRef.current) return;
    if (isPlaying) {
      stopRef.current = true;
      sessionRef.current.interrupt();
      setIsPlaying(false);
    } else {
      stopRef.current = false;
      sessionRef.current.message(lesson.script[currentSegment].text);
      setIsPlaying(true);
    }
  };

  const jumpToSegment = (index: number) => {
    if (!sessionRef.current) return;
    stopRef.current = false;
    currentSegmentRef.current = index;
    setCurrentSegment(index);
    sessionRef.current.message(lesson.script[index].text);
    if (!isPlaying) setIsPlaying(true);
  };

  const handlePrev = () => {
    const prevIndex = Math.max(0, currentSegment - 1);
    jumpToSegment(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = Math.min(lesson.script.length - 1, currentSegment + 1);
    jumpToSegment(nextIndex);
  };

  const currentMs = lesson.script.slice(0, currentSegment + 1).reduce((sum, seg) => sum + (seg.timeMs || 0), 0);

  const styles: Record<string, CSSProperties> = {
    modal: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#111',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      zIndex: 1000,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid #222',
      flexShrink: 0,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    closeButton: { background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer', padding: 0 },
    title: { fontSize: 16, fontWeight: 600 },
    subtitle: { fontSize: 13, color: '#888' },
    badge: {
      background: 'rgba(23, 165, 137, 0.2)',
      color: ACCENT_COLOR,
      border: `1px solid ${ACCENT_COLOR}`,
      padding: '4px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
    },
    main: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    videoPanel: {
      width: 420,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      borderRight: '1px solid #222',
    },
    video: { width: '100%', height: '100%', objectFit: 'cover' },
    preview: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 20,
    },
    previewImg: {
        width: 150,
        height: 150,
        borderRadius: '50%',
        objectFit: 'cover',
        marginBottom: 20,
        border: '3px solid #333',
    },
    startButton: {
        background: ACCENT_COLOR,
        color: '#fff',
        border: 'none',
        borderRadius: 25,
        padding: '12px 24px',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: 20,
    },
    controls: {
        position: 'absolute',
        bottom: 20, left: 20, right: 20,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: 12,
    },
    progressWrapper: { width: '100%', background: '#444', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 12},
    progressBar: { background: ACCENT_COLOR, height: '100%', width: `${(currentMs / totalDurationMs) * 100}%` },
    buttons: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 },
    controlButton: { background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' },
    transcriptPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    transcriptContainer: {
      padding: '24px 32px',
      overflowY: 'auto',
      flex: 1,
    },
    segment: {
      padding: '10px 12px',
      borderRadius: 8,
      marginBottom: 8,
      cursor: 'pointer',
      borderLeft: '3px solid transparent',
    },
    activeSegment: {
      background: 'rgba(23, 165, 137, 0.15)',
      borderLeft: `3px solid ${ACCENT_COLOR}`,
    },
    speaker: {
        fontSize: 12,
        fontWeight: 700,
        color: '#999',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    text: {
        fontSize: 15,
        lineHeight: 1.6,
        color: '#ddd',
    },
  };

  const getStatusText = () => {
    switch (sessionState) {
      case SessionState.CONNECTING: return 'Connecting...';
      case SessionState.CONNECTED: return 'Loading Stream...';
      case SessionState.DISCONNECTED: return 'Disconnected. Click to retry.';
      default: return 'Starting Presentation...';
    }
  }

  return (
    <div style={styles.modal}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
          <div>
            <div style={styles.title}>{lesson.title}</div>
            <div style={styles.subtitle}>{coach.name} · {lesson.durationMins} min</div>
          </div>
        </div>
        <div style={styles.badge}>🎥 Avatar Presentation</div>
      </header>

      <main style={styles.main}>
        <div style={styles.videoPanel}>
          {/* Video always in DOM so videoRef is populated when SESSION_STREAM_READY fires */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ ...styles.video, display: streamReady ? 'block' : 'none' }}
          />

          {/* Pre-session overlay — shown until stream is ready */}
          {!streamReady && (
            <div style={{ ...styles.preview, position: 'absolute', inset: 0 }}>
              {sessionState === SessionState.INACTIVE ? (
                <>
                  <img src={coach.previewUrl} alt={coach.name} style={styles.previewImg} />
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{coach.name}</div>
                  <div style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>{coach.title}</div>
                  <button onClick={startSession} style={styles.startButton}>▶ Start Presentation</button>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#888' }}>
                  <div style={{ fontSize: 18, marginBottom: 12 }}>{getStatusText()}</div>
                  {sessionState === SessionState.CONNECTING && (
                    <div style={{ fontSize: 13, color: '#555' }}>This may take a few seconds…</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Playback controls — shown once stream is ready */}
          {streamReady && (
            <div style={styles.controls}>
              <div style={styles.progressWrapper}><div style={styles.progressBar} /></div>
              <div style={styles.buttons}>
                <button onClick={handlePrev} style={styles.controlButton}>◀</button>
                <button onClick={handlePlayPause} style={styles.controlButton}>{isPlaying ? '⏸' : '▶'}</button>
                <button onClick={handleNext} style={styles.controlButton}>▶▶</button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.transcriptPanel}>
          <div ref={transcriptContainerRef} style={styles.transcriptContainer}>
            {lesson.script.map((seg, i) => (
              <div
                key={i}
                onClick={() => streamReady && jumpToSegment(i)}
                style={{ ...styles.segment, ...(i === currentSegment ? styles.activeSegment : {}) }}
              >
                <div style={styles.speaker}>{seg.speakerName}</div>
                <div style={styles.text}>{seg.text}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
