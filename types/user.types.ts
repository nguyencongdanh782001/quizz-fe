export type UserRole = "student" | "teacher";
export type UserGender = "male" | "female" | "other";

export interface UserProfile {
  date_of_birth: string;
  age: number;
  gender: UserGender;
  school_name: string | null;
  onboarding_completed_at: string;
}

export interface User {
  id: number;
  role_id: number | null;
  full_name: string;
  username: string;
  email: string;
  auth_type: string;
  role_name: UserRole | null;
  needs_onboarding: boolean;
  avatar_url: string | null;
  updated_at: string;
  created_at: string;
  profile: UserProfile | null;
}
