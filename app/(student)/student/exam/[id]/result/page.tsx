"use client";

import { use, useSyncExternalStore, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Home,
  BookOpen,
} from "lucide-react";
import { mockExams } from "@/data/mock/mock-exams";
import { getQuestionsByExamId } from "@/data/mock/mock-questions";
import { ExamAttempt } from "@/types/exam.types";
import { cn } from "@/lib/utils";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function ResultPageContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const exam = mockExams.find((e) => e.id === id);
  const questions = getQuestionsByExamId(id);
  const attempt = useSyncExternalStore(
    () => () => {},
    () => {
      if (!attemptId) return null;
      const stored = sessionStorage.getItem(`attempt-${attemptId}`);
      return stored ? (JSON.parse(stored) as ExamAttempt) : null;
    },
    () => null,
  );

  if (!exam) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Không tìm thấy kết quả</p>
        <Link href="/exams" className="text-primary text-sm mt-2 inline-block">
          ← Quay lại đề thi
        </Link>
      </div>
    );
  }

  // Mock attempt if none found
  const result = attempt ?? {
    id: "mock",
    examId: exam.id,
    userId: "user",
    answers: {},
    score: Math.floor(questions.length * 0.7),
    totalPoints: questions.length,
    percentage: 70,
    passed: true,
    startedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    timeSpent: exam.duration * 45,
  };

  const scorePercent =
    result.totalPoints > 0
      ? Math.round((result.score / result.totalPoints) * 100)
      : 0;
  const isPassed = scorePercent >= exam.passingScore;

  return (
    <div className="space-y-8 w-full mx-auto">
      {/* Back */}
      <Link
        href="/exams"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
      >
        ← Quay lại đề thi
      </Link>

      {/* Score card */}
      <div
        className={cn(
          "rounded-2xl p-8 text-center",
          isPassed
            ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800/30"
            : "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800/30",
        )}
      >
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4",
            isPassed
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          )}
        >
          {isPassed ? (
            <>
              <CheckCircle className="w-4 h-4" /> Đạt
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" /> Chưa đạt
            </>
          )}
        </div>

        <div className="mb-4">
          <div
            className="font-display font-bold text-6xl mb-1"
            style={{
              color: isPassed ? "#059669" : "#dc2626",
            }}
          >
            {scorePercent}%
          </div>
          <p className="text-muted-foreground text-sm">
            {result.score}/{result.totalPoints} câu đúng
          </p>
        </div>

        <h1 className="font-display font-bold text-xl text-on-surface mb-2">
          {exam.title}
        </h1>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-4">
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4" />
            Điểm tối thiểu: {exam.passingScore}%
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Thời gian: {formatDuration(result.timeSpent)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/exams"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Làm bài khác
        </Link>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border border-outline/20 text-on-surface hover:bg-surface-container-low transition-colors"
        >
          <Home className="w-4 h-4" />
          Trang chủ
        </Link>
      </div>

      {/* Per-question breakdown */}
      {questions.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-lg text-on-surface mb-4">
            Chi tiết từng câu
          </h2>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const selected = result.answers[q.id] ?? [];
              const correctIds = q.options
                .filter((o) => o.isCorrect)
                .map((o) => o.id);
              const isSingleSelect =
                q.type === "single" ||
                q.type === "multiple_choice" ||
                q.type === "true_false";
              const isCorrect = isSingleSelect
                ? selected.length === 1 && correctIds.includes(selected[0])
                : selected.length === correctIds.length &&
                  selected.every((id) => correctIds.includes(id));

              return (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-xl p-4 border",
                    isCorrect
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30"
                      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface">
                        Câu {i + 1}: {q.text}
                      </p>
                      {!isCorrect && q.explanation && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Giải thích: {q.explanation}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium shrink-0",
                        isCorrect
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {q.points}đ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 text-muted-foreground">
          Đang tải kết quả...
        </div>
      }
    >
      <ResultPageContent id={id} />
    </Suspense>
  );
}
