"use client";

import { useAuth } from "@/hooks/useAuth";
import { AccountSettingsForm } from "./user-info/account-settings-form";
import { roleContentByRole } from "./user-info/constants";
import type { UserInfoPageProps } from "./user-info/types";
import { UserInfoHero } from "./user-info/user-info-hero";
import { UserInfoSidebar } from "./user-info/user-info-sidebar";

export function UserInfoPage({ role }: UserInfoPageProps) {
  const { user } = useAuth();
  const content = roleContentByRole[role];
  const isOauthAccount = user?.auth_type === "oauth";
  const displayName =
    user?.full_name?.trim() ||
    (role === "teacher" ? "Tài khoản giáo viên" : "Tài khoản học sinh");
  const displayEmail =
    user?.email ||
    (role === "teacher"
      ? "teacher@scholar-clarity.app"
      : "student@scholar-clarity.app");
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <UserInfoHero
        content={content}
        displayName={displayName}
        displayEmail={displayEmail}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_340px]">
        <AccountSettingsForm
          role={role}
          content={content}
          user={user}
          isOauthAccount={isOauthAccount}
        />
        <UserInfoSidebar
          content={content}
          displayName={displayName}
          displayEmail={displayEmail}
          isOauthAccount={isOauthAccount}
          userInitial={userInitial}
        />
      </div>
    </div>
  );
}
