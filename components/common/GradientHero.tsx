import { cn } from '@/lib/utils';

interface GradientHeroProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientHero({ children, className }: GradientHeroProps) {
  return (
    <div
      className={cn(
        'bg-gradient-hero rounded-xl p-10 md:p-14 text-white',
        className
      )}
    >
      {children}
    </div>
  );
}
