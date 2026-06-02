import type { LucideIcon } from "lucide-react";
import type { ProfileGender } from "@/lib/api/types";
import type { User, UserRole } from "@/types/user.types";

export type UserInfoRole = UserRole;
export type UserInfoSaveButtonVariant = "default" | "secondary";

export interface UserInfoPageProps {
  role: UserInfoRole;
}

export interface UserInfoFormValues {
  userName: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileFormValues {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: ProfileGender | "";
  school_name: string;
}

export interface ChangePasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserInfoRoleContent {
  badgeLabel: string;
  title: string;
  subtitle: string;
  roleLabel: string;
  usernamePlaceholder: string;
  heroClassName: string;
  badgeClassName: string;
  iconWrapClassName: string;
  accentClassName: string;
  saveButtonVariant: UserInfoSaveButtonVariant;
  icon: LucideIcon;
}

export interface AccountSettingsFormProps {
  role: UserInfoRole;
  content: UserInfoRoleContent;
  user: User | null;
  isOauthAccount: boolean;
}
