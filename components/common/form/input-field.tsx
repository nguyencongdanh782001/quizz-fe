'use client';

import { forwardRef } from 'react';
import { Input as InputBase } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface InputFieldProps extends React.ComponentProps<'input'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <Label htmlFor={inputId} className="text-sm font-medium text-on-surface">
            {label}
            {props.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
        )}
        <InputBase
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>
            {error ?? helperText}
          </p>
        )}
      </div>
    );
  }
);
InputField.displayName = 'InputField';