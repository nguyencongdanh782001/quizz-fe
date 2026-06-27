"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
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
  formatDateDisplay,
  getDaysInMonthGrid,
  getWeekdayLabels,
  isAfterDay,
  isSameDay,
  parseDateValue,
  startOfMonth,
  toDateValue,
} from "@/lib/date";

interface DatePickerProps {
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
  maxDate?: Date;
  defaultOpenDate?: Date;
  yearsBack?: number;
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

function getDefaultBirthDate(maxDate: Date): Date {
  return createLocalDate(
    maxDate.getFullYear() - 18,
    maxDate.getMonth(),
    Math.min(maxDate.getDate(), 28),
  );
}

function clampMonthToMax(date: Date, maxDate: Date): Date {
  const month = startOfMonth(date);

  return isAfterDay(month, maxDate) ? startOfMonth(maxDate) : month;
}

function getInitialMonth(
  value: string | null | undefined,
  defaultOpenDate: Date,
  maxDate: Date,
): Date {
  return clampMonthToMax(parseDateValue(value) ?? defaultOpenDate, maxDate);
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  label,
  error,
  helperText,
  placeholder = "Chọn ngày sinh",
  disabled = false,
  required = false,
  className,
  id,
  maxDate: maxDateProp,
  defaultOpenDate,
  yearsBack = 100,
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? `date-picker-${generatedId}`;
  const messageId = `${inputId}-message`;
  const maxDate = useMemo(() => maxDateProp ?? new Date(), [maxDateProp]);
  const fallbackOpenDate = useMemo(
    () => defaultOpenDate ?? getDefaultBirthDate(maxDate),
    [defaultOpenDate, maxDate],
  );
  const [open, setOpen] = useState(false);
  const [openMonth, setOpenMonth] = useState(() =>
    getInitialMonth(value, fallbackOpenDate, maxDate),
  );
  const dayButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const selectedLabel = formatDateDisplay(value);
  const monthCells = useMemo(() => getDaysInMonthGrid(openMonth), [openMonth]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(), []);
  const currentDate = useMemo(() => new Date(), []);
  const maxYear = maxDate.getFullYear();
  const yearSpan = Math.max(yearsBack, 100);
  const minYear = maxYear - yearSpan;
  const yearOptions = useMemo(
    () =>
      Array.from({ length: yearSpan + 1 }, (_, index) => maxYear - index),
    [maxYear, yearSpan],
  );
  const isMaxedOutMonth = isAfterDay(
    startOfMonth(addMonths(openMonth, 1)),
    maxDate,
  );
  const activeTabDate = useMemo(() => {
    if (
      selectedDate &&
      !isAfterDay(selectedDate, maxDate) &&
      startOfMonth(selectedDate).getTime() === openMonth.getTime()
    ) {
      return selectedDate;
    }

    return (
      monthCells.find(
        (cell): cell is Date => cell !== null && !isAfterDay(cell, maxDate),
      ) ?? 
      null
    );
  }, [maxDate, monthCells, openMonth, selectedDate]);

  function updateOpenMonth(year: number, month: number) {
    const nextMonth = clampMonthToMax(createLocalDate(year, month, 1), maxDate);
    setOpenMonth(nextMonth);
  }

  function handleYearChange(yearValue: string) {
    const nextYear = Number(yearValue);

    if (!Number.isFinite(nextYear) || nextYear < minYear || nextYear > maxYear) {
      return;
    }

    updateOpenMonth(nextYear, openMonth.getMonth());
  }

  function handleMonthChange(monthValue: string) {
    const nextMonth = Number(monthValue);

    if (!Number.isFinite(nextMonth) || nextMonth < 0 || nextMonth > 11) {
      return;
    }

    updateOpenMonth(openMonth.getFullYear(), nextMonth);
  }

  function handleSelect(nextDate: Date) {
    if (isAfterDay(nextDate, maxDate)) {
      return;
    }

    onChange(toDateValue(nextDate));
    onBlur?.();
    setOpen(false);
  }

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onChange("");
    onBlur?.();
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
        handleSelect(currentDateValue);
        return;
      default:
        return;
    }

    if (!nextDate || isAfterDay(nextDate, maxDate)) {
      return;
    }

    event.preventDefault();
    focusDay(nextDate);
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={inputId} className="text-sm font-medium text-on-surface">
          {label}
          {required ? <span className="ml-0.5 text-destructive">*</span> : null}
        </Label>
      ) : null}

      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setOpenMonth(getInitialMonth(value, fallbackOpenDate, maxDate));
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
              aria-describedby={(error || helperText) ? messageId : undefined}
              aria-expanded={open}
              aria-haspopup="dialog"
              className={cn(
                "group flex h-11 w-full items-center gap-3 rounded-xl border border-outline/20 bg-surface-container-lowest px-3.5 pr-11 text-left text-sm text-on-surface shadow-[0_1px_2px_rgba(7,30,39,0.06)] outline-none transition-[border-color,box-shadow,background-color] hover:border-primary/35 hover:bg-surface focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/12 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
                "dark:shadow-none dark:hover:bg-surface-container-low dark:focus-visible:bg-surface-container-low dark:aria-invalid:ring-destructive/25",
                error && "border-destructive",
              )}
            >
              <CalendarDays className="size-4 shrink-0 text-on-surface-variant transition-colors group-hover:text-primary" />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  selectedLabel ? "text-on-surface" : "text-on-surface-variant/65",
                )}
              >
                {selectedLabel || placeholder}
              </span>
            </button>
          </PopoverTrigger>

          {value?.trim() ? (
            <button
              type="button"
              aria-label="Xóa ngày sinh"
              onClick={handleClear}
              className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <PopoverContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display text-base font-semibold text-on-surface">
                Chọn ngày sinh
              </p>
              <p className="text-xs text-muted-foreground">
                Dùng phím mũi tên để di chuyển, Enter để chọn.
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
                onClick={() => {
                  const nextMonth = addMonths(openMonth, 1);
                  if (!isAfterDay(startOfMonth(nextMonth), maxDate)) {
                    setOpenMonth(nextMonth);
                  }
                }}
                disabled={isMaxedOutMonth}
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
                    className="max-h-72 min-w-[var(--radix-select-trigger-width)]"
                  >
                    <SelectGroup>
                      {MONTH_LABELS.map((month) => {
                        const isFutureMonth =
                          openMonth.getFullYear() === maxYear &&
                          month.value > maxDate.getMonth();

                        return (
                          <SelectItem
                            key={month.value}
                            value={String(month.value)}
                            disabled={isFutureMonth}
                          >
                            {month.label}
                          </SelectItem>
                        );
                      })}
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
                    className="max-h-72 min-w-[var(--radix-select-trigger-width)]"
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

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate font-display text-base font-semibold text-on-surface">
                {openMonth.toLocaleDateString("vi-VN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {selectedDate ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/12"
                >
                  Xóa ngày
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {weekdayLabels.map((weekdayLabel) => (
              <div key={weekdayLabel} className="py-2">
                {weekdayLabel}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1" aria-label="Lịch chọn ngày sinh">
            {monthCells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-10" />;
              }

              const isSelected =
                selectedDate !== null && isSameDay(date, selectedDate);
              const isDisabled = isAfterDay(date, maxDate);
              const isToday = isSameDay(date, currentDate);
              const isTabbable = activeTabDate
                ? isSameDay(date, activeTabDate)
                : index === monthCells.findIndex((cell) => cell !== null);

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
                  onClick={() => handleSelect(date)}
                  disabled={isDisabled}
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
                    isDisabled &&
                      "cursor-not-allowed text-muted-foreground/50 hover:bg-transparent hover:text-muted-foreground/50",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {(error || helperText) ? (
        <p
          id={messageId}
          className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}
        >
          {error ?? helperText}
        </p>
      ) : null}
    </div>
  );
}
