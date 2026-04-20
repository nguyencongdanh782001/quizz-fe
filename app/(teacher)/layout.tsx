import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import { TeacherSidebar } from '@/components/common/teacher-sidebar';
import { Header } from '@/components/common/Header';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (session.needs_onboarding || !session.role_name) {
    redirect('/role');
  }

  if (session.role_name !== 'teacher') {
    redirect('/student');
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
