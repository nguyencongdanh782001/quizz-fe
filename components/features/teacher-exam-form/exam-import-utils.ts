import type { TeacherExamFormValues, TeacherExamQuestionType } from "./types";
import {
  createEmptyOption,
  createEmptyQuestion,
  createInitialTeacherExamFormValues,
  createOptionKey,
  normalizeChoiceOptions,
  reindexTeacherExamQuestions,
} from "./utils";

export type ExamImportSheetName = "exam" | "questions" | "options";

export interface ExamImportValidationError {
  message: string;
  rowNumber?: number;
  sheet: ExamImportSheetName;
}

export interface ExamImportParseInput {
  classroomId?: number | null;
  examRows: SpreadsheetRow[];
  optionRows: SpreadsheetRow[];
  questionRows: SpreadsheetRow[];
  scope: string;
}

export interface ExamImportParseResult {
  errors: ExamImportValidationError[];
  values: TeacherExamFormValues;
}

export type SpreadsheetRow = Record<string, unknown>;

type NormalizedSpreadsheetRow = Record<string, string>;

interface ImportQuestionDraft {
  acceptedAnswers: string[];
  options: ImportOptionDraft[];
  orderIndex: number;
  points: number;
  prompt: string;
  questionType: TeacherExamQuestionType;
  rowNumber: number;
}

interface ImportOptionDraft {
  isCorrect: boolean;
  optionKey: string;
  optionText: string;
  rowNumber: number;
}

const SUPPORTED_QUESTION_TYPES = [
  "single_choice",
  "multiple_choice",
  "text",
] as const satisfies readonly TeacherExamQuestionType[];

const TRUE_VALUES = new Set(["true", "1", "yes", "y", "x", "co", "có", "dung", "đúng"]);
const FALSE_VALUES = new Set(["false", "0", "no", "n", "khong", "không", "sai", ""]);

function normalizeKey(key: string): string {
  return key.trim().toLowerCase();
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value).trim();
}

function normalizeRow(row: SpreadsheetRow): NormalizedSpreadsheetRow {
  return Object.entries(row).reduce<NormalizedSpreadsheetRow>(
    (normalizedRow, [key, value]) => ({
      ...normalizedRow,
      [normalizeKey(key)]: normalizeCellValue(value),
    }),
    {},
  );
}

function getCell(row: NormalizedSpreadsheetRow, key: string): string {
  return row[normalizeKey(key)] ?? "";
}

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseBoolean(value: string, fallback: boolean): boolean {
  const normalized = value.trim().toLowerCase();

  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return fallback;
}

function splitAcceptedAnswers(value: string): string[] {
  return value
    .split(/[;|\n]+/)
    .map((answer) => answer.trim())
    .filter(Boolean);
}

function formatRowError(
  sheet: ExamImportSheetName,
  rowNumber: number,
  message: string,
): ExamImportValidationError {
  return {
    sheet,
    rowNumber,
    message,
  };
}

function parseQuestionType(value: string): TeacherExamQuestionType | null {
  const normalizedValue = value.trim();

  return SUPPORTED_QUESTION_TYPES.includes(
    normalizedValue as TeacherExamQuestionType,
  )
    ? (normalizedValue as TeacherExamQuestionType)
    : null;
}

function getSpreadsheetRowNumber(index: number): number {
  return index + 2;
}

function parseExamRows(
  rows: SpreadsheetRow[],
  scope: string,
  classroomId: number | null,
): Pick<
  TeacherExamFormValues,
  | "classroom_id"
  | "description"
  | "duration_minutes"
  | "image_url"
  | "is_active"
  | "is_published"
  | "scope"
  | "title"
> & { errors: ExamImportValidationError[] } {
  const errors: ExamImportValidationError[] = [];
  const firstRow = rows[0] ? normalizeRow(rows[0]) : null;
  const title = firstRow ? getCell(firstRow, "title") : "";
  const description = firstRow ? getCell(firstRow, "description") : "";
  const durationValue = firstRow ? getCell(firstRow, "duration_minutes") : "";
  const durationMinutes = parsePositiveNumber(durationValue);

  if (!firstRow) {
    errors.push({
      sheet: "exam",
      message: "Trang tính exam chưa có dữ liệu đề thi",
    });
  }

  if (!title) {
    errors.push({
      sheet: "exam",
      rowNumber: firstRow ? 2 : undefined,
      message: "Tiêu đề đề thi là bắt buộc",
    });
  }

  if (!durationMinutes) {
    errors.push({
      sheet: "exam",
      rowNumber: firstRow ? 2 : undefined,
      message: "Thời lượng phải lớn hơn 0",
    });
  }

  return {
    classroom_id: classroomId,
    description,
    duration_minutes: durationMinutes ?? 45,
    errors,
    image_url: "",
    is_active: true,
    is_published: firstRow
      ? parseBoolean(getCell(firstRow, "is_published"), false)
      : false,
    scope,
    title,
  };
}

function parseOptionRows(
  rows: SpreadsheetRow[],
  errors: ExamImportValidationError[],
): Map<number, ImportOptionDraft[]> {
  return rows.reduce<Map<number, ImportOptionDraft[]>>((groupedOptions, row, index) => {
    const rowNumber = getSpreadsheetRowNumber(index);
    const normalizedRow = normalizeRow(row);
    const questionOrderValue = getCell(normalizedRow, "question_order");
    const questionOrder = Number(questionOrderValue);
    const optionText = getCell(normalizedRow, "option_text");

    if (!Number.isInteger(questionOrder) || questionOrder <= 0) {
      errors.push(
        formatRowError(
          "options",
          rowNumber,
          "question_order phải là số thứ tự câu hỏi hợp lệ",
        ),
      );
      return groupedOptions;
    }

    if (!optionText) {
      errors.push(
        formatRowError("options", rowNumber, "Nội dung đáp án là bắt buộc"),
      );
    }

    const nextOption: ImportOptionDraft = {
      isCorrect: parseBoolean(getCell(normalizedRow, "is_correct"), false),
      optionKey: getCell(normalizedRow, "option_key"),
      optionText,
      rowNumber,
    };
    const currentOptions = groupedOptions.get(questionOrder) ?? [];

    groupedOptions.set(questionOrder, [...currentOptions, nextOption]);
    return groupedOptions;
  }, new Map<number, ImportOptionDraft[]>());
}

function parseQuestionRows(
  rows: SpreadsheetRow[],
  optionsByQuestionOrder: Map<number, ImportOptionDraft[]>,
  errors: ExamImportValidationError[],
): ImportQuestionDraft[] {
  const seenOrderIndexes = new Set<number>();

  return rows.reduce<ImportQuestionDraft[]>((questions, row, index) => {
    const rowNumber = getSpreadsheetRowNumber(index);
    const normalizedRow = normalizeRow(row);
    const orderValue = getCell(normalizedRow, "order_index");
    const orderIndex = Number(orderValue);
    const questionType = parseQuestionType(getCell(normalizedRow, "question_type"));
    const prompt = getCell(normalizedRow, "prompt");
    const points = parsePositiveNumber(getCell(normalizedRow, "points"));

    if (!Number.isInteger(orderIndex) || orderIndex <= 0) {
      errors.push(
        formatRowError(
          "questions",
          rowNumber,
          "order_index phải là số thứ tự câu hỏi hợp lệ",
        ),
      );
    } else if (seenOrderIndexes.has(orderIndex)) {
      errors.push(
        formatRowError("questions", rowNumber, "order_index không được trùng"),
      );
    } else {
      seenOrderIndexes.add(orderIndex);
    }

    if (!questionType) {
      errors.push(
        formatRowError("questions", rowNumber, "Loại câu hỏi không hợp lệ"),
      );
    }

    if (!prompt) {
      errors.push(
        formatRowError("questions", rowNumber, "Nội dung câu hỏi là bắt buộc"),
      );
    }

    if (!points) {
      errors.push(formatRowError("questions", rowNumber, "Điểm phải lớn hơn 0"));
    }

    const safeOrderIndex =
      Number.isInteger(orderIndex) && orderIndex > 0 ? orderIndex : index + 1;
    const safeQuestionType = questionType ?? "single_choice";
    const acceptedAnswers = splitAcceptedAnswers(
      getCell(normalizedRow, "accepted_answers"),
    );
    const options = optionsByQuestionOrder.get(safeOrderIndex) ?? [];

    if (safeQuestionType === "text" && acceptedAnswers.length === 0) {
      errors.push(
        formatRowError(
          "questions",
          rowNumber,
          "Câu hỏi tự luận phải có accepted_answers",
        ),
      );
    }

    if (safeQuestionType !== "text") {
      const correctOptionCount = options.filter((option) => option.isCorrect).length;

      if (options.length < 2) {
        errors.push(
          formatRowError(
            "questions",
            rowNumber,
            "Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án",
          ),
        );
      }

      if (safeQuestionType === "single_choice" && correctOptionCount !== 1) {
        errors.push(
          formatRowError(
            "questions",
            rowNumber,
            "Câu hỏi một đáp án phải có đúng 1 đáp án đúng",
          ),
        );
      }

      if (safeQuestionType === "multiple_choice" && correctOptionCount < 1) {
        errors.push(
          formatRowError(
            "questions",
            rowNumber,
            "Câu hỏi nhiều đáp án phải có ít nhất 1 đáp án đúng",
          ),
        );
      }
    }

    questions.push({
      acceptedAnswers,
      options,
      orderIndex: safeOrderIndex,
      points: points ?? 1,
      prompt,
      questionType: safeQuestionType,
      rowNumber,
    });

    return questions;
  }, []);
}

function mapQuestionDraftsToFormValues(
  questionDrafts: ImportQuestionDraft[],
): TeacherExamFormValues["questions"] {
  return reindexTeacherExamQuestions(
    questionDrafts
      .sort((left, right) => left.orderIndex - right.orderIndex)
      .map((questionDraft, questionIndex) => {
        const baseQuestion = createEmptyQuestion(
          questionDraft.questionType,
          questionIndex + 1,
        );
        const mappedOptions =
          questionDraft.questionType === "text"
            ? []
            : questionDraft.options.map((optionDraft, optionIndex) => ({
                ...createEmptyOption(optionDraft.isCorrect),
                option_key: optionDraft.optionKey || createOptionKey(optionIndex),
                option_text: optionDraft.optionText,
              }));

        return {
          ...baseQuestion,
          accepted_answers:
            questionDraft.questionType === "text"
              ? questionDraft.acceptedAnswers
              : [],
          options:
            questionDraft.questionType === "text"
              ? []
              : normalizeChoiceOptions(questionDraft.questionType, mappedOptions),
          order_index: questionIndex + 1,
          points: questionDraft.points,
          prompt: questionDraft.prompt,
          question_type: questionDraft.questionType,
        };
      }),
  );
}

export function formatImportValidationError(
  error: ExamImportValidationError,
): string {
  const location = error.rowNumber
    ? `Dòng ${error.rowNumber} (${error.sheet})`
    : `Trang tính ${error.sheet}`;

  return `${location}: ${error.message}`;
}

export function parseExamImportRows({
  classroomId = null,
  examRows,
  optionRows,
  questionRows,
  scope,
}: ExamImportParseInput): ExamImportParseResult {
  const errors: ExamImportValidationError[] = [];
  const hasWorkbookData =
    examRows.length > 0 || questionRows.length > 0 || optionRows.length > 0;
  const examValues = parseExamRows(examRows, scope, classroomId);
  const optionsByQuestionOrder = parseOptionRows(optionRows, errors);
  const questionDrafts = parseQuestionRows(
    questionRows,
    optionsByQuestionOrder,
    errors,
  );

  errors.push(...examValues.errors);

  if (!hasWorkbookData) {
    errors.push({
      sheet: "exam",
      message: "File Excel không có dữ liệu",
    });
  }

  if (questionDrafts.length === 0) {
    errors.push({
      sheet: "questions",
      message: "Đề thi phải có ít nhất 1 câu hỏi",
    });
  }

  return {
    errors,
    values: {
      ...createInitialTeacherExamFormValues(),
      ...examValues,
      questions:
        questionDrafts.length > 0
          ? mapQuestionDraftsToFormValues(questionDrafts)
          : [createEmptyQuestion()],
    },
  };
}
