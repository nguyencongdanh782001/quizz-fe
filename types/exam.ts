export type TeacherExamQuestionType = "single_choice" | "text";

export type TeacherExamSortKey =
  | "created_at"
  | "updated_at"
  | "attempt_count"
  | "question_count";

export type TeacherExamSortOrder = "asc" | "desc";

export type TeacherExamPublishedFilter = "all" | "published" | "unpublished";

export type TeacherExamActiveFilter = "all" | "active" | "inactive";

export interface TeacherExamOption {
  id: number;
  option_key: string;
  option_text: string;
  image_url: string | null;
  is_correct: boolean;
}

export interface TeacherExamQuestion {
  id: number;
  question_type: TeacherExamQuestionType;
  order_index: number;
  prompt: string;
  explanation: string;
  image_url: string | null;
  points: number;
  options: TeacherExamOption[];
  accepted_answers: string[];
  explanation?: string;
}

export interface TeacherExam {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  scope: string | null;
  classroom_id: number | null;
  classroom_name: string | null;
  duration_minutes: number;
  total_points: number;
  question_count: number;
  attempt_count: number;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions?: TeacherExamQuestion[];
}

export interface TeacherExamPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TeacherExamListResult {
  items: TeacherExam[];
}

export interface TeacherExamQuery {
  search?: string;
  is_published?: boolean;
  is_active?: boolean;
  sort_by?: TeacherExamSortKey;
  sort_order?: TeacherExamSortOrder;
}

export interface TeacherExamFilterFormValues {
  search: string;
  published: TeacherExamPublishedFilter;
  active: TeacherExamActiveFilter;
  sort_by: TeacherExamSortKey;
  sort_order: TeacherExamSortOrder;
}
