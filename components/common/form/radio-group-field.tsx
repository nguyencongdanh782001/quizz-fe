'use client';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupFieldProps {
  label?: string;
  name?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

export function RadioGroupField({
  label,
  name,
  options,
  value,
  onChange,
  error,
  disabled,
  required,
  className,
  direction = 'vertical',
}: RadioGroupFieldProps) {
  const fieldId = name ?? label?.toLowerCase().replace(/\s+/g, '-') ?? 'radio-group';

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-on-surface">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <RadioGroup
        name={name}
        value={value}
        onValueChange={val => !disabled && onChange?.(val)}
        disabled={disabled}
        className={cn(
          direction === 'horizontal' ? 'flex flex-wrap gap-3' : 'gap-3',
          className
        )}
      >
        {options.map(opt => {
          const optionId = `${fieldId}-${opt.value}`;
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              className={cn(
                'flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_1px_2px_rgba(7,30,39,0.05)] transition-[border-color,background-color,box-shadow]',
                isSelected
                  ? 'border-primary/30 bg-primary/5 shadow-[0_16px_40px_-28px_rgba(0,70,74,0.35)]'
                  : 'border-outline/15 bg-surface-container-lowest/90 hover:border-primary/20 hover:bg-surface',
                disabled && 'opacity-60'
              )}
            >
              <RadioGroupItem
                id={optionId}
                value={opt.value}
                aria-invalid={!!error}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <Label
                  htmlFor={optionId}
                  className={cn('text-sm font-medium text-on-surface', !disabled && 'cursor-pointer')}
                >
                  {opt.label}
                </Label>
                {opt.description && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{opt.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </RadioGroup>
      {error && <p className="px-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
