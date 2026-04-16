"use client";

import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamNavigationProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function ExamNavigation({
  currentIndex,
  total,
  onPrev,
  onNext,
  onSubmit,
}: ExamNavigationProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className={cn(
          "cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
          "border transition-all duration-150",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          "bg-surface-container-lowest border-outline/20 text-on-surface",
          "hover:bg-surface-container-low active:scale-95",
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        Câu trước
      </button>

      <span className="text-sm text-muted-foreground font-medium tabular-nums">
        {currentIndex + 1} / {total}
      </span>

      {isLast ? (
        <button
          onClick={onSubmit}
          className={cn(
            "cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold",
            "bg-secondary text-white transition-all duration-150",
            "hover:bg-secondary/90 active:scale-95",
            "shadow-[0_4px_12px_rgba(41,105,91,0.3)]",
          )}
        >
          Nộp bài
          <Send className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={onNext}
          className={cn(
            "cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
            "bg-primary text-white transition-all duration-150",
            "hover:bg-primary/90 active:scale-95",
          )}
        >
          Câu tiếp
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
