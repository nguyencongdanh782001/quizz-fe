'use client';

import { Check } from 'lucide-react';
import { AnswerOption as AnswerOptionType } from '@/types/exam.types';
import { cn } from '@/lib/utils';

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

interface AnswerOptionProps {
  option: AnswerOptionType;
  index: number;
  isSelected: boolean;
  isMultiple: boolean;
  onSelect: (id: string) => void;
}

export function AnswerOption({
  option,
  index,
  isSelected,
  isMultiple,
  onSelect,
}: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        'flex items-start gap-3 w-full p-4 rounded-xl text-left',
        'border transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary/40',
        isSelected
          ? 'bg-primary/8 border-primary text-on-surface'
          : 'bg-surface-container-lowest border-outline/20 text-on-surface hover:bg-surface-container-low hover:border-outline/40'
      )}
    >
      <div
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5',
          'border transition-colors duration-150',
          isSelected
            ? 'bg-primary text-white border-primary'
            : 'bg-surface-container text-muted-foreground border-outline/30'
        )}
      >
        {isMultiple && isSelected ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          optionLetters[index]
        )}
      </div>
      <span className="text-sm leading-relaxed flex-1 pt-0.5">{option.text}</span>
    </button>
  );
}
