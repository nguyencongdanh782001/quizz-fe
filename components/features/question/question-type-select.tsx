'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QuestionType } from '@/types/exam.types';

interface QuestionTypeSelectProps {
  value: QuestionType;
  onChange: (val: QuestionType) => void;
}

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Trắc nghiệm (1 đáp án)' },
  { value: 'true_false',      label: 'Đúng / Sai' },
  { value: 'text',             label: 'Tự luận ngắn' },
  { value: 'single',          label: 'Một đáp án (legacy)' },
  { value: 'multiple',        label: 'Nhiều đáp án (legacy)' },
];

export function QuestionTypeSelect({ value, onChange }: QuestionTypeSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="question-type">Loại câu hỏi</Label>
      <Select
        value={value}
        onValueChange={v => onChange(v as QuestionType)}
      >
        <SelectTrigger id="question-type" className="w-full">
          <SelectValue placeholder="Chọn loại câu hỏi" />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}