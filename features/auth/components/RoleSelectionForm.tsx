"use client";

import { useEffect, useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  getRoleDashboardPath,
  isOnboardingIncomplete,
} from "@/lib/auth/onboarding";
import { cn } from "@/lib/utils";
import { SurfaceCard } from "@/components/common/SurfaceCard";
import { InputField } from "@/components/common/form/input-field";
import { SelectField } from "@/components/common/form/select-field";
import { APP_MESSAGES } from "@/lib/app-messages";
import { onboardingSchema } from "../schemas/onboarding.schema";
import type { User } from "@/types/user.types";
import { UserGender, UserRole } from "@/types/user.types";
import { GraduationCap, Loader2, Users } from "lucide-react";
import { FormikDatePickerField } from "@/features/account/components/user-info/formik-fields";

interface RoleSelectionValues {
  role: UserRole | "";
  date_of_birth: string;
  gender: UserGender | "";
  school_name: string;
}

interface RoleSelectionFormProps {
  initialUser: User;
}

export function RoleSelectionForm({ initialUser }: RoleSelectionFormProps) {
  const { user, fetchMe, completeOnboarding } = useAuth();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const currentUser = user ?? initialUser;

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isOnboardingIncomplete(currentUser)) {
      router.replace(getRoleDashboardPath(currentUser.role_name));
    }
  }, [currentUser, router]);

  const initialValues: RoleSelectionValues = {
    role: currentUser.role_name ?? "",
    date_of_birth: currentUser.profile?.date_of_birth ?? "",
    gender: currentUser.profile?.gender ?? "",
    school_name: currentUser.profile?.school_name ?? "",
  };

  const handleSubmit = async (
    values: RoleSelectionValues,
    helpers: FormikHelpers<RoleSelectionValues>,
  ) => {
    try {
      setSubmitError(null);

      const nextUser = await completeOnboarding({
        role: values.role as UserRole,
        full_name: currentUser.full_name?.trim() ?? "",
        date_of_birth: values.date_of_birth,
        gender: values.gender as UserGender,
        school_name: values.school_name.trim() || null,
      });

      router.replace(getRoleDashboardPath(nextUser.role_name));
    } catch (error) {
      console.error("Failed to submit onboarding form", error);
      helpers.setSubmitting(false);
      setSubmitError(APP_MESSAGES.COMPLETE_ONBOARDING_FAILED);
    }
  };

  if (!isOnboardingIncomplete(currentUser)) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={onboardingSchema}
      onSubmit={handleSubmit}
    >
      {({
        errors,
        touched,
        values,
        isSubmitting,
        setFieldTouched,
        setFieldValue,
        getFieldProps,
      }) => (
        <Form className="space-y-7">
          <div className="space-y-3 text-center">
            <h2 className="font-display text-2xl font-bold text-on-surface sm:text-3xl">
              Chọn vai trò của bạn
            </h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-on-surface-variant">
              Hoàn tất vài thông tin cuối cùng để cá nhân hoá trải nghiệm ngay từ lần đầu đăng nhập.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <SurfaceCard
              as="button"
              type="button"
              onClick={() => {
                void setFieldValue("role", "student");
                void setFieldTouched("role", true, false);
              }}
              className={cn(
                "w-full cursor-pointer p-6 text-left transition-all duration-200 group",
                "hover:ring-2 hover:ring-primary/20",
                values.role === "student" && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container">
                  <GraduationCap className="h-7 w-7 text-on-primary-container" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-on-surface transition-colors group-hover:text-primary">
                    Học sinh
                  </h3>
                  <p className="mt-0.5 text-sm text-on-surface-variant">
                    Làm bài thi, xem kết quả, tham gia lớp học.
                  </p>
                </div>
                {values.role === "student" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <span className="text-xs text-white">&#10003;</span>
                  </div>
                )}
              </div>
            </SurfaceCard>

            <SurfaceCard
              as="button"
              type="button"
              onClick={() => {
                void setFieldValue("role", "teacher");
                void setFieldTouched("role", true, false);
              }}
              className={cn(
                "w-full cursor-pointer p-6 text-left transition-all duration-200 group",
                "hover:ring-2 hover:ring-primary/20",
                values.role === "teacher" && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-container">
                  <Users className="h-7 w-7 text-on-secondary-container" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-on-surface transition-colors group-hover:text-secondary">
                    Giáo viên
                  </h3>
                  <p className="mt-0.5 text-sm text-on-surface-variant">
                    Tạo bài thi, quản lý lớp học, theo dõi tiến độ.
                  </p>
                </div>
                {values.role === "teacher" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                    <span className="text-xs text-white">&#10003;</span>
                  </div>
                )}
              </div>
            </SurfaceCard>
          </div>

          {touched.role && errors.role && (
            <p className="px-1 text-xs text-destructive">{errors.role}</p>
          )}

          <section className="rounded-[2rem] border border-outline/10 bg-surface-container-lowest/75 p-5 shadow-[0_16px_44px_-34px_rgba(7,30,39,0.22)] sm:p-6">
            <div className="mb-5 space-y-1">
              <h3 className="font-display text-lg font-semibold text-on-surface">
                Thông tin cá nhân
              </h3>
              <p className="text-sm text-on-surface-variant">
                Chúng tôi chỉ cần những thông tin cơ bản để hoàn thiện hồ sơ ban đầu.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormikDatePickerField
                name="date_of_birth"
                label="Ngày sinh"
                placeholder="Chọn ngày sinh"
                helperText="Chọn ngày sinh của bạn để hoàn tất hồ sơ."
                required
              />

              <SelectField
                label="Giới tính"
                placeholder="Chọn giới tính"
                options={[
                  { value: "male", label: "Nam" },
                  { value: "female", label: "Nữ" },
                  { value: "other", label: "Khác" },
                ]}
                value={values.gender}
                onValueChange={(value) => {
                  void setFieldValue("gender", value);
                }}
                onBlur={() => {
                  void setFieldTouched("gender", true, false);
                }}
                error={touched.gender ? errors.gender : undefined}
                required
              />
            </div>

            <div className="mt-4">
              <InputField
                label="Trường học"
                placeholder="Tên trường học của bạn"
                error={touched.school_name ? errors.school_name : undefined}
                helperText="Trường học là tuỳ chọn, bạn có thể bổ sung sau."
                {...getFieldProps("school_name")}
              />
            </div>
          </section>

          {submitError && (
            <p className="text-center text-sm text-destructive">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold",
              "bg-primary text-white transition-all duration-200",
              "hover:bg-primary/90",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Hoàn tất
          </button>
        </Form>
      )}
    </Formik>
  );
}
