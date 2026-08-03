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
import { InputField } from "@/components/common/form/input-field";
import { SelectField } from "@/components/common/form/select-field";
import { APP_MESSAGES } from "@/lib/app-messages";
import { onboardingSchema } from "../schemas/onboarding.schema";
import type { User } from "@/types/user.types";
import { UserGender, UserRole } from "@/types/user.types";
import { GraduationCap, Loader2, Users, Check } from "lucide-react";
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
        <Loader2 className="h-6 w-6 animate-spin text-[#6366F1]" />
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
        <Form className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">
              Chọn vai trò của bạn
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Hoàn tất thông tin để bắt đầu trải nghiệm QuizzVN.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                void setFieldValue("role", "student");
                void setFieldTouched("role", true, false);
              }}
              className={cn(
                "relative flex cursor-pointer items-center justify-between rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] p-3 text-left transition-all duration-200 hover:border-[#6366F1]",
                values.role === "student" && "border-[#6366F1] bg-[#EEF2FF]/60 ring-1 ring-[#6366F1]",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-[#EEF2FF] text-[#6366F1]">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#1E293B]">Học sinh</h3>
                  <p className="text-[11px] text-[#64748B]">Làm bài, xem kết quả</p>
                </div>
              </div>
              {values.role === "student" && (
                <div className="flex size-4.5 items-center justify-center rounded-full bg-[#6366F1] text-white">
                  <Check className="size-3" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                void setFieldValue("role", "teacher");
                void setFieldTouched("role", true, false);
              }}
              className={cn(
                "relative flex cursor-pointer items-center justify-between rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] p-3 text-left transition-all duration-200 hover:border-[#6366F1]",
                values.role === "teacher" && "border-[#6366F1] bg-[#EEF2FF]/60 ring-1 ring-[#6366F1]",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-[#F0FDF4] text-[#16A34A]">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#1E293B]">Giáo viên</h3>
                  <p className="text-[11px] text-[#64748B]">Tạo đề, quản lý lớp</p>
                </div>
              </div>
              {values.role === "teacher" && (
                <div className="flex size-4.5 items-center justify-center rounded-full bg-[#16A34A] text-white">
                  <Check className="size-3" />
                </div>
              )}
            </button>
          </div>

          {touched.role && errors.role && (
            <p className="text-xs text-destructive">{errors.role}</p>
          )}

          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B]">
              Thông tin cá nhân
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormikDatePickerField
                name="date_of_birth"
                label="Ngày sinh"
                placeholder="Chọn ngày sinh"
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

            <InputField
              label="Trường học"
              placeholder="Vui lòng nhập tên trường của bạn"
              error={touched.school_name ? errors.school_name : undefined}
              {...getFieldProps("school_name")}
            />
          </div>

          {submitError && (
            <p className="text-center text-xs text-destructive">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "cursor-pointer w-full h-11 rounded-[6px] font-bold text-xs text-white mt-2",
              "bg-[linear-gradient(90deg,#3478ff_0%,#6557f5_54%,#d63cf4_100%)]",
              "shadow-[0_8px_20px_rgba(101,87,245,0.3)] hover:opacity-95",
              "transition-all duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2",
            )}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Hoàn tất
          </button>
        </Form>
      )}
    </Formik>
  );
}
