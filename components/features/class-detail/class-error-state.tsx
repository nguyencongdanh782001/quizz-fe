"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ClassErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
  className?: string;
}

export function ClassErrorState({
  title = "Không thể tải dữ liệu",
  message,
  onRetry,
  retryLabel = "Thử lại",
  compact = false,
  className,
}: ClassErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[10px] border border-rose-200 bg-rose-50 px-6 text-center",
        compact ? "py-8" : "py-12",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
        <AlertTriangle className="size-5" />
      </span>

      <h3 className="mt-3 text-sm font-bold text-rose-700">{title}</h3>

      <p className="mt-1.5 max-w-xl text-xs leading-5 text-rose-600">
        {message}
      </p>

      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 border-rose-200 bg-white text-rose-700 hover:bg-rose-100 hover:text-rose-800"
        >
          <RefreshCw className="mr-1.5 size-3.5" />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
