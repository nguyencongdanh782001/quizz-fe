import { Briefcase, GraduationCap } from "lucide-react";
import type { ProfileGender, UserSchema } from "@/lib/api/types";
import type { User } from "@/types/user.types";
import type {
  ProfileFormValues,
  UserInfoFormValues,
  UserInfoRole,
  UserInfoRoleContent,
} from "./types";

export const roleContentByRole: Record<UserInfoRole, UserInfoRoleContent> = {
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
    saveButtonVariant: "default",
    icon: GraduationCap,
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
    saveButtonVariant: "secondary",
    icon: Briefcase,
  },
};

export function createUserInfoInitialValues(
  user: User | null | undefined,
): UserInfoFormValues {
  return {
    userName: user?.username?.trim() || user?.full_name?.trim() || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

export const genderOptions: Array<{ value: ProfileGender; label: string }> = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
];

export function createProfileInitialValues(user: UserSchema): ProfileFormValues {
  const gender =
    user.profile?.gender === "male" || user.profile?.gender === "female"
      ? user.profile.gender
      : "";

  return {
    full_name: user.full_name ?? "",
    phone: user.phone ?? "",
    date_of_birth: user.profile?.date_of_birth ?? "",
    gender,
    school_name: user.profile?.school_name ?? "",
  };
}
