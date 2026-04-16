import { cn } from '@/lib/utils';

interface NoLineListProps {
  children: React.ReactNode;
  className?: string;
}

export function NoLineList({ children, className }: NoLineListProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {children}
    </div>
  );
}
