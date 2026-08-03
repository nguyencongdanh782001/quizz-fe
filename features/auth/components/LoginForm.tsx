"use client";

import { useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { InputField } from "@/components/common/form/input-field";
import { useAuth } from "@/hooks/useAuth";
import { APP_MESSAGES } from "@/lib/app-messages";
import { getPostAuthDestination } from "@/lib/auth/onboarding";
import { setLoginSuccessFlash } from "@/lib/auth/login-success-flash";
import { cn } from "@/lib/utils";
import { loginSchema } from "../schemas/login.schema";
import { FormikAutofillSync } from "./FormikAutofillSync";

interface LoginFormValues {
  email: string;
  password: string;
}

const LOGIN_AUTOFILL_FIELDS = ["email", "password"] as const;

function getOauthErrorMessage(error: string | null) {
  if (error === "oauth_failed") {
    return "Đăng nhập Google thất bại. Vui lòng thử lại.";
  }

  if (error === "session_not_found") {
    return "Đăng nhập Google đã xong nhưng FE chưa đọc được session. Nếu đang dùng local, hãy mở app bằng cùng host với API callback (localhost:3000 hoặc 127.0.0.1:3000) rồi thử lại.";
  }

  if (error === "callback_failed") {
    return "Không thể xử lý callback Google. Vui lòng thử lại.";
  }

  return null;
}

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [oauthError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const error = new URLSearchParams(window.location.search).get("error");
    return getOauthErrorMessage(error);
  });

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;
  };

  const handleSubmit = async (
    values: LoginFormValues,
    helpers: FormikHelpers<LoginFormValues>,
  ) => {
    try {
      const user = await login(values.email, values.password);
      setLoginSuccessFlash();
      window.location.href = getPostAuthDestination(user);
    } catch (err) {
      helpers.setSubmitting(false);
      console.error("Failed to submit login form", err);
      setApiError(APP_MESSAGES.LOGIN_FAILED);
    }
  };

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({
        errors,
        touched,
        isSubmitting,
        getFieldProps,
        handleChange,
        setFieldValue,
      }) => (
        <Form className="space-y-5">
          <FormikAutofillSync
            fields={LOGIN_AUTOFILL_FIELDS}
            setFieldValue={setFieldValue}
          />

          <div>
            <h2 className="text-[28px] font-semibold leading-tight text-[#222222]">
              Đăng nhập
            </h2>
          </div>

          {(oauthError || apiError) && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {oauthError ?? apiError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className={cn(
              "relative cursor-pointer w-full h-12 rounded-[10px] font-bold text-sm text-white",
              "bg-[linear-gradient(90deg,#3478ff_0%,#6557f5_54%,#d63cf4_100%)]",
              "shadow-[0_6px_18px_rgba(101,87,245,0.25)] hover:opacity-95",
              "transition-all duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center",
            )}
          >
            <div className="absolute left-4.5 flex items-center justify-center">
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <Image
                  src="/image/google-logo.png"
                  alt="Google"
                  width={22}
                  height={22}
                  className="w-5.5 h-5.5 object-contain"
                />
              )}
            </div>
            <span>
              {isGoogleLoading ? "Loading..." : "Đăng nhập bằng Google"}
            </span>
          </button>

          <div className="flex items-center gap-3 text-sm text-[#2e2e2e]">
            <div className="h-[0.5px] flex-1 bg-[#e0e0e0]" />
            <span className="shrink-0">hoặc tiếp tục với</span>
            <div className="h-[0.5px] flex-1 bg-[#e0e0e0]" />
          </div>

          <InputField
            label="Tài khoản đăng nhập"
            type="email"
            autoComplete="username"
            placeholder="Nhập tài khoản hoặc email"
            error={touched.email ? errors.email : undefined}
            {...getFieldProps("email")}
            onChange={(e) => {
              setApiError(null);
              handleChange(e);
            }}
          />

          <InputField
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu của bạn"
            error={touched.password ? errors.password : undefined}
            {...getFieldProps("password")}
            onChange={(e) => {
              setApiError(null);
              handleChange(e);
            }}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-[#C527FF] hover:text-[#A855F7] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />

          <div className="text-right">
            <Link
              href="/forgot"
              className="text-xs font-semibold text-[#3E65FE] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "cursor-pointer w-full h-12 rounded-[10px] font-bold text-sm text-white mt-2",
              "bg-[linear-gradient(90deg,#3478ff_0%,#6557f5_54%,#d63cf4_100%)]",
              "shadow-[0_8px_20px_rgba(101,87,245,0.3)] hover:opacity-95",
              "transition-all duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2",
            )}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Đăng nhập
          </button>

          <p className="text-center text-sm text-[#64748B] pt-1">
            chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#3E65FE] hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
