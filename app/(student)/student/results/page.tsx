'use client';

import Link from 'next/link';
import { Clock, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { mockResults } from '@/data/mock/mock-results';
import { mockExams } from '@/data/mock/mock-exams';
import { cn } from '@/lib/utils';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function HistoryPage() {
  const results = mockResults;
  const totalExams = mockExams.length;
  const passedCount = results.filter(r => r.passed).length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Lịch sử bài thi
        </h1>
        <p className="text-sm text-muted-foreground">
          Xem lại kết quả các bài thi đã làm
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-on-primary-container" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-on-surface">{totalExams}</p>
              <p className="text-xs text-muted-foreground">Đề thi</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-on-secondary-container" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-on-surface">{passedCount}</p>
              <p className="text-xs text-muted-foreground">Đạt</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-tertiary-container flex items-center justify-center">
              <Clock className="w-5 h-5 text-on-tertiary-container" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-on-surface">{avgScore}%</p>
              <p className="text-xs text-muted-foreground">Điểm TB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results list */}
      <div>
        <h2 className="font-display font-semibold text-lg text-on-surface mb-4">
          Kết quả chi tiết
        </h2>

        {results.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-surface-container-lowest rounded-xl">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Chưa có bài thi nào</p>
            <p className="text-sm mt-1">Bắt đầu làm bài thi đầu tiên của bạn</p>
            <Link href="/exams" className="text-primary text-sm mt-3 inline-block">
              Khám phá đề thi →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map(result => {
              const exam = mockExams.find(e => e.id === result.examId);
              return (
                <div
                  key={result.id}
                  className={cn(
                    'flex items-center gap-4 bg-surface-container-lowest rounded-xl p-4',
                    'border transition-colors hover:bg-surface-container-low',
                    result.passed
                      ? 'border-green-200/50 dark:border-green-800/30'
                      : 'border-red-200/50 dark:border-red-800/30'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0',
                      result.passed
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {result.percentage}%
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-on-surface text-sm truncate">
                      {exam?.title ?? 'Không rõ đề thi'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(result.submittedAt)}
                      </span>
                      <span>{result.score}/{result.totalPoints} câu đúng</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {result.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    <Link
                      href={`/exam/${result.examId}/result?attemptId=${result.id}`}
                      className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                      Chi tiết →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
