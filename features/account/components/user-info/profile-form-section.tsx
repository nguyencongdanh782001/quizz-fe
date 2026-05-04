import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormikInputField } from "./formik-fields";
import { RoleInfoCard } from "./role-info-card";
import type { UserInfoRole, UserInfoRoleContent } from "./types";

interface ProfileFormSectionProps {
  role: UserInfoRole;
  content: UserInfoRoleContent;
  onFieldChange?: () => void;
}

export function ProfileFormSection({
  role,
  content,
  onFieldChange,
}: ProfileFormSectionProps) {
  return (
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
            Giữ thông tin tài khoản rõ ràng để bạn bè trong lớp hoặc đồng
            nghiệp dễ nhận biết.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RoleInfoCard role={role} content={content} />

        <div className="rounded-2xl border border-outline/10 bg-surface p-5">
          <FormikInputField
            name="userName"
            label="Tên người dùng mới"
            placeholder={content.usernamePlaceholder}
            autoComplete="nickname"
            required
            onValueChange={onFieldChange}
          />
        </div>
      </div>
    </section>
  );
}
