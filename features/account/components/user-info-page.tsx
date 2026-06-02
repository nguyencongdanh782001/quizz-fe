"use client";

import { ProfilePage } from "./profile-page";
import type { UserInfoPageProps } from "./user-info/types";

export function UserInfoPage({ role }: UserInfoPageProps) {
  return <ProfilePage role={role} />;
}
