import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (session) {
    const destination = session.role === 'teacher' ? '/teacher' : '/student';
    redirect(destination);
  }

  return <>{children}</>;
}