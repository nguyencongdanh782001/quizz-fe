import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { AuthHydrator } from "@/components/common/AuthHydrator";
import { AppShell } from "@/components/shared/app-shell";
import {
  SELECT_ROLE_PATH,
  getRoleDashboardPath,
  isOnboardingIncomplete,
} from "@/lib/auth/onboarding";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (isOnboardingIncomplete(session)) {
    redirect(SELECT_ROLE_PATH);
  }

  if (getRoleDashboardPath(session.role_name) !== "/teacher") {
    redirect("/student");
  }

  return (
    <AuthHydrator>
      <AppShell role="teacher">{children}</AppShell>
    </AuthHydrator>
  );
}
