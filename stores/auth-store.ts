import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, RegisterData } from '@/types/auth.types';
import { User } from '@/types/user.types';

const SESSION_COOKIE = 'auth-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Client-only: sets the session cookie that Next.js middleware can read. */
export function setSessionCookie(user: User): void {
  if (typeof document === 'undefined') return;
  // btoa crashes on non-Latin1 chars; use UTF-8 safe encoding
  const value = btoa(unescape(encodeURIComponent(JSON.stringify({ id: user.id, role: user.role, email: user.email }))));
  document.cookie = `${SESSION_COOKIE}=${value}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

/** Client-only: clears the session cookie. */
export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

const mockUsers: User[] = [
  { id: '1', name: 'Nguyễn Văn Minh', email: 'student@scholar.com', role: 'student', createdAt: '2024-01-01' },
  { id: '2', name: 'Trần Thị Lan', email: 'teacher@scholar.com', role: 'teacher', createdAt: '2024-01-01' },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 800));
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
          const newUser: User = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email,
            role: email.includes('teacher') ? 'teacher' : 'student',
            createdAt: new Date().toISOString(),
          };
          set({ user: newUser, role: newUser.role, isAuthenticated: true, isLoading: false });
          setSessionCookie(newUser);
        } else {
          set({ user, role: user.role, isAuthenticated: true, isLoading: false });
          setSessionCookie(user);
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 800));
        const newUser: User = {
          id: Date.now().toString(),
          name: data.name,
          email: data.email,
          role: data.role,
          createdAt: new Date().toISOString(),
        };
        set({ user: newUser, role: data.role, isAuthenticated: true, isLoading: false });
        setSessionCookie(newUser);
      },

      selectRole: (role) => {
        const { user } = get();
        if (user) {
          const updated = { ...user, role };
          set({ role, user: updated });
          setSessionCookie(updated);
        } else {
          set({ role });
        }
      },

      logout: () => {
        set({ user: null, role: null, isAuthenticated: false });
        clearSessionCookie();
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
