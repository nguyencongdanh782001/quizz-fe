"use client";

import { getIn, useFormikContext } from "formik";
import { Trash2 } from "lucide-react";
import { EXAM_FLOW_MESSAGES } from "@/components/exams/exam-flow-messages";
import { InputField } from "@/components/common/form/input-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { TeacherExamFormValues } from "./types";
import { ImageUploadField } from "./image-upload-field";

const OPTION_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type OptionSelectionMode = "single" | "multiple";

export function OptionItem({
  questionIndex,
  optionIndex,
  optionId,
  selectionMode,
  isCorrect,
  canRemove,
  readOnly = false,
  onRemove,
  onCorrectChange,
}: {
  questionIndex: number;
  optionIndex: number;
  optionId: string;
  selectionMode: OptionSelectionMode;
  isCorrect: boolean;
  canRemove: boolean;
  readOnly?: boolean;
  onRemove: () => void;
  onCorrectChange: (checked: boolean) => void;
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
  const controlId = `question-${questionIndex}-option-${optionId}`;
  const helperText =
    selectionMode === "single"
      ? "Chọn nút tròn để đánh dấu đáp án đúng."
      : "Có thể chọn nhiều ô vuông nếu câu hỏi có nhiều đáp án đúng.";

  return (
    <div
      className={cn(
        "rounded-[8px] border p-4 transition-all duration-200",
        isCorrect
          ? "border-primary/30 bg-primary/5 shadow-[0_18px_40px_-30px_rgba(0,70,74,0.45)]"
          : "border-outline/15 bg-surface-container-lowest hover:border-primary/20 hover:bg-surface",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1.5">
          {selectionMode === "single" ? (
            <RadioGroupItem id={controlId} value={optionId} />
          ) : (
            <Checkbox
              id={controlId}
              checked={isCorrect}
              onCheckedChange={(checked) => onCorrectChange(checked === true)}
              aria-label={`Đánh dấu đáp án ${
                OPTION_KEYS[optionIndex] ?? optionIndex + 1
              } là đáp án đúng`}
            />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Label
                  htmlFor={controlId}
                  className="text-sm font-semibold text-on-surface"
                >
                  {EXAM_FLOW_MESSAGES.labels.answer}{" "}
                  {OPTION_KEYS[optionIndex] ?? optionIndex + 1}
                </Label>
                {isCorrect ? (
                  <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
                    Đáp án đúng
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {helperText}
              </p>
            </div>

            {canRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={onRemove}
                aria-label={`${EXAM_FLOW_MESSAGES.buttons.deleteOption} ${
                  OPTION_KEYS[optionIndex] ?? optionIndex + 1
                }`}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            ) : null}
          </div>

          {readOnly ? (
            <div className="rounded-lg border border-outline/15 bg-surface px-4 py-3 text-sm font-medium text-on-surface">
              {option.option_text}
            </div>
          ) : (
            <>
              <InputField
                id={`${controlId}-text`}
                label={EXAM_FLOW_MESSAGES.labels.answer}
                required
                value={option.option_text}
                onChange={(event) =>
                  void setFieldValue(
                    `questions.${questionIndex}.options.${optionIndex}.option_text`,
                    event.target.value,
                  )
                }
                error={shouldShowError(optionTouched, optionError)}
                placeholder={EXAM_FLOW_MESSAGES.placeholders.option}
              />

              <ImageUploadField
                id={`${controlId}-image`}
                label="Ảnh đáp án (tùy chọn)"
                value={option.image_url}
                onChange={(url) =>
                  void setFieldValue(
                    `questions.${questionIndex}.options.${optionIndex}.image_url`,
                    url,
                  )
                }
                error={shouldShowError(imageTouched, imageError)}
                helperText="Chỉ dùng khi đáp án cần thêm hình ảnh minh họa."
                size="compact"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
