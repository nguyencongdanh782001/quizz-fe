"use client";

import type { ExamStatus } from "@/lib/exam-availability";
import { formatExamDateTime } from "@/lib/date";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { ExamStatusBadge } from "./exam-status-badge";

interface ExamUnavailableProps {
  examId: string;
  status: ExamStatus;
  startTime?: Date | null;
  endTime?: Date | null;
}

const REASON_MAP: Record<
  ExamStatus,
  { headline: string; body: string }
> = {
  upcoming: {
    headline: "Đề thi chưa mở",
    body: "Đề thi chưa đến thời gian mở. Vui lòng quay lại khi bắt đầu.",
  },
  expired: {
    headline: "Đề thi đã hết hạn",
    body: "Đề thi đã kết thúc. Bạn không thể tiếp tục làm bài.",
  },
  unavailable: {
    headline: "Đề thi không khả dụng",
    body: "Đề thi này hiện không thể truy cập. Vui lòng liên hệ giáo viên.",
  },
  available: {
    headline: "",
    body: "",
  },
};

export function ExamUnavailable({
  examId,
  status,
  startTime,
  endTime,
}: ExamUnavailableProps) {
  const reason = REASON_MAP[status];
  const boundary =
    status === "upcoming"
      ? startTime
      : status === "expired"
        ? endTime
        : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md rounded-2xl border border-outline/10 bg-surface-container-lowest p-6 text-center shadow-[0_18px_44px_-32px_rgba(7,30,39,0.18)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
          <AlertCircle className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
        </div>
        <ExamStatusBadge status={status} />
        <h2 className="mt-4 font-display text-xl font-semibold text-on-surface">
          {reason.headline}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{reason.body}</p>
        {boundary && (
          <p className="mt-3 text-sm font-medium text-on-surface">
            {status === "upcoming" ? "Mở vào:" : "Đã đóng vào:"}{" "}
            {formatExamDateTime(boundary)}
          </p>
        )}
        <Link
          href={`/student/exam/${examId}`}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang đề thi
        </Link>
      </div>
    </div>
  );
}
