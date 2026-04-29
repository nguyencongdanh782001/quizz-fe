"use client";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { InputField } from "@/components/common/form/input-field";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";

type UserInfoRole = "student" | "teacher";

interface UserInfoPageProps {
  role: UserInfoRole;
}

interface UserInfoFormState {
  username: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  className?: string;
  autoComplete?: string;
}

const roleContent = {
  student: {
    badgeLabel: "Học sinh",
    title: "Thông tin tài khoản",
    subtitle: "Quản lý thông tin tài khoản và cập nhật hồ sơ lớp học của bạn.",
    roleLabel: "Quyền truy cập học sinh",
    usernamePlaceholder: "Nhập tên người dùng mới",
    heroClassName:
      "bg-[linear-gradient(135deg,rgba(0,105,92,0.96),rgba(47,128,120,0.92),rgba(110,193,173,0.9))]",
    badgeClassName: "bg-white/14 text-white ring-1 ring-white/18",
    iconWrapClassName: "bg-white/14 text-white ring-1 ring-white/18",
    accentClassName:
      "bg-primary-container text-on-primary-container ring-1 ring-primary/10",
    saveButtonVariant: "default" as const,
  },
  teacher: {
    badgeLabel: "Giáo viên",
    title: "Thông tin tài khoản",
    subtitle:
      "Cập nhật thông tin tài khoản và cài đặt bảo mật cho không gian giảng dạy của bạn.",
    roleLabel: "Quyền truy cập giáo viên",
    usernamePlaceholder: "Nhập tên người dùng mới",
    heroClassName:
      "bg-[linear-gradient(135deg,rgba(58,84,64,0.96),rgba(78,118,88,0.92),rgba(156,184,123,0.88))]",
    badgeClassName: "bg-white/14 text-white ring-1 ring-white/18",
    iconWrapClassName: "bg-white/14 text-white ring-1 ring-white/18",
    accentClassName:
      "bg-secondary-container text-on-secondary-container ring-1 ring-secondary/10",
    saveButtonVariant: "secondary" as const,
  },
} as const;

function createInitialFormState(username: string): UserInfoFormState {
  return {
    username,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  helperText,
  className,
  autoComplete,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <InputField
        label={label}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
        className="pr-11"
        helperText={helperText}
      />
      <button
        type="button"
        onClick={() => setShowPassword((current) => !current)}
        aria-label={showPassword ? `Ẩn ${label}` : `Hiện ${label}`}
        className="absolute right-3 top-9 flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export function UserInfoPage({ role }: UserInfoPageProps) {
  const { user } = useAuth();
  const content = roleContent[role];
  const RoleIcon = role === "student" ? GraduationCap : Briefcase;
  const userInitial = (user?.full_name?.trim() || "U").charAt(0).toUpperCase();
  const displayName =
    user?.full_name?.trim() ||
    (role === "teacher" ? "Tài khoản giáo viên" : "Tài khoản học sinh");
  const displayEmail =
    user?.email ||
    (role === "teacher"
      ? "teacher@scholar-clarity.app"
      : "student@scholar-clarity.app");

  const [formState, setFormState] = useState<UserInfoFormState>(() =>
    createInitialFormState(user?.full_name ?? ""),
  );
  const [notice, setNotice] = useState<string | null>(null);

  const updateField = (field: keyof UserInfoFormState) => (value: string) => {
    setNotice(null);
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setFormState(createInitialFormState(user?.full_name ?? ""));
    setNotice(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(
      "Đây hiện là giao diện mẫu và có thể kết nối API cập nhật hồ sơ khi bạn sẵn sàng.",
    );
  };

  return (
    <div className="space-y-6">
      <section
        className={cn(
          "relative overflow-hidden rounded-[28px] p-6 shadow-[0_12px_42px_rgba(7,30,39,0.14)] sm:p-8",
          content.heroClassName,
        )}
      >
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-8 translate-x-10 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-28 w-28 -translate-x-6 translate-y-6 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl",
                content.iconWrapClassName,
              )}
            >
              <RoleIcon className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                  content.badgeClassName,
                )}
              >
                {content.badgeLabel}
              </span>
              <div>
                <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {content.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                  {content.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-white/65">
              Đang đăng nhập với
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {displayName}
            </p>
            <p className="text-sm text-white/75">{displayEmail}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_340px]">
        <SurfaceCard className="overflow-hidden border border-outline/10">
          <form onSubmit={handleSubmit}>
            <div className="border-b border-outline/10 px-6 py-5 sm:px-7">
              <h2 className="font-display text-xl font-semibold text-on-surface">
                Cài đặt tài khoản
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cập nhật tên người dùng và mật khẩu của bạn tại một nơi.
              </p>
            </div>

            <div className="space-y-8 px-6 py-6 sm:px-7">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl",
                      content.accentClassName,
                    )}
                  >
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-on-surface">
                      Thông tin hồ sơ
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Giữ thông tin tài khoản rõ ràng để bạn bè trong lớp hoặc
                      đồng nghiệp dễ nhận biết.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-outline/10 bg-surface p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Vai trò hiện tại
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl",
                          content.accentClassName,
                        )}
                      >
                        <RoleIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">
                          {content.badgeLabel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {content.roleLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-outline/10 bg-surface p-5">
                    <InputField
                      label="Tên người dùng mới"
                      placeholder={content.usernamePlaceholder}
                      value={formState.username}
                      onChange={(event) =>
                        updateField("username")(event.target.value)
                      }
                      autoComplete="nickname"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl",
                      content.accentClassName,
                    )}
                  >
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-on-surface">
                      Mật khẩu
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sử dụng các trường mật khẩu bảo mật để bảo vệ tài khoản
                      của bạn.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <PasswordField
                    label="Mật khẩu hiện tại"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={formState.currentPassword}
                    onChange={updateField("currentPassword")}
                    autoComplete="current-password"
                  />
                  <PasswordField
                    label="Mật khẩu mới"
                    placeholder="Nhập mật khẩu mới"
                    value={formState.newPassword}
                    onChange={updateField("newPassword")}
                    autoComplete="new-password"
                  />
                  <PasswordField
                    label="Xác nhận mật khẩu mới"
                    placeholder="Nhập lại mật khẩu mới"
                    value={formState.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    autoComplete="new-password"
                    className="md:col-span-2"
                    helperText="Nên dùng ít nhất 8 ký tự để tăng độ bảo mật."
                  />
                </div>
              </section>

              {notice && (
                <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-on-surface">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p>{notice}</p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-outline/10 pt-6 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-11 rounded-xl px-5"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant={content.saveButtonVariant}
                  className="h-11 rounded-xl px-5"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </form>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="border border-outline/10 p-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl",
                  content.accentClassName,
                )}
              >
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-on-surface">
                  Tóm tắt tài khoản
                </h3>
                <p className="text-sm text-muted-foreground">
                  Xem nhanh thông tin của tài khoản đang sử dụng.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Tên hiển thị
                </p>
                <p className="mt-1 font-medium text-on-surface">
                  {displayName}
                </p>
              </div>
              <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 break-all font-medium text-on-surface">
                  {displayEmail}
                </p>
              </div>
              <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Vai trò
                </p>
                <p className="mt-1 font-medium text-on-surface">
                  {content.badgeLabel}
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="border border-outline/10 p-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl",
                  content.accentClassName,
                )}
              >
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-on-surface">
                  Lưu ý bảo mật
                </h3>
                <p className="text-sm text-muted-foreground">
                  Một vài lưu ý trước khi kết nối API lưu thay đổi.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                Sử dụng mật khẩu riêng, không trùng với các nền tảng khác.
              </div>
              <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                Đảm bảo mật khẩu xác nhận khớp hoàn toàn trước khi lưu thay đổi.
              </div>
              <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                Giữ tên người dùng dễ nhận biết để học sinh hoặc đồng nghiệp dễ
                tìm thấy bạn.
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="border border-dashed border-outline/20 bg-surface-container-low p-5">
            <div className="flex items-center gap-3">
              <div className="flex min-h-12 min-w-12 items-center justify-center rounded-2xl bg-surface-container-high text-on-surface">
                <span className="font-display text-sm font-bold">
                  {userInitial}
                </span>
              </div>
              <div>
                <p className="font-medium text-on-surface">Sẵn sàng tích hợp</p>
                <p className="text-sm text-muted-foreground">
                  Màn hình này hiện chỉ có giao diện và có thể kết nối với API
                  cập nhật hồ sơ sau.
                </p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
