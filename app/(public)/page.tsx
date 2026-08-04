import { redirect } from 'next/navigation';
import { LandingAbout } from '@/components/features/landing/landing-about';
import { LandingCourses } from '@/components/features/landing/landing-courses';
import { LandingFaq } from '@/components/features/landing/landing-faq';
import { LandingFooter } from '@/components/features/landing/landing-footer';
import { LandingHeader } from '@/components/features/landing/landing-header';
import { LandingHero } from '@/components/features/landing/landing-hero';
import { LandingPartners } from '@/components/features/landing/landing-partners';
import { LandingPricing } from '@/components/features/landing/landing-pricing';
import { getServerSession } from '@/lib/auth-server';
import {
  EMAIL_VERIFICATION_REASON_HOME,
  getVerifyEmailPath,
} from '@/lib/auth/email-verification';
import {
  SELECT_ROLE_PATH,
  getRoleDashboardPath,
  isOnboardingIncomplete,
} from '@/lib/auth/onboarding';

export default async function LandingPage() {
  const session = await getServerSession();

  if (session) {
    if (!session.email_verified) {
      redirect(
        getVerifyEmailPath({
          email: session.email,
          nextPath: '/',
          reason: EMAIL_VERIFICATION_REASON_HOME,
        }),
      );
    }

    if (isOnboardingIncomplete(session)) redirect(SELECT_ROLE_PATH);
    redirect(getRoleDashboardPath(session.role_name));
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-white font-sans text-[#111827]">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingPartners />
        <LandingAbout />
        <LandingCourses />
        <LandingFaq />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  );
}
