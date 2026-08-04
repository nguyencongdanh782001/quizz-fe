'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GhostButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const GhostButton = forwardRef<HTMLButtonElement, GhostButtonProps>(
  ({ className, variant = 'ghost', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'rounded-xl transition-all duration-200',
          'border border-outline/15 bg-transparent',
          'hover:bg-surface-container-low',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
          'disabled:opacity-50 disabled:pointer-events-none',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-5 py-2.5 text-base',
          size === 'lg' && 'px-7 py-3 text-lg',
          className
        )}
        {...props}
      />
    );
  }
);
GhostButton.displayName = 'GhostButton';
