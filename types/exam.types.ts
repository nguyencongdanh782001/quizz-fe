export type QuestionType = 'single' | 'multiple' | 'multiple_choice' | 'true_false' | 'text';
export type ExamDifficulty = 'easy' | 'medium' | 'hard';
export type ExamStatus = 'draft' | 'published' | 'archived';

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  type: QuestionType;
  options: AnswerOption[];
  points: number;
  explanation?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: number; // 1-12
  difficulty: ExamDifficulty;
  duration: number; // minutes
  passingScore: number; // percentage 0-100
  questionCount: number;
  attemptCount: number;
  status: ExamStatus;
  createdBy: string; // teacher user id
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  tags: string[];
  classIds: string[]; // assigned class ids
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  answers: Record<string, string[]>; // questionId → selected option ids
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string;
  timeSpent: number; // seconds
}

export interface ExamFilter {
  subject?: string;
  grade?: number;
  difficulty?: ExamDifficulty;
  search?: string;
}

export interface ExamSession {
  examId: string;
  attemptId: string;
  currentIndex: number;
  answers: Record<string, string[]>;
  timeLeft: number; // seconds
  startedAt: string;
}
