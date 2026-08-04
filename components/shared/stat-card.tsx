import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary" | "tertiary" | "neutral";
  className?: string;
  compact?: boolean;
}

const toneClassName = {
  primary: "border-[#C7D0FF] bg-[#EEF2FF] text-[#4F62F2]",
  secondary: "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]",
  tertiary: "border-[#E9D5FF] bg-[#FAF5FF] text-[#9333EA]",
  neutral: "border-[#DDE2EB] bg-[#F7F8FB] text-[#526079]",
} as const;

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "primary",
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-24 items-center gap-3 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-[0_1px_3px_rgba(30,41,59,0.04)]",
        className,
      )}
    >
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-[9px] border", toneClassName[tone])}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#526079]">{label}</p>
        <p className="mt-0.5 truncate text-xl font-bold tracking-tight text-[#1E293B]">{value}</p>
        {description ? (
          <p className="mt-0.5 line-clamp-1 text-[10.5px] text-[#7C879B]">{description}</p>
        ) : null}
      </div>
    </article>
  );
}
