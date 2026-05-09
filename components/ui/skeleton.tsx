import type * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-surface-container-high/80 dark:bg-surface-container-highest/40",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
