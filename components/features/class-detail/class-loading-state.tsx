import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ClassLoadingStateProps {
  label?: string;
  cardCount?: number;
  className?: string;
}

export function ClassLoadingState({
  label = "dữ liệu lớp học",
  cardCount = 3,
  className,
}: ClassLoadingStateProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-xs font-medium text-[#64748B]">Đang tải {label}...</p>

      <section className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white">
        <Skeleton className="h-1.5 w-full rounded-none" />

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-64 rounded-[6px]" />
              <Skeleton className="h-4 w-96 max-w-full rounded-[6px]" />
            </div>

            <Skeleton className="h-9 w-28 rounded-[6px]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-[8px]" />
            ))}
          </div>
        </div>
      </section>

      <Skeleton className="h-14 rounded-[10px]" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, index) => (
          <Skeleton key={index} className="h-72 rounded-[10px]" />
        ))}
      </div>
    </div>
  );
}
