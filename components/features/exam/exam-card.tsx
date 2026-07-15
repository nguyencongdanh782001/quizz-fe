"use client";

import Link from "next/link";
import { Clock, BookOpen, Star, ArrowRight } from "lucide-react";
import { Exam } from "@/types/exam.types";
import { cn } from "@/lib/utils";

const difficultyColor = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface ExamCardProps {
  exam: Exam;
  compact?: boolean;
}

export function ExamCard({ exam, compact = false }: ExamCardProps) {
  const badgeLabel = exam.scope === "system" ? "Hệ thống" : "Giáo viên";

  const badgeClassName =
    exam.scope === "system"
      ? "bg-primary-container text-on-primary-container"
      : difficultyColor[exam.difficulty];

  const secondaryLabel =
    exam.grade > 0 ? `Lớp ${exam.grade}` : exam.classroomName;

  const scoreLabel =
    exam.totalPoints && exam.totalPoints > 0
      ? `${exam.totalPoints} điểm`
      : `${exam.passingScore}%`;

  return (
    <div
      className={cn(
        "flex flex-col h-auto group overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/82",
        "shadow-[0_22px_80px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-40px_rgba(15,23,42,0.28)]",
      )}
    >
      {exam.thumbnailUrl && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={exam.thumbnailUrl}
            alt={exam.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div
        className={cn(
          "p-5 h-full flex-1 flex flex-col",
          compact ? "space-y-3" : "space-y-4",
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={cn(
              "inline-block rounded-full px-3 py-1 text-xs font-medium shadow-sm",
              badgeClassName,
            )}
          >
            {badgeLabel}
          </span>
          {secondaryLabel && (
            <span className="text-right text-xs text-muted-foreground font-medium line-clamp-1">
              {secondaryLabel}
            </span>
          )}
        </div>

        <h3
          className={cn(
            "font-display font-semibold text-on-surface leading-snug mb-2 line-clamp-2",
            compact ? "text-sm" : "text-base",
          )}
        >
          {exam.title}
        </h3>

        {!compact && (
          <p className="text-sm leading-7 text-muted-foreground line-clamp-2 mb-3">
            {exam.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {exam.questionCount} câu
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5">
            <Clock className="w-3.5 h-3.5" />
            {exam.duration} phút
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5">
            <Star className="w-3.5 h-3.5" />
            {scoreLabel}
          </span>
        </div>

        <Link
          href={`/student/exam/${exam.id}`}
          className={cn(
            "mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-3",
            "bg-linear-to-r from-primary to-tertiary text-sm font-semibold text-white",
            "shadow-[0_18px_38px_-20px_rgba(79,70,229,0.52)] transition-all duration-200",
            "hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-18px_rgba(79,70,229,0.42)] active:scale-[0.99]",
          )}
        >
          Xem chi tiết
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
