"use client";

import { getIn, useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import {
  EXAM_FLOW_MESSAGES,
  getTeacherExamQuestionTypeLabel,
} from "@/components/exams/exam-flow-messages";
import { InputField } from "@/components/common/form/input-field";
import { SelectField } from "@/components/common/form/select-field";
import { TextareaField } from "@/components/common/form/textarea-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TeacherExamFormValues, TeacherExamQuestionType } from "./types";
import { ImageUploadField } from "./image-upload-field";
import { ChoiceOptionsSection } from "./choice-options-section";
import { TextAnswerSection } from "./text-answer-section";
import {
  applyTeacherExamQuestionType,
  createEmptyOption,
  formatTeacherExamPoints,
  getTeacherExamQuestionPoints,
  isTextQuestionType,
  normalizeTeacherExamQuestionType,
  normalizeChoiceOptions,
  reindexTeacherExamOptions,
} from "./utils";

const QUESTION_TYPE_OPTIONS: Array<{
  label: string;
  value: TeacherExamQuestionType;
}> = [
  {
    value: "single_choice",
    label: EXAM_FLOW_MESSAGES.questionTypes.single,
  },
  {
    value: "multiple_choice",
    label: EXAM_FLOW_MESSAGES.questionTypes.multiple,
  },
  {
    value: "true_false",
    label: EXAM_FLOW_MESSAGES.questionTypes.trueFalse,
  },
  {
    value: "fill_in_blank",
    label: EXAM_FLOW_MESSAGES.questionTypes.fillInBlank,
  },
  {
    value: "short_answer",
    label: EXAM_FLOW_MESSAGES.questionTypes.shortAnswer,
  },
  {
    value: "text",
    label: EXAM_FLOW_MESSAGES.questionTypes.text,
  },
];

const QUESTION_TYPE_BADGE_CONFIG: Record<
  TeacherExamQuestionType,
  { badgeClassName: string; label: string }
> = {
  single_choice: {
    badgeClassName: "bg-primary/10 text-primary",
    label: getTeacherExamQuestionTypeLabel("single_choice"),
  },
  multiple_choice: {
    badgeClassName: "bg-tertiary/12 text-tertiary",
    label: getTeacherExamQuestionTypeLabel("multiple_choice"),
  },
  true_false: {
    badgeClassName: "bg-emerald-100 text-emerald-700",
    label: getTeacherExamQuestionTypeLabel("true_false"),
  },
  fill_in_blank: {
    badgeClassName: "bg-sky-100 text-sky-700",
    label: getTeacherExamQuestionTypeLabel("fill_in_blank"),
  },
  short_answer: {
    badgeClassName: "bg-amber-100 text-amber-700",
    label: getTeacherExamQuestionTypeLabel("short_answer"),
  },
  text: {
    badgeClassName: "bg-secondary/15 text-secondary",
    label: getTeacherExamQuestionTypeLabel("text"),
  },
};

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
  const questionPoints = getTeacherExamQuestionPoints(
    questionIndex,
    values.questions.length,
  );
  const questionType = normalizeTeacherExamQuestionType(question.question_type);
  const badgeConfig = QUESTION_TYPE_BADGE_CONFIG[questionType];
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
  const explanationError = getIn(
    errors,
    `questions.${questionIndex}.explanation`,
  );
  const explanationTouched = getIn(
    touched,
    `questions.${questionIndex}.explanation`,
  );
  const imageError = getIn(errors, `questions.${questionIndex}.image_url`);
  const imageTouched = getIn(touched, `questions.${questionIndex}.image_url`);
  const questionStateError = getIn(errors, `questions.${questionIndex}`);
  const questionStateTouched = getIn(touched, `questions.${questionIndex}`);
  const shouldShowError = (fieldTouched: unknown, fieldError: unknown) =>
    (submitCount > 0 || Boolean(fieldTouched)) && typeof fieldError === "string"
      ? fieldError
      : undefined;
  const shouldHighlightQuestionError =
    Boolean(questionStateError) &&
    (submitCount > 0 || Boolean(questionStateTouched));

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
      `questions.${questionIndex}`,
      applyTeacherExamQuestionType(question, nextQuestionType),
    );
  }

  function handleAddOption() {
    if (isTextQuestionType(questionType) || questionType === "true_false") {
      return;
    }

    const nextOptions =
      questionType === "single_choice"
        ? normalizeChoiceOptions(questionType, [
            ...question.options,
            createEmptyOption(false),
          ])
        : reindexTeacherExamOptions([
            ...question.options,
            createEmptyOption(false),
          ]);

    void setFieldValue(`questions.${questionIndex}.options`, nextOptions);
  }

  function handleRemoveOption(optionIndex: number) {
    if (questionType === "true_false") {
      return;
    }

    const nextOptions = question.options.filter(
      (_, currentIndex) => currentIndex !== optionIndex,
    );

    if (questionType === "single_choice") {
      void setFieldValue(
        `questions.${questionIndex}.options`,
        normalizeChoiceOptions(questionType, nextOptions),
      );
      return;
    }

    void setFieldValue(
      `questions.${questionIndex}.options`,
      reindexTeacherExamOptions(nextOptions),
    );
  }

  function handleSingleCorrectOptionChange(selectedOptionId: string) {
    void setFieldValue(
      `questions.${questionIndex}.options`,
      normalizeChoiceOptions(
        questionType === "true_false" ? "true_false" : "single_choice",
        question.options.map((option) => ({
          ...option,
          is_correct: option.client_id === selectedOptionId,
        })),
      ),
    );
  }

  function handleMultipleCorrectOptionChange(
    selectedOptionId: string,
    checked: boolean,
  ) {
    void setFieldValue(
      `questions.${questionIndex}.options`,
      reindexTeacherExamOptions(
        question.options.map((option) =>
          option.client_id === selectedOptionId
            ? { ...option, is_correct: checked }
            : option,
        ),
      ),
    );
  }

  return (
    <div
      ref={cardRef}
      id={`question-${question.client_id}`}
      tabIndex={-1}
      className={cn(
        "rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(30,41,59,0.08)] outline-none transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2",
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
                {EXAM_FLOW_MESSAGES.labels.question} {questionIndex + 1}
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold",
                  badgeConfig.badgeClassName,
                )}
              >
                {badgeConfig.label}
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
          label={EXAM_FLOW_MESSAGES.labels.question}
          required
          value={question.prompt}
          onChange={(event) =>
            void setFieldValue(
              `questions.${questionIndex}.prompt`,
              event.target.value,
            )
          }
          error={shouldShowError(questionTouched, questionError)}
          placeholder={EXAM_FLOW_MESSAGES.placeholders.question}
          rows={4}
          helperText="Viết rõ yêu cầu để học sinh có thể trả lời mà không cần đoán ý."
        />

        <TextareaField
          id={`question-${question.client_id}-explanation`}
          label={EXAM_FLOW_MESSAGES.labels.explanation}
          value={question.explanation}
          onChange={(event) =>
            void setFieldValue(
              `questions.${questionIndex}.explanation`,
              event.target.value,
            )
          }
          error={shouldShowError(explanationTouched, explanationError)}
          placeholder={EXAM_FLOW_MESSAGES.placeholders.explanation}
          rows={3}
          helperText="Có thể để trống nếu câu hỏi không cần giải thích thêm."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label={EXAM_FLOW_MESSAGES.labels.questionType}
            name={`questions.${questionIndex}.question_type`}
            required
            value={questionType}
            onValueChange={handleQuestionTypeChange}
            error={shouldShowError(questionTypeTouched, questionTypeError)}
            placeholder={EXAM_FLOW_MESSAGES.labels.questionType}
            options={QUESTION_TYPE_OPTIONS}
          />

          <InputField
            id={`question-${question.client_id}-points`}
            label="Điểm (tự động)"
            type="number"
            min={0}
            step="any"
            readOnly
            value={questionPoints}
            helperText={`${formatTeacherExamPoints(questionPoints)} điểm trên tổng 10 điểm.`}
            className="bg-[#F8FAFC]"
          />
        </div>

        <ImageUploadField
          id={`question-${question.client_id}-image`}
          label="Ảnh câu hỏi (tùy chọn)"
          value={question.image_url}
          onChange={(url) =>
            void setFieldValue(`questions.${questionIndex}.image_url`, url)
          }
          error={shouldShowError(imageTouched, imageError)}
          helperText="Dùng khi câu hỏi cần biểu đồ, hình minh họa hoặc ngữ cảnh trực quan."
          size="compact"
        />

        {isTextQuestionType(questionType) ? (
          <TextAnswerSection questionIndex={questionIndex} />
        ) : (
          <ChoiceOptionsSection
            questionIndex={questionIndex}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
            onSelectSingleCorrectOption={handleSingleCorrectOptionChange}
            onToggleMultipleCorrectOption={handleMultipleCorrectOptionChange}
          />
        )}
      </div>
    </div>
  );
}
