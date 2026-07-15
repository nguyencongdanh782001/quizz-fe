import { parseExamTimestamp } from "./date";
import { formatRemainingTime, type ExamTimeWindow } from "./exam-availability";

/**
 * Display-oriented state for the student exam card. Richer than
 * `ExamStatus` — supports partial schedules (only start, only end) and
 * the "always open / no schedule" case.
 *
 * - `always-open` — both timestamps missing → no schedule constraint.
 * - `unavailable` — non-empty but invalid timestamps (data error).
 * - `scheduled-only` — only start_time, not yet reached.
 * - `scheduled-pending` — only start_time, already reached (open-ended).
 * - `upcoming` — both timestamps, now < start.
 * - `open` — both timestamps, start ≤ now ≤ end.
 * - `expired` — both timestamps, now > end, OR only-end with now > end.
 */
export type ExamOpenState =
  | "always-open"
  | "unavailable"
  | "scheduled-only"
  | "scheduled-pending"
  | "upcoming"
  | "open"
  | "expired";

export interface ExamOpenInfo {
  state: ExamOpenState;
  startTime: Date | null;
  endTime: Date | null;
  /** Signed. Positive = time until next boundary; negative = time past. */
  remainingMs: number;
  /** Pre-formatted countdown ("Còn 3 ngày 5 giờ" / "Quá hạn 2 ngày" / ""). */
  countdownLabel: string;
  /** Whether the student can start the exam right now. */
  isOpenableNow: boolean;
  /** Tone for badge styling. */
  tone: "positive" | "warning" | "danger" | "muted";
  /** Human-readable label for the badge. */
  badgeLabel: string;
  /** CTA label for the action button. */
  ctaLabel: string;
}

/**
 * Determine the display-oriented state of an exam. Independent of
 * `getExamAvailabilityStatus` (which remains the strict gating signal).
 */
export function getExamOpenState(
  exam: ExamTimeWindow,
  now: Date = new Date(),
): ExamOpenInfo {
  const rawStart = exam.startTime ?? null;
  const rawEnd = exam.endTime ?? null;
  const startTime = parseExamTimestamp(rawStart);
  const endTime = parseExamTimestamp(rawEnd);

  const hasStart = startTime !== null;
  const hasEnd = endTime !== null;

  // Both fields empty → no schedule.
  if (!hasStart && !hasEnd) {
    return {
      state: "always-open",
      startTime: null,
      endTime: null,
      remainingMs: 0,
      countdownLabel: "",
      isOpenableNow: true,
      tone: "positive",
      badgeLabel: "Luôn mở",
      ctaLabel: "Làm bài",
    };
  }

  // Non-empty but invalid → data error.
  if ((rawStart && !hasStart) || (rawEnd && !hasEnd)) {
    return {
      state: "unavailable",
      startTime,
      endTime,
      remainingMs: 0,
      countdownLabel: "",
      isOpenableNow: false,
      tone: "muted",
      badgeLabel: "Không khả dụng",
      ctaLabel: "Không khả dụng",
    };
  }

  // Both valid → classic window.
  if (hasStart && hasEnd) {
    if (now < startTime!) {
      return {
        state: "upcoming",
        startTime,
        endTime,
        remainingMs: startTime!.getTime() - now.getTime(),
        countdownLabel: formatRemainingTime(
          startTime!.getTime() - now.getTime(),
        ),
        isOpenableNow: false,
        tone: "warning",
        badgeLabel: "Chưa mở",
        ctaLabel: "Chưa mở",
      };
    }
    if (now > endTime!) {
      return {
        state: "expired",
        startTime,
        endTime,
        remainingMs: endTime!.getTime() - now.getTime(), // negative
        countdownLabel: formatRemainingTime(
          endTime!.getTime() - now.getTime(),
        ),
        isOpenableNow: false,
        tone: "danger",
        badgeLabel: "Đã hết hạn",
        ctaLabel: "Đã hết hạn",
      };
    }
    return {
      state: "open",
      startTime,
      endTime,
      remainingMs: endTime!.getTime() - now.getTime(),
      countdownLabel: formatRemainingTime(
        endTime!.getTime() - now.getTime(),
      ),
      isOpenableNow: true,
      tone: "positive",
      badgeLabel: "Đang mở",
      ctaLabel: "Làm bài",
    };
  }

  // Only start_time valid.
  if (hasStart) {
    if (now < startTime!) {
      return {
        state: "scheduled-only",
        startTime,
        endTime: null,
        remainingMs: startTime!.getTime() - now.getTime(),
        countdownLabel: formatRemainingTime(
          startTime!.getTime() - now.getTime(),
        ),
        isOpenableNow: false,
        tone: "warning",
        badgeLabel: "Chưa mở",
        ctaLabel: "Chưa mở",
      };
    }
    return {
      state: "scheduled-pending",
      startTime,
      endTime: null,
      remainingMs: 0,
      countdownLabel: "",
      isOpenableNow: true,
      tone: "positive",
      badgeLabel: "Đang mở",
      ctaLabel: "Làm bài",
    };
  }

  // Only end_time valid.
  // hasEnd must be true here (covered by !hasStart && !hasEnd above).
  if (now > endTime!) {
    return {
      state: "expired",
      startTime: null,
      endTime,
      remainingMs: endTime!.getTime() - now.getTime(), // negative
      countdownLabel: formatRemainingTime(
        endTime!.getTime() - now.getTime(),
      ),
      isOpenableNow: false,
      tone: "danger",
      badgeLabel: "Đã hết hạn",
      ctaLabel: "Đã hết hạn",
    };
  }
  return {
    state: "open",
    startTime: null,
    endTime,
    remainingMs: endTime!.getTime() - now.getTime(),
    countdownLabel: formatRemainingTime(
      endTime!.getTime() - now.getTime(),
    ),
    isOpenableNow: true,
    tone: "positive",
    badgeLabel: "Đang mở",
    ctaLabel: "Làm bài",
  };
}

/**
 * Compound-unit countdown label like "Còn 3 ngày 5 giờ" or "Quá hạn 2 ngày".
 * Reuses `formatRemainingTime` style (Vietnamese) but emits two units when
 * the duration is large enough.
 */
export function formatRemainingTimeDetailed(
  ms: number,
  options: { compound?: boolean } = {},
): string {
  if (!Number.isFinite(ms) || ms === 0) return "";
  const { compound = false } = options;

  if (!compound) {
    return formatRemainingTime(ms);
  }

  const past = ms < 0;
  const abs = Math.abs(ms);
  const days = Math.floor(abs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((abs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((abs % (60 * 60 * 1000)) / (60 * 1000));

  const prefix = past ? "Quá hạn" : "Còn";
  if (days >= 1) {
    return hours > 0
      ? `${prefix} ${days} ngày ${hours} giờ`
      : `${prefix} ${days} ngày`;
  }
  if (hours >= 1) {
    return minutes > 0
      ? `${prefix} ${hours} giờ ${minutes} phút`
      : `${prefix} ${hours} giờ`;
  }
  const safeMinutes = Math.max(1, minutes);
  return `${prefix} ${safeMinutes} phút`;
}