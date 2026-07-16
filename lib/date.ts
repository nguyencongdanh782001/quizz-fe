const DATE_DISPLAY_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/**
 * Format a backend-sourced timestamp string as "DD/MM/YYYY HH:mm" using
 * **only** the characters that appear in the string. Never constructs a
 * `Date` instance and never consults the runtime's local timezone.
 *
 * Accepts ISO-8601 variants:
 *   - "2026-07-15T12:30"
 *   - "2026-07-15T12:30:00"
 *   - "2026-07-15T12:30:00.000Z"
 *   - "2026-07-15T12:30:00+07:00"
 *
 * Returns "" for null/undefined/garbage input.
 *
 * This is the canonical display helper for any exam timestamp returned
 * by the backend. Always prefer it over `new Date(...)` for display
 * because the API may emit bare ISO strings (no `Z`/offset), which
 * browsers interpret as local time and shift accordingly.
 */
export function formatWallClockDateTime(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return "";
  const [, yyyy, mm, dd, hh, mi] = match;
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

/**
 * Format an exam timestamp string as "DD/MM/YYYY HH:mm" using its
 * wall-clock components. Wraps {@link formatWallClockDateTime} so that
 * every consumer routes through the same regex. Never constructs a
 * `Date`. See that helper for accepted input variants.
 */
export function formatExamDateTime(value?: string | null | undefined): string {
  return formatWallClockDateTime(typeof value === "string" ? value : null);
}

/**
 * ⚠️ Display-safe callers should use {@link formatExamDateTime} (regex)
 *    instead. This helper is reserved for **logic-only** consumers (window
 *    comparisons, remaining-time math).
 *
 * Parse an ISO-ish timestamp string (or null/empty) into a `Date`.
 *
 * The returned `Date` is **synthetic**: its epoch-ms represent the
 * wall-clock fields of `value` interpreted as the runtime's local time.
 * This means the returned `Date` is meaningful **only** for relative
 * comparisons against another value parsed the same way (or against
 * `Date.now()`), provided the server's clock matches the user's browser
 * clock to within seconds. It is **not** meaningful for displaying a
 * wall-clock time — that has been re-interpreted under the runtime's
 * local TZ and will shift on non-matching browsers.
 *
 * Returns null when the input is missing/invalid — strict-mode friendly.
 */
export function parseExamTimestamp(value?: string | null): Date | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function createLocalDate(
  year: number,
  month: number,
  day: number,
): Date {
  return new Date(year, month, day, 12, 0, 0, 0);
}

export function parseDateValue(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = createLocalDate(year, month, day);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(value?: string | null): string {
  const date = parseDateValue(value);
  return date ? DATE_DISPLAY_FORMATTER.format(date) : "";
}

export function formatDateInputLabel(value?: string | null): string {
  const display = formatDateDisplay(value);
  return display || "Chọn ngày sinh";
}

export function startOfMonth(date: Date): Date {
  return createLocalDate(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return createLocalDate(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function isAfterDay(left: Date, right: Date): boolean {
  return toDateValue(left) > toDateValue(right);
}

export function getDaysInMonthGrid(month: Date): Array<Date | null> {
  const firstDay = startOfMonth(month);
  const daysInMonth = new Date(
    firstDay.getFullYear(),
    firstDay.getMonth() + 1,
    0,
  ).getDate();

  const leadingBlankDays = (firstDay.getDay() + 6) % 7;
  const cells: Array<Date | null> = [];

  for (let index = 0; index < leadingBlankDays; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(createLocalDate(firstDay.getFullYear(), firstDay.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function getWeekdayLabels(): string[] {
  return ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
}
