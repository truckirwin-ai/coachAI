import { useEffect, useRef } from 'react';
import type { Message } from '../../store/sessionStore';

function CoachMsg({ msg }: { msg: Message }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-start', maxWidth: '78%', animation: 'fadeIn .2s ease' }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0, marginTop: 4,
      }}>CA</div>
      <div>
        <div style={{
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: '16px 16px 16px 4px',
          padding: '10px 14px', fontSize: 14, lineHeight: 1.55, color: 'var(--text)',
          boxShadow: '0 1px 3px rgba(44,36,22,.06)',
        }}>{msg.content}</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, paddingLeft: 4 }}>{msg.timestamp}</div>
      </div>
    </div>
  );
}

function UserMsg({ msg }: { msg: Message }) {
  return (
    <div style={{ alignSelf: 'flex-end', maxWidth: '78%', animation: 'fadeIn .2s ease' }}>
      <div style={{
        background: 'var(--accent)', color: 'white',
        borderRadius: '16px 16px 4px 16px',
        padding: '10px 14px', fontSize: 14, lineHeight: 1.55,
      }}>{msg.content}</div>
      <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, textAlign: 'right', paddingRight: 4 }}>{msg.timestamp}</div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-start', animation: 'fadeIn .2s ease' }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
      }}>CA</div>
      <div style={{
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: '16px 16px 16px 4px', padding: '12px 16px',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, .25, .5].map((delay, i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: 'var(--text-3)',
            animation: `dots 1.2s ${delay}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

export function ChatWindow({ messages, isThinking }: { messages: Message[]; isThinking: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {messages.length === 0 && (
        <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-3)', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>CA</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Ready when you are</div>
          <div style={{ fontSize: 13 }}>Type a message or start speaking to begin your session.</div>
        </div>
      )}
      {messages.map((msg) => {
        if (msg.role === 'coach') {
          return msg.content.length > 0 ? <CoachMsg key={msg.id} msg={msg} /> : null;
        }
        return <UserMsg key={msg.id} msg={msg} />;
      })}
      {isThinking && <ThinkingDots />}
      <div ref={bottomRef} />
    </div>
  );
}
