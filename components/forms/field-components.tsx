'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
          <label htmlFor={inputId} className="block text-sm font-medium text-on-surface">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2.5 rounded-xl text-sm',
            'bg-surface text-on-surface border',
            'outline-none transition-colors placeholder:text-muted-foreground',
            error
              ? 'border-destructive focus:ring-1 focus:ring-destructive/30'
              : 'border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary/30',
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

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, helperText, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-on-surface">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2.5 rounded-xl text-sm',
            'bg-surface text-on-surface border',
            'outline-none transition-colors',
            error
              ? 'border-destructive focus:ring-1 focus:ring-destructive/30'
              : 'border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary/30',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const taId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={taId} className="block text-sm font-medium text-on-surface">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={taId}
          rows={4}
          className={cn(
            'w-full px-3 py-2.5 rounded-xl text-sm resize-none',
            'bg-surface text-on-surface border',
            'outline-none transition-colors placeholder:text-muted-foreground',
            error
              ? 'border-destructive focus:ring-1 focus:ring-destructive/30'
              : 'border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary/30',
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
TextAreaField.displayName = 'TextAreaField';
