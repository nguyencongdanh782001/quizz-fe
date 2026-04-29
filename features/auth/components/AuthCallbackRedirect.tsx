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

export function AuthCallbackRedirect() {
  const { fetchMe } = useAuth();
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

      if (!freshUser) {
        window.location.replace("/login?error=session_not_found");
        return;
      }

      window.location.replace(getDestination(freshUser));
    })();

    return () => {
      isCancelled = true;
    };
  }, [fetchMe]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="space-y-1">
        <h1 className="font-display text-xl font-semibold text-on-surface">
          Đang đăng nhập...
        </h1>
        <p className="text-sm text-muted-foreground">
          Chúng tôi đang đồng bộ thông tin tài khoản của bạn.
        </p>
      </div>
    </div>
  );
}
