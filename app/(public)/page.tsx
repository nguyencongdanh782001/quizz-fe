import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import { LandingHeader } from '@/components/features/landing/landing-header';
import { LandingHero } from '@/components/features/landing/landing-hero';
import { LandingStats } from '@/components/features/landing/landing-stats';
import { LandingFeatures } from '@/components/features/landing/landing-features';
import { LandingDashboardPreview } from '@/components/features/landing/landing-dashboard-preview';
import { LandingActivity } from '@/components/features/landing/landing-activity';
import { LandingTestimonials } from '@/components/features/landing/landing-testimonials';
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
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[linear-gradient(180deg,#f9fcff_0%,#f3faff_32%,#eef7fb_100%)]">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="landing-glow left-[-10rem] top-24 h-80 w-80 bg-primary/15" />
      <div className="landing-glow right-[-8rem] top-[30rem] h-72 w-72 bg-secondary/18" />
      <div className="landing-glow bottom-16 left-1/2 h-64 w-64 -translate-x-1/2 bg-sky-300/20" />
      <LandingHeader />
      <main className="relative z-10 flex-1">
        <LandingHero />
        <LandingStats />
        <LandingFeatures />
        <LandingDashboardPreview />
        <LandingActivity />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
