export const TEACHER_EXAM_QUESTION_TYPES = ["single_choice", "text"] as const;

export type TeacherExamQuestionType =
  (typeof TEACHER_EXAM_QUESTION_TYPES)[number];

export const DEFAULT_TEACHER_EXAM_QUESTION_TYPE: TeacherExamQuestionType =
  "single_choice";

export interface TeacherExamOptionFormValues {
  client_id: string;
  option_text: string;
  image_url: string;
  is_correct: boolean;
}

export interface TeacherExamQuestionFormValues {
  client_id: string;
  question_type: TeacherExamQuestionType;
  prompt: string;
  image_url: string;
  points: number;
  accepted_answers: string;
  options: TeacherExamOptionFormValues[];
}

export interface TeacherExamFormValues {
  title: string;
  description: string;
  image_url: string;
  duration_minutes: number;
  is_published: boolean;
  is_active: boolean;
  questions: TeacherExamQuestionFormValues[];
}
