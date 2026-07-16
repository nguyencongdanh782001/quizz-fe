"use client";

import {
  formatRemainingTime,
  getExamAvailabilityStatus,
  type ExamAvailabilityInfo,
  type ExamTimeWindow,
} from "@/lib/exam-availability";
import { useNow } from "@/hooks/use-now";
import { formatExamDateTime } from "@/lib/date";
import { AlertTriangle, Clock } from "lucide-react";
import { ExamStatusBadge } from "./exam-status-badge";
import { cn } from "@/lib/utils";

interface ExamAvailabilityCardProps {
  exam: ExamTimeWindow;
}

export function ExamAvailabilityCard({ exam }: ExamAvailabilityCardProps) {
  const now = useNow();
  const info: ExamAvailabilityInfo = getExamAvailabilityStatus(exam, now);

  // Card is hidden when fields are missing — strict mode.
  if (info.status === "unavailable") {
    return null;
  }

  const showStart = info.status === "upcoming" && info.startTimeRaw;
  const showEnd =
    (info.status === "available" || info.status === "expired") && info.endTimeRaw;

  const toneClass =
    info.status === "upcoming"
      ? "border-yellow-200/60 bg-yellow-50/80 dark:border-yellow-800/30 dark:bg-yellow-950/20"
      : info.status === "expired"
        ? "border-red-200/60 bg-red-50/80 dark:border-red-800/30 dark:bg-red-950/20"
        : "border-green-200/60 bg-green-50/80 dark:border-green-800/30 dark:bg-green-950/20";

  const iconClass =
    info.status === "upcoming"
      ? "text-yellow-700 dark:text-yellow-300"
      : info.status === "expired"
        ? "text-red-700 dark:text-red-300"
        : "text-green-700 dark:text-green-300";

  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border-2 px-6 py-5",
        toneClass,
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        {info.status === "available" ? (
          <Clock className={cn("h-5 w-5", iconClass)} />
        ) : (
          <AlertTriangle className={cn("h-5 w-5", iconClass)} />
        )}
        <ExamStatusBadge status={info.status} />
      </div>

      {showStart && (
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Đề thi sẽ mở vào:
          </p>
          <p className="font-display text-lg font-semibold text-on-surface">
            {formatExamDateTime(info.startTimeRaw)}
          </p>
          {info.remainingMs > 0 && (
            <p className="text-sm text-muted-foreground">
              {formatRemainingTime(info.remainingMs)}
            </p>
          )}
        </div>
      )}

      {showEnd && (
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {info.status === "expired" ? "Đề thi đã đóng vào:" : "Đóng vào:"}
          </p>
          <p className="font-display text-lg font-semibold text-on-surface">
            {formatExamDateTime(info.endTimeRaw)}
          </p>
          {info.remainingMs !== 0 && (
            <p className="text-sm text-muted-foreground">
              {formatRemainingTime(info.remainingMs)}
            </p>
          )}
        </div>
      )}

      {info.status === "available" && (
        <p className="mt-3 text-sm text-green-800 dark:text-green-200">
          Có thể làm bài ngay.
        </p>
      )}
    </section>
  );
}
