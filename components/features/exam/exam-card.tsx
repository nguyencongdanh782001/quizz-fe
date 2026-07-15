"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Hourglass,
  Infinity as InfinityIcon,
  Star,
  Timer,
} from "lucide-react";
import { Exam } from "@/types/exam.types";
import { useNow } from "@/hooks/use-now";
import { formatExamDateTime } from "@/lib/date";
import {
  formatRemainingTimeDetailed,
  getExamOpenState,
  type ExamOpenInfo,
} from "@/lib/exam-open-state";
import { cn } from "@/lib/utils";

type ExamSource = "teacher" | "system";

const SOURCE_BADGE: Record<ExamSource, { label: string; className: string }> = {
  system: {
    label: "Hệ thống",
    className: "bg-primary-container text-on-primary-container",
  },
  teacher: {
    label: "Giáo viên",
    className: "bg-secondary-container text-on-secondary-container",
  },
};

/**
 * Resolve the badge source for an exam, preferring the authoritative
 * `source` field from the API. Falls back to deriving from `scope` (legacy)
 * when `source` is absent.
 */
function resolveExamSource(exam: Exam): ExamSource {
  if (exam.source === "teacher" || exam.source === "system") {
    return exam.source;
  }
  if (exam.scope === "system") return "system";
  if (exam.scope === "classroom" || exam.scope === "class") return "teacher";
  return "teacher";
}

const TONE_BADGE: Record<ExamOpenInfo["tone"], string> = {
  positive:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  muted: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

const TONE_DOT: Record<ExamOpenInfo["tone"], string> = {
  positive: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  muted: "bg-gray-500",
};

interface ExamCardProps {
  exam: Exam;
  compact?: boolean;
}

export function ExamCard({ exam, compact = false }: ExamCardProps) {
  const now = useNow();
  const openState = getExamOpenState(exam, now);

  const source = resolveExamSource(exam);
  const sourceBadge = SOURCE_BADGE[source];

  const secondaryLabel =
    exam.grade > 0 ? `Lớp ${exam.grade}` : exam.classroomName;

  const scoreLabel =
    exam.totalPoints && exam.totalPoints > 0
      ? `${exam.totalPoints} điểm`
      : `${exam.passingScore}%`;

  return (
    <div
      className={cn(
        "flex flex-col h-auto group overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/82",
        "shadow-[0_22px_80px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-40px_rgba(15,23,42,0.28)]",
      )}
    >
      {exam.thumbnailUrl && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={exam.thumbnailUrl}
            alt={exam.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div
        className={cn(
          "p-5 h-full flex-1 flex flex-col",
          compact ? "space-y-3" : "space-y-4",
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm",
              sourceBadge.className,
            )}
          >
            {sourceBadge.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm",
              TONE_BADGE[openState.tone],
            )}
            aria-label={`Trạng thái: ${openState.badgeLabel}`}
          >
            <span
              aria-hidden
              className={cn(
                "h-2 w-2 rounded-full",
                TONE_DOT[openState.tone],
              )}
            />
            {openState.badgeLabel}
          </span>
        </div>

        {secondaryLabel && (
          <p className="text-xs text-muted-foreground font-medium">
            {secondaryLabel}
          </p>
        )}

        <h3
          className={cn(
            "font-display font-semibold text-on-surface leading-snug mb-2 line-clamp-2",
            compact ? "text-sm" : "text-base",
          )}
        >
          {exam.title}
        </h3>

        {!compact && exam.description && (
          <p className="text-sm leading-7 text-muted-foreground line-clamp-2 mb-3">
            {exam.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {exam.questionCount} câu
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5">
            <Clock className="w-3.5 h-3.5" />
            {exam.duration} phút
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5">
            <Star className="w-3.5 h-3.5" />
            {scoreLabel}
          </span>
        </div>

        {!compact && (
          <ScheduleBlock info={openState} />
        )}

        <Link
          href={`/student/exam/${exam.id}`}
          aria-disabled={!openState.isOpenableNow}
          tabIndex={openState.isOpenableNow ? 0 : -1}
          className={cn(
            "mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
            openState.isOpenableNow
              ? "bg-linear-to-r from-primary to-tertiary text-white shadow-[0_18px_38px_-20px_rgba(79,70,229,0.52)] hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-18px_rgba(79,70,229,0.42)] active:scale-[0.99]"
              : "cursor-not-allowed bg-surface-container-low text-muted-foreground",
          )}
          onClick={(event) => {
            if (!openState.isOpenableNow) {
              event.preventDefault();
            }
          }}
        >
          {openState.ctaLabel}
        </Link>
      </div>
    </div>
  );
}

function ScheduleBlock({ info }: { info: ExamOpenInfo }) {
  const hasStart = info.startTime !== null;
  const hasEnd = info.endTime !== null;

  // Both missing → render "no schedule" note only.
  if (!hasStart && !hasEnd) {
    return (
      <div className="rounded-xl border border-outline/10 bg-surface-container-lowest/60 px-3 py-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <InfinityIcon className="w-3.5 h-3.5" />
          Không giới hạn thời gian làm bài.
        </span>
      </div>
    );
  }

  const isExpired = info.state === "expired";
  const isUpcoming =
    info.state === "upcoming" || info.state === "scheduled-only";

  return (
    <div className="space-y-1.5 rounded-xl border border-outline/10 bg-surface-container-lowest/60 px-3 py-2.5 text-xs">
      {hasStart && (
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          <span className="text-foreground/60">Mở:</span>
          <span className="font-medium text-on-surface">
            {formatExamDateTime(info.startTime)}
          </span>
        </p>
      )}
      {hasEnd && (
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <Hourglass className="w-3.5 h-3.5 shrink-0" />
          <span className="text-foreground/60">Đóng:</span>
          <span className="font-medium text-on-surface">
            {formatExamDateTime(info.endTime)}
          </span>
        </p>
      )}
      {info.countdownLabel && (
        <p
          className={cn(
            "flex items-center gap-1.5 font-medium",
            isExpired
              ? "text-red-700 dark:text-red-300"
              : isUpcoming
                ? "text-yellow-700 dark:text-yellow-300"
                : "text-green-700 dark:text-green-300",
          )}
        >
          <Timer className="w-3.5 h-3.5 shrink-0" />
          {formatRemainingTimeDetailed(info.remainingMs, { compound: true })}
        </p>
      )}
    </div>
  );
}