"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileCheck2,
  Layers3,
  ListChecks,
  LoaderCircle,
  RefreshCw,
  Save,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/api/error-message";
import type {
  AIExamDifficulty,
  AIExamGenerationJobResponse,
  AIExamQuestionType,
  AIQuestionDraftResponse,
  GenerateExamRequest,
  UpdateAIQuestionDraftRequest,
} from "@/lib/api/types";
import { teacherExamQueryKeys } from "@/hooks/queries/exam.query-keys";
import { getTeacherClassById } from "@/lib/teacher-classes";
import {
  generateAIExam,
  generateMoreAIQuestions,
  getAIExamJob,
  saveAIExamToQuiz,
  updateAIQuestionDraft,
} from "@/services/ai-exam.service";

type AIExamScope = "system" | "class";
type ToastVariant = "success" | "error";

interface ScreenToastState {
  description?: string;
  open: boolean;
  title: string;
  variant: ToastVariant;
}

interface GenerateExamFormState {
  difficulty_distribution: Record<AIExamDifficulty, number>;
  duration_minutes: number;
  grade: string;
  question_count: number;
  question_types: AIExamQuestionType[];
  subject: string;
  topic: string;
}

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

interface SaveExamFormState {
  description: string | null;
  duration_minutes: number | null;
  is_published: boolean;
  title: string | null;
}

interface StoredAIExamSession {
  draftOverrides: Record<number, AIQuestionDraftResponse>;
  formValues: GenerateExamFormState;
  jobSeed: AIExamGenerationJobResponse | null;
  saveValues: SaveExamFormState;
  updatedAt: string;
}

interface ExtractedDraftOptions {
  content: string;
  options: string[];
}

const AI_QUESTION_TYPE_OPTIONS: {
  label: string;
  value: AIExamQuestionType;
}[] = [
  { value: "multiple_choice", label: "Trắc nghiệm" },
  { value: "true_false", label: "Đúng / sai" },
  { value: "short_answer", label: "Trả lời ngắn" },
  { value: "essay", label: "Tự luận" },
];

const AI_DIFFICULTY_OPTIONS: {
  label: string;
  value: AIExamDifficulty;
}[] = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
];

const DRAFT_OPTION_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const DEFAULT_GENERATE_FORM: GenerateExamFormState = {
  difficulty_distribution: {
    easy: 3,
    medium: 5,
    hard: 2,
  },
  duration_minutes: 45,
  grade: "",
  question_count: 10,
  question_types: ["multiple_choice"],
  subject: "",
  topic: "",
};

const DEFAULT_SAVE_FORM: SaveExamFormState = {
  description: null,
  duration_minutes: null,
  is_published: false,
  title: null,
};
const EMPTY_DRAFT_OVERRIDES: Record<number, AIQuestionDraftResponse> = {};

const AI_EXAM_SESSION_STORAGE_PREFIX = "quizzvn.teacher.ai-exam-session";
const AI_EXAM_SESSION_STORAGE_EVENT = "quizzvn:ai-exam-session-storage";
const storageRawCache = new Map<string, string | null>();
const storageSessionCache = new Map<string, StoredAIExamSession | null>();

function getAIExamSessionStorageKey(
  scope: AIExamScope,
  classId: string | null,
): string {
  return `${AI_EXAM_SESSION_STORAGE_PREFIX}.${scope}.${classId ?? "system"}`;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseStoredAIExamSession(rawValue: string | null) {
  try {
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isObjectRecord(parsedValue)) {
      return null;
    }

    const jobSeed = parsedValue.jobSeed;

    if (
      jobSeed !== null &&
      (!isObjectRecord(jobSeed) || typeof jobSeed.id !== "number")
    ) {
      return null;
    }

    return {
      draftOverrides: isObjectRecord(parsedValue.draftOverrides)
        ? (parsedValue.draftOverrides as Record<number, AIQuestionDraftResponse>)
        : {},
      formValues: isObjectRecord(parsedValue.formValues)
        ? ({ ...DEFAULT_GENERATE_FORM, ...parsedValue.formValues } as GenerateExamFormState)
        : DEFAULT_GENERATE_FORM,
      jobSeed: jobSeed as AIExamGenerationJobResponse | null,
      saveValues: isObjectRecord(parsedValue.saveValues)
        ? ({ ...DEFAULT_SAVE_FORM, ...parsedValue.saveValues } as SaveExamFormState)
        : DEFAULT_SAVE_FORM,
      updatedAt:
        typeof parsedValue.updatedAt === "string"
          ? parsedValue.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function getStoredAIExamSessionSnapshot(
  storageKey: string,
): StoredAIExamSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(storageKey);

  if (storageRawCache.get(storageKey) === rawValue) {
    return storageSessionCache.get(storageKey) ?? null;
  }

  const session = parseStoredAIExamSession(rawValue);
  storageRawCache.set(storageKey, rawValue);
  storageSessionCache.set(storageKey, session);

  return session;
}

function subscribeToStoredAIExamSession(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleStorage(event: StorageEvent) {
    if (event.key?.startsWith(AI_EXAM_SESSION_STORAGE_PREFIX)) {
      onStoreChange();
    }
  }

  function handleLocalStorageUpdate() {
    onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AI_EXAM_SESSION_STORAGE_EVENT, handleLocalStorageUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      AI_EXAM_SESSION_STORAGE_EVENT,
      handleLocalStorageUpdate,
    );
  };
}

function writeStoredAIExamSession(
  storageKey: string,
  session: StoredAIExamSession,
) {
  if (typeof window === "undefined") {
    return;
  }

  const rawValue = JSON.stringify(session);
  window.localStorage.setItem(storageKey, rawValue);
  storageRawCache.set(storageKey, rawValue);
  storageSessionCache.set(storageKey, session);
  window.dispatchEvent(new Event(AI_EXAM_SESSION_STORAGE_EVENT));
}

function removeStoredAIExamSession(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);
  storageRawCache.set(storageKey, null);
  storageSessionCache.set(storageKey, null);
  window.dispatchEvent(new Event(AI_EXAM_SESSION_STORAGE_EVENT));
}

function useStoredAIExamSession(storageKey: string) {
  return useSyncExternalStore(
    subscribeToStoredAIExamSession,
    () => getStoredAIExamSessionSnapshot(storageKey),
    () => null,
  );
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function buildBalancedDifficultyDistribution(
  questionCount: number,
): Record<AIExamDifficulty, number> {
  const easy = Math.floor(questionCount * 0.3);
  const medium = Math.floor(questionCount * 0.5);

  return {
    easy,
    medium,
    hard: questionCount - easy - medium,
  };
}

function getDifficultyTotal(
  distribution: Record<AIExamDifficulty, number>,
): number {
  return distribution.easy + distribution.medium + distribution.hard;
}

function getGenerationValidationMessage(
  values: GenerateExamFormState,
): string | null {
  if (!values.subject.trim()) {
    return "Vui lòng nhập môn học.";
  }

  if (!values.grade.trim()) {
    return "Vui lòng nhập khối/lớp.";
  }

  if (!values.topic.trim()) {
    return "Vui lòng nhập chủ đề.";
  }

  if (values.question_types.length === 0) {
    return "Vui lòng chọn ít nhất một loại câu hỏi.";
  }

  if (
    getDifficultyTotal(values.difficulty_distribution) !==
    values.question_count
  ) {
    return "Tổng phân bổ độ khó phải bằng số câu hỏi.";
  }

  return null;
}

function buildGeneratePayload(
  values: GenerateExamFormState,
): GenerateExamRequest {
  return {
    subject: values.subject.trim(),
    grade: values.grade.trim(),
    topic: values.topic.trim(),
    duration_minutes: values.duration_minutes,
    question_count: values.question_count,
    question_types: values.question_types,
    difficulty_distribution: values.difficulty_distribution,
  };
}

function getStatusLabel(status: string): string {
  const normalized = status.toLowerCase();

  if (["completed", "done", "success", "succeeded", "finished"].includes(normalized)) {
    return "Hoàn tất";
  }

  if (["failed", "error", "cancelled", "canceled"].includes(normalized)) {
    return "Có lỗi";
  }

  if (["pending", "queued"].includes(normalized)) {
    return "Đang chờ";
  }

  if (["processing", "running", "in_progress", "generating"].includes(normalized)) {
    return "Đang tạo";
  }

  return status;
}

function isJobRunning(status: string): boolean {
  return ["pending", "queued", "processing", "running", "in_progress", "generating"].includes(
    status.toLowerCase(),
  );
}

function isJobFailed(status: string): boolean {
  return ["failed", "error", "cancelled", "canceled"].includes(
    status.toLowerCase(),
  );
}

function formatCorrectAnswer(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function getDraftOptionKey(index: number): string {
  return DRAFT_OPTION_KEYS[index] ?? `${index + 1}`;
}

function stripDraftOptionLabel(value: string): string {
  return value.replace(/^\s*[A-Z]\s*[\.)]\s*/i, "").trim();
}

function normalizeDraftOptionText(value: string): string {
  return stripDraftOptionLabel(value).replace(/\s+/g, " ").trim().toLowerCase();
}

function isChoiceQuestionType(type: AIExamQuestionType): boolean {
  return type === "multiple_choice" || type === "true_false";
}

function getDraftOptionRows(value: string | string[]) {
  const options = Array.isArray(value)
    ? value
    : value.split(/\r?\n/).map((item) => item.trim());

  return options.map((option, index) => {
    const key = getDraftOptionKey(index);
    const text = stripDraftOptionLabel(option);

    return {
      key,
      label: `${key}. ${text}`,
      text,
    };
  });
}

function getDraftOptionItems(value: string | string[]) {
  return getDraftOptionRows(value).filter((option) => option.text);
}

function formatCorrectAnswerWithOptions(
  answer: string,
  options: string[],
): string {
  const optionItems = getDraftOptionItems(options);
  const trimmedAnswer = answer.trim();
  const letterMatch = trimmedAnswer.match(/^([A-Z])(?:[\.)]\s*)?$/i);
  const labeledAnswerMatch = trimmedAnswer.match(/^([A-Z])\s*[\.)]\s*(.+)$/i);

  if (letterMatch) {
    const matchedOption = optionItems.find(
      (option) => option.key.toLowerCase() === letterMatch[1].toLowerCase(),
    );

    return matchedOption?.label ?? trimmedAnswer;
  }

  if (labeledAnswerMatch) {
    const matchedOption = optionItems.find(
      (option) =>
        option.key.toLowerCase() === labeledAnswerMatch[1].toLowerCase(),
    );
    const answerBody = labeledAnswerMatch[2].trim();

    if (
      matchedOption &&
      (normalizeDraftOptionText(answerBody) ===
        matchedOption.key.toLowerCase() ||
        normalizeDraftOptionText(answerBody) ===
          normalizeDraftOptionText(matchedOption.text))
    ) {
      return matchedOption.label;
    }
  }

  const normalizedAnswer = normalizeDraftOptionText(trimmedAnswer);
  const matchedOption = optionItems.find(
    (option) => normalizeDraftOptionText(option.text) === normalizedAnswer,
  );

  return matchedOption?.label ?? trimmedAnswer;
}

function formatDraftCorrectAnswer(
  value: unknown,
  options: string[],
): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => formatCorrectAnswerWithOptions(String(item), options))
      .join(", ");
  }

  return formatCorrectAnswerWithOptions(formatCorrectAnswer(value), options);
}

function isPlaceholderOption(option: string, index: number): boolean {
  const normalizedOption = normalizeDraftOptionText(option);

  return (
    !normalizedOption ||
    normalizedOption === getDraftOptionKey(index).toLowerCase()
  );
}

function hasPlaceholderOptions(options: string[]): boolean {
  return options.length >= 2 && options.every(isPlaceholderOption);
}

function cleanEmbeddedOptionText(value: string): string {
  return stripDraftOptionLabel(
    value.replace(/^[\s,;:]+/, "").replace(/[\s,;:]+$/, ""),
  );
}

function cleanEmbeddedQuestionContent(value: string): string {
  return value.replace(/[\s,;:]+$/, "").trim();
}

function extractEmbeddedOptionsFromContent(
  content: string,
): ExtractedDraftOptions | null {
  const optionMarkers: { index: number; key: string; valueStart: number }[] = [];
  const optionMarkerRegex = /(^|[\s,;:])([A-Z])\s*[\.)]\s*/g;
  let match: RegExpExecArray | null;

  while ((match = optionMarkerRegex.exec(content)) !== null) {
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
      const optionIndex = DRAFT_OPTION_KEYS.indexOf(
        optionMarkers[markerIndex].key,
      );

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
      const optionEnd = nextMarker?.index ?? content.length;

      return cleanEmbeddedOptionText(
        content.slice(marker.valueStart, optionEnd),
      );
    });

    if (options.every(Boolean)) {
      return {
        content: cleanEmbeddedQuestionContent(
          content.slice(0, sequence[0].index),
        ),
        options,
      };
    }
  }

  return null;
}

function normalizeDraftChoiceContent(
  draft: AIQuestionDraftResponse,
): Pick<AIQuestionDraftResponse, "content" | "options"> {
  if (!isChoiceQuestionType(draft.question_type)) {
    return {
      content: draft.content,
      options: draft.options,
    };
  }

  const extractedOptions = extractEmbeddedOptionsFromContent(draft.content);

  if (!extractedOptions) {
    return {
      content: draft.content,
      options: draft.options,
    };
  }

  if (draft.options.length === 0 || hasPlaceholderOptions(draft.options)) {
    return extractedOptions;
  }

  return {
    content: extractedOptions.content,
    options: draft.options,
  };
}

function parseCorrectAnswer(value: string): unknown | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return trimmed;
}

function draftToFormState(draft: AIQuestionDraftResponse): DraftFormState {
  const normalizedDraft = normalizeDraftChoiceContent(draft);

  return {
    content: normalizedDraft.content,
    correct_answer: formatDraftCorrectAnswer(
      draft.correct_answer,
      normalizedDraft.options,
    ),
    difficulty: draft.difficulty,
    explanation: draft.explanation,
    is_approved: draft.is_approved,
    options: formatDraftOptions(normalizedDraft.options),
    points: draft.points,
    question_type: draft.question_type,
    topic: draft.topic,
  };
}

function formatDraftOptions(options: string[]): string {
  return options
    .map((option, index) => {
      const optionKey = getDraftOptionKey(index);
      const optionText = stripDraftOptionLabel(option);

      return `${optionKey}. ${optionText}`;
    })
    .join("\n");
}

function splitDraftOptions(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map(stripDraftOptionLabel)
    .filter(Boolean);
}

function normalizeCorrectAnswerForPayload(
  value: string,
  optionItems: ReturnType<typeof getDraftOptionItems>,
): unknown | null {
  const parsedValue = parseCorrectAnswer(value);

  function normalizeOne(answer: string): string {
    const trimmedAnswer = answer.trim();
    const letterMatch = trimmedAnswer.match(/^([A-Z])(?:[\.)]\s*)?$/i);

    if (letterMatch) {
      const matchedOption = optionItems.find(
        (option) => option.key.toLowerCase() === letterMatch[1].toLowerCase(),
      );

      return matchedOption?.text ?? trimmedAnswer;
    }

    const normalizedAnswer = normalizeDraftOptionText(trimmedAnswer);
    const matchedOption = optionItems.find(
      (option) =>
        normalizeDraftOptionText(option.text) === normalizedAnswer ||
        normalizeDraftOptionText(option.label) === normalizedAnswer,
    );

    return matchedOption?.text ?? stripDraftOptionLabel(trimmedAnswer);
  }

  if (Array.isArray(parsedValue)) {
    return parsedValue.map((item) => normalizeOne(String(item)));
  }

  if (typeof parsedValue === "string") {
    return normalizeOne(parsedValue);
  }

  return parsedValue;
}

function draftFormToPayload(
  values: DraftFormState,
): UpdateAIQuestionDraftRequest {
  const shouldKeepOptions = isChoiceQuestionType(values.question_type);
  const options = shouldKeepOptions ? splitDraftOptions(values.options) : [];
  const optionItems = getDraftOptionItems(values.options);

  return {
    question_type: values.question_type,
    content: values.content.trim(),
    options,
    correct_answer: shouldKeepOptions
      ? normalizeCorrectAnswerForPayload(values.correct_answer, optionItems)
      : parseCorrectAnswer(values.correct_answer),
    explanation: values.explanation.trim(),
    difficulty: values.difficulty,
    points: values.points,
    topic: values.topic.trim(),
    is_approved: values.is_approved,
  };
}

function draftToUpdatePayload(
  draft: AIQuestionDraftResponse,
  overrides: Partial<DraftFormState> = {},
): UpdateAIQuestionDraftRequest {
  return draftFormToPayload({
    ...draftToFormState(draft),
    ...overrides,
  });
}

function stringifyDraftPayloadValue(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function hasDraftPayloadChanges(
  draft: AIQuestionDraftResponse,
  payload: UpdateAIQuestionDraftRequest,
): boolean {
  return (
    payload.question_type !== draft.question_type ||
    payload.content !== draft.content.trim() ||
    stringifyDraftPayloadValue(payload.options) !==
      stringifyDraftPayloadValue(draft.options) ||
    stringifyDraftPayloadValue(payload.correct_answer) !==
      stringifyDraftPayloadValue(draft.correct_answer) ||
    payload.explanation !== draft.explanation.trim() ||
    payload.difficulty !== draft.difficulty ||
    payload.points !== draft.points ||
    payload.topic !== draft.topic.trim() ||
    payload.is_approved !== draft.is_approved
  );
}

async function syncNormalizedDrafts(
  drafts: AIQuestionDraftResponse[],
): Promise<AIQuestionDraftResponse[]> {
  const draftsToUpdate = drafts
    .map((draft) => ({
      draft,
      payload: draftToUpdatePayload(draft),
    }))
    .filter(({ draft, payload }) => hasDraftPayloadChanges(draft, payload));

  if (draftsToUpdate.length === 0) {
    return [];
  }

  return Promise.all(
    draftsToUpdate.map(({ draft, payload }) =>
      updateAIQuestionDraft(draft.id, payload),
    ),
  );
}

function getQuestionTypeLabel(type: AIExamQuestionType): string {
  return (
    AI_QUESTION_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type
  );
}

function getDifficultyLabel(difficulty: AIExamDifficulty): string {
  return (
    AI_DIFFICULTY_OPTIONS.find((item) => item.value === difficulty)?.label ??
    difficulty
  );
}

function mergeDraftOverrides(
  job: AIExamGenerationJobResponse | null,
  draftOverrides: Record<number, AIQuestionDraftResponse>,
): AIExamGenerationJobResponse | null {
  if (!job) {
    return null;
  }

  return {
    ...job,
    question_drafts: job.question_drafts.map(
      (draft) => draftOverrides[draft.id] ?? draft,
    ),
  };
}

function GenerationForm({
  error,
  isGenerating,
  isSupplementGenerating = false,
  isSupplementMode = false,
  missingApprovedCount = 0,
  onSupplementRequest,
  onSubmit,
  setValues,
  values,
}: {
  error: string | null;
  isGenerating: boolean;
  isSupplementGenerating?: boolean;
  isSupplementMode?: boolean;
  missingApprovedCount?: number;
  onSupplementRequest?: (values: {
    additionalInstructions: string;
    count: number;
  }) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  setValues: React.Dispatch<React.SetStateAction<GenerateExamFormState>>;
  values: GenerateExamFormState;
}) {
  const difficultyTotal = getDifficultyTotal(values.difficulty_distribution);
  const suggestedSupplementQuestionCount = Math.max(missingApprovedCount, 1);
  const [supplementQuestionCount, setSupplementQuestionCount] = useState(
    suggestedSupplementQuestionCount,
  );

  useEffect(() => {
    setSupplementQuestionCount(suggestedSupplementQuestionCount);
  }, [suggestedSupplementQuestionCount]);

  function updateQuestionType(type: AIExamQuestionType, checked: boolean) {
    setValues((current) => {
      if (checked) {
        return {
          ...current,
          question_types: Array.from(new Set([...current.question_types, type])),
        };
      }

      if (current.question_types.length === 1) {
        return current;
      }

      return {
        ...current,
        question_types: current.question_types.filter((item) => item !== type),
      };
    });
  }

  function updateDifficulty(
    difficulty: AIExamDifficulty,
    nextValue: string,
  ) {
    setValues((current) => ({
      ...current,
      difficulty_distribution: {
        ...current.difficulty_distribution,
        [difficulty]: clampNumber(Number(nextValue), 0, 50),
      },
    }));
  }

  if (isSupplementMode) {
    return (
      <Card
        size="sm"
        className="border-0 bg-surface-container-lowest shadow-[0_24px_70px_-50px_rgba(7,30,39,0.24)]"
      >
        <CardHeader className="pb-1">
          <div className="flex items-start gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <CardTitle className="font-display text-lg text-on-surface">
                Tạo bổ sung câu hỏi
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs leading-5">
                Dùng cấu hình đề hiện tại, chỉ nhập chủ đề câu bổ sung.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-on-surface">
              Chủ đề bổ sung
            </span>
            <Textarea
              value={values.topic}
              className="min-h-20"
              placeholder="Ví dụ: thêm câu phân biệt phát âm /s/ và /z/, thêm câu trọng âm..."
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  topic: event.target.value,
                }))
              }
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[96px_minmax(0,1fr)]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Số câu
              </span>
              <Input
                min={1}
                max={50}
                type="number"
                value={supplementQuestionCount}
                onChange={(event) =>
                  setSupplementQuestionCount(
                    clampNumber(Number(event.target.value), 1, 50),
                  )
                }
              />
            </label>

            <div className="flex items-end">
              <Button
                type="button"
                disabled={isSupplementGenerating}
                className="h-10 w-full rounded-xl"
                onClick={() =>
                  onSupplementRequest?.({
                    additionalInstructions: values.topic.trim(),
                    count: supplementQuestionCount,
                  })
                }
              >
                {isSupplementGenerating ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-4" />
                )}
                {isSupplementGenerating ? "Đang tạo..." : "Tạo bổ sung"}
              </Button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-surface-container-lowest shadow-[0_24px_70px_-50px_rgba(7,30,39,0.24)]">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <CardTitle className="font-display text-xl text-on-surface">
              Tạo đề thi bằng AI
            </CardTitle>
            <CardDescription className="mt-1 leading-6">
              Nhập yêu cầu đề thi, AI sẽ tạo câu hỏi nháp để giáo viên duyệt
              trước khi lưu.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Môn học
              </span>
              <Input
                value={values.subject}
                placeholder="Toán, Vật lý, Tiếng Anh..."
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Khối/Lớp
              </span>
              <Input
                value={values.grade}
                placeholder="Lớp 10, THPT..."
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    grade: event.target.value,
                  }))
                }
              />
            </label>

          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-on-surface">Chủ đề</span>
            <Textarea
              value={values.topic}
              className="min-h-24"
              placeholder="Ví dụ: Hàm số bậc hai, định luật Newton, thì hiện tại hoàn thành..."
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  topic: event.target.value,
                }))
              }
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Thời lượng
              </span>
              <Input
                min={1}
                max={300}
                type="number"
                value={values.duration_minutes}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    duration_minutes: clampNumber(
                      Number(event.target.value),
                      1,
                      300,
                    ),
                  }))
                }
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-on-surface">
                Số câu hỏi
              </span>
              <Input
                min={1}
                max={50}
                type="number"
                value={values.question_count}
                onChange={(event) => {
                  const questionCount = clampNumber(
                    Number(event.target.value),
                    1,
                    50,
                  );
                  setValues((current) => ({
                    ...current,
                    question_count: questionCount,
                    difficulty_distribution:
                      buildBalancedDifficultyDistribution(questionCount),
                  }));
                }}
              />
            </label>
          </div>

          <div className="space-y-3 rounded-2xl border border-outline/10 bg-surface px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-on-surface">
                Loại câu hỏi
              </p>
              <Badge variant="secondary">
                {values.question_types.length} loại được chọn
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {AI_QUESTION_TYPE_OPTIONS.map((item) => (
                <label
                  key={item.value}
                  className="flex items-center gap-3 rounded-xl border border-outline/10 bg-surface-container-lowest px-3 py-3 text-sm font-medium text-on-surface"
                >
                  <Checkbox
                    checked={values.question_types.includes(item.value)}
                    onCheckedChange={(checked) =>
                      updateQuestionType(item.value, Boolean(checked))
                    }
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-outline/10 bg-surface px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface">
                  Phân bổ độ khó
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tổng hiện tại: {difficultyTotal}/{values.question_count}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    difficulty_distribution:
                      buildBalancedDifficultyDistribution(
                        current.question_count,
                      ),
                  }))
                }
              >
                <RefreshCw className="size-3.5" />
                Cân bằng
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {AI_DIFFICULTY_OPTIONS.map((item) => (
                <label key={item.value} className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </span>
                  <Input
                    min={0}
                    max={50}
                    type="number"
                    value={values.difficulty_distribution[item.value]}
                    onChange={(event) =>
                      updateDifficulty(item.value, event.target.value)
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={isGenerating}
            className="h-11 w-full rounded-2xl sm:w-auto"
          >
            {isGenerating ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 size-4" />
            )}
            {isGenerating ? "Đang gửi yêu cầu..." : "Tạo đề bằng AI"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function QuestionDraftCard({
  draft,
  onUpdate,
}: {
  draft: AIQuestionDraftResponse;
  onUpdate: (draft: AIQuestionDraftResponse) => void;
}) {
  const [values, setValues] = useState<DraftFormState>(() =>
    draftToFormState(draft),
  );
  const patchMutation = useMutation({
    mutationFn: async () =>
      updateAIQuestionDraft(draft.id, draftFormToPayload(values)),
    onSuccess: onUpdate,
  });

  const isChoiceDraft =
    values.question_type === "multiple_choice" ||
    values.question_type === "true_false";
  const optionRows = getDraftOptionRows(values.options);
  const optionItems = getDraftOptionItems(values.options);
  const hasCorrectAnswerOption = optionItems.some(
    (option) => option.label === values.correct_answer,
  );
  const patchError = patchMutation.error
    ? getApiErrorMessage(patchMutation.error, "Không thể lưu câu hỏi nháp")
    : null;

  function updateOptionText(optionIndex: number, nextText: string) {
    setValues((current) => {
      const rows = getDraftOptionRows(current.options);
      const nextOptions = rows.map((option) => option.text);
      const optionKey = getDraftOptionKey(optionIndex);
      const selectedAnswerKey = current.correct_answer
        .trim()
        .match(/^([A-Z])\s*[\.)]/i)?.[1]
        ?.toUpperCase();

      nextOptions[optionIndex] = nextText;

      return {
        ...current,
        correct_answer:
          selectedAnswerKey === optionKey
            ? `${optionKey}. ${stripDraftOptionLabel(nextText)}`
            : current.correct_answer,
        options: formatDraftOptions(nextOptions),
      };
    });
  }

  return (
    <Card className="border-0 bg-surface-container-lowest shadow-[0_20px_60px_-46px_rgba(7,30,39,0.22)]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={values.is_approved ? "success" : "warning"}>
                {values.is_approved ? "Đã duyệt" : "Chưa duyệt"}
              </Badge>
              <Badge variant="secondary">
                Câu {draft.order || draft.id}
              </Badge>
              <Badge variant="outline">
                {getQuestionTypeLabel(draft.question_type)}
              </Badge>
              {draft.topic ? (
                <Badge variant="outline">Chủ đề: {draft.topic}</Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Badge variant="secondary" className="px-3 py-1.5">
              {getDifficultyLabel(values.difficulty)}
            </Badge>
            <div className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-sm font-semibold text-on-surface">
              <FileCheck2 className="size-4 text-primary" />
              {draft.points} điểm
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-on-surface">
              Nội dung câu hỏi
            </span>
            <Textarea
              value={values.content}
              className="min-h-28"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-on-surface">
              Giải thích
            </span>
            <Textarea
              value={values.explanation}
              className="min-h-28"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  explanation: event.target.value,
                }))
              }
            />
          </label>
        </div>

        {isChoiceDraft ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-on-surface">
                  Các lựa chọn
                </span>
                <Badge variant="secondary">{optionRows.length} đáp án</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {optionRows.map((option, index) => (
                  <label
                    key={`${option.key}-${index}`}
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-outline/10 bg-surface px-3 py-2"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {option.key}
                    </span>
                    <Input
                      value={option.text}
                      aria-label={`Đáp án ${option.key}`}
                      className="h-9 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                      onChange={(event) =>
                        updateOptionText(index, event.target.value)
                      }
                    />
                  </label>
                ))}
              </div>
            </div>

            <label className="space-y-2 rounded-xl border border-outline/10 bg-surface px-4 py-3">
              <span className="text-sm font-medium text-on-surface">
                Đáp án đúng
              </span>
              <Select
                value={values.correct_answer}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    correct_answer: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đáp án đúng" />
                </SelectTrigger>
                <SelectContent>
                  {!hasCorrectAnswerOption && values.correct_answer.trim() ? (
                    <SelectItem value={values.correct_answer}>
                      {values.correct_answer}
                    </SelectItem>
                  ) : null}
                  {optionItems.map((option) => (
                    <SelectItem key={option.key} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
        ) : (
          <label className="block max-w-xl space-y-2">
            <span className="text-sm font-medium text-on-surface">
              Đáp án đúng
            </span>
            <Input
              value={values.correct_answer}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  correct_answer: event.target.value,
                }))
              }
            />
          </label>
        )}

        <div className="flex flex-col gap-3 border-t border-outline/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm font-medium text-on-surface">
            <Checkbox
              checked={values.is_approved}
              onCheckedChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  is_approved: Boolean(checked),
                }))
              }
            />
            {values.is_approved ? "Đã duyệt câu này" : "Duyệt câu này"}
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {patchError ? (
              <span className="text-sm text-destructive">{patchError}</span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={patchMutation.isPending}
              onClick={() => void patchMutation.mutateAsync()}
            >
              {patchMutation.isPending ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Lưu câu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TeacherAIExamScreen({
  classId,
  initialScope,
}: {
  classId: string | null;
  initialScope: AIExamScope;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const classroomId = useMemo(() => {
    if (!classId) {
      return null;
    }

    const numericClassId = Number(classId);

    return Number.isFinite(numericClassId) ? numericClassId : null;
  }, [classId]);
  const scope: AIExamScope =
    initialScope === "class" && classroomId !== null ? "class" : "system";
  const cancelHref =
    scope === "class" && classId ? `/teacher/classes/${classId}` : "/teacher/exams";
  const storageKey = getAIExamSessionStorageKey(scope, classId);
  const storedSession = useStoredAIExamSession(storageKey);
  const [formValuesOverride, setFormValuesOverride] =
    useState<GenerateExamFormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [jobSeedOverride, setJobSeedOverride] =
    useState<AIExamGenerationJobResponse | null>(null);
  const [draftOverridesOverride, setDraftOverridesOverride] = useState<
    Record<number, AIQuestionDraftResponse> | null
  >(null);
  const [saveValuesOverride, setSaveValuesOverride] =
    useState<SaveExamFormState | null>(null);
  const [toast, setToast] = useState<ScreenToastState | null>(null);
  const formValues =
    formValuesOverride ?? storedSession?.formValues ?? DEFAULT_GENERATE_FORM;
  const jobSeed = jobSeedOverride ?? storedSession?.jobSeed ?? null;
  const draftOverrides =
    draftOverridesOverride ??
    storedSession?.draftOverrides ??
    EMPTY_DRAFT_OVERRIDES;
  const saveValues =
    saveValuesOverride ?? storedSession?.saveValues ?? DEFAULT_SAVE_FORM;
  const jobId = jobSeed?.id ?? null;

  const setFormValues: React.Dispatch<
    React.SetStateAction<GenerateExamFormState>
  > = (action) => {
    setFormValuesOverride((current) => {
      const base = current ?? storedSession?.formValues ?? DEFAULT_GENERATE_FORM;

      return typeof action === "function" ? action(base) : action;
    });
  };

  const setDraftOverrides: React.Dispatch<
    React.SetStateAction<Record<number, AIQuestionDraftResponse>>
  > = (action) => {
    setDraftOverridesOverride((current) => {
      const base = current ?? storedSession?.draftOverrides ?? {};

      return typeof action === "function" ? action(base) : action;
    });
  };

  const setSaveValues: React.Dispatch<React.SetStateAction<SaveExamFormState>> =
    (action) => {
      setSaveValuesOverride((current) => {
        const base = current ?? storedSession?.saveValues ?? DEFAULT_SAVE_FORM;

        return typeof action === "function" ? action(base) : action;
      });
    };

  const classQuery = useQuery({
    queryKey: ["teacher-ai-exam-class", classId],
    queryFn: async () => {
      if (!classId) {
        return null;
      }

      return getTeacherClassById(classId);
    },
    enabled: scope === "class" && Boolean(classId),
  });

  const jobQuery = useQuery({
    queryKey: ["ai-exam-job", jobId],
    queryFn: async () => getAIExamJob(jobId as number),
    enabled: jobId !== null,
    refetchInterval: (query) => {
      const latestJob = query.state.data as
        | AIExamGenerationJobResponse
        | undefined;
      const status = latestJob?.status ?? jobSeed?.status;

      return status && isJobRunning(status) ? 2500 : false;
    },
  });

  const generateMutation = useMutation({
    mutationFn: generateAIExam,
    onSuccess: (nextJob) => {
      setJobSeedOverride(nextJob);
      setDraftOverrides({});
      setSaveValues(DEFAULT_SAVE_FORM);
      setToast({
        open: true,
        title: "Đã gửi yêu cầu tạo đề",
        description: "AI đang xử lý và sẽ cập nhật danh sách câu hỏi nháp.",
        variant: "success",
      });
    },
  });

  const job = useMemo(
    () => mergeDraftOverrides(jobQuery.data ?? jobSeed, draftOverrides),
    [draftOverrides, jobQuery.data, jobSeed],
  );

  const generateMoreMutation = useMutation({
    mutationFn: async ({
      additionalInstructions,
      count,
    }: {
      additionalInstructions: string;
      count: number;
    }) => {
      if (!job) {
        throw new Error("Chưa có đề AI để tạo bổ sung câu hỏi.");
      }

      return generateMoreAIQuestions(job.id, {
        count,
        question_types: job.question_types ?? formValues.question_types,
        additional_instructions: additionalInstructions,
      });
    },
    onSuccess: (nextJob) => {
      setJobSeedOverride(nextJob);
      setDraftOverrides({});
      setToast({
        open: true,
        title: "Đã tạo bổ sung câu hỏi",
        description: "Danh sách câu hỏi nháp đã được cập nhật.",
        variant: "success",
      });
      void queryClient.invalidateQueries({
        queryKey: ["ai-exam-job", nextJob.id],
      });
    },
  });

  const defaultSaveTitle = job
    ? job.title?.trim() || `${job.subject} - ${job.topic}`
    : "";
  const defaultSaveDescription = job
    ? job.description?.trim() ||
      `Đề ${job.subject} cho ${job.grade}, chủ đề ${job.topic}.`
    : "";
  const saveTitle = saveValues.title ?? defaultSaveTitle;
  const saveDescription = saveValues.description ?? defaultSaveDescription;
  const saveDuration =
    saveValues.duration_minutes ?? job?.duration_minutes ?? formValues.duration_minutes;
  const drafts = job?.question_drafts ?? [];
  const approvedCount = drafts.filter((draft) => draft.is_approved).length;
  const unapprovedDrafts = drafts.filter((draft) => !draft.is_approved);
  const expectedApprovedCount = job
    ? Math.max(1, formValues.question_count || job.question_count)
    : 0;
  const missingApprovedCount = job
    ? Math.max(job.question_count - approvedCount, 0)
    : 0;
  const hasMissingApprovedDrafts = missingApprovedCount > 0;
  const hasDrafts = drafts.length > 0;
  const jobRunning = job ? isJobRunning(job.status) : false;
  const jobFailed = job ? isJobFailed(job.status) : false;
  const canSave =
    Boolean(job) &&
    hasDrafts &&
    approvedCount > 0 &&
    !hasMissingApprovedDrafts &&
    !jobRunning &&
    !jobFailed &&
    saveTitle.trim().length > 0;

  useEffect(() => {
    if (jobId === null) {
      return;
    }

    const latestJob = jobQuery.data ?? jobSeed;

    if (!latestJob) {
      return;
    }

    writeStoredAIExamSession(storageKey, {
      draftOverrides,
      formValues,
      jobSeed: latestJob,
      saveValues,
      updatedAt: new Date().toISOString(),
    });
  }, [
    draftOverrides,
    formValues,
    jobId,
    jobQuery.data,
    jobSeed,
    saveValues,
    storageKey,
  ]);

  const approveAllMutation = useMutation({
    mutationFn: async () =>
      Promise.all(
        unapprovedDrafts.map((draft) =>
          updateAIQuestionDraft(
            draft.id,
            draftToUpdatePayload(draft, { is_approved: true }),
          ),
        ),
      ),
    onSuccess: (updatedDrafts) => {
      setDraftOverrides((current) => {
        const nextOverrides = { ...current };

        updatedDrafts.forEach((draft) => {
          nextOverrides[draft.id] = draft;
        });

        return nextOverrides;
      });
      setToast({
        open: true,
        title: "Đã duyệt các câu hỏi",
        variant: "success",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!job) {
        throw new Error("Chưa có đề AI để lưu.");
      }

      const normalizedDrafts = await syncNormalizedDrafts(
        drafts.filter((draft) => draft.is_approved),
      );
      const response = await saveAIExamToQuiz(job.id, {
        title: saveTitle.trim(),
        description: saveDescription.trim() || null,
        scope,
        classroom_id: scope === "class" ? classroomId : null,
        duration_minutes: saveDuration,
        is_published: saveValues.is_published,
        is_active: true,
      });

      return {
        normalizedDrafts,
        response,
      };
    },
    onSuccess: async ({ normalizedDrafts, response }) => {
      if (normalizedDrafts.length > 0) {
        setDraftOverrides((current) => {
          const nextOverrides = { ...current };

          normalizedDrafts.forEach((draft) => {
            nextOverrides[draft.id] = draft;
          });

          return nextOverrides;
        });
      }

      await queryClient.invalidateQueries({
        queryKey: teacherExamQueryKeys.all,
      });
      setToast({
        open: true,
        title: "Đã lưu đề thi AI",
        description: response.message,
        variant: "success",
      });
      removeStoredAIExamSession(storageKey);
      router.push(cancelHref);
    },
  });

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = getGenerationValidationMessage(formValues);
    setFormError(validationMessage);

    if (validationMessage) {
      return;
    }

    try {
      await generateMutation.mutateAsync(buildGeneratePayload(formValues));
    } catch (error) {
      setToast({
        open: true,
        title: "Không thể tạo đề bằng AI",
        description: getApiErrorMessage(error, "Vui lòng thử lại sau."),
        variant: "error",
      });
    }
  }

  async function handleSupplementRequest({
    additionalInstructions,
    count,
  }: {
    additionalInstructions: string;
    count: number;
  }) {
    setFormError(null);

    try {
      await generateMoreMutation.mutateAsync({
        additionalInstructions,
        count,
      });
    } catch (error) {
      setToast({
        open: true,
        title: "Không thể tạo bổ sung câu hỏi",
        description: getApiErrorMessage(error, "Vui lòng thử lại sau."),
        variant: "error",
      });
    }
  }

  function handleDraftUpdate(nextDraft: AIQuestionDraftResponse) {
    setDraftOverrides((current) => ({
      ...current,
      [nextDraft.id]: nextDraft,
    }));
  }

  function handleClearSession() {
    setJobSeedOverride(null);
    setDraftOverridesOverride(null);
    setSaveValuesOverride(null);
    setFormValuesOverride(null);
    removeStoredAIExamSession(storageKey);
    setToast({
      open: true,
      title: "Đã xóa phiên nháp AI",
      variant: "success",
    });
  }

  async function handleApproveAll() {
    if (unapprovedDrafts.length === 0) {
      return;
    }

    try {
      await approveAllMutation.mutateAsync();
    } catch (error) {
      setToast({
        open: true,
        title: "Không thể duyệt tất cả câu hỏi",
        description: getApiErrorMessage(error, "Vui lòng thử lại sau."),
        variant: "error",
      });
    }
  }

  async function handleSave() {
    try {
      await saveMutation.mutateAsync();
    } catch (error) {
      setToast({
        open: true,
        title: "Không thể lưu đề thi AI",
        description: getApiErrorMessage(error, "Vui lòng thử lại sau."),
        variant: "error",
      });
    }
  }

  const saveError = saveMutation.error
    ? getApiErrorMessage(saveMutation.error, "Không thể lưu đề thi AI")
    : null;
  const approveAllError = approveAllMutation.error
    ? getApiErrorMessage(approveAllMutation.error, "Không thể duyệt câu hỏi")
    : null;
  const className =
    classQuery.data?.name ?? (scope === "class" ? `Lớp ${classId}` : null);

  return (
    <ToastProvider duration={3500}>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Link
          href={cancelHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="size-4" />
          {scope === "class" ? "Quay lại lớp học" : "Quay lại danh sách đề thi"}
        </Link>

        <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Khu vực giáo viên
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-on-surface">
              AI tạo đề thi
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="info">
                {scope === "class" ? "Lưu vào lớp học" : "Lưu vào kho hệ thống"}
              </Badge>
              {className ? (
                <Badge variant="secondary">
                  <BookOpen className="mr-1.5 size-3.5" />
                  {className}
                </Badge>
              ) : null}
            </div>
          </div>

          <Button asChild variant="outline" size="lg" className="h-11 rounded-2xl">
            <Link href={scope === "class" && classId ? `/teacher/classes/${classId}/exams/create` : "/teacher/exams/create"}>
              <ListChecks className="mr-2 size-4" />
              Tạo thủ công
            </Link>
          </Button>
        </section>

        <div
          className={
            hasDrafts
              ? "grid gap-4 xl:grid-cols-[minmax(280px,0.82fr)_minmax(310px,0.82fr)_minmax(340px,0.95fr)] xl:items-start"
              : "grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.58fr)] xl:items-start"
          }
        >
          <GenerationForm
            values={formValues}
            setValues={setFormValues}
            error={formError}
            isGenerating={generateMutation.isPending}
            isSupplementGenerating={generateMoreMutation.isPending}
            isSupplementMode={hasDrafts}
            missingApprovedCount={missingApprovedCount}
            onSupplementRequest={handleSupplementRequest}
            onSubmit={handleGenerate}
          />

          <div className={hasDrafts ? "contents" : "space-y-4"}>
            <Card className="border-0 bg-surface-container-lowest shadow-[0_24px_70px_-50px_rgba(7,30,39,0.24)]">
              <CardHeader>
                <CardTitle className="font-display text-xl text-on-surface">
                  Trạng thái AI
                </CardTitle>
                <CardDescription className="leading-6">
                  Theo dõi job tạo đề và chất lượng câu hỏi trước khi lưu.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          jobFailed
                            ? "destructive"
                            : jobRunning
                              ? "warning"
                              : "success"
                        }
                      >
                        {jobRunning ? (
                          <LoaderCircle className="mr-1.5 size-3.5 animate-spin" />
                        ) : jobFailed ? (
                          <XCircle className="mr-1.5 size-3.5" />
                        ) : (
                          <CheckCircle2 className="mr-1.5 size-3.5" />
                        )}
                        {getStatusLabel(job.status)}
                      </Badge>
                      <Badge variant="secondary">Tự lưu nháp</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSession}
                      >
                        <XCircle className="size-3.5" />
                        Xóa nháp
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Câu hỏi
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-on-surface">
                          <Layers3 className="size-4 text-primary" />
                          {drafts.length}/{job.question_count}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Đã duyệt
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-on-surface">
                          <FileCheck2 className="size-4 text-primary" />
                          {approvedCount}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Thời lượng
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-on-surface">
                          <Clock3 className="size-4 text-primary" />
                          {job.duration_minutes} phút
                        </p>
                      </div>
                      <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Điểm
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-on-surface">
                          <ListChecks className="size-4 text-primary" />
                          {job.total_points}
                        </p>
                      </div>
                    </div>

                    {hasMissingApprovedDrafts ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <CircleAlert className="mt-0.5 size-4 shrink-0" />
                        <div>
                          <p className="font-semibold">
                            Còn thiếu {missingApprovedCount} câu đã duyệt
                          </p>
                          <p className="mt-1 leading-6">
                            Đề yêu cầu {expectedApprovedCount} câu, hiện có{" "}
                            {approvedCount} câu được duyệt. Hãy duyệt lại câu
                            phù hợp hoặc tạo bổ sung câu thay thế trước khi lưu.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {job.error_message ? (
                      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {job.error_message}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-outline/20 bg-surface px-4 py-8 text-center">
                    <Sparkles className="mx-auto size-8 text-primary" />
                    <p className="mt-3 text-sm font-medium text-on-surface">
                      Chưa có đề AI nào trong phiên này
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {hasDrafts ? (
              <Card className="border-0 bg-surface-container-lowest shadow-[0_24px_70px_-50px_rgba(7,30,39,0.24)]">
                <CardHeader>
                  <CardTitle className="font-display text-xl text-on-surface">
                    Lưu thành đề thi
                  </CardTitle>
                  <CardDescription className="leading-6">
                    Chỉ các câu đã duyệt sẽ sẵn sàng để lưu vào ngân hàng đề.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-on-surface">
                      Tên đề thi
                    </span>
                    <Input
                      value={saveTitle}
                      onChange={(event) =>
                        setSaveValues((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-on-surface">
                      Mô tả
                    </span>
                    <Textarea
                      value={saveDescription}
                      className="min-h-24"
                      onChange={(event) =>
                        setSaveValues((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-on-surface">
                        Thời lượng
                      </span>
                      <Input
                        min={1}
                        max={300}
                        type="number"
                      value={saveDuration}
                      onChange={(event) =>
                        setSaveValues((current) => ({
                          ...current,
                          duration_minutes: clampNumber(
                            Number(event.target.value),
                            1,
                            300,
                          ),
                        }))
                      }
                    />
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-outline/10 bg-surface px-4 py-3 text-sm font-medium text-on-surface sm:mt-7">
                      <Checkbox
                        checked={saveValues.is_published}
                        onCheckedChange={(checked) =>
                          setSaveValues((current) => ({
                            ...current,
                            is_published: Boolean(checked),
                          }))
                        }
                      />
                      Công khai đề thi
                    </label>
                  </div>

                  {hasMissingApprovedDrafts ? (
                    <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      <CircleAlert className="mt-0.5 size-4 shrink-0" />
                      <span>
                        Chưa thể lưu vì còn thiếu {missingApprovedCount} câu đã
                        duyệt. Đề cần đủ {expectedApprovedCount} câu trước khi
                        lưu.
                      </span>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      disabled={
                        approveAllMutation.isPending ||
                        unapprovedDrafts.length === 0
                      }
                      onClick={handleApproveAll}
                    >
                      {approveAllMutation.isPending ? (
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 size-4" />
                      )}
                      Duyệt tất cả
                    </Button>

                    <Button
                      type="button"
                      size="lg"
                      disabled={!canSave || saveMutation.isPending}
                      onClick={handleSave}
                    >
                      {saveMutation.isPending ? (
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 size-4" />
                      )}
                      Lưu đề thi
                    </Button>
                  </div>

                  {saveError || approveAllError ? (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {saveError ?? approveAllError}
                    </div>
                  ) : null}
                  {approvedCount === 0 ? (
                    <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      <CircleAlert className="mt-0.5 size-4 shrink-0" />
                      Cần duyệt ít nhất một câu hỏi trước khi lưu đề.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        {hasDrafts ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold text-on-surface">
                  Câu hỏi nháp
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {drafts.length} câu hỏi, {approvedCount} câu đã duyệt
                </p>
              </div>
              {jobQuery.isFetching ? (
                <Badge variant="secondary">
                  <LoaderCircle className="mr-1.5 size-3.5 animate-spin" />
                  Đang đồng bộ
                </Badge>
              ) : null}
              {hasMissingApprovedDrafts ? (
                <Badge variant="warning">
                  Thiếu {missingApprovedCount} câu
                </Badge>
              ) : null}
            </div>

            <div className="grid gap-4">
              {drafts
                .slice()
                .sort((left, right) => left.order - right.order)
                .map((draft) => (
                  <QuestionDraftCard
                    key={`${draft.id}-${draft.updated_at ?? "draft"}-${draft.is_approved}`}
                    draft={draft}
                    onUpdate={handleDraftUpdate}
                  />
                ))}
            </div>
          </section>
        ) : null}
      </div>

      {toast ? (
        <Toast
          open={toast.open}
          variant={toast.variant}
          onOpenChange={(open) =>
            setToast((current) => (current ? { ...current, open } : current))
          }
        >
          <div className="pr-8">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description ? (
              <ToastDescription className="mt-1">
                {toast.description}
              </ToastDescription>
            ) : null}
          </div>
          <ToastClose />
        </Toast>
      ) : null}
      <ToastViewport />
    </ToastProvider>
  );
}
