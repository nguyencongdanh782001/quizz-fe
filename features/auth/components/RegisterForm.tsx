"use client";

import { Formik, Form, FormikHelpers } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema } from "../schemas/register.schema";
import { useAuth } from "@/hooks/useAuth";
import { InputField } from "@/components/common/form/input-field";
import { RadioGroupField } from "@/components/common/form/radio-group-field";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "student" | "teacher";
}

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    values: RegisterFormValues,
    helpers: FormikHelpers<RegisterFormValues>,
  ) => {
    try {
      await register(values);
      router.push(values.role === "teacher" ? "/teacher" : "/student");
    } catch {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
      }}
      validationSchema={registerSchema}
      onSubmit={handleSubmit}
    >
      {({
        errors,
        touched,
        isSubmitting,
        getFieldProps,
        setFieldValue,
        values,
      }) => (
        <Form className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-on-surface text-center">
            Tạo tài khoản
          </h2>

          <InputField
            label="Họ và tên"
            placeholder="Nguyễn Văn Minh"
            error={touched.name ? errors.name : undefined}
            {...getFieldProps("name")}
          />

          <InputField
            label="Email"
            type="email"
            placeholder="nguyen.van.minh@email.com"
            error={touched.email ? errors.email : undefined}
            {...getFieldProps("email")}
          />

          <div className="relative">
            <InputField
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              placeholder="Tối thiểu 6 ký tự"
              error={touched.password ? errors.password : undefined}
              {...getFieldProps("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer absolute right-3 top-9 text-on-surface-variant hover:text-on-surface"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <InputField
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Nhập lại mật khẩu"
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            {...getFieldProps("confirmPassword")}
          />

          <RadioGroupField
            label="Vai trò"
            options={[
              {
                value: "student",
                label: "Học sinh",
                description: "Làm bài thi, xem kết quả, tham gia lớp học",
              },
              {
                value: "teacher",
                label: "Giáo viên",
                description: "Tạo bài thi, quản lý lớp học, theo dõi tiến độ",
              },
            ]}
            value={values.role}
            onChange={(v) => setFieldValue("role", v)}
            error={touched.role ? errors.role : undefined}
            direction="vertical"
          />

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
            Đăng ký
          </button>

          <p className="text-center text-sm text-on-surface-variant">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Đăng nhập
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
