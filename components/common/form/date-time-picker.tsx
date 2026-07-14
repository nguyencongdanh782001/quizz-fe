"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  addMonths,
  createLocalDate,
  getDaysInMonthGrid,
  getWeekdayLabels,
  isSameDay,
  startOfMonth,
  toDateValue,
} from "@/lib/date";

interface DateTimePickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, month) => {
  const label = createLocalDate(2024, month, 1).toLocaleDateString("vi-VN", {
    month: "long",
  });

  return {
    value: month,
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
});

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, minute) =>
  String(minute).padStart(2, "0"),
);

function toLocalDateTimeValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function parseDateTimeValue(value?: string | null): Date | null {
  if (!value?.trim()) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTimeDisplay(value?: string | null): string {
  const date = parseDateTimeValue(value);

  if (!date) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function getDateParts(value?: string | null) {
  const date = parseDateTimeValue(value);

  return {
    date,
    hour: date ? String(date.getHours()).padStart(2, "0") : "00",
    minute: date ? String(date.getMinutes()).padStart(2, "0") : "00",
  };
}

function createDateTimeFromParts(date: Date, hour: string, minute: string) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number(hour),
    Number(minute),
    0,
    0,
  );
}

function getInitialOpenMonth(value?: string | null): Date {
  return startOfMonth(parseDateTimeValue(value) ?? new Date());
}

export function DateTimePicker({
  value,
  onChange,
  onBlur,
  label,
  error,
  helperText,
  placeholder = "Chọn ngày và giờ",
  disabled = false,
  required = false,
  className,
  id,
}: DateTimePickerProps) {
  const generatedId = useId();
  const inputId = id ?? `date-time-picker-${generatedId}`;
  const messageId = `${inputId}-message`;
  const [open, setOpen] = useState(false);
  const [openMonth, setOpenMonth] = useState(() => getInitialOpenMonth(value));
  const dayButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const selected = useMemo(() => getDateParts(value), [value]);
  const selectedLabel = formatDateTimeDisplay(value);
  const monthCells = useMemo(() => getDaysInMonthGrid(openMonth), [openMonth]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(), []);
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;

    return Array.from({ length: 16 }, (_, index) => startYear + index);
  }, []);
  const currentDate = useMemo(() => new Date(), []);

  function emitChange(
    date: Date,
    hour = selected.hour,
    minute = selected.minute,
  ) {
    onChange(toLocalDateTimeValue(createDateTimeFromParts(date, hour, minute)));
  }

  function handleSelectDate(nextDate: Date) {
    emitChange(nextDate);
    onBlur?.();
  }

  function handleHourChange(nextHour: string) {
    emitChange(selected.date ?? new Date(), nextHour, selected.minute);
    onBlur?.();
  }

  function handleMinuteChange(nextMinute: string) {
    emitChange(selected.date ?? new Date(), selected.hour, nextMinute);
    onBlur?.();
  }

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onChange("");
    onBlur?.();
  }

  function handleYearChange(yearValue: string) {
    const nextYear = Number(yearValue);

    if (!Number.isFinite(nextYear)) {
      return;
    }

    setOpenMonth(createLocalDate(nextYear, openMonth.getMonth(), 1));
  }

  function handleMonthChange(monthValue: string) {
    const nextMonth = Number(monthValue);

    if (!Number.isFinite(nextMonth) || nextMonth < 0 || nextMonth > 11) {
      return;
    }

    setOpenMonth(createLocalDate(openMonth.getFullYear(), nextMonth, 1));
  }

  function focusDay(nextDate: Date) {
    const key = toDateValue(nextDate);
    const nextButton = dayButtonsRef.current.get(key);

    if (nextButton) {
      nextButton.focus();
      return;
    }

    setOpenMonth(startOfMonth(nextDate));
    requestAnimationFrame(() => {
      dayButtonsRef.current.get(key)?.focus();
    });
  }

  function handleGridKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentDateValue: Date,
  ) {
    let nextDate: Date | null = null;

    switch (event.key) {
      case "ArrowRight":
        nextDate = new Date(currentDateValue);
        nextDate.setDate(currentDateValue.getDate() + 1);
        break;
      case "ArrowLeft":
        nextDate = new Date(currentDateValue);
        nextDate.setDate(currentDateValue.getDate() - 1);
        break;
      case "ArrowDown":
        nextDate = new Date(currentDateValue);
        nextDate.setDate(currentDateValue.getDate() + 7);
        break;
      case "ArrowUp":
        nextDate = new Date(currentDateValue);
        nextDate.setDate(currentDateValue.getDate() - 7);
        break;
      case "Home":
        nextDate = startOfMonth(currentDateValue);
        break;
      case "End":
        nextDate = new Date(
          currentDateValue.getFullYear(),
          currentDateValue.getMonth() + 1,
          0,
          12,
        );
        break;
      case "PageUp":
        nextDate = addMonths(currentDateValue, -1);
        nextDate.setDate(currentDateValue.getDate());
        break;
      case "PageDown":
        nextDate = addMonths(currentDateValue, 1);
        nextDate.setDate(currentDateValue.getDate());
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleSelectDate(currentDateValue);
        return;
      default:
        return;
    }

    event.preventDefault();
    focusDay(nextDate);
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label
          htmlFor={inputId}
          className="text-sm font-medium text-on-surface"
        >
          {label}
          {required ? <span className="ml-0.5 text-destructive">*</span> : null}
        </Label>
      ) : null}

      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setOpenMonth(getInitialOpenMonth(value));
          }

          setOpen(nextOpen);
          if (!nextOpen) {
            onBlur?.();
          }
        }}
      >
        <div className="relative">
          <PopoverTrigger asChild>
            <button
              id={inputId}
              type="button"
              disabled={disabled}
              data-invalid={Boolean(error)}
              aria-describedby={error || helperText ? messageId : undefined}
              aria-expanded={open}
              aria-haspopup="dialog"
              className={cn(
                "group flex min-h-12 w-full flex-wrap items-center gap-3 rounded-xl border border-outline/20 bg-surface-container-lowest px-3.5 py-2 text-left text-sm text-on-surface shadow-[0_1px_2px_rgba(7,30,39,0.06)] outline-none transition-[border-color,box-shadow,background-color]",
                "hover:border-primary/35 hover:bg-surface focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/12 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
                "dark:shadow-none dark:hover:bg-surface-container-low dark:focus-visible:bg-surface-container-low dark:aria-invalid:ring-destructive/25",
                error && "border-destructive",
              )}
            >
              <CalendarDays className="size-4 shrink-0 text-on-surface-variant transition-colors group-hover:text-primary" />
              <span
                className={cn(
                  "min-w-36 flex-1 truncate",
                  selectedLabel
                    ? "text-on-surface"
                    : "text-on-surface-variant/65",
                )}
              >
                {selectedLabel || placeholder}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-surface-container px-2.5 py-1 text-xs font-semibold text-on-surface-variant">
                <Clock3 className="size-3.5 text-primary" />
                {selected.hour} : {selected.minute}
              </span>
            </button>
          </PopoverTrigger>

          {/* {value?.trim() ? (
            <button
              type="button"
              aria-label="Xóa thời gian"
              onClick={handleClear}
              className="absolute top-1/2 right-2 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface sm:inline-flex"
            >
              <X className="size-4" />
            </button>
          ) : null} */}
        </div>

        <PopoverContent className="p-4 sm:w-[min(calc(100vw-1rem),28rem)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display text-base font-semibold text-on-surface">
                {label || "Chọn ngày và giờ"}
              </p>
              <p className="text-xs text-muted-foreground">
                Chọn ngày, sau đó đặt giờ và phút cho lịch mở đề.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setOpenMonth(addMonths(openMonth, -1))}
                aria-label="Tháng trước"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setOpenMonth(addMonths(openMonth, 1))}
                aria-label="Tháng sau"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-surface-container-low p-3">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
              <div className="space-y-1.5">
                <label
                  htmlFor={`${inputId}-month`}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Tháng
                </label>
                <Select
                  value={String(openMonth.getMonth())}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger
                    id={`${inputId}-month`}
                    size="sm"
                    aria-label="Chọn tháng"
                    className="h-10 rounded-xl font-medium"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="max-h-72 min-w-(--radix-select-trigger-width)"
                  >
                    <SelectGroup>
                      {MONTH_LABELS.map((month) => (
                        <SelectItem
                          key={month.value}
                          value={String(month.value)}
                        >
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={`${inputId}-year`}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Năm
                </label>
                <Select
                  value={String(openMonth.getFullYear())}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger
                    id={`${inputId}-year`}
                    size="sm"
                    aria-label="Chọn năm"
                    className="h-10 rounded-xl font-medium"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="max-h-72 min-w-(--radix-select-trigger-width)"
                  >
                    <SelectGroup>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="mt-3 min-w-0 truncate font-display text-base font-semibold text-on-surface">
              {openMonth.toLocaleDateString("vi-VN", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {weekdayLabels.map((weekdayLabel) => (
              <div key={weekdayLabel} className="py-2">
                {weekdayLabel}
              </div>
            ))}
          </div>

          <div
            className="mt-2 grid grid-cols-7 gap-1"
            aria-label="Lịch chọn ngày giờ"
          >
            {monthCells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-10" />;
              }

              const isSelected =
                selected.date !== null && isSameDay(date, selected.date);
              const isToday = isSameDay(date, currentDate);
              const selectedMonthKey = selected.date
                ? toDateValue(selected.date)
                : toDateValue(currentDate);
              const isTabbable = toDateValue(date) === selectedMonthKey;

              return (
                <button
                  key={toDateValue(date)}
                  type="button"
                  ref={(node) => {
                    const key = toDateValue(date);

                    if (node) {
                      dayButtonsRef.current.set(key, node);
                    } else {
                      dayButtonsRef.current.delete(key);
                    }
                  }}
                  onKeyDown={(event) => handleGridKeyDown(event, date)}
                  onFocus={() => setOpenMonth(startOfMonth(date))}
                  onClick={() => handleSelectDate(date)}
                  tabIndex={isTabbable ? 0 : -1}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={date.toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-full text-sm font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/12",
                    isSelected
                      ? "bg-primary text-white shadow-[0_12px_24px_-18px_rgba(79,70,229,0.7)]"
                      : "text-on-surface hover:bg-primary/10 hover:text-primary",
                    isToday && !isSelected && "ring-1 ring-primary/20",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl bg-surface-container-low p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-1.5">
              <label
                htmlFor={`${inputId}-hour`}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Giờ
              </label>
              <Select value={selected.hour} onValueChange={handleHourChange}>
                <SelectTrigger
                  id={`${inputId}-hour`}
                  className="h-10 rounded-xl"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  className="max-h-72 min-w-(--radix-select-trigger-width)"
                >
                  <SelectGroup>
                    {HOUR_OPTIONS.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={`${inputId}-minute`}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Phút
              </label>
              <Select
                value={selected.minute}
                onValueChange={handleMinuteChange}
              >
                <SelectTrigger
                  id={`${inputId}-minute`}
                  className="h-10 rounded-xl"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  className="max-h-72 min-w-(--radix-select-trigger-width)"
                >
                  <SelectGroup>
                    {MINUTE_OPTIONS.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-on-surface">
              {selectedLabel || placeholder}
            </p>
            {value?.trim() ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                Xóa
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>

      {error || helperText ? (
        <p
          id={messageId}
          className={cn(
            "text-xs",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ?? helperText}
        </p>
      ) : null}
    </div>
  );
}
