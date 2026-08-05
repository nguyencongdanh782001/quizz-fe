import type {
  TeacherExamOptionSchema,
  TeacherExamQuestionSchema,
  TeacherExamSummarySchema,
  ExamAssignmentType,
} from "@/lib/api/types";
import type {
  TeacherExam,
  TeacherExamOption,
  TeacherExamQuestion,
  TeacherExamQuestionType,
} from "@/types/exam";

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function toNullableString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  return null;
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toBooleanValue(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true" || normalized === "1") {
      return true;
    }

    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }

  return fallback;
}

function toAssignmentType(value: unknown): ExamAssignmentType {
  return value === "test" ? "test" : "exam";
}

function toQuestionType(value: unknown): TeacherExamQuestionType {
  if (
    value === "text" ||
    value === "multiple_choice" ||
    value === "true_false" ||
    value === "fill_in_blank" ||
    value === "short_answer"
  ) {
    return value;
  }

  return "single_choice";
}

function mapExamOption(
  option: TeacherExamOptionSchema,
  index: number,
): TeacherExamOption {
  return {
    id: toNumberValue(option.id, index + 1),
    option_key: toStringValue(
      option.option_key,
      String.fromCharCode(65 + index),
    ),
    option_text: toStringValue(option.option_text),
    image_url: toNullableString(option.image_url),
    is_correct: toBooleanValue(option.is_correct),
  };
}

function mapExamQuestion(
  question: TeacherExamQuestionSchema,
  index: number,
): TeacherExamQuestion {
  const rawAcceptedAnswers = Array.isArray(question.accepted_answers)
    ? question.accepted_answers
    : [];

  return {
    id: toNumberValue(question.id, index + 1),
    question_type: toQuestionType(question.question_type),
    order_index: toNumberValue(question.order_index, index + 1),
    prompt: toStringValue(question.prompt),
    explanation: toNullableString(question.explanation),
    image_url: toNullableString(question.image_url),
    points: toNumberValue(question.points),
    options: (question.options ?? []).map(mapExamOption),
    accepted_answers: rawAcceptedAnswers
      .map((answer) => toStringValue(answer).trim())
      .filter(Boolean),
  };
}

export type TeacherExamDetailPayload = TeacherExamSummarySchema & {
  questions?: TeacherExamQuestionSchema[] | null;
};

export function mapTeacherExam(exam: TeacherExamDetailPayload): TeacherExam {
  const rawQuestions = Array.isArray(exam.questions) ? exam.questions : null;

  return {
    id: toNumberValue(exam.id),
    title: toStringValue(exam.title),
    description: toStringValue(exam.description),
    grade: toStringValue(exam.grade),
    image_url: toNullableString(exam.image_url),
    scope: toNullableString(exam.scope),
    classroom_id:
      exam.classroom_id === null || exam.classroom_id === undefined
        ? null
        : toNumberValue(exam.classroom_id),
    classroom_name: toNullableString(exam.classroom_name),
    duration_minutes: toNumberValue(exam.duration_minutes),
    start_time: toStringValue(exam.start_time),
    end_time: toStringValue(exam.end_time),
    assignment_type: toAssignmentType(exam.assignment_type),
    max_attempts:
      exam.max_attempts === null || exam.max_attempts === undefined
        ? null
        : toNumberValue(exam.max_attempts),
    total_points: toNumberValue(exam.total_points),
    question_count: toNumberValue(exam.question_count),
    attempt_count: toNumberValue(exam.attempt_count),
    is_published: toBooleanValue(exam.is_published),
    is_active: toBooleanValue(exam.is_active),
    created_at: toStringValue(exam.created_at),
    updated_at: toStringValue(exam.updated_at),
    questions: rawQuestions
      ?.map(mapExamQuestion)
      .sort((left, right) => left.order_index - right.order_index),
  };
}
