"use client";

import { customAlphabet } from "nanoid";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const generateJoinCode = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  6,
);

function normalizeJoinCodeInput(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

interface ClassJoinCodeInputProps {
  disabled?: boolean;
  error?: string;
  helperText?: string;
  id: string;
  label: string;
  maxLength?: number;
  name?: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (value: string, source: "input" | "random") => void;
}

export function ClassJoinCodeInput({
  disabled = false,
  error,
  helperText = "Học sinh sẽ dùng mã này để tham gia lớp.",
  id,
  label,
  maxLength = 30,
  name = "join_code",
  placeholder,
  required = false,
  value,
  onChange,
}: ClassJoinCodeInputProps) {
  const hasError = Boolean(error);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-on-surface">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>

      <div className="flex gap-3">
        <Input
          id={id}
          name={name}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          aria-invalid={hasError}
          className={cn(
            "flex-1",
            hasError &&
              "border-destructive focus-visible:ring-destructive/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          )}
          onChange={(event) => {
            onChange(normalizeJoinCodeInput(event.target.value), "input");
          }}
        />

        <div className="flex h-11 items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={() => {
              onChange(generateJoinCode(), "random");
            }}
            title="Tạo mã ngẫu nhiên"
            aria-label="Tạo mã ngẫu nhiên"
            className="rounded-[6px]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p
        className={cn(
          "text-xs",
          hasError ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {error ?? helperText}
      </p>
    </div>
  );
}
