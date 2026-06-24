import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { RoleSelectionForm } from "@/features/auth/components/RoleSelectionForm";
import { getServerSession } from "@/lib/auth-server";
import {
  getRoleDashboardPath,
  isOnboardingIncomplete,
} from "@/lib/auth/onboarding";

export default async function SelectRolePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (!isOnboardingIncomplete(session)) {
    redirect(getRoleDashboardPath(session.role_name));
  }

  return (
    <AuthCard>
      <RoleSelectionForm initialUser={session} />
    </AuthCard>
  );
}
