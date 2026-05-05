"use client";

import { customAlphabet } from "nanoid";
import { useField, useFormikContext } from "formik";
import { RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CreateClassFormValues } from "./create-class-form";

const generateJoinCode = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  6,
);

export function JoinCodeField() {
  const [field, meta, helpers] = useField("join_code");
  const { setStatus } = useFormikContext<CreateClassFormValues>();
  const hasError = Boolean(meta.touched && meta.error);

  function handleRandomCode() {
    setStatus(undefined);
    void helpers.setValue(generateJoinCode());
    void helpers.setTouched(true);
  }

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor="join_code"
        className="text-sm font-medium text-on-surface"
      >
        Mã vào lớp
        <span className="ml-0.5 text-destructive">*</span>
      </Label>

      <div className="flex gap-3">
        <Input
          id="join_code"
          placeholder="Ví dụ: CVAN-10A1"
          maxLength={30}
          aria-invalid={hasError}
          className={cn(
            "flex-1",
            hasError &&
              "border-destructive focus-visible:ring-destructive/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          )}
          {...field}
          onChange={(event) => {
            setStatus(undefined);
            void helpers.setValue(event.target.value.toUpperCase());
          }}
        />
        <div className="h-11 flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRandomCode}
            title="Generate code"
            aria-label="Generate code"
            className="rounded-full"
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
        {hasError ? meta.error : "Học sinh sẽ dùng mã này để tham gia lớp."}
      </p>
    </div>
  );
}
