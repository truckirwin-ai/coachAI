import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useSessionStore } from '../../store/sessionStore';

interface MessageInputProps {
  voiceTranscript?: string; // live transcript from voice hook
  // onVoiceSend?: (text: string) => void;
}

export function MessageInput({ voiceTranscript }: MessageInputProps) {
  const [text, setText] = useState('');
  const { addUserMessage, isThinking, pendingInput, setPendingInput } = useSessionStore();
  const ref = useRef<HTMLTextAreaElement>(null);

  // Quick prompt chips (pendingInput path — one-shot, not voice)
  useEffect(() => {
    if (pendingInput) {
      setText(pendingInput);
      setPendingInput('');
      ref.current?.focus();
    }
  }, [pendingInput, setPendingInput]);

  // Voice transcript — update textarea live as user speaks
  useEffect(() => {
    if (voiceTranscript !== undefined) {
      setText(voiceTranscript);
    }
  }, [voiceTranscript]);

  const send = () => {
    const t = text.trim();
    if (!t || isThinking) return;
    addUserMessage(t);
    setText('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const onInput = () => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = Math.min(ref.current.scrollHeight, 120) + 'px';
  };

  return (
    <div style={{
      padding: '12px 20px 16px', borderTop: '1px solid var(--border)',
      background: 'var(--surface)', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onInput={onInput}
          placeholder="Type your response… (Enter to send, Shift+Enter for newline)"
          disabled={isThinking}
          rows={1}
          style={{
            flex: 1, resize: 'none', overflow: 'hidden',
            background: 'white', border: '1.5px solid var(--border)',
            borderRadius: 10, padding: '9px 14px',
            fontSize: 14, color: 'var(--text)', lineHeight: 1.5,
            fontFamily: 'inherit', outline: 'none',
            opacity: isThinking ? .6 : 1,
          }}
        />
        <button onClick={send} disabled={!text.trim() || isThinking} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: text.trim() && !isThinking ? '#111' : 'var(--border)',
          border: 'none', color: 'white', fontSize: 16, cursor: text.trim() && !isThinking ? 'pointer' : 'default',
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s',
        }}>→</button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 7 }}>
        Press Enter to send · Shift+Enter for new line
      </div>
    </div>
  );
}
