import { cn } from "@/lib/utils";

export interface ClassDetailTabItem<T extends string> {
  id: T;
  label: string;
  count: number;
}

export function ClassDetailTabs<T extends string>({
  activeTab,
  tabs,
  onChange,
}: {
  activeTab: T;
  tabs: ClassDetailTabItem<T>[];
  onChange: (tab: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-[8px] bg-surface-container-lowest p-2 shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-[6px] px-4 py-2.5 text-sm font-medium transition-all",
            activeTab === tab.id
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:bg-surface-container hover:text-on-surface",
          )}
        >
          <span>{tab.label}</span>

          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              activeTab === tab.id
                ? "bg-white/20 text-white"
                : "bg-surface-container text-muted-foreground",
            )}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
