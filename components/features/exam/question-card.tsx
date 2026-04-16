'use client';

import { Flag, CheckCircle } from 'lucide-react';
import { Question } from '@/types/exam.types';
import { AnswerOption } from './answer-option';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  selectedIds: string[];
  onSelect: (questionId: string, optionIds: string[]) => void;
  isFlagged?: boolean;
}

export function QuestionCard({
  question,
  index,
  total,
  selectedIds,
  onSelect,
  isFlagged = false,
}: QuestionCardProps) {
  const handleSelect = (optionId: string) => {
    if (question.type === 'single') {
      onSelect(question.id, [optionId]);
    } else {
      // Multiple: toggle
      if (selectedIds.includes(optionId)) {
        onSelect(question.id, selectedIds.filter(id => id !== optionId));
      } else {
        onSelect(question.id, [...selectedIds, optionId]);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Câu hỏi {index + 1} / {total}
          </span>
          <h2 className="font-display font-semibold text-on-surface text-base md:text-lg leading-relaxed mt-1">
            {question.text}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {question.type === 'multiple' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container text-muted-foreground font-medium">
              Chọn nhiều
            </span>
          )}
          {isFlagged && (
            <Flag className="w-4 h-4 text-yellow-500 fill-yellow-100 dark:fill-yellow-900/30" />
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, i) => (
          <AnswerOption
            key={option.id}
            option={option}
            index={i}
            isSelected={selectedIds.includes(option.id)}
            isMultiple={question.type === 'multiple'}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Points */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>{question.points} điểm</span>
      </div>
    </div>
  );
}
