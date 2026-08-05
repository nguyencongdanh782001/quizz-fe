import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ClassEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function ClassEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  compact = false,
  className,
}: ClassEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[10px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 text-center",
        compact ? "py-10" : "py-16",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-white text-[#4F62F2] shadow-[0_1px_3px_rgba(30,41,59,0.08)]">
        <Icon className="size-6" />
      </span>

      <h3 className="mt-4 text-sm font-bold text-[#1E293B]">{title}</h3>

      {description ? (
        <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#64748B]">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
