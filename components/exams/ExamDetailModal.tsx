"use client";
/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import useSWR from "swr";
import {
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  HelpCircle,
  ImageIcon,
  ListChecks,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExamVisibilityToggle } from "@/components/exams/ExamVisibilityToggle";
import type { ToggleVisibilityResponse } from "@/hooks/queries/useToggleExamVisibility";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeacherExam } from "@/types/exam";
import { getTeacherSystemExamDetail } from "@/services/exam.service";
import { cn } from "@/lib/utils";
import { mergeTeacherExamPublishUpdate } from "./exam-publish-utils";
import { VisibilityStatusBadge } from "./ExamVisibilityToggle";
import {
  formatExamDateTime,
  formatExamNumber,
  getActiveBadgeConfig,
  getQuestionTypeLabel,
} from "./exam-utils";

const TEACHER_EXAM_DETAIL_KEY = "teacher-system-exam-detail";

interface ExamDetailModalProps {
  exam: TeacherExam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleVisibility?: (response: ToggleVisibilityResponse) => void;
  onToggleError?: (message: string) => void;
}

function ExamDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 w-full rounded-[28px]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-[24px]" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-44 rounded-[28px]" />
        ))}
      </div>
    </div>
  );
}

function DetailMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-outline/10 bg-surface p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-base font-semibold text-on-surface">{value}</p>
    </div>
  );
}

export function ExamDetailModal({
  exam,
  open,
  onOpenChange,
  onToggleVisibility,
  onToggleError,
}: ExamDetailModalProps) {
  const {
    data: detail,
    error,
    isLoading,
    mutate,
  } = useSWR(
    open && exam ? [TEACHER_EXAM_DETAIL_KEY, exam.id] : null,
    async ([, examId]) => getTeacherSystemExamDetail(examId),
    {
      revalidateOnFocus: false,
      fallbackData: exam?.questions?.length ? exam : undefined,
    },
  );

  const resolvedExam = detail ?? exam;

  function handleToggleSuccess(response: ToggleVisibilityResponse) {
    void mutate(
      (current) =>
        current
          ? mergeTeacherExamPublishUpdate(current, response.exam)
          : current,
      {
        revalidate: false,
      },
    );
    onToggleVisibility?.(response);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100%-1rem,72rem)] p-0 pb-5 h-full">
        <div className="max-h-[85vh] overflow-y-auto">
          <div className="border-b border-outline/10 px-6 pt-6 pb-5 sm:px-7">
            <DialogHeader>
              <DialogTitle>Chi tiết đề thi</DialogTitle>
              <DialogDescription>
                Xem đầy đủ nội dung đề thi, câu hỏi, đáp án và trạng thái hiện
                tại.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-7">
            {isLoading && !resolvedExam ? <ExamDetailSkeleton /> : null}

            {!isLoading && error ? (
              <div className="rounded-[28px] border border-destructive/15 bg-destructive/6 p-6">
                <p className="text-base font-semibold text-destructive">
                  Không thể tải dữ liệu đề thi
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Có lỗi xảy ra, vui lòng thử lại.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => void mutate()}
                  className="mt-4 h-11 rounded-2xl"
                >
                  Tải lại dữ liệu
                </Button>
              </div>
            ) : null}

            {resolvedExam ? (
              <>
                <section className="overflow-hidden rounded-[30px] border border-outline/10 bg-surface-container-lowest shadow-[0_24px_75px_-48px_rgba(7,30,39,0.28)]">
                  <div className="relative h-60 bg-linear-to-br from-primary/20 via-secondary/15 to-tertiary/16">
                    {resolvedExam.image_url ? (
                      <img
                        src={resolvedExam.image_url}
                        alt={resolvedExam.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="rounded-full bg-white/70 p-6 shadow-lg backdrop-blur-sm dark:bg-slate-950/35">
                          <GraduationCap className="size-12 text-primary" />
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/65 via-slate-950/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 space-y-4 px-6 py-6 text-white sm:px-7">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const activeBadge = getActiveBadgeConfig(
                              resolvedExam.is_active,
                            );

                            return (
                              <>
                                <VisibilityStatusBadge
                                  isPublished={resolvedExam.is_published}
                                  className="border-white/25 bg-white/90 text-slate-900 shadow-sm"
                                />
                                <Badge
                                  className={cn(
                                    "shadow-sm",
                                    activeBadge.className,
                                  )}
                                >
                                  {activeBadge.label}
                                </Badge>
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <ExamVisibilityToggle
                            examId={resolvedExam.id}
                            examTitle={resolvedExam.title}
                            isPublished={resolvedExam.is_published}
                            onSuccess={handleToggleSuccess}
                            onError={onToggleError}
                            className="h-9 rounded-2xl border-white/30 bg-white/92 px-4 text-slate-900 shadow-sm hover:bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h2 className="font-display text-3xl font-semibold leading-tight">
                          {resolvedExam.title}
                        </h2>
                        <p className="max-w-4xl text-sm leading-relaxed text-white/85">
                          {resolvedExam.description || "Đề thi chưa có mô tả."}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <DetailMetric
                    icon={<Clock3 className="size-3.5" />}
                    label="Thời lượng"
                    value={`${formatExamNumber(resolvedExam.duration_minutes)} phút`}
                  />
                  <DetailMetric
                    icon={<Trophy className="size-3.5" />}
                    label="Tổng điểm"
                    value={formatExamNumber(resolvedExam.total_points)}
                  />
                  <DetailMetric
                    icon={<ListChecks className="size-3.5" />}
                    label="Số câu hỏi"
                    value={formatExamNumber(resolvedExam.question_count)}
                  />
                  <DetailMetric
                    icon={<CheckCircle2 className="size-3.5" />}
                    label="Lượt làm"
                    value={formatExamNumber(resolvedExam.attempt_count)}
                  />
                </section>

                <section className="grid gap-4 rounded-[28px] border border-outline/10 bg-surface-container-lowest p-5 lg:grid-cols-3">
                  <DetailMetric
                    icon={<GraduationCap className="size-3.5" />}
                    label="Lớp học"
                    value={resolvedExam.classroom_name || "Chưa gắn lớp học"}
                  />
                  <DetailMetric
                    icon={<CalendarClockIcon />}
                    label="Ngày tạo"
                    value={formatExamDateTime(resolvedExam.created_at)}
                  />
                  <DetailMetric
                    icon={<CalendarClockIcon />}
                    label="Ngày cập nhật"
                    value={formatExamDateTime(resolvedExam.updated_at)}
                  />
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <HelpCircle className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-on-surface">
                        Danh sách câu hỏi
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Đáp án đúng được tô nổi bật để giáo viên kiểm tra nhanh.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(resolvedExam.questions ?? [])
                      .slice()
                      .sort(
                        (left, right) => left.order_index - right.order_index,
                      )
                      .map((question, index) => (
                        <article
                          key={question.id}
                          className="rounded-[28px] border border-outline/10 bg-surface-container-lowest p-5 shadow-[0_20px_55px_-42px_rgba(7,30,39,0.22)]"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">
                                  Câu {index + 1}
                                </Badge>
                                <Badge variant="outline">
                                  {getQuestionTypeLabel(question.question_type)}
                                </Badge>
                              </div>
                              <p className="mt-3 text-base font-semibold leading-relaxed text-on-surface">
                                {question.prompt}
                              </p>
                            </div>
                            <Badge className="border-primary/20 bg-primary/10 text-primary">
                              {formatExamNumber(question.points)} điểm
                            </Badge>
                          </div>

                          {question.image_url ? (
                            <div className="mt-5 overflow-hidden rounded-[24px] border border-outline/10 bg-surface">
                              <div className="flex items-center gap-2 border-b border-outline/10 px-4 py-3 text-sm font-medium text-muted-foreground">
                                <ImageIcon className="size-4" />
                                Hình minh họa câu hỏi
                              </div>
                              <img
                                src={question.image_url}
                                alt={`Hình minh họa cho câu ${index + 1}`}
                                className="max-h-80 w-full object-cover"
                              />
                            </div>
                          ) : null}

                          {question.question_type === "text" ? (
                            <div className="mt-5 rounded-[24px] border border-outline/10 bg-surface p-4">
                              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <FileText className="size-4" />
                                Đáp án chấp nhận
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {question.accepted_answers.length > 0 ? (
                                  question.accepted_answers.map((answer) => (
                                    <Badge
                                      key={answer}
                                      className="border-primary/15 bg-primary/8 text-primary"
                                    >
                                      {answer}
                                    </Badge>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Chưa có đáp án chấp nhận nào được khai báo.
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-5 space-y-3">
                              {question.options.map((option) => (
                                <div
                                  key={option.id}
                                  className={cn(
                                    "rounded-[22px] border px-4 py-3 transition-colors",
                                    option.is_correct
                                      ? "border-primary/20 bg-primary/6"
                                      : "border-outline/10 bg-surface",
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={cn(
                                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                                        option.is_correct
                                          ? "border-primary bg-primary text-primary-foreground"
                                          : "border-outline/20 bg-surface-container text-muted-foreground",
                                      )}
                                    >
                                      {option.option_key}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className={cn(
                                          "text-sm leading-relaxed",
                                          option.is_correct
                                            ? "font-semibold text-on-surface"
                                            : "text-on-surface-variant",
                                        )}
                                      >
                                        {option.option_text}
                                      </p>
                                      {option.image_url ? (
                                        <img
                                          src={option.image_url}
                                          alt={`Hình minh họa đáp án ${option.option_key}`}
                                          className="mt-3 max-h-48 rounded-2xl border border-outline/10 object-cover"
                                        />
                                      ) : null}
                                    </div>
                                    {option.is_correct ? (
                                      <Badge variant="success">
                                        Đáp án đúng
                                      </Badge>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </article>
                      ))}

                    {resolvedExam.questions?.length || isLoading ? null : (
                      <div className="rounded-[28px] border border-outline/10 bg-surface p-6 text-center">
                        <p className="text-base font-semibold text-on-surface">
                          Chưa có câu hỏi nào
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Hệ thống chưa trả về danh sách câu hỏi cho đề thi này.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CalendarClockIcon() {
  return <Clock3 className="size-3.5" />;
}
