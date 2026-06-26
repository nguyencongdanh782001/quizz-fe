import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AuthState,
  CompleteOnboardingData,
  RegisterData,
} from "@/types/auth.types";
import { User } from "@/types/user.types";
import { api } from "@/lib/api/endpoints/auth";
import { APP_MESSAGES } from "@/lib/app-messages";
import { mapUserSchemaToUser } from "@/lib/auth/user-mapper";
import { extractUserFromProfileResponse } from "@/lib/auth/response";
import { getApiErrorMessage } from "@/lib/api/error-message";

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
          role_id: user.role_id,
          role_name: user.role_name,
          needs_onboarding: user.needs_onboarding,
          avatar_url: user.avatar_url,
          updated_at: user.updated_at,
          email: user.email,
          email_verified: user.email_verified,
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

function applyAuthenticatedUser(
  set: (partial: Partial<PersistedAuthState>) => void,
  user: User,
) {
  set({
    user,
    role_id: user.role_id ?? null,
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
    role_id: null,
    role_name: null,
    needs_onboarding: false,
    isAuthenticated: false,
    isLoading: false,
    fetchError: null,
  });
  clearSessionCookie();
}

export const useAuthStore = create<PersistedAuthState>()(
  persist(
    (set) => ({
      user: null,
      role_id: null,
      role_name: null,
      needs_onboarding: false,
      isAuthenticated: false,
      isLoading: false,
      fetchError: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, fetchError: null });
        try {
          const res = await api.auth.login({ email, password });
          let user = mapUserSchemaToUser(res.data.user);

          try {
            const profileRes = await api.auth.profile();
            user = extractUserFromProfileResponse(profileRes.data);
          } catch (profileErr) {
            console.warn("Falling back to login response after profile fetch failed", profileErr);
          }

          applyAuthenticatedUser(set, user);
          return user;
        } catch (err) {
          console.error("Failed to login", err);
          const message = APP_MESSAGES.LOGIN_FAILED;
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
          let user = mapUserSchemaToUser(res.data.user);

          try {
            const profileRes = await api.auth.profile();
            user = extractUserFromProfileResponse(profileRes.data);
          } catch (profileErr) {
            console.warn("Falling back to register response after profile fetch failed", profileErr);
          }

          applyAuthenticatedUser(set, user);
          return user;
        } catch (err) {
          console.error("Failed to register", err);
          const message = getApiErrorMessage(err, APP_MESSAGES.REGISTER_FAILED);
          set({ isLoading: false, fetchError: message });
          throw new Error(message);
        }
      },

      fetchMe: async () => {
        set({ isLoading: true, fetchError: null });
        try {
          const res = await api.auth.profile();
          const user = extractUserFromProfileResponse(res.data);
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
          let user = mapUserSchemaToUser(res.data.user);

          try {
            const profileRes = await api.auth.profile();
            user = extractUserFromProfileResponse(profileRes.data);
          } catch (profileErr) {
            console.warn(
              "Falling back to onboarding response after profile refresh failed",
              profileErr,
            );
          }

          applyAuthenticatedUser(set, user);
          return user;
        } catch (err) {
          console.error("Failed to complete onboarding", err);
          const message = APP_MESSAGES.COMPLETE_ONBOARDING_FAILED;
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
        role_id: state.role_id,
        role_name: state.role_name,
        needs_onboarding: state.needs_onboarding,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
