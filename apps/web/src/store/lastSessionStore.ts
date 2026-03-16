// © 2026 Foundry SMB LLC. All rights reserved.
// Persists the most recent avatar coaching session so the dashboard
// can show the correct coach/topic and resume with full conversation history.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PersistedMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LastSessionState {
  coachId: string | null;
  topicId: string | null;
  topicLabel: string | null;
  history: PersistedMessage[];
  savedAt: string | null;

  saveSession: (
    coachId: string,
    topicId: string | undefined,
    topicLabel: string,
    history: PersistedMessage[]
  ) => void;
  clear: () => void;
}

export const useLastSessionStore = create<LastSessionState>()(
  persist(
    (set) => ({
      coachId: null,
      topicId: null,
      topicLabel: null,
      history: [],
      savedAt: null,

      saveSession: (coachId, topicId, topicLabel, history) =>
        set({
          coachId,
          topicId: topicId ?? null,
          topicLabel,
          // Cap at 40 messages (~20 turns) — enough context, not too much token burn
          history: history.slice(-40),
          savedAt: new Date().toISOString(),
        }),

      clear: () =>
        set({ coachId: null, topicId: null, topicLabel: null, history: [], savedAt: null }),
    }),
    { name: 'coachAI-lastSession' }
  )
);
