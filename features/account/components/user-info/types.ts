import type { LucideIcon } from "lucide-react";
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
