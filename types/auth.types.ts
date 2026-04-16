import { User } from './user.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher';
}

export interface AuthState {
  user: User | null;
  role: 'student' | 'teacher' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  selectRole: (role: 'student' | 'teacher') => void;
  logout: () => void;
}
