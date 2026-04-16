"use client";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

export function useAuth() {
  const {
    user,
    role,
    isAuthenticated,
    isLoading,
    login,
    register,
    selectRole,
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
    if (role && role !== requiredRole) {
      router.push("/");
    }
  };

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    login,
    register,
    selectRole,
    logout,
    requireAuth,
    requireRole,
  };
}
