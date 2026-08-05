"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Hourglass,
  Infinity as InfinityIcon,
  Star,
  Timer,
} from "lucide-react";
import { useNow } from "@/hooks/use-now";
import { formatExamDateTime } from "@/lib/date";
import {
  formatRemainingTimeDetailed,
  getExamOpenState,
  type ExamOpenInfo,
} from "@/lib/exam-open-state";
import { cn } from "@/lib/utils";
import type { Exam } from "@/types/exam.types";

const TONE_BADGE: Record<ExamOpenInfo["tone"], string> = {
  positive: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  muted: "bg-slate-100 text-slate-600",
};

interface ExamCardProps {
  exam: Exam;
  compact?: boolean;
}

function getClassificationTag(
  exam: Exam,
  prefix: "class" | "subject" | "topic",
): string | null {
  const marker = `${prefix}:`;
  const tag = exam.tags.find((item) => item.startsWith(marker));

  return tag?.slice(marker.length).trim() || null;
}

export function ExamCard({ exam, compact = false }: ExamCardProps) {
  const now = useNow();
  const openState = getExamOpenState(exam, now);

  const secondaryLabel =
    getClassificationTag(exam, "class") ||
    (exam.grade > 0 ? `Lớp ${exam.grade}` : null) ||
    exam.classroomName?.trim() ||
    null;

  const scoreLabel =
    exam.totalPoints && exam.totalPoints > 0
      ? `${exam.totalPoints} điểm`
      : `${exam.passingScore}%`;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#B8C2FF] hover:shadow-md">
      {exam.thumbnailUrl ? (
        <div
          className={cn(
            "overflow-hidden border-b border-[#E9EDF3] bg-[#F7F8FB]",
            compact ? "h-24" : "h-28",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={exam.thumbnailUrl}
            alt={exam.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center border-b border-[#E9EDF3] bg-[#F7F8FB] text-[#94A3B8]",
            compact ? "h-24" : "h-28",
          )}
        >
          <BookOpen className="size-7" />
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col",
          compact ? "gap-2.5 p-3" : "gap-3 p-4",
        )}
      >
        <div className="flex min-h-6 items-center justify-between gap-2">
          {secondaryLabel ? (
            <span
              title={secondaryLabel}
              className="min-w-0 max-w-[120px] truncate rounded-[4px] bg-[#EEF2FF] px-2 py-1 text-[10px] font-semibold text-[#4050DC]"
            >
              {secondaryLabel}
            </span>
          ) : (
            <span />
          )}

          <span
            className={cn(
              "shrink-0 rounded-[4px] px-2 py-1 text-[10px] font-semibold",
              TONE_BADGE[openState.tone],
            )}
          >
            {openState.badgeLabel}
          </span>
        </div>

        <div className="min-w-0">
          <h3
            title={exam.title}
            className={cn(
              "line-clamp-2 font-bold text-[#1E293B]",
              compact ? "min-h-10 text-xs leading-5" : "text-sm leading-5",
            )}
          >
            {exam.title}
          </h3>

          {!compact && exam.description ? (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-[#64748B]">
              {exam.description}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-[10px] text-[#526079]">
          <span className="inline-flex min-w-0 items-center justify-center gap-1 rounded-[6px] bg-[#F7F8FB] px-1.5 py-2">
            <BookOpen className="size-3.5 shrink-0 text-[#4F62F2]" />
            <span className="truncate">{exam.questionCount} câu</span>
          </span>

          <span className="inline-flex min-w-0 items-center justify-center gap-1 rounded-[6px] bg-[#F7F8FB] px-1.5 py-2">
            <Clock3 className="size-3.5 shrink-0 text-[#0EA5E9]" />
            <span className="truncate">{exam.duration} phút</span>
          </span>

          <span className="inline-flex min-w-0 items-center justify-center gap-1 rounded-[6px] bg-[#F7F8FB] px-1.5 py-2">
            <Star className="size-3.5 shrink-0 text-[#F59E0B]" />
            <span className="truncate">{scoreLabel}</span>
          </span>
        </div>

        {!compact ? <ScheduleBlock info={openState} /> : null}

        <Link
          href={`/student/exam/${exam.id}`}
          aria-disabled={!openState.isOpenableNow}
          tabIndex={openState.isOpenableNow ? 0 : -1}
          className={cn(
            "mt-auto flex items-center justify-center rounded-[6px] text-xs font-semibold transition-colors",
            compact ? "h-8" : "h-9",
            openState.isOpenableNow
              ? "bg-[#4F62F2] text-white hover:bg-[#4053DD]"
              : "cursor-not-allowed bg-[#EEF0F4] text-[#98A2B3]",
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
    </article>
  );
}

function ScheduleBlock({ info }: { info: ExamOpenInfo }) {
  const hasStart = info.startTimeRaw !== null;
  const hasEnd = info.endTimeRaw !== null;

  if (!hasStart && !hasEnd) {
    return (
      <p className="inline-flex items-center gap-1.5 border-t border-[#E9EDF3] pt-2.5 text-[10.5px] text-[#64748B]">
        <InfinityIcon className="size-3.5" />
        Không giới hạn thời gian làm bài.
      </p>
    );
  }

  return (
    <div className="space-y-1 border-t border-[#E9EDF3] pt-2.5 text-[10.5px] text-[#64748B]">
      {hasStart ? (
        <p className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          Mở:
          <strong className="font-semibold text-[#334155]">
            {formatExamDateTime(info.startTimeRaw)}
          </strong>
        </p>
      ) : null}

      {hasEnd ? (
        <p className="flex items-center gap-1.5">
          <Hourglass className="size-3.5" />
          Đóng:
          <strong className="font-semibold text-[#334155]">
            {formatExamDateTime(info.endTimeRaw)}
          </strong>
        </p>
      ) : null}

      {info.countdownLabel ? (
        <p className="flex items-center gap-1.5 font-semibold text-[#4F62F2]">
          <Timer className="size-3.5" />
          {formatRemainingTimeDetailed(info.remainingMs, {
            compound: true,
          })}
        </p>
      ) : null}
    </div>
  );
}
