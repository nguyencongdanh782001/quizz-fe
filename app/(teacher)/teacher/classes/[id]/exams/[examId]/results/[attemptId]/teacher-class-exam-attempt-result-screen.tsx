"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileQuestion,
  Mail,
  Trophy,
  XCircle,
} from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { useBreadcrumbLabel } from "@/components/shared/breadcrumb-labels";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { getTeacherClassById } from "@/lib/teacher-classes";
import {
  getTeacherClassExamAttemptResult,
  type TeacherExamAttemptAnswerData,
} from "@/lib/teacher-exam-results";
import { cn } from "@/lib/utils";
import type { TeacherExamQuestionType } from "@/types/exam";
import { EmptyState } from "../../../../components/empty-state";
import { ErrorState } from "../../../../components/error-state";
import { LoadingState } from "../../../../components/loading-state";
import { teacherClassDetailQueryKeys } from "../../../../query-keys";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const QUESTION_TYPE_LABELS: Record<TeacherExamQuestionType, string> = {
  single_choice: "Một đáp án",
  multiple_choice: "Nhiều đáp án",
  true_false: "Đúng / sai",
  fill_in_blank: "Điền từ",
  short_answer: "Trả lời ngắn",
  text: "Tự luận",
};

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

function formatDuration(startedAt: string, submittedAt: string): string {
  const startedTime = new Date(startedAt).getTime();
  const submittedTime = new Date(submittedAt).getTime();

  if (Number.isNaN(startedTime) || Number.isNaN(submittedTime)) {
    return "--";
  }

  const totalSeconds = Math.max(
    0,
    Math.round((submittedTime - startedTime) / 1000),
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }

  if (minutes > 0) {
    return `${minutes} phút ${seconds} giây`;
  }

  return `${seconds} giây`;
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] bg-surface-container-lowest p-5 shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
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

function ImagePreview({
  imageUrl,
  label,
}: {
  imageUrl: string | null;
  label: string;
}) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div
      role="img"
      aria-label={label}
      className="mt-3 h-40 w-full rounded-[8px] bg-surface bg-cover bg-center ring-1 ring-outline/10"
      style={{ backgroundImage: `url(${imageUrl})` }}
    />
  );
}

function getSubmittedAnswerLabel(answer: TeacherExamAttemptAnswerData): string {
  const textAnswer = answer.submittedAnswerText?.trim();

  if (textAnswer) {
    return textAnswer;
  }

  const optionAnswer = answer.selectedOptionText?.trim();

  if (optionAnswer) {
    return optionAnswer;
  }

  return "Chưa trả lời";
}

function getCorrectAnswerLabel(answer: TeacherExamAttemptAnswerData): string {
  const correctOption = answer.correctOptionText?.trim();

  if (correctOption) {
    return correctOption;
  }

  if (answer.acceptedAnswers.length > 0) {
    return answer.acceptedAnswers.join(", ");
  }

  return "Không có đáp án";
}

function AnswerPanel({
  title,
  value,
  imageUrl,
  tone,
}: {
  title: string;
  value: string;
  imageUrl: string | null;
  tone: "neutral" | "success" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-[8px] border p-4",
        tone === "success" &&
          "border-green-200/70 bg-green-50/70 text-green-800 dark:border-green-800/30 dark:bg-green-950/20 dark:text-green-200",
        tone === "danger" &&
          "border-red-200/70 bg-red-50/70 text-red-800 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-200",
        tone === "neutral" &&
          "border-outline/10 bg-surface text-on-surface",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
        {title}
      </p>
      <RichTextRenderer
        html={value}
        className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-6"
      />
      <ImagePreview imageUrl={imageUrl} label={title} />
    </div>
  );
}

function AnswerCard({
  answer,
  index,
}: {
  answer: TeacherExamAttemptAnswerData;
  index: number;
}) {
  return (
    <article
      className={cn(
        "rounded-[8px] border p-5 shadow-[0_1px_3px_rgba(30,41,59,0.05)]",
        answer.isCorrect
          ? "border-green-200/70 bg-green-50/50 dark:border-green-800/30 dark:bg-green-950/10"
          : "border-red-200/70 bg-red-50/40 dark:border-red-800/30 dark:bg-red-950/10",
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-on-surface-variant">
              Câu {index + 1}
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {QUESTION_TYPE_LABELS[answer.questionType] ?? answer.questionType}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                answer.isCorrect
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              )}
            >
              {answer.isCorrect ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {answer.isCorrect ? "Đúng" : "Sai"}
            </span>
          </div>

          <RichTextRenderer
            html={answer.prompt}
            className="text-base font-semibold leading-7 text-on-surface"
          />
          <ImagePreview
            imageUrl={answer.questionImageUrl}
            label={`Hình ảnh câu ${index + 1}`}
          />
        </div>

        <div className="shrink-0 rounded-[8px] bg-surface px-4 py-3 text-right">
          <p className="font-display text-xl font-bold text-on-surface">
            {formatScore(answer.pointsEarned)}/{formatScore(answer.maxPoints)}
          </p>
          <p className="text-xs text-muted-foreground">điểm</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <AnswerPanel
          title="Bài làm của học sinh"
          value={getSubmittedAnswerLabel(answer)}
          imageUrl={answer.selectedOptionImageUrl}
          tone={answer.isCorrect ? "success" : "danger"}
        />
        <AnswerPanel
          title="Đáp án đúng"
          value={getCorrectAnswerLabel(answer)}
          imageUrl={answer.correctOptionImageUrl}
          tone="success"
        />
      </div>

      {answer.explanation ? (
        <div className="mt-3 rounded-[8px] border border-outline/10 bg-surface px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Giải thích
          </p>
          <RichTextRenderer
            html={answer.explanation}
            className="mt-2 whitespace-pre-wrap text-sm leading-6 text-on-surface"
          />
        </div>
      ) : null}
    </article>
  );
}

export function TeacherClassExamAttemptResultScreen({
  classId,
  examId,
  attemptId,
}: {
  classId: string;
  examId: string;
  attemptId: string;
}) {
  const classQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.detail(classId),
    queryFn: async () => getTeacherClassById(classId),
  });
  const resultQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.examAttemptResult(
      classId,
      examId,
      attemptId,
    ),
    queryFn: async () =>
      getTeacherClassExamAttemptResult(classId, examId, attemptId),
  });

  const result = resultQuery.data ?? null;
  const classBreadcrumbHref = `/teacher/classes/${classId}`;
  const examBreadcrumbHref = `/teacher/classes/${classId}/exams/${examId}`;
  const resultsBreadcrumbHref = `${examBreadcrumbHref}/results`;
  const attemptBreadcrumbHref = `${resultsBreadcrumbHref}/${attemptId}`;

  useBreadcrumbLabel(
    classBreadcrumbHref,
    classQuery.data?.name?.trim() || null,
  );
  useBreadcrumbLabel(examBreadcrumbHref, result?.examTitle?.trim() || null);
  useBreadcrumbLabel(resultsBreadcrumbHref, "Kết quả");
  useBreadcrumbLabel(attemptBreadcrumbHref, result?.studentName?.trim() || null);

  const isLoading = resultQuery.isPending && resultQuery.data === undefined;
  const loadError =
    resultQuery.isError && resultQuery.data === undefined
      ? getApiErrorMessage(
          resultQuery.error,
          "Không thể tải chi tiết lượt nộp. Vui lòng thử lại.",
        )
      : null;

  async function handleRetry() {
    await Promise.all([classQuery.refetch(), resultQuery.refetch()]);
  }

  if (isLoading) {
    return <LoadingState label="chi tiết kết quả" />;
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <Link
          href={resultsBreadcrumbHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại kết quả
        </Link>
        <ErrorState
          title="Không thể tải chi tiết"
          message={loadError}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (!result) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Không tìm thấy lượt nộp"
        description="Lượt nộp này có thể đã bị xóa hoặc bạn không còn quyền truy cập."
        action={
          <Button asChild>
            <Link href={resultsBreadcrumbHref}>Về danh sách kết quả</Link>
          </Button>
        }
      />
    );
  }

  const isPassed = result.scorePercent >= 50;

  return (
    <div className="space-y-6">
      <Link
        href={resultsBreadcrumbHref}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại kết quả
      </Link>

      <section className="rounded-[8px] bg-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <UserAvatar
              avatarUrl={result.studentAvatarUrl}
              fullName={result.studentName}
              className="size-14 shrink-0"
              fallbackClassName="text-lg"
            />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    isPassed
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  )}
                >
                  {isPassed ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {isPassed ? "Đạt" : "Chưa đạt"}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {result.status === "submitted" ? "Đã nộp" : "Đang làm"}
                </span>
              </div>

              <h1 className="text-lg font-bold text-[#1E293B]">
                {result.studentName}
              </h1>
              <p className="mt-1 text-xs text-[#64748B]">
                {result.examTitle}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {result.studentEmail || "Chưa có email"}
              </p>
            </div>
          </div>

          <div className="rounded-[8px] bg-primary/10 px-6 py-4 text-center text-primary">
            <p className="font-display text-4xl font-bold">
              {formatPercent(result.scorePercent)}
            </p>
            <p className="mt-1 text-sm font-medium">
              {formatScore(result.score)}/{formatScore(result.totalPoints)} điểm
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatTile
          icon={CheckCircle2}
          label="Câu đúng"
          value={`${result.correctAnswersCount}/${result.totalQuestions}`}
        />
        <StatTile
          icon={Trophy}
          label="Tổng điểm"
          value={`${formatScore(result.score)}/${formatScore(result.totalPoints)}`}
        />
        <StatTile
          icon={Clock}
          label="Thời gian làm"
          value={formatDuration(result.startedAt, result.submittedAt)}
        />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-on-surface">
              Chi tiết từng câu
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nộp lúc {formatDate(result.submittedAt)}
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {result.answers.length} câu hỏi
          </span>
        </div>

        {result.answers.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title="Chưa có dữ liệu câu trả lời"
            description="Backend chưa trả về danh sách câu trả lời cho lượt nộp này."
          />
        ) : (
          <div className="space-y-4">
            {result.answers.map((answer, index) => (
              <AnswerCard
                key={answer.questionId}
                answer={answer}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
