import { redirect } from "next/navigation";
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
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F4F7FE] p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[460px] rounded-[6px] border border-[#E2E8F0] bg-white p-6 shadow-xl sm:p-7">
        <RoleSelectionForm initialUser={session} />
      </div>
    </div>
  );
}
