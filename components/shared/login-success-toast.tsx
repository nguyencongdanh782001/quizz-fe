"use client";

import { useEffect, useState } from "react";
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { APP_MESSAGES } from "@/lib/app-messages";
import { consumeLoginSuccessFlash } from "@/lib/auth/login-success-flash";

const TOAST_DURATION = 3500;

export function LoginSuccessToast() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!consumeLoginSuccessFlash()) return;

    const timer = window.setTimeout(() => setOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ToastProvider duration={TOAST_DURATION}>
      {open ? (
        <Toast
          open={open}
          onOpenChange={setOpen}
          variant="success"
          duration={TOAST_DURATION}
        >
          <ToastTitle>{APP_MESSAGES.LOGIN_SUCCESS}</ToastTitle>
          <ToastClose />
        </Toast>
      ) : null}
      <ToastViewport />
    </ToastProvider>
  );
}

