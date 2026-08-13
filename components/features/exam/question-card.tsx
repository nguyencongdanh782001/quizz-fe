"use client";

import { useCallback, useEffect, useRef, type ChangeEvent } from "react";
import { Flag, CheckCircle } from "lucide-react";
import type { Question, StudentAnswer } from "@/types/exam.types";
import { AnswerOption } from "./answer-option";
import { Textarea } from "@/components/ui/textarea";
import { RichTextRenderer } from "@/components/shared/rich-text-renderer";
import {
  getSelectedOptionIds,
  getTextAnswerValue,
  isSingleChoiceQuestionType,
} from "@/lib/student-exam-answers";

function resizeTextarea(textarea: HTMLTextAreaElement): void {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function TextQuestion({
  questionId,
  value,
  error,
  onChange,
}: {
  questionId: string;
  value: string;
  error?: string;
  onChange: (questionId: string, value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      resizeTextarea(textareaRef.current);
    }
  }, [value]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(questionId, event.target.value);
      resizeTextarea(event.currentTarget);
    },
    [onChange, questionId],
  );

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        rows={4}
        value={value}
        onChange={handleChange}
        placeholder="Nhập câu trả lời của bạn..."
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${questionId}-text-answer-error` : undefined}
        className="min-h-40 resize-none overflow-hidden px-4 py-3 leading-6 tracking-normal"
      />
      {error ? (
        <p
          id={`${questionId}-text-answer-error`}
          className="text-xs font-medium text-red-600"
        >
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Câu trả lời sẽ được lưu khi bạn chuyển câu hoặc nộp bài.
        </p>
      )}
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  answer?: StudentAnswer;
  answerError?: string;
  onSelect: (question: Question, optionIds: string[]) => void;
  onTextAnswerChange: (questionId: string, value: string) => void;
  isFlagged?: boolean;
}

export function QuestionCard({
  question,
  index,
  total,
  answer,
  answerError,
  onSelect,
  onTextAnswerChange,
  isFlagged = false,
}: QuestionCardProps) {
  const isSingleSelect = isSingleChoiceQuestionType(question.type);
  const selectedIds = getSelectedOptionIds(question, answer);
  const textAnswer = getTextAnswerValue(question, answer);

  const handleSelect = (optionId: string) => {
    if (isSingleSelect) {
      onSelect(question, [optionId]);
    } else {
      // Multiple: toggle
      if (selectedIds.includes(optionId)) {
        onSelect(
          question,
          selectedIds.filter((id) => id !== optionId),
        );
      } else {
        onSelect(question, [...selectedIds, optionId]);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Câu hỏi {index + 1} / {total}
          </span>
          <RichTextRenderer
            html={question.text}
            className="mt-1 font-display text-base font-semibold leading-relaxed text-on-surface md:text-lg"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {question.type === "multiple" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container text-muted-foreground font-medium">
              Chọn nhiều
            </span>
          )}
          {question.type === "true_false" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container text-muted-foreground font-medium">
              Đúng / Sai
            </span>
          )}
          {isFlagged && (
            <Flag className="w-4 h-4 text-yellow-500 fill-yellow-100 dark:fill-yellow-900/30" />
          )}
        </div>
      </div>

      {/* Options */}
      {question.type === "text" ? (
        <TextQuestion
          questionId={question.id}
          value={textAnswer}
          error={answerError}
          onChange={onTextAnswerChange}
        />
      ) : (
        <div className="space-y-3">
          {question.options.map((option, i) => (
            <AnswerOption
              key={option.id}
              option={option}
              index={i}
              isSelected={selectedIds.includes(option.id)}
              isMultiple={question.type === "multiple"}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Points */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>{question.points} điểm</span>
      </div>
    </div>
  );
}
