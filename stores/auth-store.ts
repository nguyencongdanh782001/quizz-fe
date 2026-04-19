import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, RegisterData } from '@/types/auth.types';
import { User } from '@/types/user.types';
import { api } from '@/lib/api/endpoints/auth';

const SESSION_COOKIE = 'auth-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function setSessionCookie(user: User): void {
  if (typeof document === 'undefined') return;
  const value = btoa(unescape(encodeURIComponent(JSON.stringify({ id: user.id, role: user.role, email: user.email }))));
  document.cookie = `${SESSION_COOKIE}=${value}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

function userFromSchema(u: { id: number; full_name: string; email: string; role_name: 'teacher' | 'student' | null; created_at: string }): User {
  return {
    id: u.id.toString(),
    name: u.full_name,
    email: u.email,
    role: u.role_name ?? null,
    createdAt: u.created_at,
  };
}

export const useAuthStore = create<AuthState & { fetchMe: () => Promise<void>; fetchError: string | null }>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      fetchError: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, fetchError: null });
        try {
          const res = await api.auth.login({ email, password });
          const user = userFromSchema(res.data.user);
          set({ user, role: res.data.user.role_name, isAuthenticated: true, isLoading: false });
          setSessionCookie(user);
        } catch {
          set({ isLoading: false, fetchError: 'Đăng nhập thất bại' });
          throw new Error('Login failed');
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, fetchError: null });
        try {
          const res = await api.auth.register({
            full_name: data.name,
            email: data.email,
            password: data.password,
            confirm_password: data.confirmPassword,
          });
          const user = userFromSchema(res.data.user);
          set({ user, role: res.data.user.role_name, isAuthenticated: true, isLoading: false });
          setSessionCookie(user);
        } catch {
          set({ isLoading: false, fetchError: 'Đăng ký thất bại' });
          throw new Error('Register failed');
        }
      },

      fetchMe: async () => {
        try {
          const res = await api.auth.me();
          const user = userFromSchema(res.data.user);
          set({ user, role: res.data.user.role_name, isAuthenticated: true, fetchError: null });
          setSessionCookie(user);
        } catch {
          set({ user: null, role: null, isAuthenticated: false, fetchError: null });
        }
      },

      selectRole: (role) => {
        set((state) => {
          if (state.user) {
            const updated = { ...state.user, role };
            setSessionCookie(updated);
            return { role, user: updated };
          }
          return { role };
        });
      },

      logout: async () => {
        try { await api.auth.logout(); } catch { /* swallow */ }
        set({ user: null, role: null, isAuthenticated: false });
        clearSessionCookie();
        window.location.href = '/';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);