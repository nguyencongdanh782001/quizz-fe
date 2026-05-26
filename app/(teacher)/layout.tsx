import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { AuthHydrator } from "@/components/common/AuthHydrator";
import { AppShell } from "@/components/shared/app-shell";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.needs_onboarding || !session.role_name) {
    redirect("/role");
  }

  if (session.role_name !== "teacher") {
    redirect("/student");
  }

  return (
    <AuthHydrator>
      <AppShell role="teacher">{children}</AppShell>
    </AuthHydrator>
  );
}
