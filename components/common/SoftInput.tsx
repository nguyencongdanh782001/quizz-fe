'use client';

import { forwardRef } from 'react';
import { Input as InputBase } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const SoftInput = forwardRef<HTMLInputElement, SoftInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <Label className="block text-sm font-medium text-on-surface">
            {label}
          </Label>
        )}
        <InputBase
          ref={ref}
          aria-invalid={!!error}
          className={cn(
            'bg-surface-container-highest hover:bg-surface-container-lowest focus-visible:bg-surface-container-lowest',
            error && 'border-destructive focus-visible:ring-destructive/20',
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
