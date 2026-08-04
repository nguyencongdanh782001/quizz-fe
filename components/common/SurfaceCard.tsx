import { cn } from '@/lib/utils';

interface SurfaceCardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'button';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function SurfaceCard({
  children,
  className,
  as: Tag = 'div',
  onClick,
  type,
}: SurfaceCardProps) {
  return (
    <Tag
      onClick={onClick}
      type={Tag === 'button' ? type : undefined}
      className={cn(
        'bg-surface-container-lowest rounded-xl',
        'shadow-[0_4px_24px_rgba(7,30,39,0.06)]',
        className
      )}
    >
      {children}
    </Tag>
  );
}
