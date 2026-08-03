"use client";

import { useState } from "react";
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

type TrueFalseAnswer = "true" | "false";

interface AIQuestionDraftCardProps {
  disabled?: boolean;
  draft: AIQuestionDraftResponse;
  onUpdated: (draft: AIQuestionDraftResponse) => void;
}

function draftToFormState(draft: AIQuestionDraftResponse): DraftFormState {
  return {
    content: draft.content,
    correct_answer:
      draft.question_type === "true_false"
        ? normalizeTrueFalseAnswer(draft.correct_answer)
        : formatCorrectAnswer(draft.correct_answer),
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
  return questionType === "multiple_choice";
}

function normalizeTrueFalseAnswer(value: unknown): TrueFalseAnswer {
  if (value === false || value === 0) {
    return "false";
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLocaleLowerCase("vi-VN");

    if (["false", "0", "sai"].includes(normalized)) {
      return "false";
    }
  }

  return "true";
}

function getDraftValidationMessage(values: DraftFormState): string | null {
  if (!values.content.trim()) {
    return "Nội dung câu hỏi không được để trống.";
  }

  if (!Number.isFinite(values.points) || values.points <= 0) {
    return "Điểm của câu hỏi phải lớn hơn 0.";
  }

  if (values.question_type === "multiple_choice") {
    const options = splitDraftOptions(values.options);

    if (options.length !== 4) {
      return "Câu trắc nghiệm phải có đúng 4 lựa chọn.";
    }

    if (new Set(options.map((option) => option.toLocaleLowerCase("vi-VN"))).size !== options.length) {
      return "Các lựa chọn của câu trắc nghiệm không được trùng nhau.";
    }

    if (!options.includes(values.correct_answer.trim())) {
      return "Vui lòng chọn một đáp án đúng có trong danh sách lựa chọn.";
    }
  }

  if (
    values.question_type === "short_answer" &&
    splitDraftOptions(values.correct_answer).length === 0
  ) {
    return "Câu trả lời ngắn phải có ít nhất một đáp án chấp nhận.";
  }

  if (values.question_type === "essay" && !values.explanation.trim()) {
    return "Câu tự luận phải có hướng dẫn chấm hoặc đáp án tham khảo.";
  }

  return null;
}

function buildDraftPayload(values: DraftFormState): UpdateAIQuestionDraftRequest {
  const isChoice = isChoiceType(values.question_type);
  let correctAnswer: UpdateAIQuestionDraftRequest["correct_answer"] =
    values.correct_answer.trim() || null;

  if (values.question_type === "true_false") {
    correctAnswer = values.correct_answer === "true";
  } else if (values.question_type === "short_answer") {
    correctAnswer = splitDraftOptions(values.correct_answer);
  } else if (values.question_type === "essay") {
    correctAnswer = values.correct_answer.trim() || null;
  }

  return {
    content: values.content.trim(),
    correct_answer: correctAnswer,
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const patchMutation = useMutation({
    mutationFn: async () =>
      updateAIQuestionDraft(draft.id, buildDraftPayload(values)),
    onSuccess: onUpdated,
  });
  const isChoice = isChoiceType(values.question_type);
  const patchError = patchMutation.error
    ? getApiErrorMessage(patchMutation.error, "Không thể lưu câu hỏi nháp")
    : null;

  function updateValues(patch: Partial<DraftFormState>) {
    setValidationError(null);
    setValues((current) => ({
      ...current,
      ...patch,
    }));
  }

  function handleQuestionTypeChange(questionType: AIExamQuestionType) {
    if (questionType === "true_false") {
      updateValues({
        correct_answer: normalizeTrueFalseAnswer(values.correct_answer),
        options: "",
        question_type: questionType,
      });
      return;
    }

    if (questionType === "short_answer" || questionType === "essay") {
      updateValues({ options: "", question_type: questionType });
      return;
    }

    updateValues({ question_type: questionType });
  }

  function handleSave() {
    const message = getDraftValidationMessage(values);

    if (message) {
      setValidationError(message);
      return;
    }

    void patchMutation.mutateAsync();
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
                  handleQuestionTypeChange(value as AIExamQuestionType)
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
          {values.question_type === "true_false" ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Đáp án đúng
              </span>
              <Select
                value={values.correct_answer}
                disabled={disabled}
                onValueChange={(value) =>
                  updateValues({ correct_answer: value as TrueFalseAnswer })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Đúng</SelectItem>
                  <SelectItem value="false">Sai</SelectItem>
                </SelectContent>
              </Select>
            </label>
          ) : values.question_type === "multiple_choice" ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Đáp án đúng
              </span>
              <Select
                value={values.correct_answer}
                disabled={disabled || splitDraftOptions(values.options).length === 0}
                onValueChange={(value) => updateValues({ correct_answer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đáp án đúng" />
                </SelectTrigger>
                <SelectContent>
                  {splitDraftOptions(values.options).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          ) : values.question_type === "short_answer" ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Đáp án chấp nhận, mỗi dòng một đáp án
              </span>
              <Textarea
                value={values.correct_answer}
                disabled={disabled}
                className="min-h-24"
                onChange={(event) =>
                  updateValues({ correct_answer: event.target.value })
                }
              />
            </label>
          ) : (
            <div className="rounded-lg border border-outline/10 bg-surface px-4 py-3 text-sm text-muted-foreground">
              Câu tự luận sử dụng phần hướng dẫn chấm bên dưới làm đáp án tham khảo.
            </div>
          )}

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
          <span className="text-sm font-medium text-on-surface">
            {values.question_type === "essay"
              ? "Hướng dẫn chấm / đáp án tham khảo"
              : "Giải thích"}
          </span>
          <Textarea
            value={values.explanation}
            disabled={disabled}
            className="min-h-24"
            onChange={(event) => updateValues({ explanation: event.target.value })}
          />
        </label>

        <div className="flex flex-col gap-3 border-t border-outline/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {validationError || patchError ? (
            <p className="text-sm text-destructive">
              {validationError ?? patchError}
            </p>
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
            onClick={handleSave}
          >
            <Save className="size-4" />
            {patchMutation.isPending ? "Đang lưu..." : "Lưu câu"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
