"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/user.types";
import { getPostAuthDestination } from "@/lib/auth/onboarding";
import { setLoginSuccessFlash } from "@/lib/auth/login-success-flash";

function getDestination(user: Pick<User, "role_name" | "needs_onboarding" | "role_id">) {
  return getPostAuthDestination(user);
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

      setLoginSuccessFlash();
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
