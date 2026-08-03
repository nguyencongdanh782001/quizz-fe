"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MailCheck,
  Send,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api/endpoints/auth";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { mapUserSchemaToUser } from "@/lib/auth/user-mapper";

const DEFAULT_NEXT_PATH = "/select-role";
const LOGIN_PATH = "/login";
const OTP_LENGTH = 6;

interface EmailVerificationFormProps {
  email?: string;
  nextPath?: string;
  reason?: string;
  sent?: string;
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
  const [notice, setNotice] = useState<string | null>(
    sent === "1"
      ? "Mã OTP đã được gửi tới email của bạn."
      : sent === "0"
        ? "Chưa gửi được mã OTP. Bấm Gửi mã để gửi lại."
        : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const safeNextPath = getSafeNextPath(nextPath);
  const otpCode = useMemo(() => digits.join(""), [digits]);
  const isOtpComplete = digits.every(Boolean);

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
    setNotice(null);

    try {
      await api.auth.sendEmailVerificationOtp();
      setNotice("Mã OTP mới đã được gửi tới email của bạn.");
      focusInput(0);
    } catch (sendError) {
      setError(
        getApiErrorMessage(
          sendError,
          "Không thể gửi mã OTP. Vui lòng thử lại.",
        ),
      );
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
      setNotice(response.data.message || "Email đã được xác thực thành công.");
      setIsVerified(true);
    } catch (verifyError) {
      setError(
        getApiErrorMessage(
          verifyError,
          "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
        ),
      );
    } finally {
      setIsVerifying(false);
    }
  }

  function handleBackToInformation() {
    router.replace(LOGIN_PATH);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-bold text-on-surface">
          Xác thực mã OTP
        </h2>
        <p className="text-sm leading-5 text-on-surface-variant">
          Nhập 6 chữ số trong email để hoàn tất đăng ký tài khoản.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
          <MailCheck className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-on-surface-variant">Email</p>
          <p className="truncate text-sm font-semibold text-on-surface">
            {email || "Email tài khoản của bạn"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={isSending || isVerifying || isVerified}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Gửi mã
        </button>
      </div>

      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {isVerified ? (
        <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">Email đã được xác thực</p>
            <p className="leading-5 opacity-90">
              Bạn sẽ được chuyển sang bước chọn vai trò.
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-6 gap-2 sm:gap-3">
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
            className="h-12 rounded-xl border border-outline-variant bg-white text-center text-xl font-bold text-on-surface shadow-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
        ))}
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={handleVerifyOtp}
          disabled={isVerifying || isSending || isVerified}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerifying ? <Loader2 className="size-4 animate-spin" /> : null}
          Xác thực OTP
        </button>

        <button
          type="button"
          onClick={handleBackToInformation}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white py-2.5 text-sm font-semibold text-on-surface transition-all duration-200 hover:bg-surface-container-low"
        >
          <ArrowLeft className="size-4" />
          Quay lại thông tin
        </button>
      </div>
    </div>
  );
}
