import { cn } from '@/lib/utils';

interface SurfacePanelProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside' | 'form';
  tone?: 'default' | 'muted' | 'accent';
}

const toneClassName = {
  default: 'surface-panel',
  muted: 'surface-panel-muted',
  accent:
    'border border-primary/10 bg-linear-to-br from-primary/8 via-white/82 to-secondary/10 shadow-[0_24px_80px_-40px_rgba(79,70,229,0.28)] backdrop-blur-2xl',
} as const;

export function SurfacePanel({
  children,
  className,
  as: Tag = 'section',
  tone = 'default',
}: SurfacePanelProps) {
  return (
    <Tag
      className={cn(
        'rounded-[1.9rem] p-5 sm:p-6',
        toneClassName[tone],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
