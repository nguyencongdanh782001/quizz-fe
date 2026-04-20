"use client";

import { useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { InputField } from "@/components/common/form/input-field";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { loginSchema } from "../schemas/login.schema";

interface LoginFormValues {
  email: string;
  password: string;
}

function getOauthErrorMessage(error: string | null) {
  if (error === "oauth_failed") {
    return "Đăng nhập Google thất bại. Vui lòng thử lại.";
  }

  if (error === "session_not_found") {
    return "Dang nhap Google da xong nhung phien dang nhap khong duoc tao. Neu ban dang mo localhost, hay thu lai bang 127.0.0.1:3000.";
  }

  if (error === "callback_failed") {
    return "Khong the xu ly callback Google. Vui long thu lai.";
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

      if (user.needs_onboarding || !user.role_name) {
        window.location.href = "/role";
        return;
      }

      window.location.href =
        user.role_name === "teacher" ? "/teacher" : "/student";
    } catch (err) {
      helpers.setSubmitting(false);
      setApiError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    }
  };

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting, getFieldProps, handleChange }) => (
        <Form className="space-y-5">
          <h2 className="font-display text-2xl font-bold text-on-surface text-center">
            Đăng nhập
          </h2>

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
              "cursor-pointer w-full py-3 rounded-xl font-semibold text-base",
              "bg-white text-gray-700 border border-gray-300",
              "hover:bg-gray-50",
              "transition-all duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-3",
            )}
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isGoogleLoading ? "Loading..." : "Đăng nhập với Google"}
          </button>

          <div className="relative flex items-center">
            <div className="grow border-t border-outline-variant" />
            <span className="mx-4 text-xs text-on-surface-variant">hoặc</span>
            <div className="grow border-t border-outline-variant" />
          </div>

          <InputField
            label="Email"
            type="email"
            placeholder="nguyen.van.minh@email.com"
            error={touched.email ? errors.email : undefined}
            {...getFieldProps("email")}
            onChange={(e) => {
              setApiError(null);
              handleChange(e);
            }}
          />

          <div className="relative">
            <InputField
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              placeholder="........"
              error={touched.password ? errors.password : undefined}
              {...getFieldProps("password")}
              onChange={(e) => {
                setApiError(null);
                handleChange(e);
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer absolute right-3 top-10 text-on-surface-variant hover:text-on-surface"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="text-right">
            <Link
              href="/forgot"
              className="text-sm text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "cursor-pointer w-full py-3 rounded-xl font-semibold text-base",
              "bg-primary text-white",
              "hover:bg-primary/90",
              "transition-all duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2",
            )}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Đăng nhập
          </button>

          <p className="text-center text-sm text-on-surface-variant">
            chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
