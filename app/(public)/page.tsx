import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import { LandingHeader } from '@/components/features/landing/landing-header';
import { LandingHero } from '@/components/features/landing/landing-hero';
import { LandingExamPreview } from '@/components/features/landing/landing-exam-preview';
import { LandingFeatures } from '@/components/features/landing/landing-features';
import { LandingCTA } from '@/components/features/landing/landing-cta';
import { LandingFooter } from '@/components/features/landing/landing-footer';

export default async function LandingPage() {
  const session = await getServerSession();

  if (session) {
    if (session.needs_onboarding || !session.role_name) {
      redirect('/role');
    }

    redirect(session.role_name === 'teacher' ? '/teacher' : '/student');
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
