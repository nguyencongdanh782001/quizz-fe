"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api/error-message";
import type {
  AIExamDifficulty,
  AIExamQuestionType,
  AIQuestionDraftResponse,
  UpdateAIQuestionDraftRequest,
} from "@/lib/api/types";
import { updateAIQuestionDraft } from "@/services/ai-exam.service";
import {
  AI_DIFFICULTY_OPTIONS,
  AI_QUESTION_TYPE_OPTIONS,
  formatCorrectAnswer,
  getDifficultyLabel,
  getQuestionTypeLabel,
  splitDraftOptions,
} from "./utils";

interface DraftFormState {
  content: string;
  correct_answer: string;
  difficulty: AIExamDifficulty;
  explanation: string;
  is_approved: boolean;
  options: string;
  points: number;
  question_type: AIExamQuestionType;
  topic: string;
}

interface AIQuestionDraftCardProps {
  disabled?: boolean;
  draft: AIQuestionDraftResponse;
  onUpdated: (draft: AIQuestionDraftResponse) => void;
}

function draftToFormState(draft: AIQuestionDraftResponse): DraftFormState {
  return {
    content: draft.content,
    correct_answer: formatCorrectAnswer(draft.correct_answer),
    difficulty: draft.difficulty,
    explanation: draft.explanation,
    is_approved: draft.is_approved,
    options: draft.options.join("\n"),
    points: draft.points,
    question_type: draft.question_type,
    topic: draft.topic,
  };
}

function isChoiceType(questionType: AIExamQuestionType): boolean {
  return questionType === "multiple_choice" || questionType === "true_false";
}

function buildDraftPayload(values: DraftFormState): UpdateAIQuestionDraftRequest {
  const isChoice = isChoiceType(values.question_type);

  return {
    content: values.content.trim(),
    correct_answer: values.correct_answer.trim() || null,
    difficulty: values.difficulty,
    explanation: values.explanation.trim(),
    is_approved: values.is_approved,
    options: isChoice ? splitDraftOptions(values.options) : [],
    points: Number(values.points) || 1,
    question_type: values.question_type,
    topic: values.topic.trim(),
  };
}

export function AIQuestionDraftCard({
  disabled = false,
  draft,
  onUpdated,
}: AIQuestionDraftCardProps) {
  const [values, setValues] = useState<DraftFormState>(() =>
    draftToFormState(draft),
  );
  const patchMutation = useMutation({
    mutationFn: async () =>
      updateAIQuestionDraft(draft.id, buildDraftPayload(values)),
    onSuccess: onUpdated,
  });
  const isChoice = isChoiceType(values.question_type);
  const patchError = patchMutation.error
    ? getApiErrorMessage(patchMutation.error, "Không thể lưu câu hỏi nháp")
    : null;

  useEffect(() => {
    setValues(draftToFormState(draft));
  }, [draft]);

  function updateValues(patch: Partial<DraftFormState>) {
    setValues((current) => ({
      ...current,
      ...patch,
    }));
  }

  return (
    <Card className="rounded-[26px] border border-outline/10 bg-surface-container-lowest shadow-[0_18px_54px_-42px_rgba(7,30,39,0.25)]">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={values.is_approved ? "success" : "warning"}>
                {values.is_approved ? "Đã duyệt" : "Chưa duyệt"}
              </Badge>
              <Badge variant="secondary">Câu {draft.order || draft.id}</Badge>
              <Badge variant="outline">
                {getQuestionTypeLabel(values.question_type)}
              </Badge>
              <Badge variant="outline">
                {getDifficultyLabel(values.difficulty)}
              </Badge>
            </div>
            <CardTitle className="font-display text-lg text-on-surface">
              {values.topic || "Câu hỏi AI"}
            </CardTitle>
          </div>

          <label className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-sm font-medium text-on-surface">
            <Checkbox
              checked={values.is_approved}
              disabled={disabled || patchMutation.isPending}
              onCheckedChange={(checked) =>
                updateValues({ is_approved: Boolean(checked) })
              }
            />
            Duyệt câu này
          </label>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.45fr)]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-on-surface">
              Nội dung câu hỏi
            </span>
            <Textarea
              value={values.content}
              disabled={disabled}
              className="min-h-28"
              onChange={(event) => updateValues({ content: event.target.value })}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">Loại</span>
              <Select
                value={values.question_type}
                disabled={disabled}
                onValueChange={(value) =>
                  updateValues({ question_type: value as AIExamQuestionType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_QUESTION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Độ khó
              </span>
              <Select
                value={values.difficulty}
                disabled={disabled}
                onValueChange={(value) =>
                  updateValues({ difficulty: value as AIExamDifficulty })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">Điểm</span>
              <Input
                type="number"
                min={0.25}
                step={0.25}
                value={values.points}
                disabled={disabled}
                onChange={(event) =>
                  updateValues({ points: Number(event.target.value) || 1 })
                }
              />
            </label>
          </div>
        </div>

        {isChoice ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-on-surface">
              Các lựa chọn, mỗi dòng một đáp án
            </span>
            <Textarea
              value={values.options}
              disabled={disabled}
              className="min-h-28"
              onChange={(event) => updateValues({ options: event.target.value })}
            />
          </label>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-on-surface">
              Đáp án đúng
            </span>
            <Input
              value={values.correct_answer}
              disabled={disabled}
              onChange={(event) =>
                updateValues({ correct_answer: event.target.value })
              }
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-on-surface">Chủ đề</span>
            <Input
              value={values.topic}
              disabled={disabled}
              onChange={(event) => updateValues({ topic: event.target.value })}
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-on-surface">Giải thích</span>
          <Textarea
            value={values.explanation}
            disabled={disabled}
            className="min-h-24"
            onChange={(event) => updateValues({ explanation: event.target.value })}
          />
        </label>

        <div className="flex flex-col gap-3 border-t border-outline/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {patchError ? (
            <p className="text-sm text-destructive">{patchError}</p>
          ) : (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              Lưu câu sau khi chỉnh sửa để cập nhật bản nháp.
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={disabled || patchMutation.isPending}
            onClick={() => void patchMutation.mutateAsync()}
          >
            <Save className="size-4" />
            {patchMutation.isPending ? "Đang lưu..." : "Lưu câu"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
