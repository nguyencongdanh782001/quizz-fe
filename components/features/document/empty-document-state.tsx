"use client";

import { BookOpenText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { cn } from "@/lib/utils";

interface EmptyDocumentStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyDocumentState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyDocumentStateProps) {
  return (
    <SurfacePanel
      className={cn(
        "relative overflow-hidden px-6 py-12 text-center sm:px-8 sm:py-14",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.10),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(8,145,178,0.12),_transparent_30%)]" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-linear-to-br from-primary/12 via-white/80 to-secondary/15 shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
          <div className="absolute -left-3 top-1 rounded-full bg-primary/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            LMS
          </div>
          <div className="absolute right-0 bottom-0 flex size-10 items-center justify-center rounded-[8px] bg-surface-container-lowest shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
            <BookOpenText className="size-5 text-primary" />
          </div>
          <Sparkles className="size-10 text-primary" />
        </div>

        <h2 className="mt-6 font-display text-3xl font-semibold text-on-surface">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            "Tài liệu học tập sẽ xuất hiện tại đây.",
            "Bạn có thể xem trước và tải xuống khi có nội dung mới.",
            "Hãy quay lại sau khi giáo viên cập nhật học liệu.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[8px] border border-outline/10 bg-white/70 px-4 py-3 text-left text-sm text-on-surface"
            >
              {item}
            </div>
          ))}
        </div>

        {actionLabel && onAction ? (
          <Button type="button" onClick={onAction} className="mt-7">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </SurfacePanel>
  );
}
