'use client';

import { forwardRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SelectFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const SelectField = forwardRef<HTMLDivElement, SelectFieldProps>(
  ({ label, error, helperText, options, placeholder, value, onValueChange, onChange, onBlur, name, disabled, required, className }, ref) => {
    const selectId = label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5" ref={ref}>
        {label && (
          <Label htmlFor={selectId} className="text-sm font-medium text-on-surface">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
        )}
        <Select
          value={value}
          onValueChange={val => {
            onValueChange?.(val);
            // Support both onValueChange and onChange (native-like)
            if (onChange) {
              const fakeEvent = { target: { value: val } } as React.ChangeEvent<HTMLSelectElement>;
              onChange(fakeEvent);
            }
          }}
          onOpenChange={() => onBlur?.()}
          disabled={disabled}
          name={name}
        >
          <SelectTrigger
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'w-full',
              error && 'border-destructive focus-visible:ring-destructive/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>
            {error ?? helperText}
          </p>
        )}
      </div>
    );
  }
);
SelectField.displayName = 'SelectField';