import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (session && !session.needs_onboarding && session.role_name) {
    const destination = session.role_name === 'teacher' ? '/teacher' : '/student';
    redirect(destination);
  }

  return <>{children}</>;
}
