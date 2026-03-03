import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';
import { COACHING_TOPICS } from '../../data/coachingTopics';

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}


interface SessionHeaderProps {
  currentTopic: string;
  onTopicChange: (topicId: string) => void;
}

export function SessionHeader({ currentTopic, onTopicChange }: SessionHeaderProps) {
  const { elapsedSecs, tick } = useSessionStore();
  const { voiceEnabled, update } = useSettingsStore();
  const navigate = useNavigate();
  const intervalRef = useRef<number | null>(null);
  const topicLabel = COACHING_TOPICS.find(t => t.id === currentTopic)?.label || 'Difficult Conversations';

  useEffect(() => {
    intervalRef.current = window.setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div style={{
      padding: '16px 28px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center',
      flexShrink: 0, gap: 16,
    }}>
      {/* Left: title + topic subtitle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: 'var(--text)',
          letterSpacing: '-0.5px', lineHeight: 1.1, margin: 0,
        }}>Coaching</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{topicLabel}</span>
          <select
            value={currentTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--accent)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', outline: 'none', padding: 0,
            }}
          >
            {COACHING_TOPICS.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>· {fmt(elapsedSecs)}</span>
        </div>
      </div>

      {/* Right: voice toggle + end session */}
      <button
        onClick={() => update({ voiceEnabled: !voiceEnabled })}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: voiceEnabled ? '#17A589' : 'var(--border)',
          color: voiceEnabled ? 'white' : 'var(--text-3)',
          fontSize: 13, fontWeight: 600, transition: 'all .2s', flexShrink: 0,
        }}
      >
        {voiceEnabled ? <Mic size={14} /> : <MicOff size={14} />}
        {voiceEnabled ? 'Voice On' : 'Voice Off'}
      </button>

      <button onClick={() => navigate('/dashboard')} style={{
        padding: '8px 16px', borderRadius: 8, flexShrink: 0,
        background: 'transparent', border: '1.5px solid var(--border)',
        color: 'var(--text-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      }}>End Session</button>
    </div>
  );
}
