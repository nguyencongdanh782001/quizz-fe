import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import { getRoleDashboardPath, isOnboardingIncomplete } from '@/lib/auth/onboarding';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (session && !isOnboardingIncomplete(session)) {
    redirect(getRoleDashboardPath(session.role_name));
  }

  return <>{children}</>;
}
