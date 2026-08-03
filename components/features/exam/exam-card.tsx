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

type ExamSource = "teacher" | "system";

const SOURCE_BADGE: Record<ExamSource, { label: string; className: string }> = {
  system: { label: "Hệ thống", className: "bg-[#EEF2FF] text-[#4F62F2]" },
  teacher: { label: "Giáo viên", className: "bg-[#ECFDF5] text-[#059669]" },
};

const TONE_BADGE: Record<ExamOpenInfo["tone"], string> = {
  positive: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  muted: "bg-slate-100 text-slate-600",
};

function resolveExamSource(exam: Exam): ExamSource {
  if (exam.source === "teacher" || exam.source === "system") return exam.source;
  return exam.scope === "system" ? "system" : "teacher";
}

interface ExamCardProps {
  exam: Exam;
  compact?: boolean;
}

export function ExamCard({ exam, compact = false }: ExamCardProps) {
  const now = useNow();
  const openState = getExamOpenState(exam, now);
  const sourceBadge = SOURCE_BADGE[resolveExamSource(exam)];
  const secondaryLabel = exam.grade > 0 ? `Lớp ${exam.grade}` : exam.classroomName;
  const scoreLabel = exam.totalPoints && exam.totalPoints > 0
    ? `${exam.totalPoints} điểm`
    : `${exam.passingScore}%`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-[#DDE2EB] bg-white transition-colors hover:border-[#BFC8D8]">
      {exam.thumbnailUrl ? (
        <div className="h-28 overflow-hidden border-b border-[#E9EDF3] bg-[#F7F8FB]">
          {/* Exam thumbnails may be hosted by different document providers. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={exam.thumbnailUrl} alt={exam.title} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" />
        </div>
      ) : null}

      <div className={cn("flex flex-1 flex-col p-4", compact ? "gap-2.5" : "gap-3")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={cn("rounded-[6px] px-2 py-1 text-[10px] font-semibold", sourceBadge.className)}>
            {sourceBadge.label}
          </span>
          <span className={cn("rounded-[6px] px-2 py-1 text-[10px] font-semibold", TONE_BADGE[openState.tone])}>
            {openState.badgeLabel}
          </span>
        </div>

        <div className="min-w-0">
          {secondaryLabel ? <p className="mb-1 text-[10.5px] font-medium text-[#7C879B]">{secondaryLabel}</p> : null}
          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#1E293B]">{exam.title}</h3>
          {!compact && exam.description ? <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-[#64748B]">{exam.description}</p> : null}
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-[10px] text-[#526079]">
          <span className="inline-flex items-center justify-center gap-1 rounded-[6px] bg-[#F7F8FB] px-2 py-2"><BookOpen className="size-3.5 text-[#4F62F2]" />{exam.questionCount} câu</span>
          <span className="inline-flex items-center justify-center gap-1 rounded-[6px] bg-[#F7F8FB] px-2 py-2"><Clock3 className="size-3.5 text-[#0EA5E9]" />{exam.duration} phút</span>
          <span className="inline-flex items-center justify-center gap-1 rounded-[6px] bg-[#F7F8FB] px-2 py-2"><Star className="size-3.5 text-[#F59E0B]" />{scoreLabel}</span>
        </div>

        {!compact ? <ScheduleBlock info={openState} /> : null}

        <Link
          href={`/student/exam/${exam.id}`}
          aria-disabled={!openState.isOpenableNow}
          tabIndex={openState.isOpenableNow ? 0 : -1}
          className={cn(
            "mt-auto flex h-9 items-center justify-center rounded-[6px] text-xs font-semibold transition-colors",
            openState.isOpenableNow
              ? "bg-[#4F62F2] text-white hover:bg-[#4053DD]"
              : "cursor-not-allowed bg-[#EEF0F4] text-[#98A2B3]",
          )}
          onClick={(event) => {
            if (!openState.isOpenableNow) event.preventDefault();
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
    return <p className="inline-flex items-center gap-1.5 border-t border-[#E9EDF3] pt-2.5 text-[10.5px] text-[#64748B]"><InfinityIcon className="size-3.5" />Không giới hạn thời gian làm bài.</p>;
  }
  return (
    <div className="space-y-1 border-t border-[#E9EDF3] pt-2.5 text-[10.5px] text-[#64748B]">
      {hasStart ? <p className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />Mở: <strong className="font-semibold text-[#334155]">{formatExamDateTime(info.startTimeRaw)}</strong></p> : null}
      {hasEnd ? <p className="flex items-center gap-1.5"><Hourglass className="size-3.5" />Đóng: <strong className="font-semibold text-[#334155]">{formatExamDateTime(info.endTimeRaw)}</strong></p> : null}
      {info.countdownLabel ? <p className="flex items-center gap-1.5 font-semibold text-[#4F62F2]"><Timer className="size-3.5" />{formatRemainingTimeDetailed(info.remainingMs, { compound: true })}</p> : null}
    </div>
  );
}
