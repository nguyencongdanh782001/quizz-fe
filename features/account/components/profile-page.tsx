"use client";

import { Form, Formik, type FormikHelpers } from "formik";
import {
  AtSign,
  BadgeCheck,
  CalendarDays,
  Clock,
  IdCard,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Save,
  School,
  ShieldCheck,
  type LucideIcon,
  UserRound,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import {
  useChangePasswordMutation,
  useProfile,
  useUpdateProfileMutation,
} from "@/hooks/queries/useProfile";
import type {
  ChangePasswordRequest,
  ProfileGender,
  UpdateProfileRequest,
  UserSchema,
} from "@/lib/api/types";
import { APP_MESSAGES } from "@/lib/app-messages";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user.types";
import {
  changePasswordSchema,
  profileFormSchema,
} from "../schemas/user-info.schema";
import {
  createProfileInitialValues,
  genderOptions,
  roleContentByRole,
} from "./user-info/constants";
import {
  FormikInputField,
  FormikPasswordField,
  FormikSelectField,
} from "./user-info/formik-fields";
import type {
  ChangePasswordFormValues,
  ProfileFormValues,
  UserInfoPageProps,
  UserInfoRole,
  UserInfoRoleContent,
} from "./user-info/types";

type ProfileToastVariant = "success" | "error";

interface ProfileToastState {
  id: number;
  open: boolean;
  title: string;
  variant: ProfileToastVariant;
}

interface ProfileSectionProps {
  user: UserSchema;
  content: UserInfoRoleContent;
  role: UserInfoRole;
}

interface ToastAwareProps {
  onToast: (variant: ProfileToastVariant, title: string) => void;
}

const emptyPasswordValues: ChangePasswordFormValues = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Chưa cập nhật";
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (dateOnlyMatch) {
    return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

// function formatDateTime(value: string | null | undefined): string {
//   if (!value) {
//     return "Chưa có dữ liệu";
//   }

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return value;
//   }

//   return new Intl.DateTimeFormat("vi-VN", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(date);
// }

function getRoleLabel(
  roleName: UserSchema["role_name"] | UserInfoRole,
): string {
  if (roleName === "teacher") {
    return "Giáo viên";
  }

  if (roleName === "student") {
    return "Học sinh";
  }

  return "Chưa phân quyền";
}

function getGenderLabel(gender: string | null | undefined): string {
  if (gender === "male") {
    return "Nam";
  }

  if (gender === "female") {
    return "Nữ";
  }

  if (gender === "other") {
    return "Khác";
  }

  return "Chưa cập nhật";
}

function toAuthUser(user: UserSchema): User {
  return {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    auth_type: user.auth_type,
    role_name:
      user.role_name === "teacher" || user.role_name === "student"
        ? user.role_name
        : null,
    needs_onboarding: user.needs_onboarding,
    avatar_url: user.avatar_url ?? null,
    created_at: user.created_at,
    profile: user.profile
      ? {
          date_of_birth: user.profile.date_of_birth,
          age: user.profile.age,
          gender: user.profile.gender,
          school_name: user.profile.school_name ?? null,
          onboarding_completed_at: user.profile.onboarding_completed_at,
        }
      : null,
  };
}

function isProfileGender(
  value: ProfileFormValues["gender"],
): value is ProfileGender {
  return value === "male" || value === "female";
}

function toProfilePayload(
  values: ProfileFormValues,
): UpdateProfileRequest | null {
  if (!isProfileGender(values.gender)) {
    return null;
  }

  return {
    full_name: values.full_name.trim(),
    phone: values.phone.trim(),
    date_of_birth: values.date_of_birth,
    gender: values.gender,
    school_name: values.school_name.trim(),
  };
}

function toPasswordPayload(
  values: ChangePasswordFormValues,
): ChangePasswordRequest {
  return {
    current_password: values.current_password,
    new_password: values.new_password,
    confirm_password: values.confirm_password,
  };
}

function ProfileAvatar({
  user,
  size = "default",
  className,
}: {
  user: UserSchema;
  size?: "default" | "hero";
  className?: string;
}) {
  const sizeClassName =
    size === "hero"
      ? "size-20 rounded-2xl text-2xl shadow-[0_20px_44px_-24px_rgba(7,30,39,0.45)]"
      : "size-16 rounded-2xl text-xl shadow-[0_18px_38px_-28px_rgba(7,30,39,0.45)]";

  return (
    <UserAvatar
      avatarUrl={user.avatar_url}
      fullName={user.full_name}
      className={cn("ring-1 ring-white/30", sizeClassName, className)}
    />
  );
}

function ProfileHero({ user, content, role }: ProfileSectionProps) {
  const roleLabel = getRoleLabel(user.role_name ?? role);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] p-6 text-white shadow-[0_20px_60px_-36px_rgba(7,30,39,0.5)] sm:p-8",
        content.heroClassName,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_38%,rgba(255,255,255,0.1))]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ProfileAvatar user={user} size="hero" />
          <div>
            <p className="text-sm font-medium text-white/72">Hồ sơ tài khoản</p>
            <h1 className="mt-1 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Xin chào, {user.full_name}
            </h1>
            <p className="mt-2 text-base font-medium text-white/86">
              {roleLabel}
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/18 bg-white/12 px-4 py-3 text-sm font-medium text-white backdrop-blur-md">
          <ShieldCheck className="size-4" />
          <span>
            {user.email_verified ? "Email đã xác thực" : "Email chưa xác thực"}
          </span>
        </div>
      </div>
    </section>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  breakAll = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-outline/10 bg-surface-container-lowest px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_16px_32px_-26px_rgba(7,30,39,0.4)]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p
        className={cn(
          "mt-2 text-sm font-semibold text-on-surface",
          breakAll && "break-all",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ProfileInformationCard({ user, role }: ProfileSectionProps) {
  const roleLabel = getRoleLabel(user.role_name ?? role);
  const hasAvatar = Boolean(user.avatar_url?.trim());

  return (
    <section className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-5 shadow-[0_10px_38px_-30px_rgba(7,30,39,0.45)] sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UserRound className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-on-surface">
            Thông tin cá nhân
          </h2>
          <p className="text-sm text-muted-foreground">
            Hồ sơ hiện tại của tài khoản.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="self-start overflow-hidden rounded-2xl border border-outline/10 bg-surface">
          <div className="h-20 bg-linear-to-br from-primary/12 via-secondary/10 to-tertiary/12 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Ảnh đại diện
            </p>
          </div>
          <div className="-mt-8 flex flex-col items-center px-4 pb-4 text-center">
            <ProfileAvatar
              user={user}
              className="bg-surface-container-lowest ring-4 ring-surface"
            />
            <div className="mt-3 w-full min-w-0">
              <p className="truncate font-display font-semibold text-on-surface">
                {user.full_name}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                @{user.username}
              </p>
            </div>
            <span
              className={cn(
                "mt-3 inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                hasAvatar
                  ? "border-secondary/15 bg-secondary-container/70 text-on-secondary-container"
                  : "border-primary/15 bg-primary-container/70 text-on-primary-container",
              )}
            >
              {hasAvatar ? "Ảnh cá nhân" : "Ảnh mặc định"}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InfoItem icon={UserRound} label="Họ và tên" value={user.full_name} />
          <InfoItem icon={Mail} label="Email" value={user.email} breakAll />
          <InfoItem
            icon={AtSign}
            label="Tên đăng nhập"
            value={user.username}
            breakAll
          />
          <InfoItem
            icon={Phone}
            label="Số điện thoại"
            value={user.phone || "Chưa cập nhật"}
          />
          <InfoItem
            icon={BadgeCheck}
            label="Giới tính"
            value={getGenderLabel(user.profile?.gender)}
          />
          <InfoItem
            icon={CalendarDays}
            label="Ngày sinh"
            value={formatDate(user.profile?.date_of_birth)}
          />
          <InfoItem
            icon={School}
            label="Trường học"
            value={user.profile?.school_name || "Chưa cập nhật"}
          />
          <InfoItem icon={IdCard} label="Vai trò" value={roleLabel} />
          <InfoItem
            icon={Clock}
            label="Ngày tham gia"
            value={formatDate(user.created_at)}
          />
        </div>
      </div>
    </section>
  );
}

function ProfileForm({
  user,
  onToast,
}: Pick<ProfileSectionProps, "user"> & ToastAwareProps) {
  const updateProfileMutation = useUpdateProfileMutation();
  const initialValues = createProfileInitialValues(user);

  async function handleSubmit(
    values: ProfileFormValues,
    helpers: FormikHelpers<ProfileFormValues>,
  ) {
    const payload = toProfilePayload(values);

    if (!payload) {
      helpers.setFieldError("gender", "Vui lòng chọn giới tính");
      helpers.setSubmitting(false);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync(payload);
      helpers.resetForm({ values });
      onToast("success", APP_MESSAGES.UPDATE_PROFILE_SUCCESS);
    } catch {
      onToast("error", APP_MESSAGES.UPDATE_PROFILE_FAILED);
    } finally {
      helpers.setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-5 shadow-[0_10px_38px_-30px_rgba(7,30,39,0.45)] sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <BadgeCheck className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-on-surface">
            Chỉnh sửa hồ sơ
          </h2>
          <p className="text-sm text-muted-foreground">
            Cập nhật các thông tin có thể chỉnh sửa.
          </p>
        </div>
      </div>

      <Formik<ProfileFormValues>
        initialValues={initialValues}
        enableReinitialize
        validationSchema={profileFormSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => {
          const isSaving = isSubmitting || updateProfileMutation.isPending;

          return (
            <Form className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormikInputField
                  name="full_name"
                  label="Họ và tên"
                  placeholder="Nhập họ và tên"
                  autoComplete="name"
                  required
                />
                <FormikInputField
                  name="phone"
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  autoComplete="tel"
                />
                <FormikInputField
                  name="date_of_birth"
                  label="Ngày sinh"
                  type="date"
                  required
                />
                <FormikSelectField
                  name="gender"
                  label="Giới tính"
                  options={genderOptions}
                  placeholder="Chọn giới tính"
                  required
                />
                <FormikInputField
                  name="school_name"
                  label="Trường học"
                  placeholder="Nhập tên trường học"
                  autoComplete="organization"
                  className="md:col-span-2"
                />
              </div>

              <div className="flex justify-end border-t border-outline/10 pt-5">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 rounded-xl px-5"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </section>
  );
}

// function AccountInformationCard({ user }: Pick<ProfileSectionProps, "user">) {
//   const emailVerified = user.email_verified;

//   return (
//     <section className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-5 shadow-[0_10px_38px_-30px_rgba(7,30,39,0.45)] sm:p-6">
//       <div className="flex items-center gap-3">
//         <div className="flex size-11 items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary">
//           <ShieldCheck className="size-5" />
//         </div>
//         <div>
//           <h2 className="font-display text-xl font-semibold text-on-surface">
//             Thông tin tài khoản
//           </h2>
//           <p className="text-sm text-muted-foreground">
//             Trạng thái và lịch sử đăng nhập.
//           </p>
//         </div>
//       </div>

//       <div className="mt-6 space-y-3">
//         <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-4">
//           <div className="flex items-center justify-between gap-3">
//             <div>
//               <p className="text-sm font-medium text-muted-foreground">
//                 Email đã xác thực
//               </p>
//               <p className="mt-1 font-semibold text-on-surface">
//                 {emailVerified ? "Đã xác thực" : "Chưa xác thực"}
//               </p>
//             </div>
//             <div
//               className={cn(
//                 "flex size-10 items-center justify-center rounded-2xl",
//                 emailVerified
//                   ? "bg-emerald-50 text-emerald-600"
//                   : "bg-destructive/10 text-destructive",
//               )}
//             >
//               {emailVerified ? (
//                 <CheckCircle2 className="size-5" />
//               ) : (
//                 <XCircle className="size-5" />
//               )}
//             </div>
//           </div>
//         </div>

//         <InfoItem
//           icon={Clock}
//           label="Đăng nhập gần nhất"
//           value={formatDateTime(user.last_login_at)}
//         />
//         <InfoItem
//           icon={CalendarDays}
//           label="Ngày tham gia"
//           value={formatDateTime(user.created_at)}
//         />
//       </div>
//     </section>
//   );
// }

function ChangePasswordCard({ onToast }: ToastAwareProps) {
  const changePasswordMutation = useChangePasswordMutation();

  async function handleSubmit(
    values: ChangePasswordFormValues,
    helpers: FormikHelpers<ChangePasswordFormValues>,
  ) {
    try {
      await changePasswordMutation.mutateAsync(toPasswordPayload(values));
      helpers.resetForm();
      onToast("success", APP_MESSAGES.CHANGE_PASSWORD_SUCCESS);
    } catch {
      onToast("error", APP_MESSAGES.CHANGE_PASSWORD_FAILED);
    } finally {
      helpers.setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-5 shadow-[0_10px_38px_-30px_rgba(7,30,39,0.45)] sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <KeyRound className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-on-surface">
            Đổi mật khẩu
          </h2>
          <p className="text-sm text-muted-foreground">
            Mật khẩu mới cần tối thiểu 8 ký tự.
          </p>
        </div>
      </div>

      <Formik<ChangePasswordFormValues>
        initialValues={emptyPasswordValues}
        validationSchema={changePasswordSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => {
          const isSaving = isSubmitting || changePasswordMutation.isPending;

          return (
            <Form className="mt-6 space-y-5">
              <div className="grid gap-4">
                <FormikPasswordField
                  name="current_password"
                  label="Mật khẩu hiện tại"
                  placeholder="Nhập mật khẩu hiện tại"
                  autoComplete="current-password"
                  required
                />
                <FormikPasswordField
                  name="new_password"
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới"
                  autoComplete="new-password"
                  helperText="Tối thiểu 8 ký tự."
                  required
                />
                <FormikPasswordField
                  name="confirm_password"
                  label="Xác nhận mật khẩu mới"
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="flex justify-end border-t border-outline/10 pt-5">
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSaving}
                  className="h-11 rounded-xl px-5"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  Cập nhật mật khẩu
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </section>
  );
}

function ProfilePageSkeleton({ role }: UserInfoPageProps) {
  const content = roleContentByRole[role];

  return (
    <div className="space-y-6">
      <section
        className={cn(
          "rounded-[28px] p-6 shadow-[0_20px_60px_-36px_rgba(7,30,39,0.5)] sm:p-8",
          content.heroClassName,
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="size-20 rounded-2xl bg-white/25" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 bg-white/25" />
            <Skeleton className="h-9 w-72 max-w-full bg-white/25" />
            <Skeleton className="h-5 w-28 bg-white/25" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)">
        <div className="space-y-6">
          <SkeletonCard rows={9} />
          <FormSkeleton />
          <FormSkeleton />
        </div>
        {/* <SkeletonCard rows={3} /> */}
      </div>
    </div>
  );
}

function SkeletonCard({ rows }: { rows: number }) {
  return (
    <section className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

function FormSkeleton() {
  return (
    <section className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end border-t border-outline/10 pt-5">
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
    </section>
  );
}

function ProfilePageError({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-2xl border border-destructive/15 bg-destructive/5 p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <XCircle className="size-6" />
      </div>
      <h1 className="mt-4 font-display text-xl font-semibold text-on-surface">
        Không thể tải thông tin tài khoản
      </h1>
      <div className="mt-5 flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-10 px-4"
        >
          <RefreshCw className={cn("size-4", isRetrying && "animate-spin")} />
          Thử lại
        </Button>
      </div>
    </section>
  );
}

function ProfileToast({
  toast,
  onOpenChange,
}: {
  toast: ProfileToastState | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!toast) {
    return null;
  }

  return (
    <Toast
      key={toast.id}
      open={toast.open}
      variant={toast.variant}
      onOpenChange={onOpenChange}
    >
      <ToastTitle>{toast.title}</ToastTitle>
      <ToastClose />
    </Toast>
  );
}

export function ProfilePage({ role }: UserInfoPageProps) {
  const content = roleContentByRole[role];
  const {
    data: user,
    isError,
    isLoading,
    isRefetching,
    refetch,
  } = useProfile();
  const hydrateFromUser = useAuthStore((state) => state.hydrateFromUser);
  const [toast, setToast] = useState<ProfileToastState | null>(null);

  useEffect(() => {
    if (user) {
      hydrateFromUser(toAuthUser(user));
    }
  }, [hydrateFromUser, user]);

  function showToast(variant: ProfileToastVariant, title: string) {
    setToast({
      id: Date.now(),
      open: true,
      title,
      variant,
    });
  }

  let body: ReactNode;

  if (isLoading) {
    body = <ProfilePageSkeleton role={role} />;
  } else if (isError || !user) {
    body = (
      <ProfilePageError
        isRetrying={isRefetching}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  } else {
    body = (
      <div className="space-y-6">
        <ProfileHero user={user} content={content} role={role} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)">
          <div className="space-y-6">
            <ProfileInformationCard user={user} content={content} role={role} />
            <ProfileForm user={user} onToast={showToast} />
            <ChangePasswordCard onToast={showToast} />
          </div>

          {/* <AccountInformationCard user={user} /> */}
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      {body}
      <ProfileToast
        toast={toast}
        onOpenChange={(open) => {
          setToast((current) => (current ? { ...current, open } : current));
        }}
      />
      <ToastViewport />
    </ToastProvider>
  );
}
