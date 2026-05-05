import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-outline/20 bg-surface-container-lowest p-8 text-center">
      <Icon className="mx-auto h-10 w-10 text-muted-foreground/60" />
      <h3 className="mt-4 font-display text-lg font-semibold text-on-surface">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
