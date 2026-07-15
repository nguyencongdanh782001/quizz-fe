"use client";

import type { ExamStatus } from "@/lib/exam-availability";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  ExamStatus,
  { label: string; className: string; dotClassName: string }
> = {
  upcoming: {
    label: "Chưa mở",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    dotClassName: "bg-yellow-500",
  },
  available: {
    label: "Đang mở",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    dotClassName: "bg-green-500",
  },
  expired: {
    label: "Đã hết hạn",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    dotClassName: "bg-red-500",
  },
  unavailable: {
    label: "Không khả dụng",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
    dotClassName: "bg-gray-500",
  },
};

export function ExamStatusBadge({ status }: { status: ExamStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        meta.className,
      )}
    >
      <span
        aria-hidden
        className={cn("h-2 w-2 rounded-full", meta.dotClassName)}
      />
      {meta.label}
    </span>
  );
}
