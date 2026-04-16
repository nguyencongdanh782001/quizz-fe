'use client';

import { useRouter } from 'next/navigation';
import { useExamWizardStore } from '@/stores/exam-wizard-store';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const {
    duration, passingScore, attemptLimit,
    shuffleQuestions, shuffleOptions,
    updateSettings
  } = useExamWizardStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggle = (key: 'shuffleQuestions' | 'shuffleOptions') => {
    const state = useExamWizardStore.getState();
    updateSettings({ [key]: !(state as any)[key] });
  };

  const handleNext = () => {
    if (!duration || duration <= 0) {
      setErrors({ duration: 'Thời gian phải lớn hơn 0' });
      return;
    }
    router.push('/teacher/exams/create/review');
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-lg text-on-surface">Cài đặt bài thi</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-on-surface mb-1 block">Thời gian (phút) *</label>
            <input
              type="number"
              value={duration}
              onChange={e => {
                updateSettings({ duration: Number(e.target.value) });
                setErrors({});
              }}
              placeholder="VD: 45"
              className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
            />
            {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-on-surface mb-1 block">Điểm đạt (%)</label>
            <input
              type="number"
              value={passingScore}
              onChange={e => updateSettings({ passingScore: Number(e.target.value) })}
              placeholder="VD: 50"
              className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-on-surface mb-1 block">Số lần làm tối đa</label>
            <input
              type="number"
              value={attemptLimit}
              onChange={e => updateSettings({ attemptLimit: Number(e.target.value) })}
              placeholder="VD: 3"
              className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {([
            { key: 'shuffleQuestions', label: 'Xáo trộn câu hỏi' },
            { key: 'shuffleOptions', label: 'Xáo trộn đáp án' },
          ] as const).map(({ key, label }) => {
            const state = useExamWizardStore.getState();
            const val = (state as any)[key];
            return (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => toggle(key)}
                  className={cn(
                    'w-11 h-6 rounded-full relative transition-colors cursor-pointer',
                    val ? 'bg-primary' : 'bg-surface-container'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform',
                      val ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </div>
                <span className="text-sm font-medium text-on-surface">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/teacher/exams/create/questions')}
          className="px-5 py-2.5 rounded-xl border border-outline text-sm font-semibold hover:bg-surface-container-low transition-colors"
        >
          ← Quay lại
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Tiếp theo: Xem lại →
        </button>
      </div>
    </div>
  );
}