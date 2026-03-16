// © 2026 Foundry SMB LLC. All rights reserved.
// CoachAI — SessionPage

import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatWindow } from '../components/chat/ChatWindow';
import { MessageInput } from '../components/chat/MessageInput';
import { SessionHeader } from '../components/chat/SessionHeader';
import { COACHING_TOPICS } from '../data/coachingTopics';
import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { ConversationTabs } from '../components/chat/ConversationTabs';
import { mockMessages } from '../data/mockData';
import { LiveAvatarCoach } from '../components/avatar/LiveAvatarCoach';
import type { LiveAvatarCoachHandle } from '../components/avatar/LiveAvatarCoach';
import { CoachSelect } from '../components/coach/CoachSelect';
import { getCoach, DEFAULT_COACH_ID } from '../data/coaches';
import { useLastSessionStore } from '../store/lastSessionStore';
import type { PersistedMessage } from '../store/lastSessionStore';

type Mode = 'avatar' | 'voice' | 'text';

export function SessionPage() {
  const { messages, isThinking, isSpeaking, setSession, setPendingInput, addUserMessage, addCoachMessage, setSkill, bargeIn } = useSessionStore();
  const { voiceEnabled } = useSettingsStore();
  const [currentTopic, setCurrentTopic] = useState('difficult-conversations');
  const [sessionTime, setSessionTime] = useState(0);
  const [mode, setMode] = useState<Mode>('avatar');
  const [coachSelected, setCoachSelected] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState(DEFAULT_COACH_ID);
  const [autoStartSession, setAutoStartSession] = useState(false);
  const [launchTopic, setLaunchTopic] = useState<string | undefined>(undefined);
  const [resumeHistory, setResumeHistory] = useState<PersistedMessage[] | undefined>(undefined);
  const avatarRef = useRef<LiveAvatarCoachHandle>(null);
  const location = useLocation();
  const { history: savedHistory, coachId: savedCoachId, topicId: savedTopicId } = useLastSessionStore();

  useEffect(() => {
    const state = location.state as { resume?: boolean; coachId?: string; topicId?: string } | null;
    if (state?.resume) {
      // Dashboard "resume" — use saved coach/topic and reload conversation history
      const coachId = state.coachId ?? savedCoachId;
      const topicId = state.topicId ?? savedTopicId ?? undefined;
      if (coachId) setSelectedCoachId(coachId);
      if (topicId) setLaunchTopic(topicId);
      setResumeHistory(savedHistory.length > 0 ? savedHistory : undefined);
      setAutoStartSession(true);
      setCoachSelected(true);
    } else {
      setCoachSelected(false);
      setAutoStartSession(false);
      setLaunchTopic(undefined);
      setResumeHistory(undefined);
    }
  }, [location.key]);

  useEffect(() => {
    const interval = setInterval(() => setSessionTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEndSession = () => {
    alert('Session ended!');
    setSessionTime(0);
  };

  useEffect(() => {
    if (messages.length === 0) {
      setSession('Difficult Conversations', 'Curriculum', 2, mockMessages);
    }
  }, [messages.length, setSession]);

  const handleTopicChange = useCallback((topicId: string) => {
    const newTopic = COACHING_TOPICS.find(t => t.id === topicId);
    if (!newTopic) return;
    const oldTopic = COACHING_TOPICS.find(t => t.id === currentTopic);
    const fromLabel = oldTopic?.label ?? currentTopic;
    setCurrentTopic(topicId);
    setSkill(newTopic.label, newTopic.domain);
    // In avatar mode: have the coach speak the transition
    if (mode === 'avatar' && avatarRef.current) {
      avatarRef.current.changeTopic(fromLabel, newTopic.label, topicId);
    } else {
      // Text/voice mode: post as chat message
      addCoachMessage(`Let's shift our focus to **${newTopic.label}**. What's on your mind about this — what are you working through right now?`);
    }
  }, [currentTopic, mode, setSkill, addCoachMessage]);

  const handleTranscript = useCallback((text: string) => setPendingInput(text), [setPendingInput]);
  const handleVoiceSend = useCallback((text: string) => {
    if (!isThinking) {
      addUserMessage(text);
      setPendingInput('');
    }
  }, [isThinking, addUserMessage, setPendingInput]);

  // Avatar mode owns all audio via HeyGen SDK — disable ElevenLabs pipeline to prevent double playback
  const { isListening, transcript } = useVoiceSession({
    onTranscript: handleTranscript,
    onSend: handleVoiceSend,
    enabled: voiceEnabled && mode !== 'avatar',
    isSpeaking,
    onBargeIn: bargeIn,
  });

  const renderModeContent = () => {
    switch (mode) {
      case 'avatar':
        return (
          <div style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            padding: '16px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: '100%',
              maxWidth: '960px',
              position: 'relative',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            }}>
              <LiveAvatarCoach
                ref={avatarRef}
                coach={getCoach(selectedCoachId)}
                isCoachSpeaking={isSpeaking}
                isUserSpeaking={isListening}
                sessionTime={sessionTime}
                onEndSession={handleEndSession}
                autoStart={autoStartSession}
                topic={launchTopic}
                resumeHistory={resumeHistory}
              />
            </div>
          </div>
        );
      case 'voice':
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Voice Session</div>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: isListening ? '#e8f5f1' : 'white',
              border: `2px solid ${isListening ? '#17A589' : 'var(--border)'}`,
              display: 'grid', placeItems: 'center',
              boxShadow: isListening ? '0 0 0 8px rgba(23,165,137,0.1)' : '0 2px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isListening ? '#17A589' : '#999'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </div>
            <div style={{ fontSize: 13, color: isListening ? '#17A589' : 'var(--text-3)', fontWeight: isListening ? 600 : 400, minHeight: '2em', textAlign: 'center' }}>
              {isListening ? (transcript ? `"${transcript}"` : 'Listening…') : 'Tap to speak'}
            </div>
          </div>
        );
      case 'text':
        return (
          <>
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
                    {[1,2,3,4,5].map(i => <div key={i} className="voice-wave-bar" style={{ background: '#e67e22', animationDuration: `${0.6 + i * 0.1}s` }} />)}
                    <span style={{ color: '#e67e22' }}>Coach speaking — say anything to interrupt</span>
                  </>
                ) : isListening ? (
                  <>
                    {[1,2,3,4,5].map(i => <div key={i} className="voice-wave-bar" />)}
                    <span>Listening{transcript ? ` — "${transcript}"` : '...'}</span>
                  </>
                ) : (
                  <span style={{ opacity: 0.5 }}>◉ Initializing mic...</span>
                )}
              </div>
            )}
            <MessageInput voiceTranscript={voiceEnabled ? transcript : undefined} />
          </>
        );
    }
  };

  if (!coachSelected) {
    return (
      <CoachSelect onSelect={(id, topic, autoStart) => {
        setSelectedCoachId(id);
        setLaunchTopic(topic || undefined);
        setAutoStartSession(!!autoStart);
        setCoachSelected(true);
      }} />
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <SessionHeader
          currentTopic={currentTopic}
          onTopicChange={handleTopicChange}
          mode={mode}
          onModeChange={setMode}
          sessionTime={sessionTime}
          coach={getCoach(selectedCoachId)}
          onChangeCoach={() => { setCoachSelected(false); }}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {renderModeContent()}
        </div>
      </div>

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
            <div key={i} style={{ padding: '8px 10px', borderRadius: 6, marginBottom: 6, cursor: 'pointer', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-2)', background: 'var(--white)', transition: 'all .12s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
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
