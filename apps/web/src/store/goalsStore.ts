import { create } from 'zustand';
import { mockGoals } from '../data/mockData';

export interface Goal {
  id: string;
  name: string;
  pct: number;
  due: string;
  focusArea?: string;
}

interface GoalsStore {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'pct'>) => void;
  reflections: string[];
  addReflection: (text: string) => void;
}

export const useGoalsStore = create<GoalsStore>((set) => ({
  goals: mockGoals,
  addGoal: (goal) =>
    set((s) => ({
      goals: [...s.goals, { ...goal, id: Date.now().toString(), pct: 0 }],
    })),
  reflections: [],
  addReflection: (text) => set((s) => ({ reflections: [...s.reflections, text] })),
}));
