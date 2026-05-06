"use client";

import { getIn, useFormikContext } from "formik";
import { Trash2 } from "lucide-react";
import { InputField } from "@/components/common/form/input-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { TeacherExamFormValues } from "./types";

const OPTION_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function OptionItem({
  questionIndex,
  optionIndex,
  optionId,
  isCorrect,
  canRemove,
  onRemove,
}: {
  questionIndex: number;
  optionIndex: number;
  optionId: string;
  isCorrect: boolean;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const { values, errors, touched, setFieldValue, submitCount } =
    useFormikContext<TeacherExamFormValues>();
  const option = values.questions[questionIndex].options[optionIndex];
  const optionError = getIn(
    errors,
    `questions.${questionIndex}.options.${optionIndex}.option_text`,
  );
  const optionTouched = getIn(
    touched,
    `questions.${questionIndex}.options.${optionIndex}.option_text`,
  );
  const imageError = getIn(
    errors,
    `questions.${questionIndex}.options.${optionIndex}.image_url`,
  );
  const imageTouched = getIn(
    touched,
    `questions.${questionIndex}.options.${optionIndex}.image_url`,
  );
  const shouldShowError = (fieldTouched: unknown, fieldError: unknown) =>
    (submitCount > 0 || Boolean(fieldTouched)) && typeof fieldError === "string"
      ? fieldError
      : undefined;
  const radioId = `question-${questionIndex}-option-${optionId}`;

  return (
    <div
      className={cn(
        "rounded-3xl border p-4 transition-all duration-200",
        isCorrect
          ? "border-primary/30 bg-primary/5 shadow-[0_18px_40px_-30px_rgba(0,70,74,0.45)]"
          : "border-outline/15 bg-surface-container-lowest hover:border-primary/20 hover:bg-surface",
      )}
    >
      <div className="flex items-start gap-3">
        <RadioGroupItem id={radioId} value={optionId} className="mt-1.5" />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Label
                  htmlFor={radioId}
                  className="text-sm font-semibold text-on-surface"
                >
                  Đáp án {OPTION_KEYS[optionIndex] ?? optionIndex + 1}
                </Label>
                {isCorrect ? (
                  <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
                    Đáp án đúng
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Chọn nút tròn để đánh dấu đáp án đúng.
              </p>
            </div>

            {canRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={onRemove}
                aria-label={`Xóa đáp án ${
                  OPTION_KEYS[optionIndex] ?? optionIndex + 1
                }`}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            ) : null}
          </div>

          <InputField
            id={`${radioId}-text`}
            label="Nội dung đáp án"
            required
            value={option.option_text}
            onChange={(event) =>
              void setFieldValue(
                `questions.${questionIndex}.options.${optionIndex}.option_text`,
                event.target.value,
              )
            }
            error={shouldShowError(optionTouched, optionError)}
            placeholder={`Nhập nội dung đáp án ${
              OPTION_KEYS[optionIndex] ?? optionIndex + 1
            }`}
          />

          <InputField
            id={`${radioId}-image`}
            label="Hình minh họa (tùy chọn)"
            value={option.image_url}
            onChange={(event) =>
              void setFieldValue(
                `questions.${questionIndex}.options.${optionIndex}.image_url`,
                event.target.value,
              )
            }
            error={shouldShowError(imageTouched, imageError)}
            placeholder="https://example.com/option-image.png"
            helperText="Chỉ dùng khi đáp án cần thêm hình ảnh minh họa."
          />
        </div>
      </div>
    </div>
  );
}
