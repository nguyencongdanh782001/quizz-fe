"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function FormActions({ isSubmitting, onCancel }: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
      {onCancel ? (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="inline-flex h-9 items-center justify-center rounded-[6px] border border-outline/20 px-4 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
        >
          Hủy
        </button>
      ) : (
        <Link
          href="/teacher/classes"
          className="inline-flex h-9 items-center justify-center rounded-[6px] border border-outline/20 px-4 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
        >
          Hủy
        </Link>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-[6px] px-4 text-sm font-semibold",
          "bg-gradient-to-r from-[#4867F8] to-[#C62CF2] text-white shadow-sm transition-opacity hover:opacity-95",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Đang tạo..." : "Tạo lớp"}
      </button>
    </div>
  );
}
