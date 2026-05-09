import { client } from "@/lib/api/client";
import type {
  MessageResponse,
  TeacherCreateExamRequest,
  TeacherCreateSystemExamResponse,
  TeacherExamOptionSchema,
  TeacherExamQuestionSchema,
  TeacherExamSummarySchema,
  TeacherSystemExamDetailResponse,
  TeacherSystemExamListResponse,
} from "@/lib/api/types";
import type {
  TeacherExam,
  TeacherExamListResult,
  TeacherExamOption,
  TeacherExamQuery,
  TeacherExamQuestion,
  TeacherExamQuestionType,
} from "@/types/exam";

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
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

function toQuestionType(value: unknown): TeacherExamQuestionType {
  return value === "text" ? "text" : "single_choice";
}

function mapExamOption(
  option: TeacherExamOptionSchema,
  index: number,
): TeacherExamOption {
  return {
    id: toNumberValue(option.id, index + 1),
    option_key: toStringValue(option.option_key, String.fromCharCode(65 + index)),
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
    image_url: toNullableString(question.image_url),
    points: toNumberValue(question.points),
    options: (question.options ?? []).map(mapExamOption),
    accepted_answers: rawAcceptedAnswers
      .map((answer) => toStringValue(answer).trim())
      .filter(Boolean),
  };
}

type TeacherExamDetailPayload = TeacherExamSummarySchema & {
  questions?: TeacherExamQuestionSchema[] | null;
};

function mapTeacherExam(exam: TeacherExamDetailPayload): TeacherExam {
  const rawQuestions = Array.isArray(exam.questions) ? exam.questions : null;
  return {
    id: toNumberValue(exam.id),
    title: toStringValue(exam.title),
    description: toStringValue(exam.description),
    image_url: toNullableString(exam.image_url),
    scope: toNullableString(exam.scope),
    classroom_id:
      exam.classroom_id === null || exam.classroom_id === undefined
        ? null
        : toNumberValue(exam.classroom_id),
    classroom_name: toNullableString(exam.classroom_name),
    duration_minutes: toNumberValue(exam.duration_minutes),
    total_points: toNumberValue(exam.total_points),
    question_count: toNumberValue(exam.question_count),
    attempt_count: toNumberValue(exam.attempt_count),
    is_published: toBooleanValue(exam.is_published),
    is_active: toBooleanValue(exam.is_active),
    created_at: toStringValue(exam.created_at),
    updated_at: toStringValue(exam.updated_at),
    questions: rawQuestions?.map(mapExamQuestion),
  };
}

function toApiParams(query: TeacherExamQuery): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};

  if (query.search?.trim()) {
    params.search = query.search.trim();
  }

  if (typeof query.is_published === "boolean") {
    params.is_published = query.is_published;
  }

  if (typeof query.is_active === "boolean") {
    params.is_active = query.is_active;
  }

  if (query.sort_by) {
    params.sort_by = query.sort_by;
  }

  if (query.sort_order) {
    params.sort_order = query.sort_order;
  }

  return params;
}

export async function getTeacherSystemExams(
  query: TeacherExamQuery = {},
): Promise<TeacherExamListResult> {
  const response = await client.get<TeacherSystemExamListResponse>(
    "/teacher/system/exams",
    {
      params: toApiParams(query),
    },
  );

  return {
    items: (response.data.items ?? []).map(mapTeacherExam),
  };
}

export async function getTeacherSystemExamDetail(
  examId: number | string,
): Promise<TeacherExam> {
  const response = await client.get<TeacherSystemExamDetailResponse>(
    `/teacher/system/exams/${examId}`,
  );

  return mapTeacherExam(response.data);
}

export async function deleteTeacherSystemExam(
  examId: number | string,
): Promise<string> {
  const response = await client.delete<MessageResponse>(
    `/teacher/system/exams/${examId}`,
  );

  return response.data.message;
}

export async function updateTeacherSystemExamPublishState(
  examId: number | string,
  isPublished: boolean,
): Promise<string> {
  const response = await client.patch<MessageResponse | { message?: string }>(
    `/teacher/system/exams/${examId}/publish`,
    {
      is_published: isPublished,
    },
  );

  return response.data.message ?? "Cập nhật trạng thái bài thi thành công.";
}

export async function createTeacherSystemExam(
  data: TeacherCreateExamRequest,
): Promise<{ message: string; exam: TeacherExam }> {
  const response = await client.post<TeacherCreateSystemExamResponse>(
    "/teacher/system/exams",
    data,
  );

  return {
    message: response.data.message,
    exam: mapTeacherExam(response.data.exam),
  };
}
