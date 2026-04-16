import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ExamDifficulty, QuestionType } from '@/types/exam.types';

export interface WizardQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: { id: string; text: string; isCorrect: boolean }[];
  answer?: string;      // for 'text' type — 4-char OTP answer
  explanation: string;
  points: number;
}

export interface ExamWizardState {
  // Step 1: Basic info
  title: string;
  description: string;
  subject: string;
  grade: number;
  difficulty: ExamDifficulty;
  tags: string[];
  // Step 2: Questions
  questions: WizardQuestion[];
  // Step 3: Settings
  duration: number;
  passingScore: number;
  attemptLimit: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  // Draft metadata
  draftId: string;
  lastSaved: string | null;
}

interface ExamWizardActions {
  updateBasicInfo: (data: Partial<Pick<ExamWizardState, 'title' | 'description' | 'subject' | 'grade' | 'difficulty' | 'tags'>>) => void;
  updateSettings: (data: Partial<Pick<ExamWizardState, 'duration' | 'passingScore' | 'attemptLimit' | 'shuffleQuestions' | 'shuffleOptions'>>) => void;
  addQuestion: (q: WizardQuestion) => void;
  updateQuestion: (id: string, data: Partial<WizardQuestion>) => void;
  removeQuestion: (id: string) => void;
  reorderQuestions: (questions: WizardQuestion[]) => void;
  resetWizard: () => void;
  loadDraft: (state: Partial<ExamWizardState>) => void;
}

const initialState: ExamWizardState = {
  title: '',
  description: '',
  subject: '',
  grade: 10,
  difficulty: 'medium',
  tags: [],
  questions: [],
  duration: 45,
  passingScore: 50,
  attemptLimit: 3,
  shuffleQuestions: false,
  shuffleOptions: false,
  draftId: `draft-${Date.now()}`,
  lastSaved: null,
};

export const useExamWizardStore = create<ExamWizardState & ExamWizardActions>()(
  persist(
    (set) => ({
      ...initialState,

      updateBasicInfo: (data) => set(state => ({ ...state, ...data, lastSaved: new Date().toISOString() })),

      updateSettings: (data) => set(state => ({ ...state, ...data, lastSaved: new Date().toISOString() })),

      addQuestion: (q) => set(state => ({
        ...state,
        questions: [...state.questions, q],
        lastSaved: new Date().toISOString(),
      })),

      updateQuestion: (id, data) => set(state => ({
        ...state,
        questions: state.questions.map(q => q.id === id ? { ...q, ...data } : q),
        lastSaved: new Date().toISOString(),
      })),

      removeQuestion: (id) => set(state => ({
        ...state,
        questions: state.questions.filter(q => q.id !== id),
        lastSaved: new Date().toISOString(),
      })),

      reorderQuestions: (questions) => set({ questions, lastSaved: new Date().toISOString() }),

      resetWizard: () => set({ ...initialState, draftId: `draft-${Date.now()}` }),

      loadDraft: (state) => set({ ...state }),
    }),
    {
      name: 'exam-wizard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
