import { User, UserGender, UserRole } from "./user.types";

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CompleteOnboardingData {
  role: UserRole;
  full_name: string;
  date_of_birth: string;
  gender: UserGender;
  school_name?: string | null;
}

export interface AuthState {
  user: User | null;
  role_id: number | null;
  role_name: UserRole | null;
  needs_onboarding: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  fetchMe: () => Promise<User | null>;
  completeOnboarding: (data: CompleteOnboardingData) => Promise<User>;
  hydrateFromUser: (user: User) => void;
  logout: () => Promise<void>;
}
