import { Plus } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import type { Conversation } from '../../store/sessionStore';
import { COACHING_TOPICS } from '../../data/coachingTopics';
import { useState } from 'react';

export function ConversationTabs() {
  const { conversations, activeConversationId, switchConversation, newConversation } = useSessionStore();
  const [showPicker, setShowPicker] = useState(false);

  const handleNew = (topicId: string) => {
    const topic = COACHING_TOPICS.find(t => t.id === topicId);
    if (!topic) return;
    newConversation(topic.id, topic.label);
    setShowPicker(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        overflowX: 'auto', flexShrink: 0,
        scrollbarWidth: 'none',
      }}>
        {conversations.map((c: Conversation, _i: number) => {
          const active = c.id === activeConversationId;
          return (
            <button
              key={c.id}
              onClick={() => switchConversation(c.id)}
              style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px',
                border: 'none', borderRight: '1px solid var(--border)',
                borderBottom: active ? '2px solid #111' : '2px solid transparent',
                background: active ? 'var(--surface)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-3)',
                fontSize: 12, fontWeight: active ? 700 : 400,
                cursor: 'pointer', transition: 'all .15s',
                marginBottom: active ? -1 : 0,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{
                display: 'inline-block',
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: active ? '#111' : 'var(--border)',
              }} />
              {c.topicLabel}
              <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 2 }}>
                {c.startedAt}
              </span>
            </button>
          );
        })}

        {/* New Topic button */}
        <button
          onClick={() => setShowPicker(v => !v)}
          style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '8px 14px',
            border: 'none', background: 'transparent',
            color: 'var(--accent)', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', borderBottom: '2px solid transparent',
          }}
        >
          <Plus size={13} />
          New Topic
        </button>
      </div>

      {/* Topic picker dropdown */}
      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowPicker(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          />
          <div style={{
            position: 'absolute', top: '100%', right: 0, zIndex: 100,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,.18)',
            width: 280, maxHeight: 380, overflowY: 'auto',
            padding: '8px 0',
          }}>
            <div style={{ padding: '6px 14px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Start New Conversation
            </div>
            {COACHING_TOPICS.map(t => (
              <button
                key={t.id}
                onClick={() => handleNew(t.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '9px 14px', border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 13, color: 'var(--text)',
                  transition: 'background .1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span>{t.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.domain}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
