import type {
  AIExamDifficulty,
  AIExamGenerationJobResponse,
  AIExamQuestionType,
  AIExamQuestionTypeDistribution,
  GenerateExamRequest,
} from "@/lib/api/types";
import type { GenerateAIExamFormState, SaveAIExamFormState } from "./types";

export const AI_QUESTION_TYPE_OPTIONS: Array<{
  label: string;
  value: AIExamQuestionType;
}> = [
  { value: "multiple_choice", label: "Trắc nghiệm" },
  { value: "true_false", label: "Đúng / sai" },
  { value: "short_answer", label: "Trả lời ngắn" },
  { value: "essay", label: "Tự luận" },
];

export const AI_DIFFICULTY_OPTIONS: Array<{
  label: string;
  value: AIExamDifficulty;
}> = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
];

export const AI_EXAM_CONTEXT_TEMPLATES = [
  "Luyện thi THPTQG 2026 - Toán - Lớp 12",
  "Phản ứng oxi hóa khử - Hóa học - Lớp 12",
  "Giải phương trình bậc 2 - Toán - THPT",
  "OOP, Design Pattern - Lập trình - Đại học",
] as const;

export const DEFAULT_GENERATE_FORM: GenerateAIExamFormState = {
  additional_instructions: "",
  difficulty_distribution: {
    easy: 3,
    medium: 5,
    hard: 2,
  },
  duration_minutes: 45,
  exam_context: "",
  language: "Vietnamese",
  question_count: 10,
  question_type_distribution: {
    multiple_choice: 10,
  },
  question_types: ["multiple_choice"],
};

export const DEFAULT_SAVE_FORM: SaveAIExamFormState = {
  description: "",
  duration_minutes: 45,
  is_published: false,
  title: "",
};

export function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export function buildBalancedDifficultyDistribution(
  questionCount: number,
): Record<AIExamDifficulty, number> {
  const safeQuestionCount = clampNumber(Math.round(questionCount), 0, 50);
  const easy = Math.floor(safeQuestionCount * 0.3);
  const medium = Math.floor(safeQuestionCount * 0.5);

  return {
    easy,
    medium,
    hard: safeQuestionCount - easy - medium,
  };
}

export function getQuestionTypeDistributionTotal(
  distribution: AIExamQuestionTypeDistribution,
  questionTypes?: AIExamQuestionType[],
): number {
  const types =
    questionTypes ?? AI_QUESTION_TYPE_OPTIONS.map((option) => option.value);

  return types.reduce(
    (total, questionType) => total + (distribution[questionType] ?? 0),
    0,
  );
}

export function buildSelectedQuestionTypeDistribution(
  values: GenerateAIExamFormState,
): AIExamQuestionTypeDistribution {
  return values.question_types.reduce<AIExamQuestionTypeDistribution>(
    (distribution, questionType) => {
      const count = values.question_type_distribution[questionType] ?? 0;

      if (count > 0) {
        distribution[questionType] = count;
      }

      return distribution;
    },
    {},
  );
}

export function getDifficultyTotal(
  distribution: Record<AIExamDifficulty, number>,
): number {
  return distribution.easy + distribution.medium + distribution.hard;
}

export interface ParsedExamContext {
  grade: string;
  subject: string;
  topic: string;
}

export function parseExamContext(value: string): ParsedExamContext | null {
  const parts = value
    .split(/\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 3) {
    return null;
  }

  return {
    grade: parts[parts.length - 1],
    subject: parts[parts.length - 2],
    topic: parts.slice(0, -2).join(" - "),
  };
}

export function getGenerationValidationMessage(
  values: GenerateAIExamFormState,
): string | null {
  const examContext = parseExamContext(values.exam_context);

  if (!examContext) {
    return "Vui lòng nhập bối cảnh đề thi theo format: [Kỹ năng/Chủ đề] - [Môn học] - [Trình độ].";
  }

  if (values.question_types.length === 0) {
    return "Vui lòng chọn ít nhất một loại câu hỏi.";
  }

  const questionTypeTotal = getQuestionTypeDistributionTotal(
    values.question_type_distribution,
    values.question_types,
  );

  const missingQuestionTypeCount = values.question_types.some(
    (questionType) =>
      (values.question_type_distribution[questionType] ?? 0) < 1,
  );

  if (missingQuestionTypeCount) {
    return "Vui lòng nhập số câu cho từng loại câu hỏi đã chọn.";
  }

  if (questionTypeTotal !== values.question_count) {
    return "Tổng số câu theo loại phải bằng số câu của đề.";
  }

  if (values.question_count < 1 || values.question_count > 50) {
    return "Số câu hỏi phải nằm trong khoảng 1 đến 50.";
  }

  if (values.duration_minutes < 1 || values.duration_minutes > 300) {
    return "Thời lượng phải nằm trong khoảng 1 đến 300 phút.";
  }

  if (
    getDifficultyTotal(values.difficulty_distribution) !==
    values.question_count
  ) {
    return "Tổng phân bổ độ khó phải bằng số câu hỏi.";
  }

  return null;
}

export function buildGeneratePayload(
  values: GenerateAIExamFormState,
): GenerateExamRequest {
  const examContext = parseExamContext(values.exam_context);

  if (!examContext) {
    throw new Error(
      "Bối cảnh đề thi chưa đúng format: [Kỹ năng/Chủ đề] - [Môn học] - [Trình độ].",
    );
  }

  return {
    additional_instructions: values.additional_instructions.trim(),
    difficulty_distribution: values.difficulty_distribution,
    duration_minutes: values.duration_minutes,
    grade: examContext.grade,
    language: values.language.trim() || "Vietnamese",
    question_count: values.question_count,
    question_type_distribution: buildSelectedQuestionTypeDistribution(values),
    question_types: values.question_types,
    subject: examContext.subject,
    topic: examContext.topic,
  };
}

export function getStatusLabel(status: string): string {
  const normalized = status.toLowerCase();

  if (
    ["completed", "done", "success", "succeeded", "finished"].includes(
      normalized,
    )
  ) {
    return "Hoàn tất";
  }

  if (["failed", "error", "cancelled", "canceled"].includes(normalized)) {
    return "Có lỗi";
  }

  if (["pending", "queued"].includes(normalized)) {
    return "Đang chờ";
  }

  if (
    ["processing", "running", "in_progress", "generating"].includes(normalized)
  ) {
    return "Đang tạo";
  }

  return status;
}

export function isJobRunning(status: string): boolean {
  return [
    "pending",
    "queued",
    "processing",
    "running",
    "in_progress",
    "generating",
  ].includes(status.toLowerCase());
}

export function isJobFailed(status: string): boolean {
  return ["failed", "error", "cancelled", "canceled"].includes(
    status.toLowerCase(),
  );
}

export function getQuestionTypeLabel(type: AIExamQuestionType): string {
  return (
    AI_QUESTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    type
  );
}

export function getDifficultyLabel(difficulty: AIExamDifficulty): string {
  return (
    AI_DIFFICULTY_OPTIONS.find((option) => option.value === difficulty)
      ?.label ?? difficulty
  );
}

export function formatCorrectAnswer(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(formatCorrectAnswer).filter(Boolean).join("\n");
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function splitDraftOptions(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((option) => option.trim())
    .filter(Boolean);
}

export function mergeDraftOverrides(
  job: AIExamGenerationJobResponse | null | undefined,
  overrides: Record<
    number,
    AIExamGenerationJobResponse["question_drafts"][number]
  >,
): AIExamGenerationJobResponse | null {
  if (!job) {
    return null;
  }

  return {
    ...job,
    question_drafts: job.question_drafts.map(
      (draft) => overrides[draft.id] ?? draft,
    ),
  };
}
