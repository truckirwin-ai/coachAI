import { create } from 'zustand';
import { coachResponses } from '../data/mockData';
import { sendCoachMessage } from '../api/claude';
import { useSettingsStore } from './settingsStore';

export interface Message {
  id: string;
  role: 'user' | 'coach';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  topicId: string;
  topicLabel: string;
  messages: Message[];
  startedAt: string;
}

interface SessionStore {
  conversations: Conversation[];
  activeConversationId: string;
  isThinking: boolean;
  isSpeaking: boolean;
  skillName: string;
  skillDomain: string;
  sessionType: string;
  weekNumber: number;
  elapsedSecs: number;
  pendingInput: string;

  // Derived: active conversation's messages
  messages: Message[];

  addUserMessage: (content: string) => void;
  bargeIn: () => void;
  setThinking: (v: boolean) => void;
  setIsSpeaking: (v: boolean) => void;
  addCoachMessage: (content: string) => void;
  setSession: (skill: string, type: string, week: number, initial: Message[]) => void;
  setSkill: (name: string, domain: string) => void;
  setPendingInput: (text: string) => void;
  tick: () => void;
  newConversation: (topicId: string, topicLabel: string) => void;
  switchConversation: (id: string) => void;
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function extractSentences(text: string): [string[], string] {
  const matches = [...text.matchAll(/[^.!?]*[.!?]+\s*/g)];
  if (matches.length === 0) return [[], text];
  const sentences = matches.map(m => m[0].trim()).filter(s => s.length > 2);
  const consumed = matches.reduce((acc, m) => acc + m[0].length, 0);
  return [sentences, text.slice(consumed)];
}

function makeConversation(topicId: string, topicLabel: string, messages: Message[] = []): Conversation {
  return { id: Date.now().toString(), topicId, topicLabel, messages, startedAt: nowTime() };
}

function syncMessages(conversations: Conversation[], activeId: string): Message[] {
  return conversations.find(c => c.id === activeId)?.messages ?? [];
}

let activeTTSController: { abort: () => void } | null = null;

const initialConvo = makeConversation('difficult-conversations', 'Difficult Conversations');

export const useSessionStore = create<SessionStore>((set, get) => ({
  conversations: [initialConvo],
  activeConversationId: initialConvo.id,
  messages: [],
  isThinking: false,
  isSpeaking: false,
  skillName: 'Difficult Conversations',
  skillDomain: 'Leadership',
  sessionType: 'Curriculum',
  weekNumber: 2,
  elapsedSecs: 0,
  pendingInput: '',

  newConversation: (topicId, topicLabel) => {
    const convo = makeConversation(topicId, topicLabel);
    set(s => {
      const conversations = [...s.conversations, convo];
      return {
        conversations,
        activeConversationId: convo.id,
        messages: [],
        skillName: topicLabel,
      };
    });
  },

  switchConversation: (id) => {
    set(s => ({
      activeConversationId: id,
      messages: syncMessages(s.conversations, id),
      skillName: s.conversations.find(c => c.id === id)?.topicLabel ?? s.skillName,
    }));
  },

  bargeIn: () => {
    if (activeTTSController) { activeTTSController.abort(); activeTTSController = null; }
    set({ isSpeaking: false });
  },

  addUserMessage: async (content) => {
    const activeId = get().activeConversationId;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: nowTime() };

    // Append user message to active conversation
    set(s => {
      const conversations = s.conversations.map(c =>
        c.id === activeId ? { ...c, messages: [...c.messages, userMsg] } : c
      );
      return { conversations, messages: syncMessages(conversations, activeId) };
    });

    const state = get();
    const activeConvo = state.conversations.find(c => c.id === activeId)!;
    const history = activeConvo.messages.map(m => ({
      role: m.role === 'coach' ? 'assistant' as const : 'user' as const,
      content: m.content,
    }));

    const responseId = Date.now().toString() + '_coach';
    const coachMsg: Message = { id: responseId, role: 'coach', content: '', timestamp: nowTime() };

    set(s => {
      const conversations = s.conversations.map(c =>
        c.id === activeId ? { ...c, messages: [...c.messages, coachMsg] } : c
      );
      return { conversations, messages: syncMessages(conversations, activeId) };
    });

    const { coachingStyle, voiceEnabled, coachVoiceId } = useSettingsStore.getState();

    let ttsController: { push: (s: string) => void; finish: () => void; abort: () => void } | null = null;
    if (voiceEnabled) {
      const { createTTSPipeline } = await import('../api/elevenlabs');
      ttsController = createTTSPipeline(
        coachVoiceId,
        () => set({ isSpeaking: true }),
        () => { activeTTSController = null; set({ isSpeaking: false }); }
      );
      activeTTSController = ttsController;
    }

    let accumulated = '';
    let sentenceBuffer = '';

    try {
      await sendCoachMessage(
        history,
        state.skillName,
        state.sessionType,
        (token: string) => {
          accumulated += token;
          sentenceBuffer += token;

          set(s => {
            const conversations = s.conversations.map(c =>
              c.id === activeId
                ? { ...c, messages: c.messages.map(m => m.id === responseId ? { ...m, content: accumulated } : m) }
                : c
            );
            return { conversations, messages: syncMessages(conversations, activeId) };
          });

          if (ttsController) {
            const [sentences, remainder] = extractSentences(sentenceBuffer);
            sentenceBuffer = remainder;
            for (const sentence of sentences) ttsController.push(sentence);
          }
        },
        coachingStyle
      );

      if (ttsController && sentenceBuffer.trim().length > 0) ttsController.push(sentenceBuffer.trim());
      ttsController?.finish();

    } catch {
      ttsController?.abort();
      activeTTSController = null;
      const fallback = coachResponses[Math.floor(Math.random() * coachResponses.length)];
      set(s => {
        const conversations = s.conversations.map(c =>
          c.id === activeId
            ? { ...c, messages: c.messages.map(m => m.id === responseId ? { ...m, content: fallback } : m) }
            : c
        );
        return { conversations, messages: syncMessages(conversations, activeId), isSpeaking: false };
      });
    }
  },

  setThinking: (v) => set({ isThinking: v }),
  setIsSpeaking: (v) => set({ isSpeaking: v }),

  addCoachMessage: (content) => {
    const activeId = get().activeConversationId;
    const msg: Message = { id: Date.now().toString(), role: 'coach', content, timestamp: nowTime() };
    set(s => {
      const conversations = s.conversations.map(c =>
        c.id === activeId ? { ...c, messages: [...c.messages, msg] } : c
      );
      return { conversations, messages: syncMessages(conversations, activeId) };
    });
  },

  setSession: (skill, type, week, initial) => {
    const activeId = get().activeConversationId;
    set(s => {
      const conversations = s.conversations.map(c =>
        c.id === activeId ? { ...c, messages: initial } : c
      );
      return { conversations, messages: initial, skillName: skill, sessionType: type, weekNumber: week, elapsedSecs: 0 };
    });
  },

  setSkill: (name, domain) => set({ skillName: name, skillDomain: domain }),
  setPendingInput: (text) => set({ pendingInput: text }),
  tick: () => set(s => ({ elapsedSecs: s.elapsedSecs + 1 })),
}));
