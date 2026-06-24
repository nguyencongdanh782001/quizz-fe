"use client";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import {
  SELECT_ROLE_PATH,
  isOnboardingIncomplete,
} from "@/lib/auth/onboarding";

export function useAuth() {
  const {
    user,
    role_id,
    role_name,
    needs_onboarding,
    isAuthenticated,
    isLoading,
    login,
    register,
    fetchMe,
    completeOnboarding,
    hydrateFromUser,
    logout,
  } = useAuthStore();
  const router = useRouter();

  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  };

  const requireRole = (requiredRole: "student" | "teacher") => {
    requireAuth();
    if (
      isOnboardingIncomplete({ needs_onboarding, role_id, role_name })
    ) {
      router.push(SELECT_ROLE_PATH);
      return;
    }

    if (role_name && role_name !== requiredRole) {
      router.push("/");
    }
  };

  return {
    user,
    role_name,
    needs_onboarding,
    isAuthenticated,
    isLoading,
    login,
    register,
    fetchMe,
    completeOnboarding,
    hydrateFromUser,
    logout,
    requireAuth,
    requireRole,
  };
}
