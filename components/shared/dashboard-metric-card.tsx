import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardMetricTone = "blue" | "purple" | "amber" | "emerald";

interface DashboardMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: DashboardMetricTone;
  isLoading?: boolean;
  className?: string;
}

const toneClassNames: Record<DashboardMetricTone, string> = {
  blue: "border-indigo-200 bg-indigo-50 text-indigo-600",
  purple: "border-purple-200 bg-purple-50 text-purple-600",
  amber: "border-amber-200 bg-amber-50 text-amber-600",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-600",
};

export function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  tone = "blue",
  isLoading = false,
  className,
}: DashboardMetricCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-22 items-center gap-3.5 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-[0_1px_3px_rgba(30,41,59,0.05)] transition-colors hover:border-[#C7D0FF]",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
          toneClassNames[tone],
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-[#526079]">{label}</p>
        {isLoading ? (
          <div className="mt-2 h-5 w-20 animate-pulse rounded bg-[#E9EDF5]" />
        ) : (
          <p className="mt-0.5 truncate text-lg font-bold text-[#1E293B]">{value}</p>
        )}
      </div>
    </article>
  );
}
