"use client";

import { useState } from "react";
import { CircleHelp, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  buildEvenQuestionTypeDistribution,
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

interface EditableNumberInputProps {
  className?: string;
  max: number;
  min: number;
  onCommit: (value: number) => void;
  value: number;
}

function EditableNumberInput({
  className,
  max,
  min,
  onCommit,
  value,
}: EditableNumberInputProps) {
  const [draft, setDraft] = useState(() => String(value));

  function commitValue() {
    const trimmedValue = draft.trim();

    if (!trimmedValue) {
      setDraft(String(value));
      return;
    }

    const parsedValue = Number(trimmedValue);

    if (!Number.isFinite(parsedValue)) {
      setDraft(String(value));
      return;
    }

    const nextValue = clampNumber(Math.round(parsedValue), min, max);

    setDraft(String(nextValue));

    if (nextValue !== value) {
      onCommit(nextValue);
    }
  }

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={draft}
      className={className}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commitValue}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }

        if (event.key === "Escape") {
          setDraft(String(value));
          event.currentTarget.blur();
        }
      }}
    />
  );
}

export function AIGenerateForm({
  error,
  isGenerating,
  onGenerate,
  onValuesChange,
  values,
}: AIGenerateFormProps) {
  const difficultyTotal = getDifficultyTotal(values.difficulty_distribution);
  const selectedQuestionTypeOptions = AI_QUESTION_TYPE_OPTIONS.filter(
    (option) => values.question_types.includes(option.value),
  );
  const questionTypeTotal = getQuestionTypeDistributionTotal(
    values.question_type_distribution,
    values.question_types,
  );
  const hasBalancedQuestionTypes = questionTypeTotal === values.question_count;
  const missingQuestionTypeCount = values.question_count - questionTypeTotal;

  function updateValues(patch: Partial<GenerateAIExamFormState>) {
    onValuesChange({ ...values, ...patch });
  }

  function toggleQuestionType(questionType: AIExamQuestionType) {
    const selected = values.question_types.includes(questionType);
    const nextTypes = selected
      ? values.question_types.filter((item) => item !== questionType)
      : [...values.question_types, questionType];

    updateValues({
      question_type_distribution: buildEvenQuestionTypeDistribution(
        values.question_count,
        nextTypes,
      ),
      question_types: nextTypes,
    });
  }

  function updateQuestionTypeCount(
    questionType: AIExamQuestionType,
    nextValue: number,
  ) {
    updateValues({
      question_type_distribution: {
        ...values.question_type_distribution,
        [questionType]: clampNumber(nextValue, 1, 50),
      },
    });
  }

  function updateQuestionCount(nextValue: number) {
    const questionCount = clampNumber(nextValue, 1, 50);

    updateValues({
      difficulty_distribution:
        buildBalancedDifficultyDistribution(questionCount),
      question_count: questionCount,
      question_type_distribution: buildEvenQuestionTypeDistribution(
        questionCount,
        values.question_types,
      ),
    });
  }

  function updateDifficulty(difficulty: AIExamDifficulty, nextValue: number) {
    updateValues({
      difficulty_distribution: {
        ...values.difficulty_distribution,
        [difficulty]: clampNumber(nextValue, 0, 50),
      },
    });
  }

  return (
    <form
      className="grid gap-3 xl:grid-cols-2 xl:items-stretch"
      onSubmit={(event) => {
        event.preventDefault();
        onGenerate();
      }}
    >
      <Card className="flex h-full flex-col rounded-[8px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
        <CardHeader className="border-b border-[#E8ECF2] px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-bold text-[#1E293B]">
              Thông tin chung
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <CircleHelp className="size-3.5" />
                    Xem hướng dẫn
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1E293B]">
                      Format nhập liệu
                    </p>
                    <p className="mt-2 rounded-[6px] bg-[#F6F7FA] px-3 py-2 font-mono text-xs text-[#475569]">
                      [Kỹ năng/Chủ đề] - [Môn học] - [Trình độ]
                    </p>
                  </div>
                  <div className="space-y-1 text-xs leading-5 text-[#64748B]">
                    {AI_EXAM_CONTEXT_TEMPLATES.map((template) => (
                      <p key={template}>{template}</p>
                    ))}
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
        </CardHeader>

        <CardContent className="flex flex-1 flex-col space-y-3 p-4">
          <label className="block space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#334155]">
              Bối cảnh đề thi
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-4 items-center justify-center text-primary"
                    aria-label="Xem format nhập bối cảnh đề thi"
                  >
                    <CircleHelp className="size-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 space-y-2">
                  <p className="text-xs font-semibold text-[#334155]">
                    Format chuẩn
                  </p>
                  <p className="rounded-[6px] bg-[#F6F7FA] px-3 py-2 font-mono text-[11px] text-[#475569]">
                    [Kỹ năng/Chủ đề] - [Môn học] - [Trình độ]
                  </p>
                </PopoverContent>
              </Popover>
            </span>

            <Textarea
              value={values.exam_context}
              maxLength={2000}
              onChange={(event) =>
                updateValues({ exam_context: event.target.value })
              }
              placeholder="VD: Luyện thi THPTQG 2026 - Toán - Lớp 12"
              className="min-h-24 rounded-[6px]"
            />

            <div className="flex items-center justify-between gap-3 text-[11px] text-[#94A3B8]">
              <span>Nhập theo format: [Chủ đề] - [Môn học] - [Trình độ]</span>
              <span>{values.exam_context.length}/2000</span>
            </div>
          </label>

          <div className="rounded-[6px] border border-sky-200 bg-[#DFF3FC] px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#075985]">
              <Sparkles className="size-3.5" />
              Tại sao cần nhập bối cảnh đề thi?
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px] leading-5 text-[#0369A1]">
              <li>Xác định mục tiêu: luyện thi, kiểm tra hoặc ôn tập.</li>
              <li>Giới hạn đúng môn học, chủ đề và trình độ.</li>
              <li>Giúp AI phân bổ câu hỏi sát yêu cầu và dễ duyệt hơn.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col rounded-[8px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
        <CardHeader className="border-b border-[#E8ECF2] px-4 py-3">
          <CardTitle className="text-sm font-bold text-[#1E293B]">
            Cấu hình tạo đề
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold text-[#334155]">
                Thời lượng (phút)
              </span>
              <EditableNumberInput
                key={`duration-${values.duration_minutes}`}
                min={1}
                max={300}
                value={values.duration_minutes}
                className="rounded-[6px]"
                onCommit={(durationMinutes) =>
                  updateValues({ duration_minutes: durationMinutes })
                }
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold text-[#334155]">
                Tổng số câu
              </span>
              <EditableNumberInput
                key={`question-count-${values.question_count}`}
                min={1}
                max={50}
                value={values.question_count}
                className="rounded-[6px]"
                onCommit={updateQuestionCount}
              />
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#334155]">
              Loại câu hỏi{" "}
              <span className="font-normal text-[#94A3B8]">
                (chọn một hoặc nhiều)
              </span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
              {AI_QUESTION_TYPE_OPTIONS.map((option) => {
                const checked = values.question_types.includes(option.value);

                return (
                  <label
                    key={option.value}
                    className={
                      checked
                        ? "flex cursor-pointer items-center gap-2 rounded-[6px] border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary"
                        : "flex cursor-pointer items-center gap-2 rounded-[6px] border border-[#DDE2EB] bg-[#FAFBFC] px-3 py-2 text-xs font-semibold text-[#475569]"
                    }
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleQuestionType(option.value)}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>

          {selectedQuestionTypeOptions.length > 0 ? (
            <div className="space-y-2.5 rounded-[6px] border border-[#E3E7EE] bg-[#F7F8FC] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-[#334155]">
                  Số câu theo loại
                </p>
                <span
                  className={
                    hasBalancedQuestionTypes
                      ? "rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#64748B]"
                      : "rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700"
                  }
                >
                  {questionTypeTotal}/{values.question_count} câu
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {selectedQuestionTypeOptions.map((option) => (
                  <label key={option.value} className="space-y-1.5">
                    <span className="text-[11px] font-medium text-[#64748B]">
                      {option.label}
                    </span>
                    <EditableNumberInput
                      key={`${option.value}-${values.question_type_distribution[option.value] ?? 0}`}
                      min={1}
                      max={50}
                      className="rounded-[6px] bg-white"
                      value={
                        values.question_type_distribution[option.value] ?? 0
                      }
                      onCommit={(questionCount) =>
                        updateQuestionTypeCount(option.value, questionCount)
                      }
                    />
                  </label>
                ))}
              </div>

              {!hasBalancedQuestionTypes ? (
                <p className="text-[11px] font-medium text-amber-700">
                  {missingQuestionTypeCount > 0
                    ? `Còn thiếu ${missingQuestionTypeCount} câu. Hãy cộng vào một loại phù hợp.`
                    : `Đang dư ${Math.abs(missingQuestionTypeCount)} câu. Hãy giảm ở một loại.`}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[#334155]">
                Phân bổ độ khó
              </p>
              <span className="rounded-full bg-[#F6F7FA] px-2.5 py-1 text-[11px] font-semibold text-[#64748B]">
                {difficultyTotal}/{values.question_count} câu
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {AI_DIFFICULTY_OPTIONS.map((option) => (
                <label key={option.value} className="space-y-1.5">
                  <span className="text-[11px] font-medium text-[#64748B]">
                    {option.label}
                  </span>
                  <EditableNumberInput
                    key={`${option.value}-${values.difficulty_distribution[option.value]}`}
                    min={0}
                    max={50}
                    className="rounded-[6px]"
                    value={values.difficulty_distribution[option.value]}
                    onCommit={(questionCount) =>
                      updateDifficulty(option.value, questionCount)
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          {error ? (
            <div className="rounded-[6px] border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isGenerating}
            className="mt-auto h-10 w-full rounded-[6px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] text-sm font-bold text-white shadow-sm hover:opacity-95"
          >
            <WandSparkles className="size-4" />
            {isGenerating ? "Đang tạo đề..." : "Tạo đề bằng AI"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
