// ─── Schemas from OpenAPI spec ──────────────────────────────────────────────

export interface UserProfileSchema {
  date_of_birth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  school_name: string | null;
  onboarding_completed_at: string;
}

export interface UserSchema {
  id: number;
  role_id: number | null;
  role_name: 'teacher' | 'student' | null;
  full_name: string;
  username: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  auth_type: string;
  email_verified: boolean;
  status: string;
  is_first_login: boolean;
  max_exam_create: number;
  max_document_create: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  needs_onboarding: boolean;
  profile: UserProfileSchema | null;
}

export interface SessionSchema {
  id: number;
  login_method: string;
  ip_address: string | null;
  user_agent: string | null;
  is_revoked: boolean;
  expires_at: string;
  refresh_expires_at: string | null;
  created_at: string;
  last_used_at: string | null;
}

// ─── Request/Response shapes ─────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface AuthSessionResponse {
  message: string;
  user: UserSchema;
  session: SessionSchema;
}

// ─── Response shapes ────────────────────────────────────────────────────────

export interface MeResponse {
  user: UserSchema;
  session: SessionSchema;
}

export interface GoogleCallbackResponse {
  message: string;
  is_new_user: boolean;
  user: UserSchema;
  session: SessionSchema;
}

export interface RoleOptionSchema {
  id: number;
  name: 'teacher' | 'student';
  display_name: string;
  required_fields: string[];
}

export interface RoleListResponse {
  roles: RoleOptionSchema[];
}

export interface RefreshSessionResponse {
  message: string;
  session: SessionSchema;
}

export interface SessionListResponse {
  sessions: SessionSchema[];
}

export interface RevokeSessionResponse {
  message: string;
  session: SessionSchema;
}

export interface CompleteOnboardingRequest {
  role: 'teacher' | 'student';
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  school_name?: string | null;
}

export interface CompleteOnboardingResponse {
  message: string;
  user: UserSchema;
}

export interface MessageResponse {
  message: string;
}

export interface HealthResponse {
  status: 'ok';
}

export interface DbCheckResponse {
  database: 'connected' | 'failed';
}

export interface RootResponse {
  message: string;
}

export interface StudentSystemExamSchema {
  id: number;
  title: string;
  description: string;
  image_url?: string | null;
  scope: string;
  classroom_id: number;
  classroom_name: string | null;
  duration_minutes: number;
  total_points: number;
  question_count: number;
  is_active: boolean;
}

export interface StudentSystemExamListResponse {
  items: StudentSystemExamSchema[];
}

export interface StudentSystemDocumentSchema {
  id: number;
  title: string;
  summary: string;
  content: string;
  scope: string;
  classroom_id: number;
  classroom_name: string | null;
  created_at: string;
}

export interface StudentSystemDocumentListResponse {
  items: StudentSystemDocumentSchema[];
}

export interface StudentSystemResultSummarySchema {
  total_completed_exams: number;
  passed_exams: number;
  average_score_percent: number;
}

export interface StudentSystemResultSchema {
  attempt_id: number;
  exam_id: number;
  exam_title: string;
  exam_description: string;
  exam_image_url: string | null;
  scope: string;
  classroom_id: number | null;
  classroom_name: string | null;
  score: number;
  total_points: number;
  score_percent: number;
  correct_answers_count: number;
  total_questions: number;
  is_passed: boolean;
  started_at: string;
  submitted_at: string;
}

export interface StudentSystemResultListResponse {
  summary: StudentSystemResultSummarySchema;
  items: StudentSystemResultSchema[];
}

export interface StudentClassSchema {
  id: number;
  name: string;
  description: string;
  join_code: string;
  joined_at: string;
  exam_count: number;
  document_count: number;
}

export interface StudentClassListResponse {
  items: StudentClassSchema[];
}

export interface StudentJoinClassRequest {
  join_code: string;
}

export interface StudentJoinClassResponse {
  message: string;
  classroom: StudentClassSchema;
}

export interface TeacherClassSchema {
  id: number;
  name: string;
  description: string;
  join_code: string;
  student_count: number;
  exam_count: number;
  document_count: number;
  created_at: string;
}

export interface TeacherClassListResponse {
  items: TeacherClassSchema[];
}

export interface TeacherCreateClassRequest {
  name: string;
  description: string;
  join_code: string;
}

export interface TeacherCreateClassResponse {
  message: string;
  classroom: TeacherClassSchema;
}

export interface TeacherClassStudentSchema {
  id: number;
  full_name: string;
  username: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  gender: string | null;
  school_name: string | null;
  joined_at: string;
}

export interface TeacherClassStudentListResponse {
  items: TeacherClassStudentSchema[];
}

export interface TeacherClassDocumentSchema {
  id: number;
  title: string;
  summary: string;
  content: string;
  scope: string;
  classroom_id: number | null;
  classroom_name: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherClassDocumentListResponse {
  items: TeacherClassDocumentSchema[];
}

export interface TeacherExamOptionSchema {
  id: number;
  option_key: string;
  option_text: string;
  image_url: string | null;
  is_correct: boolean;
}

export interface TeacherExamQuestionSchema {
  id: number;
  question_type: "single_choice" | "multiple_choice" | "text";
  prompt: string;
  image_url: string | null;
  order_index: number;
  points: number;
  options: TeacherExamOptionSchema[];
  accepted_answers: string[];
}

export interface TeacherExamSummarySchema {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  scope: string;
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
}

export interface TeacherSystemExamListResponse {
  items: TeacherExamSummarySchema[];
}

export interface TeacherSystemExamDetailResponse
  extends TeacherExamSummarySchema {
  questions?: TeacherExamQuestionSchema[] | null;
}

export type TeacherClassExamSchema = TeacherExamSummarySchema;

export interface TeacherClassExamListResponse {
  items: TeacherClassExamSchema[];
}

export interface TeacherCreateExamOptionRequest {
  option_key: string;
  option_text: string;
  image_url?: string | null;
  is_correct: boolean;
}

export interface TeacherCreateExamQuestionRequest {
  question_type: "single_choice" | "multiple_choice" | "text";
  prompt: string;
  image_url?: string | null;
  order_index: number;
  points: number;
  options: TeacherCreateExamOptionRequest[];
  accepted_answers: string[];
}

export interface TeacherCreateExamRequest {
  title: string;
  description?: string | null;
  image_url?: string | null;
  duration_minutes: number;
  is_published: boolean;
  is_active: boolean;
  questions: TeacherCreateExamQuestionRequest[];
}

export interface TeacherUpdateExamRequest extends TeacherCreateExamRequest {
  scope: string;
  classroom_id: number | null;
}

export interface TeacherCreateClassExamResponse {
  message: string;
  exam?: TeacherClassExamSchema;
}

export interface TeacherCreateSystemExamResponse {
  message: string;
  exam: TeacherSystemExamDetailResponse;
}

export interface StudentExamOptionSchema {
  id: number;
  option_key: string;
  option_text: string;
}

export interface StudentExamQuestionSchema {
  id: number;
  question_type: string;
  order_index: number;
  prompt: string;
  points: number;
  options: StudentExamOptionSchema[];
}

export interface StudentExamDetailResponse {
  id: number;
  title: string;
  description: string;
  scope: string;
  classroom_id: number;
  classroom_name: string | null;
  duration_minutes: number;
  total_points: number;
  question_count: number;
  is_active: boolean;
  questions: StudentExamQuestionSchema[];
  in_progress_attempt_id: number | null;
}

export interface StudentExamAttemptSchema {
  id: number;
  exam_id: number;
  status: string;
  score: number;
  total_points: number;
  correct_answers_count: number;
  total_questions: number;
  answered_count: number;
  started_at: string;
  submitted_at: string | null;
}

export interface StudentStartExamAttemptResponse {
  message: string;
  attempt: StudentExamAttemptSchema;
}

export interface StudentAttemptAnswerPayloadItem {
  question_id: number;
  selected_option_id?: number | null;
  answer_text?: string | null;
}

export interface StudentSaveAttemptAnswersRequest {
  answers: StudentAttemptAnswerPayloadItem[];
}

export interface StudentSaveAttemptAnswersResponse {
  message: string;
  attempt: StudentExamAttemptSchema;
}

export interface StudentSubmittedAnswerSchema {
  question_id: number;
  question_type: string;
  prompt: string;
  selected_option_id: number | null;
  selected_option_text: string | null;
  submitted_answer_text: string | null;
  correct_option_id: number | null;
  correct_option_text: string | null;
  accepted_answers: string[];
  is_correct: boolean;
  points_earned: number;
  max_points: number;
}

export interface StudentSubmitAttemptResultSchema {
  attempt_id: number;
  exam_id: number;
  exam_title: string;
  status: string;
  score: number;
  total_points: number;
  correct_answers_count: number;
  total_questions: number;
  started_at: string;
  submitted_at: string;
  answers: StudentSubmittedAnswerSchema[];
}

export interface StudentSubmitAttemptResponse {
  message: string;
  result: StudentSubmitAttemptResultSchema;
}

export interface StudentAttemptResultResponse {
  result: StudentSubmitAttemptResultSchema;
}

// ─── Generic API response wrapper ───────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface ApiError {
  detail?: string;
  message?: string;
  code?: string;
  status?: number;
}
