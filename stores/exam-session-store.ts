import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Exam, Question, ExamAttempt } from '@/types/exam.types';

export type ExamPhase = 'not-started' | 'in-progress' | 'submitted';

interface ExamSessionState {
  exam: Exam | null;
  questions: Question[];
  phase: ExamPhase;
  currentIndex: number;
  answers: Record<string, string[]>; // questionId → selected option ids
  startedAt: string | null;
  submittedAt: string | null;
  attemptId: string;
}

interface ExamSessionActions {
  startExam: (exam: Exam, questions: Question[]) => void;
  setAnswer: (questionId: string, optionIds: string[]) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitExam: () => ExamAttempt;
  resetSession: () => void;
}

const SESSION_COOKIE = 'exam-session';
const SESSION_MAX_AGE = 60 * 60 * 4; // 4 hours

export function setExamSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=active; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

export function clearExamSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

function computeScore(questions: Question[], answers: Record<string, string[]>): ExamAttempt {
  let score = 0;
  let totalPoints = 0;

  for (const q of questions) {
    totalPoints += q.points;
    const selected = answers[q.id] ?? [];
    const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);

    if (q.type === 'single' || q.type === 'multiple_choice' || q.type === 'true_false') {
      if (selected.length === 1 && correctIds.includes(selected[0])) {
        score += q.points;
      }
    } else if (q.type === 'multiple') {
      // All correct and no extras
      const isCorrect =
        selected.length === correctIds.length &&
        selected.every(id => correctIds.includes(id));
      if (isCorrect) score += q.points;
    }
  }

  return {
    id: `attempt-${Date.now()}`,
    examId: '',
    userId: '',
    answers,
    score,
    totalPoints,
    percentage: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0,
    passed: false,
    startedAt: '',
    submittedAt: '',
    timeSpent: 0,
  };
}

function hasLocalAnswerKey(questions: Question[]): boolean {
  return questions.every((question) => {
    if (question.type === 'text') {
      return false;
    }

    return question.options.some(
      (option) => typeof option.isCorrect === 'boolean',
    );
  });
}

export const useExamSessionStore = create<ExamSessionState & ExamSessionActions>()(
  persist(
    (set, get) => ({
      exam: null,
      questions: [],
      phase: 'not-started',
      currentIndex: 0,
      answers: {},
      startedAt: null,
      submittedAt: null,
      attemptId: '',

      startExam: (exam, questions) => {
        set({
          exam,
          questions,
          phase: 'in-progress',
          currentIndex: 0,
          answers: {},
          startedAt: new Date().toISOString(),
          submittedAt: null,
          attemptId: `attempt-${Date.now()}`,
        });
        setExamSessionCookie();
      },

      setAnswer: (questionId, optionIds) => {
        set(state => ({
          answers: { ...state.answers, [questionId]: optionIds },
        }));
      },

      goToQuestion: (index) => {
        const { questions } = get();
        if (index >= 0 && index < questions.length) {
          set({ currentIndex: index });
        }
      },

      nextQuestion: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
          set({ currentIndex: currentIndex + 1 });
        }
      },

      prevQuestion: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1 });
        }
      },

      submitExam: () => {
        const { exam, questions, answers, startedAt, attemptId } = get();
        if (!exam || !startedAt) throw new Error('No active exam');
        if (!hasLocalAnswerKey(questions)) {
          throw new Error('Local grading is not available for this exam');
        }

        const submittedAt = new Date().toISOString();
        const timeSpent = Math.round(
          (new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000
        );

        let attempt = computeScore(questions, answers);
        attempt = {
          ...attempt,
          id: attemptId,
          examId: exam.id,
          userId: 'current-user',
          passed: attempt.percentage >= exam.passingScore,
          startedAt,
          submittedAt,
          timeSpent,
        };

        set({ phase: 'submitted', submittedAt, answers: { ...answers } });
        clearExamSessionCookie();

        return attempt;
      },

      resetSession: () => {
        set({
          exam: null,
          questions: [],
          phase: 'not-started',
          currentIndex: 0,
          answers: {},
          startedAt: null,
          submittedAt: null,
          attemptId: '',
        });
        clearExamSessionCookie();
      },
    }),
    {
      name: 'exam-session-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        exam: state.exam,
        questions: state.questions,
        phase: state.phase,
        currentIndex: state.currentIndex,
        answers: state.answers,
        startedAt: state.startedAt,
        submittedAt: state.submittedAt,
        attemptId: state.attemptId,
      }),
    }
  )
);
