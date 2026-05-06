"use client";

import { FieldArray, useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { ListChecks, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TeacherExamFormValues } from "./types";
import { createEmptyQuestion, normalizeTeacherExamQuestionType } from "./utils";
import { QuestionItem } from "./question-item";

function getTotalPoints(values: TeacherExamFormValues): number {
  return values.questions.reduce(
    (sum, question) => sum + (Number(question.points) || 0),
    0,
  );
}

export function QuestionBuilderStep() {
  const { values, errors, touched } = useFormikContext<TeacherExamFormValues>();
  const [autoFocusQuestionId, setAutoFocusQuestionId] = useState<string | null>(
    null,
  );
  const [removingQuestionId, setRemovingQuestionId] = useState<string | null>(
    null,
  );
  const removeTimerRef = useRef<number | null>(null);
  const questionCount = values.questions.length;
  const totalPoints = getTotalPoints(values);
  const singleChoiceCount = values.questions.filter(
    (question) =>
      normalizeTeacherExamQuestionType(question.question_type) ===
      "single_choice",
  ).length;
  const textQuestionCount = questionCount - singleChoiceCount;
  const questionListError =
    typeof errors.questions === "string" ? errors.questions : undefined;
  const showQuestionListError =
    Boolean(questionListError) && Boolean(touched.questions);

  useEffect(() => {
    return () => {
      if (removeTimerRef.current !== null) {
        window.clearTimeout(removeTimerRef.current);
      }
    };
  }, []);

  return (
    <FieldArray name="questions">
      {({ push, remove, move }) => {
        function handleAddQuestion() {
          const nextQuestion = createEmptyQuestion();
          setAutoFocusQuestionId(nextQuestion.client_id);
          push(nextQuestion);
        }

        function handleRemoveQuestion(
          questionIndex: number,
          questionId: string,
        ) {
          setRemovingQuestionId(questionId);

          if (removeTimerRef.current !== null) {
            window.clearTimeout(removeTimerRef.current);
          }

          removeTimerRef.current = window.setTimeout(() => {
            remove(questionIndex);
            setRemovingQuestionId((current) =>
              current === questionId ? null : current,
            );
          }, 180);
        }

        return (
          <Card className="rounded-[32px] border-0 bg-surface-container-lowest shadow-[0_24px_70px_-46px_rgba(7,30,39,0.24)]">
            <CardHeader className="border-b border-outline/10 pb-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-2xl text-on-surface">
                      Bước 2. Xây dựng câu hỏi
                    </CardTitle>
                    <CardDescription className="mt-2 max-w-3xl text-sm leading-relaxed">
                      Thêm câu hỏi theo từng thẻ riêng, chỉnh sửa đáp án trực
                      tiếp và sắp xếp thứ tự để bài thi dễ đọc hơn.
                    </CardDescription>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleAddQuestion}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm câu hỏi
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {questionCount} câu hỏi
                </span>
                <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                  {singleChoiceCount} trắc nghiệm
                </span>
                <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                  {textQuestionCount} tự luận
                </span>
                <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                  {totalPoints} điểm
                </span>
              </div>

              {showQuestionListError ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {questionListError}
                </div>
              ) : null}

              <div className="space-y-4">
                {values.questions.map((question, questionIndex) => (
                  <QuestionItem
                    key={question.client_id}
                    questionIndex={questionIndex}
                    canRemove={values.questions.length > 1}
                    canMoveUp={questionIndex > 0}
                    canMoveDown={questionIndex < values.questions.length - 1}
                    onRemove={() =>
                      handleRemoveQuestion(questionIndex, question.client_id)
                    }
                    onMoveUp={() => move(questionIndex, questionIndex - 1)}
                    onMoveDown={() => move(questionIndex, questionIndex + 1)}
                    shouldAutoFocus={autoFocusQuestionId === question.client_id}
                    onAutoFocusHandled={() =>
                      setAutoFocusQuestionId((current) =>
                        current === question.client_id ? null : current,
                      )
                    }
                    isRemoving={removingQuestionId === question.client_id}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-[28px] border border-dashed border-outline/30 bg-surface px-4 py-5 text-sm font-medium text-on-surface transition-all",
                  "hover:border-primary/35 hover:bg-primary/5 hover:text-primary",
                )}
              >
                <Sparkles className="h-4 w-4" />
                Thêm một câu hỏi mới và chuyển tới ngay thẻ đó
              </button>
            </CardContent>
          </Card>
        );
      }}
    </FieldArray>
  );
}
