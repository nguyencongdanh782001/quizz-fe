import { useState } from "react";
import { Form, Formik } from "formik";
import { Info } from "lucide-react";
import { SurfaceCard } from "@/components/common/SurfaceCard";
import { createUserInfoSchema } from "@/features/account/schemas/user-info.schema";
import { createUserInfoInitialValues } from "./constants";
import { PasswordFormSection } from "./password-form-section";
import { ProfileFormSection } from "./profile-form-section";
import type { AccountSettingsFormProps } from "./types";
import { UserInfoFormActions } from "./user-info-form-actions";

export function AccountSettingsForm({
  role,
  content,
  user,
  isOauthAccount,
}: AccountSettingsFormProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const initialValues = createUserInfoInitialValues(user);

  const handleFieldChange = () => {
    if (notice) {
      setNotice(null);
    }
  };

  const handleSubmit = async () => {
    setNotice(
      "Biểu mẫu đã vượt qua kiểm tra và sẵn sàng kết nối API cập nhật hồ sơ khi bạn muốn triển khai bước lưu dữ liệu.",
    );
  };

  return (
    <SurfaceCard className="overflow-hidden border border-outline/10">
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={createUserInfoSchema({ isOauthAccount })}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, resetForm }) => (
          <Form>
            <div className="border-b border-outline/10 px-6 py-5 sm:px-7">
              <h2 className="font-display text-xl font-semibold text-on-surface">
                Cài đặt tài khoản
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isOauthAccount
                  ? "Cập nhật tên người dùng của bạn tại đây. Mật khẩu được quản lý qua tài khoản đăng nhập ngoài."
                  : "Cập nhật tên người dùng và mật khẩu của bạn tại một nơi."}
              </p>
            </div>

            <div className="space-y-8 px-6 py-6 sm:px-7">
              <ProfileFormSection
                role={role}
                content={content}
                onFieldChange={handleFieldChange}
              />

              {!isOauthAccount && (
                <PasswordFormSection
                  accentClassName={content.accentClassName}
                  onFieldChange={handleFieldChange}
                />
              )}

              {notice && (
                <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-on-surface">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p>{notice}</p>
                </div>
              )}

              <UserInfoFormActions
                saveButtonVariant={content.saveButtonVariant}
                isSubmitting={isSubmitting}
                onCancel={() => {
                  resetForm();
                  setNotice(null);
                }}
              />
            </div>
          </Form>
        )}
      </Formik>
    </SurfaceCard>
  );
}
