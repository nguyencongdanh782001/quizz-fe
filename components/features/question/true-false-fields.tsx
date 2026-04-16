'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrueFalseFieldsProps {
  value: string;   // 'true' | 'false' | ''
  onChange: (val: string) => void;
}

export function TrueFalseFields({ value, onChange }: TrueFalseFieldsProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Chọn đáp án đúng</p>
      <div className="flex gap-3">
        {(['true', 'false'] as const).map(opt => {
          const isCorrect = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-semibold border transition-all',
                isCorrect
                  ? 'bg-primary border-primary text-white'
                  : 'border-outline/30 bg-surface text-on-surface hover:border-outline/60'
              )}
            >
              <span className="flex items-center justify-center gap-2">
                {isCorrect && <Check className="w-4 h-4" />}
                {opt === 'true' ? 'Đúng' : 'Sai'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}