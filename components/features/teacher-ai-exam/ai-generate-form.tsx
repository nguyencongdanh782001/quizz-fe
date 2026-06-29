"use client";

import { CircleHelp, ClipboardList, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import type { AIExamDifficulty, AIExamQuestionType } from "@/lib/api/types";
import type { GenerateAIExamFormState } from "./types";
import {
  AI_DIFFICULTY_OPTIONS,
  AI_EXAM_CONTEXT_TEMPLATES,
  AI_QUESTION_TYPE_OPTIONS,
  buildBalancedDifficultyDistribution,
  clampNumber,
  getDifficultyTotal,
  getQuestionTypeDistributionTotal,
} from "./utils";

interface AIGenerateFormProps {
  error?: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onValuesChange: (values: GenerateAIExamFormState) => void;
  values: GenerateAIExamFormState;
}

function parseInteger(value: string, fallback: number): number {
  if (value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

export function AIGenerateForm({
  error,
  isGenerating,
  onGenerate,
  onValuesChange,
  values,
}: AIGenerateFormProps) {
  const difficultyTotal = getDifficultyTotal(values.difficulty_distribution);
  const selectedQuestionTypeOptions = AI_QUESTION_TYPE_OPTIONS.filter((option) =>
    values.question_types.includes(option.value),
  );
  const questionTypeTotal = getQuestionTypeDistributionTotal(
    values.question_type_distribution,
    values.question_types,
  );
  const hasBalancedQuestionTypes =
    questionTypeTotal === values.question_count;

  function updateValues(patch: Partial<GenerateAIExamFormState>) {
    onValuesChange({
      ...values,
      ...patch,
    });
  }

  function toggleQuestionType(questionType: AIExamQuestionType) {
    const selected = values.question_types.includes(questionType);
    const nextTypes = selected
      ? values.question_types.filter((item) => item !== questionType)
      : [...values.question_types, questionType];
    const nextDistribution = {
      ...values.question_type_distribution,
      [questionType]: selected
        ? 0
        : values.question_type_distribution[questionType] || 1,
    };

    updateValues({
      question_type_distribution: nextDistribution,
      question_types: nextTypes,
    });
  }

  function updateQuestionTypeCount(
    questionType: AIExamQuestionType,
    nextValue: number,
  ) {
    const nextDistribution = {
      ...values.question_type_distribution,
      [questionType]: clampNumber(nextValue, 1, 50),
    };

    updateValues({
      question_type_distribution: nextDistribution,
    });
  }

  function updateQuestionCount(nextValue: number) {
    const questionCount = clampNumber(nextValue, 1, 50);

    updateValues({
      difficulty_distribution:
        buildBalancedDifficultyDistribution(questionCount),
      question_count: questionCount,
    });
  }

  function updateDifficulty(
    difficulty: AIExamDifficulty,
    nextValue: number,
  ) {
    updateValues({
      difficulty_distribution: {
        ...values.difficulty_distribution,
        [difficulty]: clampNumber(nextValue, 0, 50),
      },
    });
  }

  return (
    <Card
      size="sm"
      className="rounded-2xl border border-outline/10 bg-surface-container-lowest shadow-[0_14px_34px_-30px_rgba(7,30,39,0.24)]"
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <WandSparkles className="size-4" />
          </div>
          <div>
            <CardTitle className="font-display text-xl text-on-surface">
              Tạo đề bằng AI
            </CardTitle>
            <CardDescription className="mt-1.5 text-sm leading-relaxed">
              Nhập bối cảnh đề thi theo format chuẩn để AI tạo câu hỏi tập
              trung và dễ duyệt hơn.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onGenerate();
          }}
        >
          <section className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-4 text-primary" />
                <h3 className="text-base font-semibold text-on-surface">
                  Thông tin chung
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <CircleHelp className="size-4" />
                      Xem hướng dẫn
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        Format nhập liệu
                      </p>
                      <p className="mt-2 rounded-xl bg-surface px-3 py-2 font-mono text-xs text-on-surface-variant">
                        [Kỹ năng/Chủ đề] - [Môn học] - [Trình độ]
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-on-surface">
                        Ví dụ cụ thể
                      </p>
                      <div className="space-y-1 text-sm leading-6 text-muted-foreground">
                        {AI_EXAM_CONTEXT_TEMPLATES.map((template) => (
                          <p key={template}>{template}</p>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      Chọn template mẫu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    {AI_EXAM_CONTEXT_TEMPLATES.map((template) => (
                      <DropdownMenuItem
                        key={template}
                        onSelect={() => updateValues({ exam_context: template })}
                      >
                        {template}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <label className="block space-y-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface">
                Bối cảnh đề thi
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex size-5 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
                      aria-label="Xem format nhập bối cảnh đề thi"
                    >
                      <CircleHelp className="size-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="space-y-2">
                    <p className="text-sm font-semibold text-on-surface">
                      Format chuẩn
                    </p>
                    <p className="rounded-xl bg-surface px-3 py-2 font-mono text-xs text-on-surface-variant">
                      [Kỹ năng/Chủ đề] - [Môn học] - [Trình độ]
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ví dụ: Luyện thi THPTQG 2026 - Toán - Lớp 12
                    </p>
                  </PopoverContent>
                </Popover>
              </span>
              <Textarea
                value={values.exam_context}
                onChange={(event) =>
                  updateValues({ exam_context: event.target.value })
                }
                placeholder="VD: Luyện thi THPTQG 2026 - Toán - Lớp 12"
                className="min-h-20"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Nhập theo format: [Kỹ năng/Chủ đề] - [Môn học] - [Trình độ]
              </p>
            </label>
          </section>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Thời lượng
              </span>
              <Input
                type="number"
                min={1}
                max={300}
                value={values.duration_minutes}
                onChange={(event) =>
                  updateValues({
                    duration_minutes: clampNumber(
                      parseInteger(event.target.value, values.duration_minutes),
                      1,
                      300,
                    ),
                  })
                }
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Tổng số câu
              </span>
              <Input
                type="number"
                min={1}
                max={50}
                value={values.question_count}
                onChange={(event) =>
                  updateQuestionCount(
                    parseInteger(event.target.value, values.question_count),
                  )
                }
              />
            </label>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-on-surface">Loại câu hỏi</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {AI_QUESTION_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 rounded-xl border border-outline/10 bg-surface px-3 py-2 text-sm font-medium text-on-surface"
                >
                  <Checkbox
                    checked={values.question_types.includes(option.value)}
                    onCheckedChange={() => toggleQuestionType(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {selectedQuestionTypeOptions.length > 0 ? (
              <div className="space-y-3 rounded-xl border border-outline/10 bg-surface px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-on-surface">
                    Số câu theo loại
                  </p>
                  <span
                    className={
                      hasBalancedQuestionTypes
                        ? "rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant"
                        : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                    }
                  >
                    {questionTypeTotal}/{values.question_count} câu
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedQuestionTypeOptions.map((option) => (
                    <label key={option.value} className="space-y-2">
                      <span className="text-xs font-medium text-on-surface-variant">
                        {option.label}
                      </span>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={values.question_type_distribution[option.value] ?? 0}
                        onChange={(event) =>
                          updateQuestionTypeCount(
                            option.value,
                            parseInteger(
                              event.target.value,
                              values.question_type_distribution[option.value] ?? 0,
                            ),
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
                {!hasBalancedQuestionTypes ? (
                  <p className="text-xs font-medium text-amber-700">
                    Tổng số câu theo loại phải bằng Tổng số câu.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-on-surface">
                Phân bổ độ khó
              </p>
              <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                {difficultyTotal}/{values.question_count} câu
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {AI_DIFFICULTY_OPTIONS.map((option) => (
                <label key={option.value} className="space-y-2">
                  <span className="text-xs font-medium text-on-surface-variant">
                    {option.label}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={values.difficulty_distribution[option.value]}
                    onChange={(event) =>
                      updateDifficulty(
                        option.value,
                        parseInteger(
                          event.target.value,
                          values.difficulty_distribution[option.value],
                        ),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/6 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isGenerating}
              className="h-10 rounded-xl px-5"
            >
              {isGenerating ? "Đang tạo đề..." : "Tạo đề bằng AI"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
