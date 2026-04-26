import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import { StudentSidebar } from '@/components/common/student-sidebar';
import { Header } from '@/components/common/Header';
import { AuthHydrator } from '@/components/common/AuthHydrator';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (session.needs_onboarding || !session.role_name) {
    redirect('/role');
  }

  if (session.role_name !== 'student') {
    redirect('/teacher');
  }

  return (
    <AuthHydrator>
      <div className="flex h-screen bg-surface overflow-hidden">
        <StudentSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthHydrator>
  );
}
