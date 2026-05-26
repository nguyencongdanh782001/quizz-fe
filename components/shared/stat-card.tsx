import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon: LucideIcon;
  tone?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
  className?: string;
  compact?: boolean;
}

const toneClassName = {
  primary: 'bg-primary/12 text-primary',
  secondary: 'bg-secondary/12 text-secondary',
  tertiary: 'bg-tertiary/12 text-tertiary',
  neutral: 'bg-slate-900/8 text-slate-700 dark:bg-slate-100/8 dark:text-slate-200',
} as const;

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'primary',
  className,
  compact = false,
}: StatCardProps) {
  return (
    <article
      className={cn(
        'rounded-[1.6rem] border border-white/70 bg-white/78 p-4 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.22)] backdrop-blur-xl',
        compact ? 'space-y-3' : 'space-y-4',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'inline-flex rounded-2xl p-3 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.3)]',
            toneClassName[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Chỉ số
        </span>
      </div>

      <div className="space-y-1.5">
        <p className="font-display text-3xl font-semibold tracking-tight text-on-surface">
          {value}
        </p>
        <p className="text-sm font-medium text-on-surface">{label}</p>
      </div>

      {description ? (
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </article>
  );
}
