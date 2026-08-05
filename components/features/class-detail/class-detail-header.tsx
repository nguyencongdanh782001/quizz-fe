"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ClassHeaderMetricTone = "blue" | "green" | "purple";

export interface ClassHeaderMetric {
  label: string;
  value: ReactNode;
  tone: ClassHeaderMetricTone;
}

export interface ClassDetailHeaderProps {
  title: string;
  imageUrl?: string | null;
  statusLabel?: string;
  statusTone?: "active" | "inactive";
  classCode?: string | null;
  metrics: ClassHeaderMetric[];
  actions?: ReactNode;
  backLabel?: string;
  fallbackImageUrl?: string;
  className?: string;
}

const METRIC_CLASSES: Record<
  ClassHeaderMetricTone,
  {
    container: string;
    value: string;
  }
> = {
  blue: {
    container: "bg-[#E0F2FE]",
    value: "text-[#0284C7]",
  },
  green: {
    container: "bg-[#DCFCE7]",
    value: "text-[#16A34A]",
  },
  purple: {
    container: "bg-[#F3E8FF]",
    value: "text-[#9333EA]",
  },
};

export function ClassDetailHeader({
  title,
  imageUrl,
  statusLabel = "Hoạt động",
  statusTone = "active",
  classCode,
  metrics,
  actions,
  backLabel = "Trở về",
  fallbackImageUrl = "/image/class-01.png",
  className,
}: ClassDetailHeaderProps) {
  const router = useRouter();

  return (
    <section
      className={cn(
        "rounded-[10px] border border-[#DDE2EB] bg-white p-5 shadow-[0_1px_3px_rgba(30,41,59,0.04)] sm:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="min-w-0 truncate text-xl font-bold text-[#1E293B]">
          {title}
        </h1>

        <div className="flex shrink-0 items-center gap-2">
          {actions}

          <Button
            type="button"
            onClick={() => router.back()}
            className="h-9 gap-1.5 rounded-[6px] bg-[#DC2626] px-3.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#B91C1C]"
          >
            <ArrowLeft className="size-3.5" />
            {backLabel}
          </Button>
        </div>
      </div>

      <div className="mt-2.5 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-28 w-48 shrink-0 overflow-hidden rounded-[8px] border border-[#ECECEC] bg-[#F8FAFC]">
          <img
            src={imageUrl?.trim() || fallbackImageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-2 pt-0.5">
          <span
            className={cn(
              "inline-block rounded-[4px] px-2.5 py-0.5 text-xs font-semibold text-white",
              statusTone === "active" ? "bg-[#15803D]" : "bg-[#64748B]",
            )}
          >
            {statusLabel}
          </span>

          <p className="text-sm font-medium text-[#1E293B]">
            Mã lớp học:{" "}
            <span className="font-mono font-bold text-[#1E293B]">
              {classCode?.trim() || "--"}
            </span>
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-5 grid grid-cols-1 gap-4",
          metrics.length === 2
            ? "sm:grid-cols-2"
            : metrics.length === 4
              ? "sm:grid-cols-2 xl:grid-cols-4"
              : "sm:grid-cols-3",
        )}
      >
        {metrics.map((metric) => {
          const tone = METRIC_CLASSES[metric.tone];

          return (
            <div
              key={metric.label}
              className={cn("rounded-[8px] p-4 text-center", tone.container)}
            >
              <div className={cn("text-2xl font-bold", tone.value)}>
                {metric.value}
              </div>

              <div className="mt-1 text-xs font-medium text-[#64748B]">
                {metric.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
