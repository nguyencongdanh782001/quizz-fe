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