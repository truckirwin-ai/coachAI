import { create } from 'zustand';

export interface CoachSettings {
  // Voice
  coachVoiceId: string;
  coachVoiceName: string;
  voiceEnabled: boolean; // auto-TTS for coaching session
  voiceSpeed: number; // 0.75 | 1.0 | 1.25 | 1.5

  // Session
  sessionLength: number; // preferred session length in minutes: 15 | 30 | 45 | 60
  autoSuggestTopics: boolean; // show topic suggestions after each response

  // Coaching style
  coachingStyle: 'socratic' | 'directive' | 'balanced'; // how the AI coach responds

  // Display
  fontSize: 'small' | 'medium' | 'large';
  showTimestamps: boolean;
  anthropicApiKey: string;
  elevenLabsApiKey: string;
}

const defaults: CoachSettings = {
  coachVoiceId: 'cgSgspJ2msm6clMCkdW9', // Jessica
  coachVoiceName: 'Jessica',
  voiceEnabled: false,
  voiceSpeed: 1.0,
  sessionLength: 30,
  autoSuggestTopics: true,
  coachingStyle: 'balanced',
  fontSize: 'medium',
  showTimestamps: true,
  anthropicApiKey: '',
  elevenLabsApiKey: '',
};

interface SettingsStore extends CoachSettings {
  update: (patch: Partial<CoachSettings>) => void;
  reset: () => void;
}

const stored = JSON.parse(localStorage.getItem('coach_settings') || 'null');

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...(stored || defaults),
  update: (patch) => set((s) => {
    const next = { ...s, ...patch };
    localStorage.setItem('coach_settings', JSON.stringify(next));
    return next;
  }),
  reset: () => set(() => {
    localStorage.setItem('coach_settings', JSON.stringify(defaults));
    return { ...defaults };
  }),
}));
