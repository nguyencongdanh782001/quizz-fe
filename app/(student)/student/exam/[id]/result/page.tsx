"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Home,
  BookOpen,
  RotateCcw,
  Trophy,
} from "lucide-react";
import {
  getStudentAttemptResult,
  readCachedStudentAttemptResult,
  startStudentExamAttempt,
  StudentSubmitAttemptResultData,
  writeCachedStudentAttemptResult,
} from "@/lib/student-system-exams";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} phút ${s} giây`;
}

function ResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const [result, setResult] = useState<StudentSubmitAttemptResultData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isStartingRetake, setIsStartingRetake] = useState(false);
  const [retakeToastMessage, setRetakeToastMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadResult() {
      if (!attemptId) {
        setResult(null);
        setLoadError("Không tìm thấy lượt nộp bài.");
        setIsLoading(false);
        return;
      }

      const cachedResult = readCachedStudentAttemptResult(attemptId);
      setResult(cachedResult);
      setLoadError(null);
      setIsLoading(!cachedResult);

      const liveResult = await getStudentAttemptResult(attemptId);

      if (!isMounted) {
        return;
      }

      if (liveResult) {
        writeCachedStudentAttemptResult(liveResult);
        setResult(liveResult);
        setLoadError(null);
      } else if (!cachedResult) {
        setLoadError("Không tìm thấy kết quả");
      }

      setIsLoading(false);
    }

    void loadResult();

    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  useEffect(() => {
    if (!retakeToastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRetakeToastMessage(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [retakeToastMessage]);

  if (isLoading && !result) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Đang tải kết quả...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">
          {loadError ?? "Không tìm thấy kết quả"}
        </p>
        <Link
          href="/student/exams"
          className="text-primary text-sm mt-2 inline-block"
        >
          ← Quay lại đề thi
        </Link>
      </div>
    );
  }

  const scorePercent =
    result.totalPoints > 0
      ? Math.round((result.score / result.totalPoints) * 100)
      : 0;
  const timeSpent = Math.max(
    0,
    Math.round(
      (new Date(result.submittedAt).getTime() -
        new Date(result.startedAt).getTime()) /
        1000,
    ),
  );
  const isExcellent = scorePercent >= 80;
  const canRetakeExam =
    Boolean(result.submittedAt) && result.status !== "in_progress";

  async function handleRetakeExam() {
    setIsStartingRetake(true);
    setRetakeToastMessage(null);

    try {
      const attempt = await startStudentExamAttempt(result?.examId || "");
      router.push(
        `/student/exam/${result?.examId}/take?attemptId=${attempt.id}`,
      );
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Không thể tạo lượt làm bài mới. Vui lòng thử lại.";

      setRetakeToastMessage(message);
      setIsStartingRetake(false);
    }
  }

  return (
    <div className="space-y-8 w-full mx-auto">
      {retakeToastMessage && (
        <div className="fixed right-4 top-4 z-50 max-w-sm" role="alert">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-[0_16px_40px_-24px_rgba(220,38,38,0.45)] dark:border-red-800/30 dark:bg-red-950/85 dark:text-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">Không thể thi lại</p>
                <p className="mt-1">{retakeToastMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setRetakeToastMessage(null)}
                className="shrink-0 text-red-500 transition-colors hover:text-red-700 dark:text-red-300 dark:hover:text-red-100"
                aria-label="Đóng thông báo lỗi"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back */}
      <Link
        href="/student/exams"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
      >
        ← Quay lại đề thi
      </Link>

      {/* Score card */}
      <div
        className={cn(
          "rounded-2xl p-8 text-center",
          isExcellent
            ? "bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800/30"
            : "bg-linear-to-br from-sky-50 to-cyan-50 dark:from-sky-950/20 dark:to-cyan-950/20 border border-sky-200 dark:border-sky-800/30",
        )}
      >
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4",
            isExcellent
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
          )}
        >
          {isExcellent ? (
            <>
              <Trophy className="w-4 h-4" /> Kết quả tốt
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" /> Đã nộp bài
            </>
          )}
        </div>

        <div className="mb-4">
          <div
            className="font-display font-bold text-6xl mb-1"
            style={{
              color: isExcellent ? "#059669" : "#0284c7",
            }}
          >
            {scorePercent}%
          </div>
          <p className="text-muted-foreground text-sm">
            {result.score}/{result.totalPoints} điểm
          </p>
        </div>

        <h1 className="font-display font-bold text-xl text-on-surface mb-2">
          {result.examTitle}
        </h1>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-4">
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4" />
            {result.correctAnswersCount}/{result.totalQuestions} câu đúng
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Thời gian: {formatDuration(timeSpent)}
          </span>
        </div>

        {canRetakeExam && (
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              size="lg"
              onClick={() => void handleRetakeExam()}
              disabled={isStartingRetake}
              aria-busy={isStartingRetake}
              className="min-w-55 rounded-2xl px-6"
            >
              <RotateCcw
                className={cn("h-4 w-4", isStartingRetake && "animate-spin")}
              />
              Thi lại
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/student/exams"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Làm bài khác
        </Link>
        <Link
          href="/student"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border border-outline/20 text-on-surface hover:bg-surface-container-low transition-colors"
        >
          <Home className="w-4 h-4" />
          Trang chủ
        </Link>
      </div>

      {/* Per-question breakdown */}
      {result.answers.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-lg text-on-surface mb-4">
            Chi tiết từng câu
          </h2>
          <div className="space-y-3">
            {result.answers.map((answer, i) => {
              return (
                <div
                  key={answer.questionId}
                  className={cn(
                    "rounded-xl p-4 border",
                    answer.isCorrect
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30"
                      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {answer.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface">
                        Câu {i + 1}: {answer.prompt}
                      </p>
                      <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                        {answer.selectedOptionText && (
                          <p>Đã chọn: {answer.selectedOptionText}</p>
                        )}
                        {answer.submittedAnswerText && (
                          <div className="mt-2 rounded-xl border border-outline/10 bg-surface/70 p-3">
                            <p className="font-medium text-on-surface">
                              Câu trả lời của bạn:
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words leading-5 text-muted-foreground">
                              {answer.submittedAnswerText}
                            </p>
                          </div>
                        )}
                        {answer.correctOptionText && (
                          <p>Đáp án đúng: {answer.correctOptionText}</p>
                        )}
                        {answer.acceptedAnswers.length > 0 && (
                          <p>
                            Đáp án chấp nhận:{" "}
                            {answer.acceptedAnswers.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium shrink-0",
                        answer.isCorrect
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {answer.pointsEarned}/{answer.maxPoints}đ
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

export default function ExamResultPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 text-muted-foreground">
          Đang tải kết quả...
        </div>
      }
    >
      <ResultPageContent />
    </Suspense>
  );
}
