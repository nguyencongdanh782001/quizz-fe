import * as Yup from "yup";
import type { UserInfoFormValues } from "../components/user-info/types";

const USER_NAME_MIN_LENGTH = 3;
const USER_NAME_MAX_LENGTH = 50;
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

function hasPasswordChange(...values: Array<string | undefined>) {
  return values.some((value) => Boolean(value?.trim()));
}

function createPasswordSchema() {
  return {
    currentPassword: Yup.string().test(
      "current-password-required",
      "Vui lòng nhập mật khẩu hiện tại",
      function validateCurrentPassword(value) {
        const { newPassword, confirmPassword } =
          this.parent as UserInfoFormValues;

        if (!hasPasswordChange(value, newPassword, confirmPassword)) {
          return true;
        }

        return Boolean(value?.trim());
      },
    ),
    newPassword: Yup.string().test(
      "new-password-rules",
      "Mật khẩu mới không hợp lệ",
      function validateNewPassword(value) {
        const { currentPassword, confirmPassword } =
          this.parent as UserInfoFormValues;

        if (!hasPasswordChange(currentPassword, value, confirmPassword)) {
          return true;
        }

        if (!value?.trim()) {
          return this.createError({ message: "Vui lòng nhập mật khẩu mới" });
        }

        if (value.length < 8) {
          return this.createError({
            message: "Mật khẩu mới cần ít nhất 8 ký tự",
          });
        }

        if (!STRONG_PASSWORD_REGEX.test(value)) {
          return this.createError({
            message:
              "Mật khẩu cần có chữ hoa, chữ thường, số và ký tự đặc biệt",
          });
        }

        return true;
      },
    ),
    confirmPassword: Yup.string().test(
      "confirm-password-match",
      "Xác nhận mật khẩu không hợp lệ",
      function validateConfirmPassword(value) {
        const { currentPassword, newPassword } =
          this.parent as UserInfoFormValues;

        if (!hasPasswordChange(currentPassword, newPassword, value)) {
          return true;
        }

        if (!value?.trim()) {
          return this.createError({
            message: "Vui lòng xác nhận mật khẩu mới",
          });
        }

        if (value !== newPassword) {
          return this.createError({ message: "Mật khẩu xác nhận không khớp" });
        }

        return true;
      },
    ),
  };
}

export function createUserInfoSchema({
  isOauthAccount,
}: {
  isOauthAccount: boolean;
}) {
  const baseSchema = {
    userName: Yup.string()
      .trim()
      .required("Tên người dùng là bắt buộc")
      .min(
        USER_NAME_MIN_LENGTH,
        `Tên người dùng cần ít nhất ${USER_NAME_MIN_LENGTH} ký tự`,
      )
      .max(
        USER_NAME_MAX_LENGTH,
        `Tên người dùng không được vượt quá ${USER_NAME_MAX_LENGTH} ký tự`,
      ),
  };

  if (isOauthAccount) {
    return Yup.object({
      ...baseSchema,
      currentPassword: Yup.string(),
      newPassword: Yup.string(),
      confirmPassword: Yup.string(),
    });
  }

  return Yup.object({
    ...baseSchema,
    ...createPasswordSchema(),
  });
}
