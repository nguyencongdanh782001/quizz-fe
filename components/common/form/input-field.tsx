"use client";

import { forwardRef } from "react";
import { Input as InputBase } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputFieldProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    { label, error, helperText, rightElement, className, id, ...props },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <Label
            htmlFor={inputId}
            className="text-xs font-bold text-[#1E293B]"
          >
            {label}
            {props.required && (
              <span className="text-rose-500 ml-0.5">*</span>
            )}
          </Label>
        )}
        <div className="relative">
          <InputBase
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              rightElement && "pr-10",
              error &&
                "border-destructive focus-visible:ring-destructive/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              "text-xs",
              error ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {error ?? helperText}
          </p>
        )}
      </div>
    );
  },
);
InputField.displayName = "InputField";
