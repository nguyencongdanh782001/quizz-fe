"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  History,
  Trophy,
} from "lucide-react";
import {
  createEmptyStudentSystemResults,
  getStudentSystemResults,
  type StudentSystemResultListData,
} from "@/lib/student-system-results";
import { cn } from "@/lib/utils";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(iso: string): string {
  return DATE_TIME_FORMATTER.format(new Date(iso));
}

function formatPercent(value: number): string {
  const roundedValue = Math.round(value * 10) / 10;
  return Number.isInteger(roundedValue)
    ? `${roundedValue}%`
    : `${roundedValue.toFixed(1)}%`;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Không thể tải lịch sử bài thi. Vui lòng thử lại.";
}

export default function HistoryPage() {
  const [resultsData, setResultsData] = useState<StudentSystemResultListData>(
    () => createEmptyStudentSystemResults(),
  );
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      try {
        const nextResults = await getStudentSystemResults();

        if (!isMounted) {
          return;
        }

        setResultsData(nextResults);
        setLoadError(null);
      } catch (error) {
        console.error("Failed to fetch student system results", error);

        if (!isMounted) {
          return;
        }

        setResultsData(createEmptyStudentSystemResults());
        setLoadError(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingResults(false);
        }
      }
    }

    void loadResults();

    return () => {
      isMounted = false;
    };
  }, []);

  const { summary, items } = resultsData;
  const totalCompletedExamsLabel =
    isLoadingResults || loadError ? "--" : String(summary.totalCompletedExams);
  const passedExamsLabel =
    isLoadingResults || loadError ? "--" : String(summary.passedExams);
  const averageScoreLabel =
    isLoadingResults || loadError
      ? "--"
      : formatPercent(summary.averageScorePercent);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Lịch sử bài thi
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi các bài thi hệ thống mà bạn đã hoàn thành
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-surface-container-lowest p-5">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container">
              <BookOpen className="h-5 w-5 text-on-primary-container" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-on-surface">
                {totalCompletedExamsLabel}
              </p>
              <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-5">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container">
              <CheckCircle className="h-5 w-5 text-on-secondary-container" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-on-surface">
                {passedExamsLabel}
              </p>
              <p className="text-xs text-muted-foreground">Đã đạt</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-5">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-container">
              <Trophy className="h-5 w-5 text-on-tertiary-container" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-on-surface">
                {averageScoreLabel}
              </p>
              <p className="text-xs text-muted-foreground">Điểm trung bình</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-lg text-on-surface">
            Kết quả chi tiết
          </h2>
          {!isLoadingResults && !loadError && (
            <span className="text-sm text-muted-foreground">
              {items.length} lượt nộp
            </span>
          )}
        </div>

        {isLoadingResults ? (
          <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-6 text-sm text-muted-foreground">
            Đang tải lịch sử bài thi...
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-5 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Không thể tải lịch sử bài thi</p>
                <p className="mt-1">{loadError}</p>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-lowest px-6 py-16 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p className="font-medium">Chưa có bài thi nào đã hoàn thành</p>
            <p className="mt-1 text-sm">
              Hãy bắt đầu một bài thi hệ thống để xem kết quả tại đây
            </p>
            <Link
              href="/student/exams"
              className="mt-3 inline-block text-sm text-primary"
            >
              Khám phá đề thi →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((result) => (
              <div
                key={result.attemptId}
                className={cn(
                  "rounded-2xl border p-4 transition-colors sm:p-5",
                  result.isPassed
                    ? "border-green-200/60 bg-green-50/50 hover:bg-green-50/80 dark:border-green-800/30 dark:bg-green-950/10 dark:hover:bg-green-950/20"
                    : "border-red-200/60 bg-red-50/40 hover:bg-red-50/70 dark:border-red-800/30 dark:bg-red-950/10 dark:hover:bg-red-950/20",
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="h-20 w-full shrink-0 overflow-hidden rounded-2xl bg-primary/8 sm:h-24 sm:w-32">
                    {result.examImageUrl ? (
                      <div
                        role="img"
                        aria-label={result.examTitle}
                        className="h-full w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${result.examImageUrl})`,
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary">
                        <BookOpen className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          result.isPassed
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                        )}
                      >
                        {result.isPassed ? "Đạt" : "Chưa đạt"}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {result.scope === "system" ? "Hệ thống" : result.scope}
                      </span>
                      {result.classroomName && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {result.classroomName}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-semibold text-on-surface">
                      {result.examTitle}
                    </h3>

                    {result.examDescription && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {result.examDescription}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(result.submittedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {result.correctAnswersCount}/{result.totalQuestions} câu
                        đúng
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        {result.score}/{result.totalPoints} điểm
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:w-35 sm:flex-col sm:items-stretch sm:justify-center">
                    <div
                      className={cn(
                        "rounded-2xl px-3 py-2 text-center",
                        result.isPassed
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      )}
                    >
                      <p className="font-display text-2xl font-bold">
                        {formatPercent(result.scorePercent)}
                      </p>
                    </div>

                    <Link
                      href={`/student/exam/${result.examId}/result?attemptId=${result.attemptId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                    >
                      <History className="h-4 w-4" />
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
