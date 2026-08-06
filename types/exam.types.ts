export type QuestionType =
  | "single"
  | "multiple"
  | "multiple_choice"
  | "true_false"
  | "text";
export type ExamDifficulty = "easy" | "medium" | "hard";
export type ExamStatus = "draft" | "published" | "archived";
export type ExamAssignmentType = "test" | "exam";

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect?: boolean;
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

export interface StudentAnswer {
  question_id: string;
  radio_answer?: string;
  checkbox_answer?: string[];
  text_answer?: string;
}

export type StudentAnswersByQuestion = Record<string, StudentAnswer>;

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
  /** Exam availability window — when students may start the exam. */
  startTime?: string | null;
  endTime?: string | null;
  thumbnailUrl?: string;
  tags: string[];
  classIds: string[]; // assigned class ids
  classroomName?: string | null;
  totalPoints?: number | null;
  scope?: string | null;
  /** Origin of the exam — preferred over `scope` for UI badges. */
  source?: "teacher" | "system";
  isPublished?: boolean;
  isActive?: boolean;
  assignmentType?: ExamAssignmentType;
  examType?: ExamAssignmentType;
  maxAttempts?: number | null;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  answers: StudentAnswersByQuestion;
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
  answers: StudentAnswersByQuestion;
  timeLeft: number; // seconds
  startedAt: string;
}
