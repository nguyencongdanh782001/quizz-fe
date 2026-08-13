"use client";
/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TeacherExam } from "@/types/exam";
import { VisibilityStatusBadge } from "./ExamVisibilityToggle";
import { ExamContextMenu } from "./ExamContextMenu";
import type { ToggleVisibilityResponse } from "@/hooks/queries/useToggleExamVisibility";
import {
  formatExamDateTime,
  formatExamNumber,
  getActiveBadgeConfig,
  getExamScopeLabel,
} from "./exam-utils";

interface ExamCardProps {
  exam: TeacherExam;
  isDeleting: boolean;
  onDeleteRequest: (exam: TeacherExam) => void;
  onToggleVisibility: (response: ToggleVisibilityResponse) => void;
  onToggleError: (message: string) => void;
  onViewDetail: (exam: TeacherExam) => void;
}

export function TruncatedTooltipText({
  text,
  className,
  lines = 1,
}: {
  text: string;
  className?: string;
  lines?: 1 | 2 | 3;
}) {
  const clampClassName =
    lines === 1
      ? "line-clamp-1"
      : lines === 2
        ? "line-clamp-2"
        : "line-clamp-3";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className={cn("min-w-0 wrap-break-word", clampClassName, className)}>
          {text}
        </p>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export function ExamStatusBadges({ exam }: { exam: TeacherExam }) {
  const activeBadge = getActiveBadgeConfig(exam.is_active);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <VisibilityStatusBadge isPublished={exam.is_published} />
      <Badge className={activeBadge.className}>
        <CheckCircle2 className="mr-1.5 size-3" />
        {activeBadge.label}
      </Badge>
    </div>
  );
}

function ExamMetaItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] border border-outline/10 bg-surface px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1.5 line-clamp-1 text-sm font-semibold text-on-surface">
        {value}
      </p>
    </div>
  );
}

export function ExamCard({
  exam,
  isDeleting,
  onDeleteRequest,
  onToggleVisibility,
  onToggleError,
  onViewDetail,
}: ExamCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[10px] border border-outline/10 bg-surface-container-lowest shadow-[0_1px_3px_rgba(30,41,59,0.05)] transition-all duration-300 hover:shadow-[0_1px_3px_rgba(30,41,59,0.05)]",
        isDeleting && "opacity-70",
      )}
    >
      <div className="relative h-48 overflow-hidden bg-linear-to-br from-primary/20 via-secondary/12 to-tertiary/15">
        {exam.image_url ? (
          <img
            src={exam.image_url}
            alt={exam.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-primary/12 via-secondary/10 to-tertiary/12">
            <div className="rounded-full bg-white/70 p-5 shadow-lg backdrop-blur-sm dark:bg-slate-900/30">
              <GraduationCap className="size-10 text-primary" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/45 via-slate-950/5 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
          <Badge className="border-white/30 bg-white/85 text-slate-900 shadow-sm backdrop-blur-sm dark:bg-slate-950/45 dark:text-white">
            {getExamScopeLabel(exam.scope)}
          </Badge>
          <ExamContextMenu
            exam={exam}
            isDeleting={isDeleting}
            onViewDetail={onViewDetail}
            onDeleteRequest={onDeleteRequest}
            onToggleVisibility={onToggleVisibility}
            onToggleError={onToggleError}
          />
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-3">
          <ExamStatusBadges exam={exam} />

          <div className="space-y-2">
            <TruncatedTooltipText
              text={exam.title}
              lines={2}
              className="font-display text-xl font-semibold leading-snug text-on-surface"
            />
            <TruncatedTooltipText
              text={exam.description || "Đề thi chưa có mô tả."}
              lines={3}
              className="text-sm leading-relaxed text-muted-foreground"
            />
          </div>

          <div className="rounded-[8px] border border-outline/10 bg-surface px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Lớp học
            </p>
            <TruncatedTooltipText
              text={exam.classroom_name || "Chưa gắn lớp học"}
              className="mt-2 text-sm font-medium text-on-surface"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ExamMetaItem
            icon={<Clock3 className="size-3.5" />}
            label="Thời lượng"
            value={`${formatExamNumber(exam.duration_minutes)} phút`}
          />
          <ExamMetaItem
            icon={<Trophy className="size-3.5" />}
            label="Tổng điểm"
            value={formatExamNumber(exam.total_points)}
          />
          <ExamMetaItem
            icon={<BookOpen className="size-3.5" />}
            label="Câu hỏi"
            value={formatExamNumber(exam.question_count)}
          />
          <ExamMetaItem
            icon={<CheckCircle2 className="size-3.5" />}
            label="Lượt làm"
            value={formatExamNumber(exam.attempt_count)}
          />
        </div>

        <div className="grid gap-3 rounded-[10px] border border-outline/10 bg-surface p-4 sm:grid-cols-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CalendarClock className="size-3.5" />
              Tạo lúc
            </div>
            <TruncatedTooltipText
              text={formatExamDateTime(exam.created_at)}
              className="mt-1.5 text-sm font-semibold text-on-surface"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CalendarClock className="size-3.5" />
              Cập nhật
            </div>
            <TruncatedTooltipText
              text={formatExamDateTime(exam.updated_at)}
              className="mt-1.5 text-sm font-semibold text-on-surface"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExamContextMenu
            exam={exam}
            isDeleting={isDeleting}
            onViewDetail={onViewDetail}
            onDeleteRequest={onDeleteRequest}
            onToggleVisibility={onToggleVisibility}
            onToggleError={onToggleError}
          />
        </div>
      </div>
    </article>
  );
}
