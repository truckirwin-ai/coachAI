import { create } from 'zustand';

interface AssessmentResult {
  score: number;
  total: number;
  date: string;
}

interface AssessmentStore {
  results: Record<string, AssessmentResult>;
  setResult: (assessmentId: string, score: number, total: number) => void;
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  results: JSON.parse(localStorage.getItem('coach_assessment_scores') || '{}'),
  setResult: (id, score, total) => {
    const result = { score, total, date: new Date().toLocaleDateString() };
    set((s) => {
      const next = { ...s.results, [id]: result };
      localStorage.setItem('coach_assessment_scores', JSON.stringify(next));
      return { results: next };
    });
  },
}));
