const DATE_DISPLAY_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const EXAM_DATETIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Parse an ISO-ish timestamp string (or null/empty) into a Date.
 * Returns null when the input is missing/invalid — strict-mode friendly.
 */
export function parseExamTimestamp(value?: string | null): Date | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Format a Date as "DD/MM/YYYY HH:mm" in the user's local timezone.
 * Accepts a Date or an ISO string for convenience.
 */
export function formatExamDateTime(value?: Date | string | null): string {
  const date =
    value instanceof Date ? value : parseExamTimestamp(value);
  if (!date) return "";
  return EXAM_DATETIME_FORMATTER.format(date);
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
