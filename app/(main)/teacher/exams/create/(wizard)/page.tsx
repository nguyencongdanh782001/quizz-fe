'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useExamWizardStore } from '@/stores/exam-wizard-store';
import { InputField, SelectField, TextAreaField } from '@/components/forms/field-components';
import { GRADES, SUBJECTS } from '@/data/mock/mock-exams';
import { cn } from '@/lib/utils';
import { ExamDifficulty } from '@/types/exam.types';

export default function CreateExamStep1Page() {
  const router = useRouter();
  const { title, description, subject, grade, difficulty, updateBasicInfo } = useExamWizardStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Tiêu đề không được để trống';
    if (!subject) e.subject = 'Vui lòng chọn môn học';
    if (description.length > 300) e.description = 'Mô tả không quá 300 ký tự';
    return e;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    router.push('/teacher/exams/create/questions');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-surface-container-lowest rounded-xl p-6 space-y-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-on-surface mb-1">
            Thông tin cơ bản
          </h2>
          <p className="text-sm text-muted-foreground">
            Điền thông tin tổng quan về bài thi
          </p>
        </div>

        <InputField
          label="Tiêu đề bài thi *"
          placeholder="Ví d: Kiểm tra Giữa Kỳ I — Toán học"
          value={title}
          onChange={e => updateBasicInfo({ title: e.target.value })}
          error={errors.title}
        />

        <TextAreaField
          label="Mô tả"
          placeholder="Mô tả ngắn về nội dung và phạm vi bài thi..."
          value={description}
          onChange={e => updateBasicInfo({ description: e.target.value })}
          error={errors.description}
          helperText={`${description.length}/300`}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Môn học *"
            value={subject}
            onChange={e => updateBasicInfo({ subject: e.target.value })}
            options={SUBJECTS.map(s => ({ value: s, label: s }))}
            placeholder="Chọn môn"
            error={errors.subject}
          />
          <SelectField
            label="Khối lớp"
            value={grade}
            onChange={e => updateBasicInfo({ grade: Number(e.target.value) } as any)}
            options={GRADES.map(g => ({ value: g, label: `Lớp ${g}` }))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-on-surface">Mức độ khó</label>
          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'medium', 'hard'] as ExamDifficulty[]).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => updateBasicInfo({ difficulty: d })}
                className={cn(
                  'py-3 rounded-xl text-sm font-medium border transition-all',
                  difficulty === d
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-on-surface border-outline/20 hover:bg-surface-container-low'
                )}
              >
                {d === 'easy' ? 'Dễ' : d === 'medium' ? 'Trung bình' : 'Khó'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Tiếp theo: Câu hỏi
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
