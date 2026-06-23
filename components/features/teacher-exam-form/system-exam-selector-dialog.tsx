"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Search,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherExams } from "@/hooks/queries/useTeacherExams";
import { teacherExamQueryKeys } from "@/hooks/queries/exam.query-keys";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";
import { getTeacherSystemExamDetail } from "@/services/exam.service";
import type {
  TeacherExam,
  TeacherExamOption,
  TeacherExamQuery,
  TeacherExamQuestion,
} from "@/types/exam";

interface SystemExamSelectorDialogProps {
  onOpenChange: (open: boolean) => void;
  onSelectExam: (exam: TeacherExam) => void;
  open: boolean;
}

const PAGE_SIZE = 5;
const OPTION_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface ExtractedQuestionOptions {
  options: string[];
  prompt: string;
}

function stripOptionLabel(value: string): string {
  return value.trim().replace(/^[A-Z]\s*[\.)]\s*/i, "").trim();
}

function normalizeOptionTextForCompare(value: string): string {
  return stripOptionLabel(value)
    .replace(/[\s,;:.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanEmbeddedOptionText(value: string): string {
  return stripOptionLabel(
    value.replace(/^[\s,;:]+/, "").replace(/[\s,;:]+$/, ""),
  );
}

function cleanQuestionPrompt(value: string): string {
  return value.replace(/[\s,;:]+$/, "").trim();
}

function isChoiceQuestion(question: TeacherExamQuestion): boolean {
  return question.question_type !== "text";
}

function extractEmbeddedOptionsFromPrompt(
  prompt: string,
): ExtractedQuestionOptions | null {
  const optionMarkers: { index: number; key: string; valueStart: number }[] = [];
  const optionMarkerRegex = /(^|[\s,;:])([A-Z])\s*[\.)]\s*/g;
  let match: RegExpExecArray | null;

  while ((match = optionMarkerRegex.exec(prompt)) !== null) {
    optionMarkers.push({
      index: match.index + match[1].length,
      key: match[2].toUpperCase(),
      valueStart: optionMarkerRegex.lastIndex,
    });
  }

  for (let startIndex = 0; startIndex < optionMarkers.length; startIndex += 1) {
    const firstMarker = optionMarkers[startIndex];

    if (firstMarker.key !== "A") {
      continue;
    }

    const sequence = [firstMarker];
    let expectedOptionIndex = 1;

    for (
      let markerIndex = startIndex + 1;
      markerIndex < optionMarkers.length;
      markerIndex += 1
    ) {
      const optionIndex = OPTION_KEYS.indexOf(optionMarkers[markerIndex].key);

      if (optionIndex === expectedOptionIndex) {
        sequence.push(optionMarkers[markerIndex]);
        expectedOptionIndex += 1;
        continue;
      }

      if (optionIndex > expectedOptionIndex) {
        break;
      }
    }

    if (sequence.length < 2) {
      continue;
    }

    const options = sequence.map((marker, index) => {
      const nextMarker = sequence[index + 1];
      const optionEnd = nextMarker?.index ?? prompt.length;

      return cleanEmbeddedOptionText(prompt.slice(marker.valueStart, optionEnd));
    });

    if (options.every(Boolean)) {
      return {
        prompt: cleanQuestionPrompt(prompt.slice(0, sequence[0].index)),
        options,
      };
    }
  }

  return null;
}

function stripTrailingOptionListFromPrompt(
  prompt: string,
  options: TeacherExamOption[],
): string {
  if (options.length < 2 || !prompt.includes(":")) {
    return prompt.trim();
  }

  const colonIndex = prompt.lastIndexOf(":");
  const head = prompt.slice(0, colonIndex).trim();
  const tail = prompt.slice(colonIndex + 1).trim();
  const tailItems = tail
    .split(/[,;]+/)
    .map(normalizeOptionTextForCompare)
    .filter(Boolean);
  const optionItems = options
    .map((option) => normalizeOptionTextForCompare(option.option_text))
    .filter(Boolean);

  if (
    head &&
    tailItems.length === optionItems.length &&
    tailItems.every((item, index) => item === optionItems[index])
  ) {
    return head;
  }

  return prompt.trim();
}

function isPlaceholderOption(option: TeacherExamOption, index: number): boolean {
  const optionKey = option.option_key || OPTION_KEYS[index] || "";
  const normalizedOptionText = normalizeOptionTextForCompare(option.option_text);

  return (
    normalizedOptionText === "" ||
    normalizedOptionText === optionKey.trim().toLowerCase()
  );
}

function buildExtractedOptions(
  options: string[],
  question: TeacherExamQuestion,
): TeacherExamOption[] {
  return options.map((optionText, index) => ({
    id: question.options[index]?.id ?? index + 1,
    option_key: question.options[index]?.option_key || OPTION_KEYS[index] || "",
    option_text: optionText,
    image_url: question.options[index]?.image_url ?? null,
    is_correct: question.options[index]?.is_correct ?? false,
  }));
}

function normalizePreviewQuestion(
  question: TeacherExamQuestion,
): TeacherExamQuestion {
  if (!isChoiceQuestion(question)) {
    return question;
  }

  const cleanedOptions = question.options.map((option) => ({
    ...option,
    option_text: stripOptionLabel(option.option_text),
  }));
  const extractedOptions = extractEmbeddedOptionsFromPrompt(question.prompt);
  const shouldUseExtractedOptions =
    extractedOptions !== null &&
    (cleanedOptions.length === 0 ||
      cleanedOptions.every((option, index) => isPlaceholderOption(option, index)));
  const options = shouldUseExtractedOptions
    ? buildExtractedOptions(extractedOptions.options, question)
    : cleanedOptions;
  const prompt = extractedOptions
    ? extractedOptions.prompt
    : stripTrailingOptionListFromPrompt(question.prompt, options);

  return {
    ...question,
    prompt,
    options,
  };
}

function normalizeSystemExamForCopy(exam: TeacherExam): TeacherExam {
  if (!exam.questions?.length) {
    return exam;
  }

  return {
    ...exam,
    questions: exam.questions.map(normalizePreviewQuestion),
  };
}

function formatDate(value: string): string {
  if (!value) {
    return "Chưa có ngày tạo";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa có ngày tạo";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getQuestionTypeCount(exam: TeacherExam): string {
  const questions = exam.questions ?? [];

  if (questions.length === 0) {
    return "Chưa tải danh sách câu hỏi";
  }

  const singleChoiceQuestionCount = questions.filter(
    (question) => question.question_type === "single_choice",
  ).length;
  const textQuestionCount = questions.filter(
    (question) => question.question_type === "text",
  ).length;
  const parts = [
    singleChoiceQuestionCount > 0
      ? `${singleChoiceQuestionCount} câu một đáp án`
      : null,
    textQuestionCount > 0 ? `${textQuestionCount} câu tự luận` : null,
  ].filter(Boolean);

  return parts.join(", ");
}

export function SystemExamSelectorDialog({
  onOpenChange,
  onSelectExam,
  open,
}: SystemExamSelectorDialogProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const query = useMemo<TeacherExamQuery>(
    () => ({
      search: debouncedSearch,
      sort_by: "created_at",
      sort_order: "desc",
    }),
    [debouncedSearch],
  );
  const examsQuery = useTeacherExams(query);
  const exams = examsQuery.data?.items ?? [];
  const pageCount = Math.max(1, Math.ceil(exams.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleExams = exams.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const activeSelectedExamId =
    visibleExams.some((exam) => exam.id === selectedExamId)
      ? selectedExamId
      : visibleExams[0]?.id ?? null;
  const selectedSummary =
    activeSelectedExamId === null
      ? null
      : exams.find((exam) => exam.id === activeSelectedExamId) ?? null;
  const selectedDetailQuery = useQuery({
    queryKey:
      activeSelectedExamId === null
        ? teacherExamQueryKeys.detail("missing")
        : teacherExamQueryKeys.detail(activeSelectedExamId),
    queryFn: async () => {
      if (activeSelectedExamId === null) {
        throw new Error("Thiếu mã đề thi hệ thống.");
      }

      return getTeacherSystemExamDetail(activeSelectedExamId);
    },
    enabled: open && activeSelectedExamId !== null,
  });
  const selectedDetail = selectedDetailQuery.data
    ? normalizeSystemExamForCopy(selectedDetailQuery.data)
    : undefined;
  const selectedPreview = selectedDetail ?? selectedSummary;
  const detailErrorMessage = selectedDetailQuery.isError
    ? getApiErrorMessage(
        selectedDetailQuery.error,
        "Không tìm thấy đề thi hệ thống",
      )
    : null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSearch("");
      setPage(1);
      setSelectedExamId(null);
    }

    onOpenChange(nextOpen);
  }

  function handleSelect() {
    if (!selectedDetail || selectedDetailQuery.isLoading) {
      return;
    }

    onSelectExam(selectedDetail);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-1rem)] max-w-7xl flex-col gap-0 p-0">
        <div className="border-b border-outline/10 px-5 py-5 sm:px-7">
          <DialogHeader className="pr-10">
            <DialogTitle>Chọn đề thi từ hệ thống</DialogTitle>
            <DialogDescription>
              Tìm đề thi hệ thống, xem nhanh nội dung rồi sao chép vào biểu mẫu
              lớp học để tiếp tục chỉnh sửa.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1fr_0.82fr]">
          <div className="flex min-h-0 flex-col border-b border-outline/10 p-5 lg:border-r lg:border-b-0 sm:p-7">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                  setSelectedExamId(null);
                }}
                placeholder="Tìm kiếm đề thi..."
                className="pl-10"
              />
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              {examsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-2xl" />
                  ))}
                </div>
              ) : visibleExams.length > 0 ? (
                <div className="space-y-3">
                  {visibleExams.map((exam) => {
                    const isSelected = exam.id === activeSelectedExamId;

                    return (
                      <button
                        key={exam.id}
                        type="button"
                        onClick={() => setSelectedExamId(exam.id)}
                        className={cn(
                          "w-full rounded-2xl border p-4 text-left transition-colors",
                          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/12",
                          isSelected
                            ? "border-primary/45 bg-primary/8"
                            : "border-outline/10 bg-surface hover:border-primary/25 hover:bg-surface-container-low",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="line-clamp-1 font-display text-base font-semibold text-on-surface">
                              {exam.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                              {exam.description || "Chưa có mô tả"}
                            </p>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                          ) : null}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
                            <BookOpen className="size-3.5" />
                            {exam.question_count} câu
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
                            <Clock className="size-3.5" />
                            {exam.duration_minutes} phút
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
                            <CalendarDays className="size-3.5" />
                            {formatDate(exam.created_at)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-outline/20 bg-surface p-6 text-center text-sm text-muted-foreground">
                  Không tìm thấy đề thi hệ thống phù hợp.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage <= 1}
              >
                <ChevronLeft />
                Trước
              </Button>
              <span className="text-xs font-medium text-muted-foreground">
                Trang {safePage}/{pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((current) => Math.min(pageCount, current + 1))
                }
                disabled={safePage >= pageCount}
              >
                Sau
                <ChevronRight />
              </Button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
            <p className="text-xs font-medium text-muted-foreground">
              Xem trước
            </p>

            {detailErrorMessage ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-center gap-2 font-medium">
                  <TriangleAlert className="size-4" />
                  {detailErrorMessage}
                </div>
              </div>
            ) : null}

            {selectedDetailQuery.isLoading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-8 w-2/3 rounded-xl" />
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
              </div>
            ) : selectedPreview ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-display text-xl font-semibold text-on-surface">
                    {selectedPreview.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {selectedPreview.description || "Chưa có mô tả"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">
                    {selectedPreview.question_count} câu hỏi
                  </Badge>
                  <Badge variant="secondary">
                    {selectedPreview.duration_minutes} phút
                  </Badge>
                  <Badge variant="outline">
                    {formatDate(selectedPreview.created_at)}
                  </Badge>
                </div>

                <div className="rounded-2xl border border-outline/10 bg-surface p-4">
                  <p className="text-sm font-semibold text-on-surface">
                    Cấu trúc câu hỏi
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getQuestionTypeCount(selectedPreview)}
                  </p>

                  {selectedPreview.questions?.length ? (
                    <div className="mt-4 space-y-3">
                      {selectedPreview.questions.map((question, index) => {
                        const isTextQuestion = question.question_type === "text";
                        const correctOptions = question.options.filter(
                          (option) => option.is_correct,
                        );

                        return (
                          <div
                            key={question.id}
                            className="rounded-xl border border-outline/10 bg-surface-container-lowest p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="secondary">
                                    Câu {index + 1}
                                  </Badge>
                                  <Badge variant="outline">
                                    {isTextQuestion ? "Tự luận" : "Trắc nghiệm"}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-sm font-medium leading-5 text-on-surface">
                                  {question.prompt}
                                </p>
                              </div>
                              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                                {question.points} điểm
                              </span>
                            </div>

                            {isTextQuestion ? (
                              question.accepted_answers.length > 0 ? (
                                <div className="mt-3 rounded-lg border border-outline/10 bg-surface px-3 py-2 text-xs text-muted-foreground">
                                  Đáp án:{" "}
                                  <span className="font-medium text-on-surface">
                                    {question.accepted_answers.join("; ")}
                                  </span>
                                </div>
                              ) : null
                            ) : question.options.length > 0 ? (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {question.options.map((option, optionIndex) => (
                                  <div
                                    key={`${question.id}-${option.option_key}-${optionIndex}`}
                                    className={cn(
                                      "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
                                      option.is_correct
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        : "border-outline/10 bg-surface text-on-surface",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                                        option.is_correct
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-primary/10 text-primary",
                                      )}
                                    >
                                      {option.option_key ||
                                        OPTION_KEYS[optionIndex]}
                                    </span>
                                    <span className="min-w-0 leading-5">
                                      {option.option_text || "Chưa có nội dung"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            {!isTextQuestion && correctOptions.length > 0 ? (
                              <div className="mt-3 text-xs text-muted-foreground">
                                Đáp án đúng:{" "}
                                <span className="font-medium text-emerald-700">
                                  {correctOptions
                                    .map(
                                      (option) =>
                                        `${option.option_key}. ${option.option_text}`,
                                    )
                                    .join("; ")}
                                </span>
                              </div>
                            ) : null}

                            {question.explanation.trim() ? (
                              <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
                                <p className="font-medium">Giải thích</p>
                                <p className="mt-1 whitespace-pre-wrap break-words leading-5">
                                  {question.explanation}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-outline/20 bg-surface p-6 text-center text-sm text-muted-foreground">
                Chọn một đề thi để xem trước.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-outline/10 px-5 py-4 sm:px-7">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSelect}
            disabled={!selectedDetail || selectedDetailQuery.isLoading}
          >
            {selectedDetailQuery.isLoading ? (
              <Loader2 className="animate-spin" />
            ) : null}
            Chọn đề thi này
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
