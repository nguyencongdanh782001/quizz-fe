"use client";

import { getIn, useFormikContext } from "formik";
import { ListChecks, Plus } from "lucide-react";
import { EXAM_FLOW_MESSAGES } from "@/components/exams/exam-flow-messages";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import type { TeacherExamFormValues } from "./types";
import { OptionItem } from "./option-item";
import { normalizeTeacherExamQuestionType } from "./utils";

export function ChoiceOptionsSection({
  questionIndex,
  onAddOption,
  onRemoveOption,
  onSelectSingleCorrectOption,
  onToggleMultipleCorrectOption,
}: {
  questionIndex: number;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onSelectSingleCorrectOption: (optionId: string) => void;
  onToggleMultipleCorrectOption: (optionId: string, checked: boolean) => void;
}) {
  const { values, errors, touched, submitCount } =
    useFormikContext<TeacherExamFormValues>();
  const question = values.questions[questionIndex];
  const questionStateTouched = getIn(touched, `questions.${questionIndex}`);
  const optionsError = getIn(errors, `questions.${questionIndex}.options`);
  const questionType = normalizeTeacherExamQuestionType(question.question_type);
  const isSingleChoiceQuestion = questionType === "single_choice";
  const correctOptionId =
    question.options.find((option) => option.is_correct)?.client_id ?? "";

  return (
    <div className="space-y-4 rounded-[26px] border border-outline/10 bg-surface/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ListChecks className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {EXAM_FLOW_MESSAGES.labels.answer}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {isSingleChoiceQuestion
                ? EXAM_FLOW_MESSAGES.validation.singleQuestionOnlyOneCorrect
                : EXAM_FLOW_MESSAGES.validation.minCorrectOptions}
            </p>
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onAddOption}>
          <Plus className="mr-2 h-4 w-4" />
          {EXAM_FLOW_MESSAGES.buttons.addOption}
        </Button>
      </div>

      {typeof optionsError === "string" &&
      (submitCount > 0 || Boolean(questionStateTouched)) ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {optionsError}
        </p>
      ) : null}

      {isSingleChoiceQuestion ? (
        <RadioGroup
          value={correctOptionId}
          onValueChange={onSelectSingleCorrectOption}
          className="space-y-3"
        >
          {question.options.map((option, optionIndex) => (
            <OptionItem
              key={option.client_id}
              questionIndex={questionIndex}
              optionIndex={optionIndex}
              optionId={option.client_id}
              selectionMode="single"
              isCorrect={option.is_correct}
              canRemove={question.options.length > 2}
              onRemove={() => onRemoveOption(optionIndex)}
              onCorrectChange={() => onSelectSingleCorrectOption(option.client_id)}
            />
          ))}
        </RadioGroup>
      ) : (
        <div className="space-y-3">
          {question.options.map((option, optionIndex) => (
            <OptionItem
              key={option.client_id}
              questionIndex={questionIndex}
              optionIndex={optionIndex}
              optionId={option.client_id}
              selectionMode="multiple"
              isCorrect={option.is_correct}
              canRemove={question.options.length > 2}
              onRemove={() => onRemoveOption(optionIndex)}
              onCorrectChange={(checked) =>
                onToggleMultipleCorrectOption(option.client_id, checked)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
