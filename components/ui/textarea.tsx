import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-[7px] border border-outline/20 bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface shadow-[0_1px_2px_rgba(7,30,39,0.06)] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-on-surface-variant/60 selection:bg-primary/15 hover:border-primary/35 hover:bg-surface focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-primary/12 disabled:cursor-not-allowed disabled:border-outline/10 disabled:bg-surface-container-high disabled:text-muted-foreground disabled:shadow-none disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 dark:shadow-none dark:hover:bg-surface-container-low dark:focus-visible:bg-surface-container-low dark:disabled:bg-surface-container dark:aria-invalid:ring-destructive/25",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
