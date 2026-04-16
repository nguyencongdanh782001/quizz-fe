'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const SoftInput = forwardRef<HTMLInputElement, SoftInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-on-surface">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg',
            'bg-surface-container-highest',
            'text-on-surface text-base font-body',
            'placeholder:text-on-surface-variant/60',
            'outline-none',
            'focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20',
            'transition-all duration-200',
            error && 'ring-2 ring-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
SoftInput.displayName = 'SoftInput';
