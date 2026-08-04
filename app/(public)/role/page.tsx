import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import {
  SELECT_ROLE_PATH,
  getRoleDashboardPath,
  isOnboardingIncomplete,
} from "@/lib/auth/onboarding";

export default async function RolePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (isOnboardingIncomplete(session)) {
    redirect(SELECT_ROLE_PATH);
  }

  redirect(getRoleDashboardPath(session.role_name));
}
