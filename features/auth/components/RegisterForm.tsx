"use client";

import { useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { InputField } from "@/components/common/form/input-field";
import { useAuth } from "@/hooks/useAuth";
import { APP_MESSAGES } from "@/lib/app-messages";
import { getPostAuthDestination } from "@/lib/auth/onboarding";
import { cn } from "@/lib/utils";
import { registerSchema } from "../schemas/register.schema";
import { FormikAutofillSync } from "./FormikAutofillSync";
import { Toast, ToastProvider } from "@/components/ui/toast";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const REGISTER_AUTOFILL_FIELDS = [
  "name",
  "email",
  "password",
  "confirmPassword",
] as const;

type RegisterToastVariant = "success" | "error" | "warning";

interface RegisterToastState {
  id: number;
  open: boolean;
  title: string;
  description?: string;
  variant: RegisterToastVariant;
}

function getEmailVerificationPath(email: string, nextPath: string) {
  const params = new URLSearchParams({
    email,
    next: nextPath,
    sent: "1",
  });

  return `/verify-email?${params.toString()}`;
}

export function RegisterForm() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [toast, setToast] = useState<RegisterToastState | null>(null);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;
  };

  function showToast(
    variant: RegisterToastVariant,
    title: string,
    description?: string,
  ) {
    setToast({
      id: Date.now(),
      open: true,
      title,
      description,
      variant,
    });
  }

  const handleSubmit = async (
    values: RegisterFormValues,
    helpers: FormikHelpers<RegisterFormValues>,
  ) => {
    try {
      const user = await register({
        full_name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      const postAuthDestination = getPostAuthDestination(user);

      window.location.href = getEmailVerificationPath(
        user.email,
        postAuthDestination,
      );
    } catch (err) {
      helpers.setSubmitting(false);
      console.error("Failed to submit register form", err);
      showToast(
        "error",
        err instanceof Error && err.message
          ? err.message
          : APP_MESSAGES.REGISTER_FAILED,
      );
    }
  };

  return (
    <ToastProvider duration={4200}>
      <Formik
        initialValues={{
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={registerSchema}
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
              fields={REGISTER_AUTOFILL_FIELDS}
              setFieldValue={setFieldValue}
            />

            <div>
              <h2 className="text-[28px] font-semibold leading-tight text-[#222222]">
                Tạo tài khoản
              </h2>
            </div>

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
                {isGoogleLoading ? "Loading..." : "Đăng ký với Google"}
              </span>
            </button>

            <div className="flex items-center gap-3 text-sm text-[#2e2e2e]">
              <div className="h-[0.5px] flex-1 bg-[#e0e0e0]" />
              <span className="shrink-0">hoặc</span>
              <div className="h-[0.5px] flex-1 bg-[#e0e0e0]" />
            </div>

            <InputField
              label="Họ và tên"
              autoComplete="name"
              placeholder="Nguyễn Văn Minh"
              error={touched.name ? errors.name : undefined}
              {...getFieldProps("name")}
              onChange={(e) => {
                handleChange(e);
              }}
            />

            <InputField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="nguyen.van.minh@email.com"
              error={touched.email ? errors.email : undefined}
              {...getFieldProps("email")}
              onChange={(e) => {
                handleChange(e);
              }}
            />

            <InputField
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              error={touched.password ? errors.password : undefined}
              {...getFieldProps("password")}
              onChange={(e) => {
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

            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              error={
                touched.confirmPassword ? errors.confirmPassword : undefined
              }
              {...getFieldProps("confirmPassword")}
              onChange={(e) => {
                handleChange(e);
              }}
            />

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
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Tạo tài khoản
            </button>

            <p className="text-center text-sm text-[#64748B] pt-1">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#3E65FE] hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </Form>
        )}
      </Formik>

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
            {toast.title ? <p className="font-bold">{toast.title}</p> : null}
            {toast.description ? <p>{toast.description}</p> : null}
          </div>
        </Toast>
      ) : null}
    </ToastProvider>
  );
}
