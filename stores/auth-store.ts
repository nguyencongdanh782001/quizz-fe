import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AuthState,
  CompleteOnboardingData,
  RegisterData,
} from "@/types/auth.types";
import { User } from "@/types/user.types";
import { api } from "@/lib/api/endpoints/auth";
import { UserSchema } from "@/lib/api/types";

const SESSION_COOKIE = "auth-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

interface PersistedAuthState extends AuthState {
  fetchError: string | null;
}

function setSessionCookie(user: User): void {
  if (typeof document === "undefined") return;

  // Keep a lightweight same-origin mirror so Next layouts can redirect in dev.
  const value = btoa(
    unescape(
      encodeURIComponent(
        JSON.stringify({
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          role_name: user.role_name,
          needs_onboarding: user.needs_onboarding,
          email: user.email,
          auth_type: user.auth_type,
        }),
      ),
    ),
  );

  document.cookie = `${SESSION_COOKIE}=${value}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

function userFromSchema(user: UserSchema): User {
  return {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    auth_type: user.auth_type,
    role_name: user.role_name ?? null,
    needs_onboarding: user.needs_onboarding,
    avatar_url: user.avatar_url ?? null,
    created_at: user.created_at,
    profile: user.profile
      ? {
          date_of_birth: user.profile.date_of_birth,
          age: user.profile.age,
          gender: user.profile.gender,
          school_name: user.profile.school_name ?? null,
          onboarding_completed_at: user.profile.onboarding_completed_at,
        }
      : null,
  };
}

function applyAuthenticatedUser(
  set: (partial: Partial<PersistedAuthState>) => void,
  user: User,
) {
  set({
    user,
    role_name: user.role_name,
    needs_onboarding: user.needs_onboarding,
    isAuthenticated: true,
    isLoading: false,
    fetchError: null,
  });
  setSessionCookie(user);
}

function clearAuthState(set: (partial: Partial<PersistedAuthState>) => void) {
  set({
    user: null,
    role_name: null,
    needs_onboarding: false,
    isAuthenticated: false,
    isLoading: false,
    fetchError: null,
  });
  clearSessionCookie();
}

function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as { message?: unknown; detail?: unknown };

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }

    if (typeof maybeError.detail === "string" && maybeError.detail.trim()) {
      return maybeError.detail;
    }
  }

  return fallback;
}

export const useAuthStore = create<PersistedAuthState>()(
  persist(
    (set) => ({
      user: null,
      role_name: null,
      needs_onboarding: false,
      isAuthenticated: false,
      isLoading: false,
      fetchError: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, fetchError: null });
        try {
          const res = await api.auth.login({ email, password });
          const user = userFromSchema(res.data.user);
          applyAuthenticatedUser(set, user);
          return user;
        } catch (err) {
          const message = getAuthErrorMessage(err, "Dang nhap that bai");
          set({ isLoading: false, fetchError: message });
          throw new Error(message);
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, fetchError: null });
        try {
          const res = await api.auth.register({
            full_name: data.full_name,
            email: data.email,
            password: data.password,
            confirm_password: data.confirmPassword,
          });
          const user = userFromSchema(res.data.user);
          applyAuthenticatedUser(set, user);
          return user;
        } catch (err) {
          const message = getAuthErrorMessage(err, "Dang ky that bai");
          set({ isLoading: false, fetchError: message });
          throw new Error(message);
        }
      },

      fetchMe: async () => {
        set({ isLoading: true, fetchError: null });
        try {
          const res = await api.auth.me();
          const user = userFromSchema(res.data.user);
          applyAuthenticatedUser(set, user);
          return user;
        } catch {
          clearAuthState(set);
          return null;
        }
      },

      completeOnboarding: async (data: CompleteOnboardingData) => {
        set({ isLoading: true, fetchError: null });
        try {
          const res = await api.auth.onboarding.complete(data);
          const user = userFromSchema(res.data.user);
          applyAuthenticatedUser(set, user);
          return user;
        } catch (err) {
          const message = getAuthErrorMessage(
            err,
            "Hoan tat thong tin that bai",
          );
          set({ isLoading: false, fetchError: message });
          throw new Error(message);
        }
      },

      hydrateFromUser: (user: User) => {
        applyAuthenticatedUser(set, user);
      },

      logout: async () => {
        try {
          await api.auth.logout();
        } catch {
          // Swallow logout errors so local cleanup still happens.
        }

        clearAuthState(set);
        window.location.href = "/";
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        role_name: state.role_name,
        needs_onboarding: state.needs_onboarding,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
