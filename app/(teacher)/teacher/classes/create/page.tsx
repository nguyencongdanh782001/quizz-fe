'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { InputField, SelectField, TextAreaField } from '@/components/forms/field-components';
import { GRADES, SUBJECTS } from '@/data/mock/mock-exams';
import { cn } from '@/lib/utils';

const COVER_COLORS = [
  '#00464a', '#29695b', '#663000', '#4a0040',
  '#1a4a00', '#004a4a', '#6b3200', '#320064',
];

export default function CreateClassPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    subject: '',
    grade: 10,
    coverColor: COVER_COLORS[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Tên lớp không được để trống';
    if (!form.subject) e.subject = 'Vui lòng chọn môn học';
    if (form.description.length > 200) e.description = 'Mô tả không quá 200 ký tự';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    router.push('/teacher/classes');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/teacher/classes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </Link>

      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Tạo lớp học mới
        </h1>
        <p className="text-sm text-muted-foreground">
          Điền thông tin cơ bản để tạo lớp học mới
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          label="Tên lớp"
          placeholder="Ví d: Lớp 10A1 — THPT Chu Văn An"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          error={errors.name}
        />

        <TextAreaField
          label="Mô tả"
          placeholder="Mô tả ngắn gọn về lớp học..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          error={errors.description}
          helperText={`${form.description.length}/200`}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Môn học"
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            options={SUBJECTS.map(s => ({ value: s, label: s }))}
            placeholder="Chọn môn"
            error={errors.subject}
          />
          <SelectField
            label="Khối lớp"
            value={form.grade}
            onChange={e => setForm(f => ({ ...f, grade: Number(e.target.value) }))}
            options={GRADES.map(g => ({ value: g, label: `Lớp ${g}` }))}
          />
        </div>

        {/* Cover color picker */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-on-surface">Màu lớp</label>
          <div className="flex gap-2">
            {COVER_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setForm(f => ({ ...f, coverColor: color }))}
                className={cn(
                  'w-8 h-8 rounded-lg transition-transform',
                  form.coverColor === color ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/teacher/classes"
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-outline/20 text-on-surface hover:bg-surface-container-low transition-colors text-center"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold',
              'bg-primary text-white hover:bg-primary/90',
              'transition-colors disabled:opacity-50'
            )}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo lớp học'}
          </button>
        </div>
      </form>
    </div>
  );
}
