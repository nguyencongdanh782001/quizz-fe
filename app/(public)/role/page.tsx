import { redirect } from 'next/navigation';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { RoleSelectionForm } from '@/features/auth/components/RoleSelectionForm';
import { getServerSession } from '@/lib/auth-server';

export default async function RolePage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (!session.needs_onboarding && session.role_name) {
    redirect(session.role_name === 'teacher' ? '/teacher' : '/student');
  }

  return (
    <AuthCard>
      <RoleSelectionForm initialUser={session} />
    </AuthCard>
  );
}
