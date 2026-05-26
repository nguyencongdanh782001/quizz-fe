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
    <SurfacePanel
      tone="accent"
      className={cn("relative overflow-hidden p-6 sm:p-7 lg:p-8", className)}
    >
      <div className="app-glow -right-32 -top-20 h-44 w-44 bg-primary/18" />
      <div className="app-glow -bottom-16 left-10 h-36 w-36 bg-secondary/18" />

      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] xl:items-end">
        <div className="space-y-5">
          {eyebrow ? (
            <Badge
              variant={badgeVariant}
              className="w-fit rounded-full px-4 py-1.5"
            >
              {eyebrow}
            </Badge>
          ) : null}

          <div className="flex items-start gap-4">
            {Icon ? (
              <div className="hidden rounded-[1.5rem] bg-white/70 p-4 text-primary shadow-[0_22px_44px_-22px_rgba(79,70,229,0.48)] backdrop-blur-sm sm:flex">
                <Icon className="h-6 w-6" />
              </div>
            ) : null}
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>
          </div>

          {actions ? (
            <div className="flex flex-wrap gap-3">{actions}</div>
          ) : null}
          {children}
        </div>

        {metrics?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <StatCard
                key={metric.label}
                compact
                label={metric.label}
                value={metric.value}
                description={metric.description}
                icon={metric.icon}
                tone={metric.tone}
              />
            ))}
          </div>
        ) : null}
      </div>
    </SurfacePanel>
  );
}
