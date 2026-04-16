'use client';

import { useRouter } from 'next/navigation';
import { useExamWizardStore } from '@/stores/exam-wizard-store';
import { InputField, SelectField, TextAreaField } from '@/components/forms/field-components';
import { useState } from 'react';

const SUBJECTS = ['Toán', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ văn', 'Tiếng Anh', 'Lịch sử', 'Địa lý'];
const GRADES = [6, 7, 8, 9, 10, 11, 12];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function ExamCreatePage() {
  const router = useRouter();
  const { title, description, subject, grade, difficulty, updateBasicInfo } = useExamWizardStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Tiêu đề bắt buộc' });
      return;
    }
    router.push('/teacher/exams/create/questions');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-lg text-on-surface">Thông tin cơ bản</h2>
        <InputField
          label="Tiêu đề bài thi *"
          value={title}
          onChange={e => { updateBasicInfo({ title: e.target.value }); setErrors({}); }}
          placeholder="VD: Kiểm tra giữa kỳ 1 - Toán lớp 10"
          error={errors.title}
        />
        <TextAreaField
          label="Mô tả"
          value={description}
          onChange={e => updateBasicInfo({ description: e.target.value })}
          placeholder="Mô tả nội dung bài thi..."
          rows={3}
        />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Môn học"
            value={subject}
            onChange={e => updateBasicInfo({ subject: e.target.value })}
            options={SUBJECTS.map(s => ({ value: s, label: s }))}
            placeholder="Chọn môn"
          />
          <SelectField
            label="Khối lớp"
            value={String(grade)}
            onChange={e => updateBasicInfo({ grade: Number(e.target.value) })}
            options={GRADES.map(g => ({ value: String(g), label: `Lớp ${g}` }))}
          />
        </div>
        <SelectField
          label="Mức độ"
          value={difficulty}
          onChange={e => updateBasicInfo({ difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
          options={[
            { value: 'easy', label: 'Dễ' },
            { value: 'medium', label: 'Trung bình' },
            { value: 'hard', label: 'Khó' },
          ]}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Tiếp theo: Câu hỏi →
        </button>
      </div>
    </form>
  );
}