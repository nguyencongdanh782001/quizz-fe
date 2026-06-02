"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthEvent } from "@/lib/auth/auth-events";
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastViewport,
} from "@/components/ui/toast";

interface AuthEventListenerProps {
  children: React.ReactNode;
}

/**
 * Listens for auth events from the event bus and renders toast notifications.
 * Mount once at the app root (inside QueryClientProvider).
 *
 * Guards against duplicate toasts within the same page lifecycle
 * using a ref, in case multiple 401/403 responses fire.
 */
export function AuthEventListener({ children }: AuthEventListenerProps) {
  const [open, setOpen] = useState(false);
  const hasShownRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthEvent((event) => {
      if (event.type === "SESSION_EXPIRED" && !hasShownRef.current) {
        hasShownRef.current = true;
        setOpen(true);
      }
    });

    // Reset the guard on window focus so re-auth works without a full reload.
    const handleFocus = () => {
      hasShownRef.current = false;
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <>
      {children}
      <ToastProvider duration={4000}>
        <Toast open={open} onOpenChange={setOpen} variant="error">
          <ToastTitle>Phiên đăng nhập đã hết hạn</ToastTitle>
          <ToastDescription>Vui lòng đăng nhập lại.</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    </>
  );
}
