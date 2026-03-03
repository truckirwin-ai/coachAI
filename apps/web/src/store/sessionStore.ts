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

interface SessionStore {
  messages: Message[];
  isThinking: boolean;
  isSpeaking: boolean;
  skillName: string;
  skillDomain: string;
  sessionType: string;
  weekNumber: number;
  elapsedSecs: number;
  pendingInput: string;
  addUserMessage: (content: string) => void;
  setThinking: (v: boolean) => void;
  setIsSpeaking: (v: boolean) => void;
  addCoachMessage: (content: string) => void;
  setSession: (skill: string, type: string, week: number, initial: Message[]) => void;
  setSkill: (name: string, domain: string) => void;
  setPendingInput: (text: string) => void;
  tick: () => void;
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  messages: [],
  isThinking: false,
  isSpeaking: false,
  skillName: 'Difficult Conversations',
  skillDomain: 'Leadership',
  sessionType: 'Curriculum',
  weekNumber: 2,
  elapsedSecs: 0,
  pendingInput: '',
  addUserMessage: async (content) => {
    const msg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: nowTime() };
    set((s) => ({ messages: [...s.messages, msg], isThinking: false }));

    const state = get();

    // Build Claude message history (coach → assistant, user → user)
    const history = [...state.messages, msg].map(m => ({
      role: m.role === 'coach' ? 'assistant' as const : 'user' as const,
      content: m.content,
    }));

    // Add empty streaming placeholder
    const responseId = Date.now().toString() + '_coach';
    const coachMsg: Message = { id: responseId, role: 'coach', content: '', timestamp: nowTime() };
    set((s) => ({ messages: [...s.messages, coachMsg] }));

    let accumulated = '';

    // Read coaching style from settings
    const { coachingStyle, voiceEnabled, coachVoiceId } = useSettingsStore.getState();

    try {
      await sendCoachMessage(
        history,
        state.skillName,
        state.sessionType,
        (token: string) => {
          accumulated += token;
          set((s) => ({
            messages: s.messages.map(m =>
              m.id === responseId ? { ...m, content: accumulated } : m
            ),
          }));
        },
        coachingStyle
      );
    } catch {
      // Fallback to canned response if API fails
      const fallback = coachResponses[Math.floor(Math.random() * coachResponses.length)];
      accumulated = fallback;
      set((s) => ({
        messages: s.messages.map(m =>
          m.id === responseId ? { ...m, content: fallback } : m
        ),
      }));
    }

    // After streaming completes, speak the response if voiceEnabled
    if (voiceEnabled) {
      try {
        const { generateSpeech, playAudio } = await import('../api/elevenlabs');
        // Note: voiceSpeed from settings is not applied here — ElevenLabs flash model
        // (eleven_flash_v2_5) does not support speed adjustment via API. Reserved for future use.
        const audioUrl = await generateSpeech(accumulated, coachVoiceId);
        get().setIsSpeaking(true);
        await playAudio(audioUrl);
        // Cooldown: wait 1.5s after audio ends before re-enabling mic
        // Prevents speaker output from being picked up by the mic
        await new Promise(resolve => setTimeout(resolve, 1500));
        get().setIsSpeaking(false);
      } catch {
        // TTS failure is silent — text still shows
      }
    }
  },
  setThinking: (v) => set({ isThinking: v }),
  setIsSpeaking: (v) => set({ isSpeaking: v }),
  addCoachMessage: (content) => {
    const msg: Message = { id: Date.now().toString(), role: 'coach', content, timestamp: nowTime() };
    set((s) => ({ messages: [...s.messages, msg], isThinking: false }));
  },
  setSession: (skill, type, week, initial) =>
    set({ skillName: skill, sessionType: type, weekNumber: week, messages: initial, elapsedSecs: 0 }),
  setSkill: (name, domain) => set({ skillName: name, skillDomain: domain }),
  setPendingInput: (text) => set({ pendingInput: text }),
  tick: () => set((s) => ({ elapsedSecs: s.elapsedSecs + 1 })),
}));
