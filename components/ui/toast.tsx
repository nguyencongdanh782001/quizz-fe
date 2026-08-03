"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex min-h-[64px] w-full items-center gap-3.5 overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white px-4.5 py-4 pr-10 shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full dark:bg-[#1E293B] dark:border-slate-700",
  {
    variants: {
      variant: {
        default: "",
        success: "",
        warning: "",
        error: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const variantConfig = {
  default: {
    icon: Info,
    iconColor: "text-white fill-[#3498db]",
    barColor: "bg-[#3498db]",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-white fill-[#07bc0c]",
    barColor: "bg-[#07bc0c]",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-white fill-[#f1c40f]",
    barColor: "bg-[#f1c40f]",
  },
  error: {
    icon: XCircle,
    iconColor: "text-white fill-[#e74c3c]",
    barColor: "bg-[#e74c3c]",
  },
};

function ToastProvider({
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider swipeDirection="right" {...props} />;
}

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        "fixed top-4 right-4 z-60 flex w-[min(100vw-1rem,22.5rem)] max-w-full flex-col gap-3 outline-none",
        className,
      )}
      {...props}
    />
  );
}

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {
  duration?: number;
  showIcon?: boolean;
  showProgressBar?: boolean;
}

function Toast({
  className,
  variant = "default",
  duration = 4000,
  showIcon = true,
  showProgressBar = true,
  children,
  ...props
}: ToastProps) {
  const currentVariant = variant ?? "default";
  const config = variantConfig[currentVariant] ?? variantConfig.default;
  const IconComponent = config.icon;

  return (
    <ToastPrimitive.Root
      duration={duration}
      className={cn(toastVariants({ variant: currentVariant }), className)}
      {...props}
    >
      {showIcon ? (
        <IconComponent className={cn("size-[22px] shrink-0", config.iconColor)} />
      ) : null}
      <div className="flex-1 min-w-0">{children}</div>
      {showProgressBar ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 bottom-0 h-[3px] origin-left",
            config.barColor,
          )}
          style={{
            animation: `toastProgress ${duration}ms linear forwards`,
          }}
        />
      ) : null}
    </ToastPrimitive.Root>
  );
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      className={cn(
        "text-sm font-medium text-[#2c3e50] dark:text-slate-100 leading-snug",
        className,
      )}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      className={cn(
        "text-xs text-[#7f8c8d] dark:text-slate-400 mt-0.5 leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      className={cn(
        "absolute top-3.5 right-3 inline-flex size-5 items-center justify-center rounded text-[#95a5a6] hover:text-[#2c3e50] dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <X className="size-3.5 stroke-[2.5]" />
    </ToastPrimitive.Close>
  );
}

export {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
};

