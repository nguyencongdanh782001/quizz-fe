import { APP_NAME } from '@/lib/constants';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-bold text-xl text-primary ${className}`}>
      {APP_NAME}
    </span>
  );
}
