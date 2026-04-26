"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthHydratorProps {
  children: React.ReactNode;
}

/**
 * Hydrates Zustand auth store with fresh data from /auth/me on mount.
 * Use this to ensure Header/Sidebar have fresh user data after SSR redirects.
 */
export function AuthHydrator({ children }: AuthHydratorProps) {
  const { fetchMe } = useAuth();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return <>{children}</>;
}
