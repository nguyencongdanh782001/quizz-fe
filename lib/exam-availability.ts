import { parseExamTimestamp } from "./date";

/**
 * Exam availability state relative to the current wall-clock time.
 *
 * - `upcoming`: `now < start_time`. Students may not start the exam.
 * - `available`: `start_time <= now <= end_time`. Students may start.
 * - `expired`: `now > end_time`. Window has passed.
 * - `unavailable`: start_time or end_time is missing/invalid. Strict mode —
 *   the API did not provide the information needed to make a decision.
 */
export type ExamStatus =
  | "upcoming"
  | "available"
  | "expired"
  | "unavailable";

/** Minimal shape required to compute availability — matches the internal `Exam`. */
export interface ExamTimeWindow {
  startTime?: string | null;
  endTime?: string | null;
}

export interface ExamAvailabilityInfo {
  status: ExamStatus;
  startTime: Date | null;
  endTime: Date | null;
  now: Date;
  /** Positive = time remaining, negative = time past. */
  remainingMs: number;
  /** True iff the exam cannot be started right now. */
  isUnavailable: boolean;
}

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Determine the exam's current availability window.
 *
 * Strict mode: if either boundary is missing/invalid, the status is
 * `unavailable` (we do not assume "available" by default).
 */
export function getExamAvailabilityStatus(
  exam: ExamTimeWindow,
  now: Date = new Date(),
): ExamAvailabilityInfo {
  const startTime = parseExamTimestamp(exam.startTime);
  const endTime = parseExamTimestamp(exam.endTime);

  if (!startTime || !endTime) {
    return {
      status: "unavailable",
      startTime,
      endTime,
      now,
      remainingMs: 0,
      isUnavailable: true,
    };
  }

  let status: ExamStatus;
  let remainingMs: number;

  if (now < startTime) {
    status = "upcoming";
    remainingMs = startTime.getTime() - now.getTime();
  } else if (now > endTime) {
    status = "expired";
    // Keep negative for "Quá hạn ..." formatting.
    remainingMs = endTime.getTime() - now.getTime();
  } else {
    status = "available";
    remainingMs = endTime.getTime() - now.getTime();
  }

  return {
    status,
    startTime,
    endTime,
    now,
    remainingMs,
    isUnavailable: status !== "available",
  };
}

/**
 * Format a (signed) duration as "Còn X ngày|giờ|phút" (positive) or
 * "Quá hạn X ngày|giờ|phút" (negative). Returns "" when the input is 0
 * or non-finite.
 *
 * Granularity: largest unit that gives a value >= 1, e.g. 1.5 days → "Còn 1 ngày",
 * 90 minutes → "Còn 1 giờ" (since 90 min floor to 1 giờ, but 60 min also → 1 giờ).
 * For minutes, we always show at least 1.
 */
export function formatRemainingTime(ms: number): string {
  if (!Number.isFinite(ms) || ms === 0) return "";

  const past = ms < 0;
  const abs = Math.abs(ms);

  let value: number;
  let unit: string;

  if (abs >= MS_PER_DAY) {
    value = Math.floor(abs / MS_PER_DAY);
    unit = "ngày";
  } else if (abs >= MS_PER_HOUR) {
    value = Math.floor(abs / MS_PER_HOUR);
    unit = "giờ";
  } else {
    value = Math.max(1, Math.floor(abs / MS_PER_MINUTE));
    unit = "phút";
  }

  return past ? `Quá hạn ${value} ${unit}` : `Còn ${value} ${unit}`;
}

/**
 * The next-significant-boundary helper — returns the date that the user
 * is comparing against now (start for upcoming, end for available/expired).
 */
export function formatBoundaryDate(info: ExamAvailabilityInfo): Date | null {
  if (info.status === "upcoming") return info.startTime;
  if (info.status === "available" || info.status === "expired")
    return info.endTime;
  return null;
}
