import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import { LandingHeader } from '@/components/features/landing/landing-header';
import { LandingHero } from '@/components/features/landing/landing-hero';
import { LandingExamPreview } from '@/components/features/landing/landing-exam-preview';
import { LandingFeatures } from '@/components/features/landing/landing-features';
import { LandingCTA } from '@/components/features/landing/landing-cta';
import { LandingFooter } from '@/components/features/landing/landing-footer';

/**
 * Root page — public landing page for unauthenticated users,
 * or redirect to /home for authenticated users.
 */
export default async function LandingPage() {
  const session = await getServerSession();

  // Authenticated → redirect to authenticated dashboard
  if (session) {
    redirect(session.role === 'teacher' ? '/teacher' : '/student');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingExamPreview />
        <LandingFeatures />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
