'use client';

import { forwardRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CheckboxFieldProps {
  label?: React.ReactNode;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  name?: string;
  id?: string;
  className?: string;
}

export const CheckboxField = forwardRef<HTMLDivElement, CheckboxFieldProps>(
  ({ label, description, checked, onCheckedChange, disabled, required, error, name, id, className }, ref) => {
    const checkboxId = id ?? (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="space-y-2">
        <div
          ref={ref}
          className={cn(
            'flex items-start gap-3 rounded-2xl border border-outline/15 bg-surface-container-lowest/90 px-4 py-3 shadow-[0_1px_2px_rgba(7,30,39,0.05)] transition-[border-color,background-color,box-shadow]',
            checked && 'border-primary/30 bg-primary/5 shadow-[0_16px_40px_-28px_rgba(0,70,74,0.35)]',
            !checked && 'hover:border-primary/20 hover:bg-surface',
            disabled && 'opacity-60',
            error && 'border-destructive/40 bg-destructive/5',
            className
          )}
        >
          <Checkbox
            id={checkboxId}
            name={name}
            checked={checked}
            onCheckedChange={value => onCheckedChange?.(value === true)}
            disabled={disabled}
            aria-invalid={!!error}
            className="mt-0.5"
          />
          {(label || description) && (
            <div className="min-w-0 flex-1">
              {label && (
                <Label
                  htmlFor={checkboxId}
                  className={cn(
                    'text-sm font-medium text-on-surface cursor-pointer',
                    disabled && 'cursor-not-allowed'
                  )}
                >
                  {label}
                  {required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
              )}
              {description && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
              )}
            </div>
          )}
        </div>
        {error && <p className="px-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
CheckboxField.displayName = 'CheckboxField';
