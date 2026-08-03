"use client";

import { Form, Formik, type FormikHelpers } from "formik";
import {
  KeyRound,
  Loader2,
  RefreshCw,
  Save,
  UploadCloud,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useUpdateAvatar } from "@/hooks/useUpdateAvatar";
import type {
  ChangePasswordRequest,
  ProfileGender,
  UpdateProfileRequest,
  UserSchema,
} from "@/lib/api/types";
import { APP_MESSAGES } from "@/lib/app-messages";
import { validateAvatarImageFile } from "@/lib/avatar-upload";
import { mapUserSchemaToUser } from "@/lib/auth/user-mapper";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  changePasswordSchema,
  profileFormSchema,
} from "../schemas/user-info.schema";
import { ProfileWorkspace } from "./profile-workspace";
import {
  createProfileInitialValues,
  genderOptions,
} from "./user-info/constants";
import {
  FormikDatePickerField,
  FormikInputField,
  FormikPasswordField,
} from "./user-info/formik-fields";
import type {
  ChangePasswordFormValues,
  ProfileFormValues,
  UserInfoPageProps,
} from "./user-info/types";

type ProfileToastVariant = "success" | "error" | "warning";

interface ProfileToastState {
  id: number;
  open: boolean;
  title: string;
  variant: ProfileToastVariant;
}

interface ToastAwareProps {
  onToast: (variant: ProfileToastVariant, title: string) => void;
}

const cardClassName =
  "rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(30,41,59,0.04)]";

const emptyPasswordValues: ChangePasswordFormValues = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

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

function EmailCard({ user }: { user: UserSchema }) {
  return (
    <section className={cardClassName}>
      <h2 className="text-sm font-bold text-[#1E293B]">Email</h2>
      <p className="mt-2 text-sm text-[#475569]">
        Email chính được sử dụng để đăng nhập và nhận thông báo liên quan đến
        tài khoản.
      </p>
      <div className="mt-4 max-w-lg">
        <Input
          value={user.email}
          readOnly
          aria-label="Email tài khoản"
          className="h-10 rounded-[6px] bg-[#F8FAFC]"
        />
        <p className="mt-2 text-xs text-[#64748B]">
          {user.email_verified
            ? "Email đã được xác minh và có thể dùng để đăng nhập."
            : "Email chưa được xác minh."}
        </p>
      </div>
    </section>
  );
}

function AvatarUploadCard({
  user,
  onToast,
}: { user: UserSchema } & ToastAwareProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadAvatarMutation = useUpdateAvatar();
  const isUploading = uploadAvatarMutation.isPending;
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationMessage = validateAvatarImageFile(file);

    if (validationMessage) {
      onToast("warning", validationMessage);
      return;
    }

    setSelectedFile(file);
  }

  async function handleUploadAvatar() {
    if (!selectedFile) {
      onToast("warning", "Vui lòng chọn một ảnh trước khi lưu.");
      return;
    }

    try {
      await uploadAvatarMutation.mutateAsync(selectedFile);
      setSelectedFile(null);
      onToast("success", APP_MESSAGES.UPLOAD_AVATAR_SUCCESS);
    } catch {
      onToast("error", APP_MESSAGES.UPLOAD_AVATAR_FAILED);
    }
  }

  return (
    <section className={cardClassName}>
      <h2 className="text-sm font-bold text-[#1E293B]">Ảnh đại diện</h2>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          className="group relative size-24 shrink-0 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          aria-label="Chọn ảnh đại diện từ thiết bị"
          onClick={() => fileInputRef.current?.click()}
        >
          <UserAvatar
            avatarUrl={previewUrl ?? user.avatar_url}
            fullName={user.full_name}
            avatarCacheKey={previewUrl ? undefined : user.updated_at}
            className="size-24 text-2xl ring-4 ring-white shadow-sm"
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-colors group-hover:bg-black/45 group-hover:text-white">
            <UploadCloud className="size-5" />
          </span>
        </button>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1E293B]">
            Nhấp vào ảnh để chọn tệp từ thiết bị
          </p>
          <p className="mt-1 text-xs leading-5 text-[#64748B]">
            Hỗ trợ JPG, PNG hoặc WEBP, dung lượng tối đa 5MB.
          </p>
          <p className="mt-1 truncate text-xs text-[#64748B]">
            {selectedFile
              ? `Đã chọn: ${selectedFile.name}`
              : "Chưa chọn ảnh mới."}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Button
          type="button"
          className="h-10 rounded-[6px] px-4"
          disabled={!selectedFile || isUploading}
          onClick={() => void handleUploadAvatar()}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Lưu ảnh
        </Button>
      </div>
    </section>
  );
}

function ProfileForm({
  user,
  onToast,
}: { user: UserSchema } & ToastAwareProps) {
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
    <Formik<ProfileFormValues>
      initialValues={initialValues}
      enableReinitialize
      validationSchema={profileFormSchema}
      onSubmit={handleSubmit}
    >
      {({
        errors,
        isSubmitting,
        setFieldTouched,
        setFieldValue,
        touched,
        values,
      }) => {
        const isSaving = isSubmitting || updateProfileMutation.isPending;

        return (
          <Form className="space-y-4">
            <section className={cardClassName}>
              <h2 className="text-sm font-bold text-[#1E293B]">Tên hiển thị</h2>
              <p className="mt-2 text-sm text-[#475569]">
                Tên này được hiển thị ở khu vực tài khoản và các nội dung bạn
                tham gia.
              </p>
              <div className="mt-4 max-w-lg">
                <FormikInputField
                  name="full_name"
                  label=""
                  aria-label="Tên hiển thị"
                  placeholder="Nhập tên hiển thị"
                  autoComplete="name"
                  className="h-10 rounded-[6px]"
                  required
                />
              </div>
              <div className="mt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 rounded-[6px] px-4"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Lưu tên hiển thị
                </Button>
              </div>
            </section>

            <section className={cardClassName}>
              <h2 className="text-sm font-bold text-[#1E293B]">
                Thông tin khác
              </h2>
              <div className="mt-4 max-w-3xl space-y-4">
                <fieldset>
                  <legend className="text-sm font-medium text-[#1E293B]">
                    Giới tính <span className="text-red-500">*</span>
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-5">
                    {genderOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2 text-sm text-[#334155]"
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={option.value}
                          checked={values.gender === option.value}
                          onChange={() => {
                            void setFieldValue("gender", option.value);
                            void setFieldTouched("gender", true, false);
                          }}
                          className="size-4 accent-[#4F46E5]"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {touched.gender && errors.gender ? (
                    <p className="mt-1 text-xs text-red-600">{errors.gender}</p>
                  ) : null}
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormikDatePickerField
                    name="date_of_birth"
                    label="Ngày sinh"
                    placeholder="Chọn ngày sinh"
                    required
                  />
                  <FormikInputField
                    name="phone"
                    label="Số điện thoại"
                    placeholder="Nhập số điện thoại"
                    autoComplete="tel"
                    className="rounded-[6px]"
                  />
                  <div className="sm:col-span-2">
                    <FormikInputField
                      name="school_name"
                      label="Trường học"
                      placeholder="Nhập tên trường học"
                      autoComplete="organization"
                      className="rounded-[6px]"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 rounded-[6px] px-4"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Lưu thông tin
                </Button>
              </div>
            </section>
          </Form>
        );
      }}
    </Formik>
  );
}

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
    <section className={cn(cardClassName, "max-w-2xl")}>
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-[6px] bg-[#EEF2FF] text-[#4F46E5]">
          <KeyRound className="size-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#1E293B]">Đổi mật khẩu</h2>
          <p className="mt-1 text-xs text-[#64748B]">
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
            <Form className="mt-5 max-w-lg space-y-4">
              <FormikPasswordField
                name="current_password"
                label="Mật khẩu hiện tại"
                placeholder="Nhập mật khẩu hiện tại"
                autoComplete="current-password"
                className="rounded-[6px]"
                required
              />
              <FormikPasswordField
                name="new_password"
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
                helperText="Tối thiểu 8 ký tự."
                className="rounded-[6px]"
                required
              />
              <FormikPasswordField
                name="confirm_password"
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                className="rounded-[6px]"
                required
              />
              <div className="border-t border-[#E2E8F0] pt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 rounded-[6px] px-4"
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

function AccountSkeleton() {
  return (
    <ProfileWorkspace
      account={
        <div className="space-y-4">
          {[160, 210, 180, 280].map((height) => (
            <section key={height} className={cardClassName}>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-3 h-4 w-80 max-w-full" />
              <Skeleton
                className="mt-5 w-full rounded-[6px]"
                style={{ height }}
              />
            </section>
          ))}
        </div>
      }
      password={<Skeleton className="h-[420px] max-w-2xl rounded-[8px]" />}
    />
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
    <section className="rounded-[8px] border border-red-200 bg-red-50 p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-[6px] bg-red-100 text-red-600">
        <XCircle className="size-6" />
      </div>
      <h1 className="mt-4 text-sm font-bold text-[#1E293B]">
        Không thể tải thông tin tài khoản
      </h1>
      <div className="mt-5 flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-10 rounded-[6px] px-4"
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
      hydrateFromUser(mapUserSchemaToUser(user));
    }
  }, [hydrateFromUser, user]);

  function showToast(variant: ProfileToastVariant, title: string) {
    setToast({ id: Date.now(), open: true, title, variant });
  }

  let body: ReactNode;

  if (isLoading) {
    body = <AccountSkeleton />;
  } else if (isError || !user) {
    body = (
      <ProfilePageError
        isRetrying={isRefetching}
        onRetry={() => void refetch()}
      />
    );
  } else {
    body = (
      <ProfileWorkspace
        account={
          <div className="space-y-4">
            <EmailCard user={user} />
            <AvatarUploadCard user={user} onToast={showToast} />
            <ProfileForm user={user} onToast={showToast} />
          </div>
        }
        password={<ChangePasswordCard onToast={showToast} />}
      />
    );
  }

  return (
    <ToastProvider>
      <div data-profile-role={role}>{body}</div>
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
