export const TEACHER_EXAM_QUESTION_TYPES = [
  "single_choice",
  "multiple_choice",
  "text",
] as const;

export type TeacherExamQuestionType =
  (typeof TEACHER_EXAM_QUESTION_TYPES)[number];

export const DEFAULT_TEACHER_EXAM_QUESTION_TYPE: TeacherExamQuestionType =
  "single_choice";

export const DEFAULT_TEACHER_EXAM_SCOPE = "system";

export interface TeacherExamOptionFormValues {
  id?: number;
  client_id: string;
  option_key: string;
  option_text: string;
  image_url: string;
  is_correct: boolean;
}

export interface TeacherExamQuestionFormValues {
  id?: number;
  client_id: string;
  question_type: TeacherExamQuestionType;
  prompt: string;
  explanation: string;
  image_url: string;
  order_index: number;
  points: number;
  accepted_answers: string[];
  options: TeacherExamOptionFormValues[];
}

export interface TeacherExamFormValues {
  title: string;
  description: string;
  grade: string;
  image_url: string;
  scope: string;
  classroom_id: number | null;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_published: boolean;
  is_active: boolean;
  questions: TeacherExamQuestionFormValues[];
}
