import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormikPasswordField } from "./formik-fields";

interface PasswordFormSectionProps {
  accentClassName: string;
  onFieldChange?: () => void;
}

export function PasswordFormSection({
  accentClassName,
  onFieldChange,
}: PasswordFormSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            accentClassName,
          )}
        >
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-on-surface">
            Mật khẩu
          </h3>
          <p className="text-sm text-muted-foreground">
            Sử dụng các trường mật khẩu bảo mật để bảo vệ tài khoản của bạn.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormikPasswordField
          name="currentPassword"
          label="Mật khẩu hiện tại"
          placeholder="Nhập mật khẩu hiện tại"
          autoComplete="current-password"
          onValueChange={onFieldChange}
        />
        <FormikPasswordField
          name="newPassword"
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới"
          autoComplete="new-password"
          helperText="Ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
          onValueChange={onFieldChange}
        />
        <FormikPasswordField
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          autoComplete="new-password"
          className="md:col-span-2"
          onValueChange={onFieldChange}
        />
      </div>
    </section>
  );
}
