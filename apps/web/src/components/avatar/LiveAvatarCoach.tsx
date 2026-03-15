import { useEffect, useRef, useState, useCallback } from 'react';
import { useAvatarSession } from '../../hooks/useAvatarSession';
import { SessionState, VoiceChatState } from '@heygen/liveavatar-web-sdk';
import './AvatarPanel.css';
import type { CoachDef } from '../../data/coaches';

interface AudioDevice { deviceId: string; label: string; }

function MicPicker({ onSelect, currentId }: { onSelect: (id: string) => void; currentId: string }) {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    // Request permission first so labels aren't blank
    await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
    const all = await navigator.mediaDevices.enumerateDevices();
    setDevices(all.filter(d => d.kind === 'audioinput').map(d => ({
      deviceId: d.deviceId,
      label: d.label || `Microphone ${d.deviceId.slice(0, 6)}`,
    })));
    setOpen(true);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={open ? () => setOpen(false) : load}
        title="Choose microphone"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6,
          color: 'rgba(255,255,255,0.6)',
          padding: '4px 8px',
          fontSize: 11,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a2 2 0 00-2 2v5a2 2 0 004 0V4a2 2 0 00-2-2zM4 9a1 1 0 00-1 1v1a6 6 0 1012 0v-1a1 1 0 10-2 0v1a4 4 0 11-8 0v-1a1 1 0 00-1-1z"/>
        </svg>
        ▾
      </button>
      {open && devices.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '110%',
          left: 0,
          background: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          minWidth: 220,
          padding: '4px 0',
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {devices.map(d => (
            <div
              key={d.deviceId}
              onClick={() => { onSelect(d.deviceId); setOpen(false); }}
              style={{
                padding: '8px 14px',
                fontSize: 12,
                color: d.deviceId === currentId ? '#17A589' : 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                background: d.deviceId === currentId ? 'rgba(23,165,137,0.1)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = d.deviceId === currentId ? 'rgba(23,165,137,0.1)' : 'transparent')}
            >
              {d.deviceId === currentId && <span style={{ color: '#17A589' }}>✓</span>}
              {d.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- PROPS ---
export interface LiveAvatarCoachProps {
  coach: CoachDef;
  isCoachSpeaking?: boolean;
  isUserSpeaking?: boolean;
  sessionTime?: number;
  onEndSession?: () => void;
  autoStart?: boolean;
  topic?: string;
}

const MicIndicator = () => (
  <div className="mic-indicator">
    <svg className="mic-icon" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a2 2 0 00-2 2v5a2 2 0 004 0V4a2 2 0 00-2-2zM4 9a1 1 0 00-1 1v1a6 6 0 1012 0v-1a1 1 0 10-2 0v1a4 4 0 11-8 0v-1a1 1 0 00-1-1z" />
    </svg>
    <div className="mic-waves">
      <div className="mic-wave-bar" />
      <div className="mic-wave-bar" />
      <div className="mic-wave-bar" />
    </div>
  </div>
);

const ConnectionStateDisplay = ({ state, error }: { state: SessionState; error: string | null }) => (
  <div className={`connection-overlay ${error ? 'error' : 'loading'}`}>
    {error ? (
      <>
        <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="connection-message" style={{ maxWidth: '80%', textAlign: 'center' }}>{error}</span>
      </>
    ) : (
      <>
        <div className="pulsing-gradient-loader" />
        <span className="connection-message">
          {state === SessionState.CONNECTING ? 'Connecting to coach...' : 'Preparing session...'}
        </span>
      </>
    )}
    <style>{`
      .pulsing-gradient-loader {
        width: 60px; height: 60px;
        border-radius: 50%;
        background: conic-gradient(from 0deg, var(--accent), #101820, var(--accent));
        animation: spin 1.5s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

// --- MAIN COMPONENT ---
export function LiveAvatarCoach({
  coach,
  onEndSession,
  autoStart = false,
  topic,
}: LiveAvatarCoachProps) {
  const { sessionState, streamReady, micState, micError, isAvatarSpeaking: avatarTalking, isUserSpeaking: userTalking, error, startSession, interrupt, attachVideo, setMicDevice, retryMic } = useAvatarSession();
  const micActive = micState === VoiceChatState.ACTIVE;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [activeMicId, setActiveMicId] = useState('default');

  const handleStart = useCallback(() => {
    setStarted(true);
    startSession(coach, topic);
  }, [startSession, coach, topic]);

  const handleMicSelect = useCallback(async (deviceId: string) => {
    setActiveMicId(deviceId);
    await setMicDevice(deviceId);
  }, [setMicDevice]);

  useEffect(() => {
    attachVideo(videoRef.current);
  }, [attachVideo]);

  // Skip splash when launched from play button
  useEffect(() => {
    if (autoStart && !started) {
      handleStart();
    }
  }, [autoStart, started, handleStart]);

  // Pre-start splash — click = user gesture = Chrome allows AudioContext + audio playback
  if (!started) return (
    <div className="avatar-panel" style={{ alignItems: 'center', justifyContent: 'center', background: `url(${coach.backgroundUrl}) no-repeat center center / cover` }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to top, rgba(10,10,20,0.88) 0%, rgba(16,24,32,0.6) 50%, rgba(16,24,32,1) 100%)',
        zIndex: 0
      }} />
      <div style={{ zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          fontSize: 10,
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: coach.accentColor,
          background: `${coach.accentColor}22`,
          border: `1px solid ${coach.accentColor}66`,
          borderRadius: 4,
          padding: '3px 10px',
          display: 'inline-block',
          marginBottom: 10,
        }}>
          {coach.specialty}
        </div>
        <h2 style={{ fontSize: 28, color: '#fff', fontWeight: 800, marginBottom: 4 }}>{coach.name}</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginTop: 0, marginBottom: 8 }}>{coach.title}</p>
        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.55)',
          fontStyle: 'italic',
          marginTop: 8,
          maxWidth: 320,
          textAlign: 'center',
          marginBottom: 32,
        }}>
          {coach.bio}
        </p>
        <button onClick={handleStart} style={{
          background: coach.accentColor, color: '#fff', border: 'none', borderRadius: 12,
          padding: '16px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          boxShadow: `0 0 24px ${coach.accentColor}66`, transition: 'transform .1s',
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ▶ Start Session with {coach.name.split(' ')[0]}
        </button>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 12 }}>
          Requires mic access for voice coaching
        </p>
      </div>
    </div>
  );

  return (
    <div className={`avatar-panel ${avatarTalking ? 'speaking' : ''}`}>
      {/* Viewport */}
      <main className="avatar-viewport">
        {!streamReady && <ConnectionStateDisplay state={sessionState} error={error} />}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="avatar-video"
          style={{ opacity: streamReady ? 1 : 0, transition: 'opacity .4s ease' }}
        />
      </main>

      {/* Footer */}
      <footer className="avatar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {userTalking ? (
            <span style={{ fontSize: 11, color: '#17A589', display: 'flex', alignItems: 'center', gap: 5 }}>
              <MicIndicator /> You
            </span>
          ) : micActive ? <MicIndicator /> : (
            <span style={{ fontSize: 11, color: micError ? '#fc8181' : 'rgba(255,255,255,0.3)' }}>
              {micError
                ? <>⚠ {micError} <button onClick={retryMic} style={{ marginLeft: 6, fontSize: 10, color: '#17A589', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button></>
                : streamReady ? '🔇 Mic muted' : ''}
            </span>
          )}
          {streamReady && <MicPicker onSelect={handleMicSelect} currentId={activeMicId} />}
          {avatarTalking && (
            <button onClick={interrupt} title="Interrupt Coach" style={{
              background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)',
              color: '#fca5a5', borderRadius: 6, padding: '3px 10px', fontSize: 11,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              ✋ Interrupt
            </button>
          )}
        </div>
        <button className="end-session-btn" onClick={onEndSession}>End Session</button>
      </footer>
    </div>
  );
}
