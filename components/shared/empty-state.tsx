import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SurfacePanel } from '@/components/shared/surface-panel';

interface AppEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  tone?: 'default' | 'muted';
}

export function AppEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  tone = 'default',
}: AppEmptyStateProps) {
  return (
    <SurfacePanel
      tone={tone}
      className={cn('px-6 py-10 text-center sm:px-8 sm:py-12', className)}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-primary/10 text-primary shadow-[0_18px_36px_-24px_rgba(79,70,229,0.44)]">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold text-on-surface">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </SurfacePanel>
  );
}
