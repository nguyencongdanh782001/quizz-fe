"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceTab<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

export function WorkspaceTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: WorkspaceTab<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-[#DDE2EB] bg-white px-4 pt-3 shadow-[0_1px_3px_rgba(30,41,59,0.04)]">
      <div className="flex min-w-max items-center gap-7">
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                "relative flex h-10 items-center gap-2 pb-3 text-xs font-semibold transition-colors",
                active ? "text-[#3B82F6]" : "text-[#64748B] hover:text-[#1E293B]",
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
              {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#3B82F6]" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function WorkspaceEmpty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-[10px] border border-dashed border-[#C9D0DD] bg-white px-6 py-12 text-center">
      <p className="text-xs font-semibold text-[#526079]">{title}</p>
      {description ? <p className="mt-1 max-w-xl text-[11px] leading-5 text-[#7C879B]">{description}</p> : null}
    </div>
  );
}
