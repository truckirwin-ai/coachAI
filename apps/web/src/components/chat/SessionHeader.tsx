import { useSettingsStore } from '../../store/settingsStore';
import { Mic, MicOff, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COACHING_TOPICS } from '../../data/coachingTopics';
import type { CoachDef } from '../../data/coaches';

type Mode = 'avatar' | 'voice' | 'text';

function fmt(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return h !== '00' ? `${h}:${m}:${sec}` : `${m}:${sec}`;
}

interface SessionHeaderProps {
  currentTopic: string;
  onTopicChange: (topicId: string) => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  sessionTime: number;
  avatarConnected?: boolean;
  coach?: CoachDef;
  onChangeCoach?: () => void;
}

export function SessionHeader({
  currentTopic, onTopicChange,
  mode, onModeChange,
  sessionTime, avatarConnected = false,
  coach,
  onChangeCoach,
}: SessionHeaderProps) {
  const { voiceEnabled, update } = useSettingsStore();
  const navigate = useNavigate();

  return (
    <div style={{
      height: 56,
      padding: '0 20px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      gap: 12,
    }}>

      {/* Back to coaches */}
      {onChangeCoach && (
        <button
          onClick={onChangeCoach}
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 12, fontWeight: 500,
            padding: '4px 6px 4px 2px', borderRadius: 6,
            transition: 'color 0.12s',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <ChevronLeft size={14} strokeWidth={2} />
          Coaches
        </button>
      )}

      {/* Divider */}
      {onChangeCoach && <div style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0 }} />}

      {/* Coach identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
        {/* Avatar circle */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: coach?.accentColor ?? '#111',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 10, fontWeight: 700,
          position: 'relative',
        }}>
          {coach?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'CA'}
          {/* Live dot */}
          <span style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 8, height: 8, borderRadius: '50%',
            background: avatarConnected ? '#22c55e' : '#bbb',
            border: '1.5px solid white',
          }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.15 }}>
            {coach?.name ?? 'Your Coach'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.2 }}>
            {coach?.specialty ?? 'AI Coach'}
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0 }} />

      {/* Topic select + timer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
        <select
          value={currentTopic}
          onChange={e => onTopicChange(e.target.value)}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--text)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', outline: 'none', padding: 0,
            maxWidth: 220,
          }}
        >
          {COACHING_TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <span style={{
          fontSize: 11, color: 'var(--text-3)',
          fontVariantNumeric: 'tabular-nums',
          fontFamily: 'ui-monospace, monospace',
          flexShrink: 0,
        }}>
          · {fmt(sessionTime)}
        </span>
      </div>

      {/* Mode tabs */}
      <div style={{
        display: 'flex', gap: 2,
        background: 'var(--bg)', borderRadius: 8,
        padding: '3px', border: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {(['avatar', 'voice', 'text'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              border: 'none',
              background: mode === m ? 'white' : 'transparent',
              color: mode === m ? '#111' : 'var(--text-3)',
              boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer', transition: 'all .12s',
              textTransform: 'capitalize',
            }}
          >{m}</button>
        ))}
      </div>

      <div style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0 }} />

      {/* Voice toggle */}
      <button
        onClick={() => update({ voiceEnabled: !voiceEnabled })}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 11px', borderRadius: 7,
          border: voiceEnabled ? '1px solid var(--accent)' : '1px solid var(--border)',
          background: voiceEnabled ? 'var(--accent-light)' : 'transparent',
          color: voiceEnabled ? 'var(--accent)' : 'var(--text-3)',
          fontSize: 12, fontWeight: 600,
          cursor: 'pointer', transition: 'all .15s', flexShrink: 0,
        }}
      >
        {voiceEnabled ? <Mic size={12} /> : <MicOff size={12} />}
        {voiceEnabled ? 'Voice' : 'Voice'}
      </button>

      {/* End session */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '5px 13px', borderRadius: 7, flexShrink: 0,
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-2)', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', transition: 'all .12s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#fee2e2';
          e.currentTarget.style.borderColor = '#fca5a5';
          e.currentTarget.style.color = '#dc2626';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-2)';
        }}
      >End</button>
    </div>
  );
}
