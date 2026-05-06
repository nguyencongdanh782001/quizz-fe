import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { TeacherSidebar } from "@/components/common/teacher-sidebar";
import { Header } from "@/components/common/Header";
import { AuthHydrator } from "@/components/common/AuthHydrator";

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
      <div className="flex bg-surface">
        {/* Sidebar */}
        <TeacherSidebar />

        {/* Right content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          {/* Scroll area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden flex-col overflow-hidden">
            <div className="min-w-0 p-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthHydrator>
  );
}
