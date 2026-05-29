"use client";

import { memo, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bookmark, Check, Circle, ListChecks } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type OrbState = "unanswered" | "answered" | "current" | "flagged";

interface ProgressOrbsProps {
  total: number;
  currentIndex: number;
  answeredIds: Set<string>;
  questionIds: string[];
  onJumpTo: (index: number) => void;
  flaggedQuestionIds?: Set<string>;
}

interface QuestionProgressItem {
  id: string;
  index: number;
  label: string;
  isAnswered: boolean;
  isCurrent: boolean;
  isFlagged: boolean;
}

interface QuestionItemProps extends QuestionProgressItem {
  onJumpTo: (index: number) => void;
  shouldReduceMotion: boolean;
  registerItem: (index: number, element: HTMLButtonElement | null) => void;
}

function formatQuestionNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function getQuestionStatusLabel({
  isAnswered,
  isCurrent,
  isFlagged,
}: Pick<
  QuestionProgressItem,
  "isAnswered" | "isCurrent" | "isFlagged"
>): string {
  const status = [isCurrent ? "câu hiện tại" : null];

  status.push(isAnswered ? "đã trả lời" : "chưa trả lời");

  if (isFlagged) {
    status.push("đã đánh dấu");
  }

  return status.filter(Boolean).join(", ");
}

const QuestionItem = memo(function QuestionItem({
  index,
  label,
  isAnswered,
  isCurrent,
  isFlagged,
  onJumpTo,
  shouldReduceMotion,
  registerItem,
}: QuestionItemProps) {
  const handleClick = useCallback(() => {
    onJumpTo(index);
  }, [index, onJumpTo]);

  const setItemRef = useCallback(
    (element: HTMLButtonElement | null) => {
      registerItem(index, element);
    },
    [index, registerItem],
  );

  const statusLabel = getQuestionStatusLabel({
    isAnswered,
    isCurrent,
    isFlagged,
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          ref={setItemRef}
          type="button"
          onClick={handleClick}
          aria-current={isCurrent ? "step" : undefined}
          aria-label={`Câu ${label}: ${statusLabel}`}
          initial={false}
          animate={
            isCurrent && !shouldReduceMotion
              ? { scale: [1, 1.035, 1] }
              : { scale: 1 }
          }
          transition={
            isCurrent && !shouldReduceMotion
              ? { duration: 2.4, ease: "easeInOut", repeat: Infinity }
              : { type: "spring", stiffness: 420, damping: 28 }
          }
          whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.045 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          className={cn(
            "group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border text-[0.78rem] font-semibold tabular-nums tracking-normal outline-none transition-colors duration-200 sm:h-12 sm:w-12 sm:text-sm",
            "focus-visible:ring-3 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isCurrent
              ? "border-transparent bg-linear-to-br from-primary via-indigo-500 to-tertiary text-white shadow-[0_18px_34px_-16px_rgba(79,70,229,0.72)]"
              : isAnswered
                ? "border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-[0_14px_28px_-24px_rgba(16,185,129,0.65)] hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-400/12 dark:text-emerald-300"
                : isFlagged
                  ? "border-amber-200/90 bg-amber-50 text-amber-700 shadow-[0_14px_28px_-24px_rgba(245,158,11,0.6)] hover:border-amber-300 hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-400/12 dark:text-amber-300"
                  : "border-border/60 bg-white/72 text-on-surface-variant shadow-[0_12px_24px_-22px_rgba(15,23,42,0.38)] hover:border-primary/25 hover:bg-white hover:text-on-surface dark:bg-surface-container/70 dark:hover:bg-surface-container-high",
          )}
        >
          <span
            className={cn(
              "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200",
              "bg-linear-to-br from-white/35 via-transparent to-white/10",
              isCurrent ? "opacity-100" : "group-hover:opacity-100",
            )}
          />
          <span className="relative z-10">{label}</span>

          {isAnswered ? (
            <span
              className={cn(
                "absolute right-1 top-1 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full",
                isCurrent
                  ? "bg-white text-primary"
                  : "bg-emerald-600 text-white ring-2 ring-white dark:ring-surface-container",
              )}
              aria-hidden="true"
            >
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </span>
          ) : null}

          {isFlagged ? (
            <Bookmark
              className={cn(
                "absolute left-1 top-1 z-10 h-3.5 w-3.5",
                isCurrent ? "fill-white/80 text-white" : "fill-amber-300 text-amber-600",
              )}
              aria-hidden="true"
            />
          ) : null}

          {isCurrent ? (
            <span
              className="absolute bottom-1.5 left-3 right-3 z-10 h-1 rounded-full bg-white/75"
              aria-hidden="true"
            />
          ) : null}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="font-medium">Câu {label}</span>
        <span className="block text-white/75">{statusLabel}</span>
      </TooltipContent>
    </Tooltip>
  );
});

function LegendItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-muted-foreground">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      {children}
    </span>
  );
}

export function ProgressOrbs({
  total,
  currentIndex,
  answeredIds,
  questionIds,
  onJumpTo,
  flaggedQuestionIds,
}: ProgressOrbsProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const items = useMemo<QuestionProgressItem[]>(
    () =>
      Array.from({ length: total }, (_, index) => {
        const questionId = questionIds[index] ?? `question-${index}`;

        return {
          id: questionId,
          index,
          label: formatQuestionNumber(index),
          isAnswered: answeredIds.has(questionId),
          isCurrent: index === currentIndex,
          isFlagged: flaggedQuestionIds?.has(questionId) ?? false,
        };
      }),
    [answeredIds, currentIndex, flaggedQuestionIds, questionIds, total],
  );

  const answeredCount = useMemo(
    () => items.filter((item) => item.isAnswered).length,
    [items],
  );
  const flaggedCount = useMemo(
    () => items.filter((item) => item.isFlagged).length,
    [items],
  );
  const progressPercentage =
    total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const unansweredCount = Math.max(total - answeredCount, 0);

  const registerItem = useCallback(
    (index: number, element: HTMLButtonElement | null) => {
      itemRefs.current[index] = element;
    },
    [],
  );

  useEffect(() => {
    const currentItem = itemRefs.current[currentIndex];

    currentItem?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentIndex, shouldReduceMotion]);

  return (
    <TooltipProvider>
      <section
        aria-labelledby="exam-progress-title"
        className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/78 p-4 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.34)] backdrop-blur-2xl dark:border-outline/25 dark:bg-surface-container-lowest/82 sm:p-5"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(79,70,229,0.16),transparent_34%),radial-gradient(circle_at_88%_0%,rgba(8,145,178,0.14),transparent_32%)]"
          aria-hidden="true"
        />

        <div className="relative space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_16px_32px_-24px_rgba(79,70,229,0.55)]">
                <ListChecks className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="exam-progress-title"
                  className="font-display text-base font-semibold text-on-surface"
                >
                  Tiến độ bài thi
                </h2>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Câu {formatQuestionNumber(currentIndex)} / {total}
                </p>
              </div>
            </div>

            <div className="w-fit rounded-full border border-primary/12 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              {progressPercentage}% hoàn thành
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 overflow-hidden rounded-full bg-primary/10 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-primary via-secondary to-tertiary"
                initial={false}
                animate={{ width: `${progressPercentage}%` }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 110, damping: 24 }
                }
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-on-surface">
                Đã hoàn thành {answeredCount}/{total} câu
              </span>
              <span className="text-muted-foreground">
                Còn {unansweredCount} câu chưa trả lời
              </span>
            </div>
          </div>

          <div className="-mx-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
            <div className="flex w-max gap-2 sm:w-full sm:flex-wrap sm:gap-2.5">
              {items.map((item) => (
                <QuestionItem
                  key={item.id}
                  {...item}
                  onJumpTo={onJumpTo}
                  shouldReduceMotion={shouldReduceMotion}
                  registerItem={registerItem}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/35 pt-3">
            <LegendItem className="bg-linear-to-br from-primary to-tertiary">
              Câu hiện tại
            </LegendItem>
            <LegendItem className="bg-emerald-500">Đã trả lời</LegendItem>
            <LegendItem className="border border-border bg-white dark:bg-surface-container">
              Chưa trả lời
            </LegendItem>
            {flaggedCount > 0 ? (
              <LegendItem className="bg-amber-400">Đã đánh dấu</LegendItem>
            ) : null}
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Circle className="h-3 w-3 fill-current text-primary/45" />
              {total} câu hỏi
            </span>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
