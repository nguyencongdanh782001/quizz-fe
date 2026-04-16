'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useExamWizardStore } from '@/stores/exam-wizard-store';
import { InputField } from '@/components/forms/field-components';
import { cn } from '@/lib/utils';

export default function ExamSettingsPage() {
  const router = useRouter();
  const {
    duration, passingScore, attemptLimit, shuffleQuestions, shuffleOptions,
    updateSettings,
  } = useExamWizardStore();

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-surface-container-lowest rounded-xl p-6 space-y-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-on-surface mb-1">
            Cài đặt bài thi
          </h2>
          <p className="text-sm text-muted-foreground">
            Thời gian, số lần làm bài và các tùy chọn khác
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Thời gian (phút) *"
            type="number"
            min={5}
            max={180}
            value={duration}
            onChange={e => updateSettings({ duration: Number(e.target.value) })}
          />
          <InputField
            label="Điểm đạt (%) *"
            type="number"
            min={10}
            max={100}
            step={5}
            value={passingScore}
            onChange={e => updateSettings({ passingScore: Number(e.target.value) })}
          />
        </div>

        <InputField
          label="Số lần làm bài tối đa"
          type="number"
          min={1}
          max={10}
          value={attemptLimit}
          onChange={e => updateSettings({ attemptLimit: Number(e.target.value) })}
          helperText="Học sinh có thể làm lại bài thi nhiều lần"
        />

        {/* Toggles */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-on-surface">Tùy chọn</p>

          {[
            { key: 'shuffleQuestions', label: 'Xáo câu hỏi', desc: 'Thứ tự câu hỏi khác nhau cho mỗi học sinh' },
            { key: 'shuffleOptions', label: 'Xáo đáp án', desc: 'Đáp án hiển thị theo thứ tự ngẫu nhiên' },
          ].map(({ key, label, desc }) => {
            const value = key === 'shuffleQuestions' ? shuffleQuestions : shuffleOptions;
            return (
              <div
                key={key}
                className="flex items-center justify-between p-4 rounded-xl bg-surface border border-outline/10"
              >
                <div>
                  <p className="text-sm font-medium text-on-surface">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={value}
                  onClick={() => updateSettings({ [key]: !value } as any)}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    value ? 'bg-primary' : 'bg-surface-container'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                      value ? 'left-6 translate-x-0' : 'left-1 -translate-x-0'
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/teacher/exams/create/questions')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-outline/20 text-on-surface hover:bg-surface-container transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <button
          onClick={() => router.push('/teacher/exams/create/review')}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Tiếp theo: Xem lại
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
