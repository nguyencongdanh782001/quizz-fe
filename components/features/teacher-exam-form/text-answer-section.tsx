"use client";

import { getIn, useFormikContext } from "formik";
import { CircleHelp, Plus, Trash2 } from "lucide-react";
import { EXAM_FLOW_MESSAGES } from "@/components/exams/exam-flow-messages";
import { InputField } from "@/components/common/form/input-field";
import { Button } from "@/components/ui/button";
import type { TeacherExamFormValues } from "./types";

function getFieldError(
  error: unknown,
  touched: unknown,
  submitCount: number,
): string | undefined {
  return (submitCount > 0 || Boolean(touched)) && typeof error === "string"
    ? error
    : undefined;
}

export function TextAnswerSection({
  questionIndex,
}: {
  questionIndex: number;
}) {
  const { values, errors, touched, setFieldValue, submitCount } =
    useFormikContext<TeacherExamFormValues>();
  const question = values.questions[questionIndex];
  const answersError = getIn(errors, `questions.${questionIndex}.accepted_answers`);
  const answersTouched = getIn(
    touched,
    `questions.${questionIndex}.accepted_answers`,
  );
  const questionTouched = getIn(touched, `questions.${questionIndex}`);

  function handleAnswerChange(answerIndex: number, value: string) {
    const nextAnswers = [...question.accepted_answers];
    nextAnswers[answerIndex] = value;
    void setFieldValue(
      `questions.${questionIndex}.accepted_answers`,
      nextAnswers,
    );
  }

  function handleAddAnswer() {
    void setFieldValue(`questions.${questionIndex}.accepted_answers`, [
      ...question.accepted_answers,
      "",
    ]);
  }

  function handleRemoveAnswer(answerIndex: number) {
    if (question.accepted_answers.length <= 1) {
      return;
    }

    void setFieldValue(
      `questions.${questionIndex}.accepted_answers`,
      question.accepted_answers.filter((_, index) => index !== answerIndex),
    );
  }

  return (
    <div className="rounded-[26px] border border-outline/10 bg-surface/50 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
            <CircleHelp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {EXAM_FLOW_MESSAGES.labels.acceptedAnswers}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Thêm từng đáp án chấp nhận để đối chiếu nhanh khi chấm bài.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAnswer}
        >
          <Plus className="mr-2 h-4 w-4" />
          {EXAM_FLOW_MESSAGES.buttons.addOption}
        </Button>
      </div>

      {typeof answersError === "string" &&
      (submitCount > 0 || Boolean(answersTouched)) ? (
        <p className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {answersError}
        </p>
      ) : null}

      <div className="space-y-3">
        {question.accepted_answers.map((answer, answerIndex) => {
          const answerError = getIn(
            errors,
            `questions.${questionIndex}.accepted_answers.${answerIndex}`,
          );
          const answerTouched = getIn(
            touched,
            `questions.${questionIndex}.accepted_answers.${answerIndex}`,
          );
          const resolvedAnswerTouched = answerTouched || answersTouched || questionTouched;

          return (
            <div
              key={`${question.client_id}-answer-${answerIndex}`}
              className="rounded-3xl border border-outline/12 bg-surface-container-lowest p-4"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <InputField
                    id={`question-${question.client_id}-answer-${answerIndex}`}
                    label={`${EXAM_FLOW_MESSAGES.labels.acceptedAnswers} ${answerIndex + 1}`}
                    required
                    value={answer}
                    onChange={(event) =>
                      handleAnswerChange(answerIndex, event.target.value)
                    }
                    error={getFieldError(
                      answerError,
                      resolvedAnswerTouched,
                      submitCount,
                    )}
                    placeholder={EXAM_FLOW_MESSAGES.placeholders.acceptedAnswer}
                    helperText="Bạn có thể thêm nhiều đáp án nếu học sinh có nhiều cách diễn đạt đúng."
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleRemoveAnswer(answerIndex)}
                  disabled={question.accepted_answers.length <= 1}
                  aria-label={`${EXAM_FLOW_MESSAGES.buttons.deleteOption} ${answerIndex + 1}`}
                  className="mt-8"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
