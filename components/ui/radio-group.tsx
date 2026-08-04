"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "cursor-pointer group/radio-group-item peer relative flex aspect-square size-5 shrink-0 rounded-full border border-outline/25 bg-surface-container-lowest text-primary shadow-[0_1px_2px_rgba(7,30,39,0.06)] outline-none transition-[border-color,box-shadow,background-color] after:absolute after:-inset-2 hover:border-primary/40 hover:bg-surface focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/12 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:shadow-none dark:hover:bg-surface-container-low dark:focus-visible:bg-surface-container-low dark:aria-invalid:ring-destructive/25",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex flex-col size-5 items-center justify-center relative cursor-pointer"
      >
        <span className="size-2 rounded-full bg-primary-foreground absolute top-[24%]" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
