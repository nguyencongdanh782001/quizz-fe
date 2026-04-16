'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, Clock, BookOpen, Star, AlertTriangle } from 'lucide-react';
import { useExamWizardStore } from '@/stores/exam-wizard-store';
import { cn } from '@/lib/utils';

export default function ExamReviewPage() {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const {
    title, description, subject, grade, difficulty, tags,
    questions, duration, passingScore, attemptLimit, shuffleQuestions, shuffleOptions,
    resetWizard,
  } = useExamWizardStore();

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const hasQuestions = questions.length > 0;
  const hasCorrectAnswers = questions.every(q => {
    if (['single', 'multiple', 'multiple_choice'].includes(q.type)) {
      return q.options.some(o => o.isCorrect);
    }
    if (q.type === 'true_false') return !!q.answer;
    if (q.type === 'text') return q.answer?.length === 4;
    return false;
  });

  const handlePublish = async () => {
    if (!hasQuestions) return;
    setIsPublishing(true);
    await new Promise(r => setTimeout(r, 1200));
    resetWizard();
    router.push('/teacher/exams');
  };

  const TYPE_BG: Record<string, string> = {
    single: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    multiple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    multiple_choice: 'bg-primary/10 text-primary',
    true_false: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    text: 'bg-secondary/10 text-secondary',
  };
  const TYPE_LABEL: Record<string, string> = {
    single: '1 đáp án',
    multiple: 'Nhiều đáp án',
    multiple_choice: 'Trắc nghiệm',
    true_false: 'Đúng / Sai',
    text: 'Tự luận ngắn',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic info */}
          <div className="bg-surface-container-lowest rounded-xl p-5">
            <h3 className="font-display font-semibold text-on-surface mb-3">Thông tin bài thi</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tiêu đề</dt>
                <dd className="font-medium text-on-surface">{title || '(chưa nhập)'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Môn học</dt>
                <dd className="font-medium text-on-surface">{subject || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Khối</dt>
                <dd className="font-medium text-on-surface">Lớp {grade}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Mức độ</dt>
                <dd className="font-medium text-on-surface capitalize">
                  {difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Mô tả</dt>
                <dd className="font-medium text-on-surface max-w-xs text-right">{description || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Questions */}
          <div className="bg-surface-container-lowest rounded-xl p-5">
            <h3 className="font-display font-semibold text-on-surface mb-3">
              Câu hỏi ({questions.length})
            </h3>
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Chưa có câu hỏi nào
              </p>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface">
                    <span className="text-xs font-semibold text-muted-foreground w-5 shrink-0">
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-on-surface line-clamp-1">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          TYPE_BG[q.type] ?? 'bg-blue-100 text-blue-700'
                        )}>
                          {TYPE_LABEL[q.type] ?? q.type}
                        </span>
                        <span className="text-xs text-muted-foreground">{q.points} điểm</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings summary */}
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-on-surface">Tổng quan</h3>

            {[
              { icon: BookOpen, label: 'Câu hỏi', value: questions.length },
              { icon: Star, label: 'Tổng điểm', value: totalPoints },
              { icon: Clock, label: 'Thời gian', value: `${duration} phút` },
              { icon: Star, label: 'Điểm đạt', value: `${passingScore}%` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold text-on-surface">{value}</p>
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-outline/10">
              <p className="text-xs text-muted-foreground">
                Lần làm bài tối đa: {attemptLimit}
              </p>
              <p className="text-xs text-muted-foreground">
                Xáo câu hỏi: {shuffleQuestions ? 'Có' : 'Không'}
              </p>
              <p className="text-xs text-muted-foreground">
                Xáo đáp án: {shuffleOptions ? 'Có' : 'Không'}
              </p>
            </div>
          </div>

          {/* Publish */}
          <div className="bg-surface-container-lowest rounded-xl p-5 space-y-3">
            {!hasQuestions && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30">
                <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Cần thêm ít nhất 1 câu hỏi
                </p>
              </div>
            )}

            {!hasCorrectAnswers && hasQuestions && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30">
                <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Tất cả câu hỏi cần ít nhất 1 đáp án đúng
                </p>
              </div>
            )}

            <button
              onClick={handlePublish}
              disabled={!hasQuestions || !hasCorrectAnswers || isPublishing}
              className={cn(
                'w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2',
                'bg-secondary text-white hover:bg-secondary/90 transition-colors',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              {isPublishing ? (
                'Đang xuất bản...'
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Xuất bản bài thi
                </>
              )}
            </button>

            <button
              onClick={() => router.push('/teacher/exams/create/settings')}
              className="w-full py-2.5 rounded-xl text-sm font-medium border border-outline/20 text-muted-foreground hover:bg-surface-container transition-colors"
            >
              Chỉnh sửa cài đặt
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push('/teacher/exams/create/settings')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại cài đặt
      </button>
    </div>
  );
}
