"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  MailCheck,
  Send,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api/endpoints/auth";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { mapUserSchemaToUser } from "@/lib/auth/user-mapper";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

const DEFAULT_NEXT_PATH = "/select-role";
const LOGIN_PATH = "/login";
const OTP_LENGTH = 6;

interface EmailVerificationFormProps {
  email?: string;
  nextPath?: string;
  reason?: string;
  sent?: string;
}

type ToastVariant = "success" | "error" | "warning";

interface ToastState {
  id: number;
  open: boolean;
  title: string;
  description?: string;
  variant: ToastVariant;
}

function getSafeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return DEFAULT_NEXT_PATH;
  }

  return nextPath;
}

export function EmailVerificationForm({
  email,
  nextPath,
  sent,
}: EmailVerificationFormProps) {
  const router = useRouter();
  const { hydrateFromUser } = useAuth();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [toast, setToast] = useState<ToastState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const safeNextPath = getSafeNextPath(nextPath);
  const otpCode = useMemo(() => digits.join(""), [digits]);
  const isOtpComplete = digits.every(Boolean);

  function triggerToast(variant: ToastVariant, title: string, description?: string) {
    setToast({
      id: Date.now(),
      open: true,
      title,
      description,
      variant,
    });
  }

  useEffect(() => {
    if (sent === "1") {
      triggerToast(
        "success",
        "Gửi mã OTP thành công",
        "Mã OTP đã được gửi tới email của bạn.",
      );
    } else if (sent === "0") {
      triggerToast(
        "warning",
        "Chưa gửi được mã OTP",
        "Bấm Gửi mã để gửi lại.",
      );
    }
  }, [sent]);

  useEffect(() => {
    if (!isVerified) return;

    const timeout = window.setTimeout(() => {
      router.replace(safeNextPath);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [isVerified, router, safeNextPath]);

  function focusInput(index: number) {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }

  function applyDigits(startIndex: number, value: string) {
    const numbers = value.replace(/\D/g, "").slice(0, OTP_LENGTH - startIndex);

    if (!numbers) {
      setDigits((current) => {
        const nextDigits = [...current];
        nextDigits[startIndex] = "";
        return nextDigits;
      });
      return;
    }

    setDigits((current) => {
      const nextDigits = [...current];

      numbers.split("").forEach((digit, offset) => {
        nextDigits[startIndex + offset] = digit;
      });

      return nextDigits;
    });

    const nextIndex = Math.min(startIndex + numbers.length, OTP_LENGTH - 1);
    window.setTimeout(() => focusInput(nextIndex), 0);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>, index: number) {
    event.preventDefault();
    applyDigits(index, event.clipboardData.getData("text"));
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  async function handleSendOtp() {
    setIsSending(true);
    setError(null);

    try {
      await api.auth.sendEmailVerificationOtp();
      triggerToast(
        "success",
        "Gửi mã mới thành công",
        "Mã OTP mới đã được gửi tới email của bạn.",
      );
      focusInput(0);
    } catch (sendError) {
      const msg = getApiErrorMessage(
        sendError,
        "Không thể gửi mã OTP. Vui lòng thử lại.",
      );
      setError(msg);
      triggerToast("error", "Gửi mã thất bại", msg);
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);

    if (!isOtpComplete) {
      setError("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await api.auth.verifyEmailOtp({ otp_code: otpCode });
      const user = mapUserSchemaToUser(response.data.user);

      hydrateFromUser(user);
      triggerToast(
        "success",
        "Xác thực thành công",
        response.data.message || "Email đã được xác thực thành công.",
      );
      setIsVerified(true);
    } catch (verifyError) {
      const msg = getApiErrorMessage(
        verifyError,
        "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
      );
      setError(msg);
      triggerToast("error", "Xác thực thất bại", msg);
    } finally {
      setIsVerifying(false);
    }
  }

  function handleBackToInformation() {
    router.replace(LOGIN_PATH);
  }

  return (
    <ToastProvider duration={4200}>
      <div className="space-y-5">
        <div>
          <h2 className="text-[28px] font-semibold leading-tight text-[#222222]">
            Xác thực mã OTP
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Nhập 6 chữ số trong email để hoàn tất đăng ký tài khoản.
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-[#EEF2FF] text-[#6366F1]">
            <MailCheck className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#94A3B8]">Email</p>
            <p className="truncate text-sm font-semibold text-[#1E293B]">
              {email || "Email tài khoản của bạn"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSending || isVerifying || isVerified}
            className="flex shrink-0 items-center justify-center gap-2 rounded-[6px] bg-[linear-gradient(90deg,#3478ff_0%,#6557f5_54%,#d63cf4_100%)] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Gửi mã
          </button>
        </div>

        {error ? (
          <div className="flex gap-2 rounded-[6px] border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              value={digit}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Chữ số OTP ${index + 1}`}
              disabled={isVerifying || isVerified}
              onChange={(event) => applyDigits(index, event.target.value)}
              onPaste={(event) => handlePaste(event, index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="h-12 rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] text-center text-xl font-bold text-[#1E293B] shadow-xs outline-none transition-all duration-200 focus:border-[#6366F1] focus:bg-white focus:ring-2 focus:ring-[#6366F1]/20 disabled:opacity-60"
            />
          ))}
        </div>

        <div className="grid gap-3 pt-1">
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isVerifying || isSending || isVerified}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-[linear-gradient(90deg,#3478ff_0%,#6557f5_54%,#d63cf4_100%)] py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(101,87,245,0.3)] transition-all duration-200 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isVerifying ? <Loader2 className="size-4 animate-spin" /> : null}
            Xác thực OTP
          </button>

          <button
            type="button"
            onClick={handleBackToInformation}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-[#CBD5E1] bg-white py-3 text-sm font-bold text-[#1E293B] transition-all duration-200 hover:bg-[#F8FAFC]"
          >
            <ArrowLeft className="size-4" />
            Quay lại thông tin
          </button>
        </div>
      </div>

      {toast ? (
        <Toast
          key={toast.id}
          open={toast.open}
          variant={toast.variant}
          onOpenChange={(open) => {
            setToast((current) => (current ? { ...current, open } : current));
          }}
        >
          <div className="space-y-1 pr-6">
            {toast.title ? <ToastTitle>{toast.title}</ToastTitle> : null}
            {toast.description ? (
              <ToastDescription>{toast.description}</ToastDescription>
            ) : null}
          </div>
          <ToastClose />
        </Toast>
      ) : null}
      <ToastViewport />
    </ToastProvider>
  );
}
