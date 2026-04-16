import { cn } from '@/lib/utils';

interface GlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassSurface({ children, className }: GlassSurfaceProps) {
  return (
    <div
      className={cn(
        'glass rounded-xl border border-outline/15',
        className
      )}
    >
      {children}
    </div>
  );
}
