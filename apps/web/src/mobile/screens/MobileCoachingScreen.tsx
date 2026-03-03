import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useVoiceSession } from '../../hooks/useVoiceSession';
import { mockMessages } from '../../data/mockData';
import { COACHING_TOPICS } from '../../components/chat/SessionHeader';

export function MobileCoachingScreen() {
  const { messages, isThinking, isSpeaking, setSession, setPendingInput, addUserMessage, addCoachMessage, setSkill, pendingInput } = useSessionStore();
  const { voiceEnabled, update: updateSettings } = useSettingsStore();
  const setVoiceEnabled = (v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === 'function' ? v(voiceEnabled) : v;
    updateSettings({ voiceEnabled: next });
  };
  const [currentTopic, setCurrentTopic] = useState('difficult-conversations');
  const [inputText, setInputText] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setSession('Difficult Conversations', 'Curriculum', 2, mockMessages);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (pendingInput) setInputText(pendingInput);
  }, [pendingInput]);

  const handleTopicChange = useCallback((topicId: string) => {
    const topic = COACHING_TOPICS.find(t => t.id === topicId);
    if (!topic) return;
    setCurrentTopic(topicId);
    setSkill(topic.label, topic.domain);
    addCoachMessage(`Let's shift focus to **${topic.label}**. What's on your mind?`);
    setShowTopicPicker(false);
  }, [setSkill, addCoachMessage]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || isThinking || isSpeaking) return;
    addUserMessage(text);
    setInputText('');
    setPendingInput('');
  }, [inputText, isThinking, isSpeaking, addUserMessage, setPendingInput]);

  const handleTranscript = useCallback((text: string) => {
    setInputText(text);
    setPendingInput(text);
  }, [setPendingInput]);

  const handleVoiceSend = useCallback((text: string) => {
    if (!isThinking && !isSpeaking) {
      addUserMessage(text);
      setInputText('');
      setPendingInput('');
    }
  }, [isThinking, isSpeaking, addUserMessage, setPendingInput]);

  const { isListening, transcript, micUnavailable } = useVoiceSession({
    onTranscript: handleTranscript,
    onSend: handleVoiceSend,
    enabled: voiceEnabled && !isThinking && !isSpeaking,
  });

  const currentTopicLabel = COACHING_TOPICS.find(t => t.id === currentTopic)?.label ?? 'Difficult Conversations';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Top bar */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '0.5px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>Coaching</div>
        <button
          onClick={() => setShowTopicPicker(v => !v)}
          style={{
            background: '#2C2C2E', border: 'none', borderRadius: 10,
            padding: '6px 12px', fontSize: 11, color: '#17A589', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
          }}
        >
          {currentTopicLabel} ▾
        </button>
      </div>

      {/* Topic picker dropdown */}
      {showTopicPicker && (
        <div style={{
          position: 'absolute', top: 108, right: 12, left: 12,
          background: '#1C1C1E', borderRadius: 14, zIndex: 50,
          border: '0.5px solid rgba(255,255,255,0.15)',
          maxHeight: 300, overflowY: 'auto',
        }}>
          {COACHING_TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => handleTopicChange(t.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '12px 16px', background: 'none', border: 'none',
                color: currentTopic === t.id ? '#17A589' : 'white',
                fontSize: 13, cursor: 'pointer',
                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                fontWeight: currentTopic === t.id ? 700 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-end', gap: 6, marginBottom: 10,
          }}>
            {msg.role === 'coach' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#17A589,#0E8A72)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'white',
              }}>C</div>
            )}
            <div style={{
              maxWidth: '72%',
              background: msg.role === 'user' ? '#17A589' : '#2C2C2E',
              color: 'white',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: '10px 14px',
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              {msg.content}
              {msg.role === 'coach' && (
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>CA · CoachAI</div>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#17A589,#0E8A72)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white',
            }}>C</div>
            <div style={{ background: '#2C2C2E', borderRadius: '18px 18px 18px 4px', padding: '12px 16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, letterSpacing: 4 }}>···</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice indicator */}
      {voiceEnabled && isListening && (
        <div style={{
          padding: '6px 16px', fontSize: 11, color: '#17A589',
          background: 'rgba(23,165,137,0.08)',
        }}>
          🎙 Listening{transcript ? ` — "${transcript}"` : '...'}
        </div>
      )}

      {/* Input bar */}
      <div style={{
        padding: '8px 12px',
        borderTop: '0.5px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}>
        {/* Voice toggle pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <button
            onClick={() => setVoiceEnabled(v => !v)}
            style={{
              background: voiceEnabled ? 'rgba(23,165,137,0.2)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${voiceEnabled ? '#17A589' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 20, padding: '4px 14px',
              fontSize: 11, color: voiceEnabled ? '#17A589' : 'rgba(255,255,255,0.5)',
              cursor: micUnavailable ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
            disabled={micUnavailable}
          >
            {voiceEnabled ? '🎙 Voice On' : '🔇 Voice Off'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Message your coach..."
            style={{
              flex: 1, background: '#1C1C1E', border: 'none', borderRadius: 22,
              padding: '11px 16px', fontSize: 14, color: 'white', outline: 'none',
            }}
          />
          {inputText.trim() ? (
            <button
              onClick={handleSend}
              style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: '#17A589', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={16} color="white" />
            </button>
          ) : (
            <button
              onClick={() => setVoiceEnabled(v => !v)}
              style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: voiceEnabled && isListening ? '#17A589' : '#2C2C2E',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {voiceEnabled ? <Mic size={16} color={isListening ? 'white' : '#17A589'} /> : <MicOff size={16} color="rgba(255,255,255,0.5)" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
