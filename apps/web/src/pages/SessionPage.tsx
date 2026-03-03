import { useEffect, useState, useCallback } from 'react';

import { ChatWindow } from '../components/chat/ChatWindow';
import { MessageInput } from '../components/chat/MessageInput';
import { SessionHeader } from '../components/chat/SessionHeader';
import { COACHING_TOPICS } from '../data/coachingTopics';
import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';

import { useVoiceSession } from '../hooks/useVoiceSession';
import { ConversationTabs } from '../components/chat/ConversationTabs';
import { mockMessages } from '../data/mockData';

export function SessionPage() {
  const { messages, isThinking, isSpeaking, setSession, setPendingInput, addUserMessage, addCoachMessage, setSkill, bargeIn } = useSessionStore();

  const { voiceEnabled } = useSettingsStore();
  const [currentTopic, setCurrentTopic] = useState('difficult-conversations');

  useEffect(() => {
    if (messages.length === 0) {
      setSession('Difficult Conversations', 'Curriculum', 2, mockMessages);
    }
  }, []);

  const handleTopicChange = useCallback((topicId: string) => {
    const topic = COACHING_TOPICS.find(t => t.id === topicId);
    if (!topic) return;
    setCurrentTopic(topicId);
    setSkill(topic.label, topic.domain);
    addCoachMessage(`Let's shift our focus to **${topic.label}**. What's on your mind about this — what are you working through right now?`);
  }, [setSkill, addCoachMessage]);


  const handleTranscript = useCallback((text: string) => {
    setPendingInput(text);
  }, [setPendingInput]);

  const handleVoiceSend = useCallback((text: string) => {
    if (!isThinking) {
      addUserMessage(text);
      setPendingInput('');
    }
  }, [isThinking, addUserMessage, setPendingInput]);

  const { isListening, transcript } = useVoiceSession({
    onTranscript: handleTranscript,
    onSend: handleVoiceSend,
    enabled: voiceEnabled,
    isSpeaking,
    onBargeIn: bargeIn,
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Main chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <SessionHeader currentTopic={currentTopic} onTopicChange={handleTopicChange} />
        <ConversationTabs />
        <ChatWindow messages={messages} isThinking={isThinking} />

        {voiceEnabled && (
          <div style={{
            padding: '8px 24px',
            background: isListening ? 'rgba(23,165,137,.08)' : 'rgba(0,0,0,.03)',
            borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: isListening ? '#17A589' : 'var(--text-3)',
            transition: 'all .3s',
            flexShrink: 0,
          }}>
            {isSpeaking ? (
              <>
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="voice-wave-bar" style={{ background: '#e67e22', animationDuration: `${0.6 + i * 0.1}s` }} />
                ))}
                <span style={{ color: '#e67e22' }}>Coach speaking — say anything to interrupt</span>
              </>
            ) : isListening ? (
              <>
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="voice-wave-bar" />
                ))}
                <span>Listening{transcript ? ` — "${transcript}"` : '...'}</span>
              </>
            ) : (
              <span style={{ opacity: 0.5 }}>◉ Initializing mic...</span>
            )}
          </div>
        )}

        <MessageInput voiceTranscript={voiceEnabled ? transcript : undefined} />
      </div>

      {/* Context panel */}
      <div style={{
        width: 280, flexShrink: 0,
        borderLeft: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '20px 18px',
        overflowY: 'auto',
      }}>
        <div className="section-label">Session Context</div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Today's Focus</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
            Navigating defensiveness. Separating the person from the behavior. Keeping the relationship intact while being direct.
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Quick Prompts</div>
          {[
            'Help me open this conversation',
            'What do I do if they get defensive?',
            'Practice the scenario with me',
            'What am I avoiding?',
          ].map((p, i) => (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 6, marginBottom: 6, cursor: 'pointer',
              border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-2)',
              background: 'var(--white)', transition: 'all .12s',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
              onClick={() => setPendingInput(p)}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <span>"{p}"</span>
              <span style={{ color: 'var(--text-3)', marginLeft: 6, flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Linked Goal</div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Complete all pending 1:1 conversations</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>2 of 5 done · Due Mar 15</div>
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: '40%', height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
