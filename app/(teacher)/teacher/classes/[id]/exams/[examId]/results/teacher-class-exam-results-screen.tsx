"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type ComponentType } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { useBreadcrumbLabel } from "@/components/shared/breadcrumb-labels";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { exportTeacherExamResultsToExcel } from "@/lib/export-teacher-exam-results";
import {
  getTeacherClassById,
  getTeacherClassroomExamDetail,
} from "@/lib/teacher-classes";
import {
  createEmptyTeacherExamResults,
  getTeacherClassExamResults,
  type TeacherExamResultItemData,
} from "@/lib/teacher-exam-results";
import { cn } from "@/lib/utils";
import { EmptyState } from "../../../components/empty-state";
import { ErrorState } from "../../../components/error-state";
import { LoadingState } from "../../../components/loading-state";
import { teacherClassDetailQueryKeys } from "../../../query-keys";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : DATE_TIME_FORMATTER.format(date);
}

function formatPercent(value: number): string {
  const roundedValue = Math.round(value * 10) / 10;
  return Number.isInteger(roundedValue)
    ? `${roundedValue}%`
    : `${roundedValue.toFixed(1)}%`;
}

function formatScore(value: number): string {
  const roundedValue = Math.round(value * 100) / 100;
  return Number.isInteger(roundedValue)
    ? String(roundedValue)
    : roundedValue.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-[0_16px_45px_-36px_rgba(7,30,39,0.28)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold text-on-surface">
            {value}
          </p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ResultStatusBadge({ isPassed }: { isPassed: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isPassed
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      )}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      {isPassed ? "Đạt" : "Chưa đạt"}
    </span>
  );
}

function ResultsTable({
  classId,
  examId,
  items,
}: {
  classId: string;
  examId: string;
  items: TeacherExamResultItemData[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(7,30,39,0.05)]">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-outline/10">
              {[
                "Học sinh",
                "Điểm",
                "Câu đúng",
                "Nộp lúc",
                "Trạng thái",
                "Hành động",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((result) => (
              <tr
                key={result.attemptId}
                className="border-b border-outline/10 last:border-0 hover:bg-surface-container-low"
              >
                <td className="min-w-72 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      avatarUrl={result.studentAvatarUrl}
                      fullName={result.studentName}
                      className="size-11"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">
                        {result.studentName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {result.studentEmail || "Chưa có email"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="min-w-28">
                    <p className="font-display text-xl font-bold text-on-surface">
                      {formatPercent(result.scorePercent)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatScore(result.score)}/{formatScore(result.totalPoints)} điểm
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {result.correctAnswersCount}/{result.totalQuestions} câu
                </td>
                <td className="min-w-44 px-5 py-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(result.submittedAt)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <ResultStatusBadge isPassed={result.isPassed} />
                </td>
                <td className="px-5 py-4">
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/teacher/classes/${classId}/exams/${examId}/results/${result.attemptId}`}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Chi tiết
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TeacherClassExamResultsScreen({
  classId,
  examId,
}: {
  classId: string;
  examId: string;
}) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const classQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.detail(classId),
    queryFn: async () => getTeacherClassById(classId),
  });
  const examQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.examDetail(classId, examId),
    queryFn: async () => getTeacherClassroomExamDetail(classId, examId),
  });
  const resultsQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.examResults(classId, examId),
    queryFn: async () => getTeacherClassExamResults(classId, examId),
  });

  const classBreadcrumbHref = `/teacher/classes/${classId}`;
  const examBreadcrumbHref = `/teacher/classes/${classId}/exams/${examId}`;
  const resultsBreadcrumbHref = `${examBreadcrumbHref}/results`;
  const classLabel = classQuery.data?.name?.trim() || null;
  const examLabel = examQuery.data?.title?.trim() || null;

  useBreadcrumbLabel(classBreadcrumbHref, classLabel);
  useBreadcrumbLabel(examBreadcrumbHref, examLabel);
  useBreadcrumbLabel(resultsBreadcrumbHref, "Kết quả");

  const isLoading =
    resultsQuery.isPending && resultsQuery.data === undefined;
  const loadError =
    resultsQuery.isError && resultsQuery.data === undefined
      ? getApiErrorMessage(
          resultsQuery.error,
          "Không thể tải kết quả bài thi. Vui lòng thử lại.",
        )
      : null;
  const resultsData = resultsQuery.data ?? createEmptyTeacherExamResults();
  const passedCount = resultsData.items.filter((item) => item.isPassed).length;
  const examTitle = examLabel || "Kết quả bài thi";
  const className = classLabel || "Lớp học";

  async function handleRetry() {
    await Promise.all([
      classQuery.refetch(),
      examQuery.refetch(),
      resultsQuery.refetch(),
    ]);
  }

  async function handleExportExcel() {
    setIsExportingExcel(true);

    try {
      await exportTeacherExamResultsToExcel({
        className,
        examTitle,
        passedCount,
        results: resultsData,
      });
    } catch (error) {
      console.error("Failed to export teacher exam results", error);
    } finally {
      setIsExportingExcel(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/teacher/classes/${classId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại lớp học
      </Link>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {className}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-on-surface">
            {examTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Theo dõi kết quả nộp bài của học sinh trong bài thi này.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void handleExportExcel()}
            disabled={
              isLoading ||
              Boolean(loadError) ||
              resultsData.items.length === 0 ||
              isExportingExcel
            }
            className="h-11 rounded-2xl"
          >
            <FileSpreadsheet
              className={cn(
                "mr-2 h-4 w-4",
                isExportingExcel && "animate-pulse",
              )}
            />
            {isExportingExcel ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void handleRetry()}
            disabled={resultsQuery.isFetching || examQuery.isFetching}
            className="h-11 rounded-2xl"
          >
            <RefreshCw
              className={cn(
                "mr-2 h-4 w-4",
                (resultsQuery.isFetching || examQuery.isFetching) &&
                  "animate-spin",
              )}
            />
            Làm mới
          </Button>
        </div>
      </section>

      {isLoading ? (
        <LoadingState label="kết quả bài thi" />
      ) : loadError ? (
        <ErrorState
          title="Không thể tải kết quả"
          message={loadError}
          onRetry={handleRetry}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={Users}
              label="Lượt nộp"
              value={String(resultsData.summary.submittedCount)}
            />
            <StatCard
              icon={CheckCircle2}
              label="Đã đạt"
              value={String(passedCount)}
            />
            <StatCard
              icon={Trophy}
              label="Điểm trung bình"
              value={formatPercent(resultsData.summary.averageScorePercent)}
            />
          </div>

          {resultsData.items.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Chưa có học sinh nộp bài"
              description="Khi học sinh hoàn thành bài thi, kết quả sẽ xuất hiện tại đây."
            />
          ) : (
            <ResultsTable
              classId={classId}
              examId={examId}
              items={resultsData.items}
            />
          )}
        </>
      )}
    </div>
  );
}
