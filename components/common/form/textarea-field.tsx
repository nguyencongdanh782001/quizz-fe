'use client';

import { forwardRef } from 'react';
import { Textarea as TextareaBase } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TextareaFieldProps extends React.ComponentProps<'textarea'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const taId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <Label htmlFor={taId} className="text-sm font-medium text-on-surface">
            {label}
            {props.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
        )}
        <TextareaBase
          ref={ref}
          id={taId}
          aria-invalid={!!error}
          className={cn(
            'resize-none',
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
TextareaField.displayName = 'TextareaField';