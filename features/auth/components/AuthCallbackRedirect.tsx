"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/user.types";

function getDestination(user: Pick<User, "role_name" | "needs_onboarding">) {
  if (user.needs_onboarding || !user.role_name) {
    return "/role";
  }

  return user.role_name === "teacher" ? "/teacher" : "/student";
}

interface AuthCallbackRedirectProps {
  fallbackUser: User;
}

export function AuthCallbackRedirect({
  fallbackUser,
}: AuthCallbackRedirectProps) {
  const { fetchMe, hydrateFromUser } = useAuth();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    let isCancelled = false;

    void (async () => {
      const freshUser = await fetchMe();

      if (isCancelled) {
        return;
      }

      const nextUser = freshUser ?? fallbackUser;
      if (!freshUser) {
        hydrateFromUser(fallbackUser);
      }

      window.location.replace(getDestination(nextUser));
    })();

    return () => {
      isCancelled = true;
    };
  }, [fallbackUser, fetchMe, hydrateFromUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="space-y-1">
        <h1 className="font-display text-xl font-semibold text-on-surface">
          Dang dang nhap...
        </h1>
        <p className="text-sm text-muted-foreground">
          Chung toi dang dong bo thong tin tai khoan cua ban.
        </p>
      </div>
    </div>
  );
}
