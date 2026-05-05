"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormActionsProps {
  isSubmitting: boolean;
}

export function FormActions({ isSubmitting }: FormActionsProps) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
      <Link
        href="/teacher/classes"
        className="inline-flex flex-1 items-center justify-center rounded-xl border border-outline/20 px-4 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
      >
        Hủy
      </Link>
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
          "bg-primary text-white transition-colors hover:bg-primary/90",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Đang tạo..." : "Tạo lớp"}
      </button>
    </div>
  );
}
