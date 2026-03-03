import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  name: string;
  role: string;
  industry: string;
  focusArea: string;
  isOnboarded: boolean;
  setProfile: (p: Partial<UserStore>) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: '',
      role: '',
      industry: '',
      focusArea: '',
      isOnboarded: false,
      setProfile: (p) => set((s) => ({ ...s, ...p })),
      completeOnboarding: () => set({ isOnboarded: true }),
      reset: () => set({ name: '', role: '', industry: '', focusArea: '', isOnboarded: false }),
    }),
    { name: 'coachAI-user' }
  )
);
