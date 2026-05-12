"use client";

import { getIn, useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import {
  ArrowDown,
  ArrowUp,
  CircleHelp,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import { InputField } from "@/components/common/form/input-field";
import { SelectField } from "@/components/common/form/select-field";
import { TextareaField } from "@/components/common/form/textarea-field";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { TeacherExamFormValues } from "./types";
import { createEmptyOption, normalizeTeacherExamQuestionType } from "./utils";
import { OptionItem } from "./option-item";

function normalizeOptionsForSingleChoice(
  options: TeacherExamFormValues["questions"][number]["options"],
) {
  const nextOptions =
    options.length >= 2
      ? options
      : [createEmptyOption(true), createEmptyOption(false)];
  const hasCorrect = nextOptions.some((option) => option.is_correct);

  return nextOptions.map((option, index) => ({
    ...option,
    is_correct: hasCorrect ? option.is_correct : index === 0,
  }));
}

export function QuestionItem({
  questionIndex,
  onRemove,
  onMoveUp,
  onMoveDown,
  canRemove,
  canMoveUp,
  canMoveDown,
  shouldAutoFocus,
  onAutoFocusHandled,
  isRemoving,
}: {
  questionIndex: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  shouldAutoFocus: boolean;
  onAutoFocusHandled: () => void;
  isRemoving: boolean;
}) {
  const { values, errors, touched, setFieldValue, submitCount } =
    useFormikContext<TeacherExamFormValues>();
  const cardRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const question = values.questions[questionIndex];
  const questionType = normalizeTeacherExamQuestionType(question.question_type);
  const isSingleChoiceQuestion = questionType === "single_choice";
  const questionTypeError = getIn(
    errors,
    `questions.${questionIndex}.question_type`,
  );
  const questionTypeTouched = getIn(
    touched,
    `questions.${questionIndex}.question_type`,
  );
  const questionError = getIn(errors, `questions.${questionIndex}.prompt`);
  const questionTouched = getIn(touched, `questions.${questionIndex}.prompt`);
  const imageError = getIn(errors, `questions.${questionIndex}.image_url`);
  const imageTouched = getIn(touched, `questions.${questionIndex}.image_url`);
  const pointsError = getIn(errors, `questions.${questionIndex}.points`);
  const pointsTouched = getIn(touched, `questions.${questionIndex}.points`);
  const acceptedAnswersError = getIn(
    errors,
    `questions.${questionIndex}.accepted_answers`,
  );
  const acceptedAnswersTouched = getIn(
    touched,
    `questions.${questionIndex}.accepted_answers`,
  );
  const optionsError = getIn(errors, `questions.${questionIndex}.options`);
  const questionStateError = getIn(errors, `questions.${questionIndex}`);
  const questionStateTouched = getIn(touched, `questions.${questionIndex}`);
  const shouldShowError = (fieldTouched: unknown, fieldError: unknown) =>
    (submitCount > 0 || Boolean(fieldTouched)) && typeof fieldError === "string"
      ? fieldError
      : undefined;
  const shouldHighlightQuestionError =
    Boolean(questionStateError) &&
    (submitCount > 0 || Boolean(questionStateTouched));
  const correctOptionId =
    question.options.find((option) => option.is_correct)?.client_id ?? "";

  useEffect(() => {
    if (!shouldAutoFocus) {
      return;
    }

    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    const frame = window.requestAnimationFrame(() => {
      promptRef.current?.focus();
      onAutoFocusHandled();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [onAutoFocusHandled, shouldAutoFocus]);

  function handleQuestionTypeChange(value: string) {
    const nextQuestionType = normalizeTeacherExamQuestionType(value);

    void setFieldValue(
      `questions.${questionIndex}.question_type`,
      nextQuestionType,
    );

    if (nextQuestionType === "single_choice") {
      void setFieldValue(
        `questions.${questionIndex}.options`,
        normalizeOptionsForSingleChoice(question.options),
      );
    }
  }

  function handleCorrectOptionChange(selectedOptionId: string) {
    void setFieldValue(
      `questions.${questionIndex}.options`,
      question.options.map((option) => ({
        ...option,
        is_correct: option.client_id === selectedOptionId,
      })),
    );
  }

  function handleAddOption() {
    void setFieldValue(
      `questions.${questionIndex}.options`,
      normalizeOptionsForSingleChoice([
        ...question.options,
        createEmptyOption(false),
      ]),
    );
  }

  function handleRemoveOption(optionIndex: number) {
    const nextOptions = question.options.filter(
      (_, currentIndex) => currentIndex !== optionIndex,
    );
    const hasCorrect = nextOptions.some((option) => option.is_correct);

    void setFieldValue(
      `questions.${questionIndex}.options`,
      nextOptions.map((option, index) => ({
        ...option,
        is_correct: hasCorrect ? option.is_correct : index === 0,
      })),
    );
  }

  return (
    <div
      ref={cardRef}
      id={`question-${question.client_id}`}
      tabIndex={-1}
      className={cn(
        "rounded-[28px] border p-5 shadow-[0_18px_44px_-34px_rgba(7,30,39,0.18)] outline-none transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2",
        shouldHighlightQuestionError
          ? "border-destructive/30 bg-destructive/5"
          : "border-outline/15 bg-surface-container-lowest",
        isRemoving && "animate-out fade-out-0 zoom-out-95 slide-out-to-right-2",
      )}
    >
      <div className="mb-5 flex flex-col gap-4 border-b border-outline/10 pb-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
            {questionIndex + 1}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-on-surface">
                Câu hỏi {questionIndex + 1}
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold",
                  isSingleChoiceQuestion
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/15 text-secondary",
                )}
              >
                {isSingleChoiceQuestion ? "Trắc nghiệm" : "Tự luận"}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Sắp xếp nội dung, chọn loại câu hỏi và hoàn thiện đáp án ngay trên
              thẻ này.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={`Đưa câu hỏi ${questionIndex + 1} lên trên`}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={`Đưa câu hỏi ${questionIndex + 1} xuống dưới`}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          {canRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              aria-label={`Xóa câu hỏi ${questionIndex + 1}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-5">
        <TextareaField
          ref={promptRef}
          id={`question-${question.client_id}-prompt`}
          label="Nội dung câu hỏi"
          required
          value={question.prompt}
          onChange={(event) =>
            void setFieldValue(
              `questions.${questionIndex}.prompt`,
              event.target.value,
            )
          }
          error={shouldShowError(questionTouched, questionError)}
          placeholder="Nhập nội dung câu hỏi"
          rows={4}
          helperText="Viết rõ yêu cầu để học sinh có thể trả lời mà không cần đoán ý."
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,220px)_minmax(0,140px)_minmax(0,1fr)]">
          <SelectField
            label="Loại câu hỏi"
            name={`questions.${questionIndex}.question_type`}
            required
            value={questionType}
            onValueChange={handleQuestionTypeChange}
            error={shouldShowError(questionTypeTouched, questionTypeError)}
            placeholder="Chọn loại câu hỏi"
            options={[
              {
                value: "single_choice",
                label: "Trắc nghiệm một đáp án",
              },
              {
                value: "text",
                label: "Tự luận ngắn",
              },
            ]}
          />

          <InputField
            id={`question-${question.client_id}-points`}
            label="Điểm"
            required
            type="number"
            min={1}
            value={question.points}
            onChange={(event) =>
              void setFieldValue(
                `questions.${questionIndex}.points`,
                Number(event.target.value),
              )
            }
            error={shouldShowError(pointsTouched, pointsError)}
            placeholder="1"
          />

          <InputField
            id={`question-${question.client_id}-image`}
            label="Hình minh họa (tùy chọn)"
            value={question.image_url}
            onChange={(event) =>
              void setFieldValue(
                `questions.${questionIndex}.image_url`,
                event.target.value,
              )
            }
            error={shouldShowError(imageTouched, imageError)}
            placeholder="https://example.com/question-image.png"
          />
        </div>

        {isSingleChoiceQuestion ? (
          <div className="space-y-4 rounded-[26px] border border-outline/10 bg-surface/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ListChecks className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    Danh sách đáp án
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Hệ thống luôn giữ tối thiểu 2 đáp án và yêu cầu chọn đúng 1
                    đáp án chính xác.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm đáp án
              </Button>
            </div>

            {typeof optionsError === "string" &&
            (submitCount > 0 || Boolean(questionStateTouched)) ? (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {optionsError}
              </p>
            ) : null}

            <RadioGroup
              value={correctOptionId}
              onValueChange={handleCorrectOptionChange}
              className="space-y-3"
            >
              {question.options.map((option, optionIndex) => (
                <OptionItem
                  key={option.client_id}
                  questionIndex={questionIndex}
                  optionIndex={optionIndex}
                  optionId={option.client_id}
                  isCorrect={option.is_correct}
                  canRemove={question.options.length > 2}
                  onRemove={() => handleRemoveOption(optionIndex)}
                />
              ))}
            </RadioGroup>
          </div>
        ) : (
          <div className="rounded-[26px] border border-outline/10 bg-surface/50 p-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
                <CircleHelp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Đáp án tự luận
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Nhập câu trả lời mẫu để giáo viên hoặc hệ thống đối chiếu khi
                  chấm bài.
                </p>
              </div>
            </div>

            <TextareaField
              id={`question-${question.client_id}-accepted-answers`}
              label="Đáp án"
              required
              value={question.accepted_answers}
              onChange={(event) =>
                void setFieldValue(
                  `questions.${questionIndex}.accepted_answers`,
                  event.target.value,
                )
              }
              error={shouldShowError(
                acceptedAnswersTouched,
                acceptedAnswersError,
              )}
              placeholder="Nhập mỗi đáp án chấp nhận trên một dòng hoặc phân tách bằng dấu phẩy."
              helperText="Nếu có nhiều cách trả lời đúng, hãy nhập mỗi cách trên một dòng riêng."
              rows={4}
            />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-[28px] border border-dashed border-outline/30 bg-surface px-4 py-5 text-sm font-medium text-on-surface transition-all",
            "hover:border-primary/35 hover:bg-primary/5 hover:text-primary",
          )}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm đáp án
        </Button>
      </div>
    </div>
  );
}
