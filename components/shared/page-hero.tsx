import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { StatCard } from "@/components/shared/stat-card";
import { cn } from "@/lib/utils";

export interface PageHeroMetric {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary" | "tertiary" | "neutral";
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  metrics?: PageHeroMetric[];
  className?: string;
  badgeVariant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "info"
    | "destructive"
    | "outline";
  children?: React.ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  metrics,
  className,
  badgeVariant = "info",
  children,
}: PageHeroProps) {
  return (
    <SurfacePanel className={cn("p-4 sm:p-5", className)}>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div className="mt-0.5 hidden size-10 shrink-0 items-center justify-center rounded-[9px] border border-[#C7D0FF] bg-[#EEF2FF] text-[#4F62F2] sm:flex">
              <Icon className="size-5" />
            </div>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? (
              <Badge variant={badgeVariant} className="mb-2 h-6 rounded-[6px] px-2 text-[10.5px]">
                {eyebrow}
              </Badge>
            ) : null}
            <h1 className="text-lg font-bold text-[#1E293B]">{title}</h1>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-[#64748B]">{description}</p>
            {children}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>

      {metrics?.length ? (
        <div className="mt-4 grid gap-3 border-t border-[#E3E7EE] pt-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
              tone={metric.tone}
            />
          ))}
        </div>
      ) : null}
    </SurfacePanel>
  );
}
