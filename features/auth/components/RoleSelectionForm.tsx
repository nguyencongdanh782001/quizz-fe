"use client";

import { useEffect, useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { SurfaceCard } from "@/components/common/SurfaceCard";
import { InputField } from "@/components/common/form/input-field";
import { SelectField } from "@/components/common/form/select-field";
import { onboardingSchema } from "../schemas/onboarding.schema";
import { User, UserGender, UserRole } from "@/types/user.types";
import { GraduationCap, Loader2, Users } from "lucide-react";

interface RoleSelectionValues {
  role: UserRole | "";
  date_of_birth: string;
  gender: UserGender | "";
  school_name: string;
}

function getDestination(roleName: UserRole | null) {
  return roleName === "teacher" ? "/teacher" : "/student";
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
    if (!currentUser.needs_onboarding && currentUser.role_name) {
      router.replace(getDestination(currentUser.role_name));
    }
  }, [currentUser.needs_onboarding, currentUser.role_name, router]);

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

      router.replace(getDestination(nextUser.role_name));
    } catch {
      helpers.setSubmitting(false);
      setSubmitError("Khong the hoan tat thong tin. Vui long thu lai.");
    }
  };

  if (!currentUser.needs_onboarding && currentUser.role_name) {
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
        <Form className="space-y-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-on-surface">
              Chon vai tro cua ban
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Hoan tat thong tin de bat dau su dung tai khoan Google.
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
                    Hoc sinh
                  </h3>
                  <p className="mt-0.5 text-sm text-on-surface-variant">
                    Lam bai thi, xem ket qua, tham gia lop hoc.
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
                    Giao vien
                  </h3>
                  <p className="mt-0.5 text-sm text-on-surface-variant">
                    Tao bai thi, quan ly lop hoc, theo doi tien do.
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Ngay sinh"
              type="date"
              error={touched.date_of_birth ? errors.date_of_birth : undefined}
              {...getFieldProps("date_of_birth")}
            />

            <SelectField
              label="Gioi tinh"
              placeholder="Chon gioi tinh"
              options={[
                { value: "male", label: "Nam" },
                { value: "female", label: "Nu" },
                { value: "other", label: "Khac" },
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
            label="Truong hoc"
            placeholder="Ten truong cua ban"
            error={touched.school_name ? errors.school_name : undefined}
            helperText="Truong hoc la tuy chon, ban co the bo sung sau."
            {...getFieldProps("school_name")}
          />

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
            Hoan tat
          </button>
        </Form>
      )}
    </Formik>
  );
}
