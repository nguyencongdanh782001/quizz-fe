import * as Yup from "yup";
import type {
  TeacherCreateExamQuestionRequest,
  TeacherCreateExamRequest,
} from "@/lib/api/types";
import type {
  TeacherExamFormValues,
  TeacherExamQuestionFormValues,
  TeacherExamQuestionType,
} from "./types";
import {
  DEFAULT_TEACHER_EXAM_QUESTION_TYPE,
  TEACHER_EXAM_QUESTION_TYPES,
} from "./types";

const OPTION_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function createFormId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()
    .toString(36)
    .slice(-4)}`;
}

export function createEmptyOption(isCorrect = false) {
  return {
    client_id: createFormId("option"),
    option_text: "",
    image_url: "",
    is_correct: isCorrect,
  };
}

export function createEmptyQuestion(): TeacherExamQuestionFormValues {
  return {
    client_id: createFormId("question"),
    question_type: DEFAULT_TEACHER_EXAM_QUESTION_TYPE,
    prompt: "",
    image_url: "",
    points: 1,
    accepted_answers: "",
    options: [createEmptyOption(true), createEmptyOption(false)],
  };
}

export function createInitialTeacherExamFormValues(): TeacherExamFormValues {
  return {
    title: "",
    description: "",
    image_url: "",
    duration_minutes: 45,
    is_published: false,
    is_active: true,
    questions: [createEmptyQuestion()],
  };
}

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseAcceptedAnswers(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeTeacherExamQuestionType(
  questionType: string | null | undefined,
): TeacherExamQuestionType {
  return questionType === "text"
    ? "text"
    : DEFAULT_TEACHER_EXAM_QUESTION_TYPE;
}

function mapQuestion(
  question: TeacherExamQuestionFormValues,
  index: number,
): TeacherCreateExamQuestionRequest {
  const questionType = normalizeTeacherExamQuestionType(question.question_type);
  const acceptedAnswers = parseAcceptedAnswers(question.accepted_answers);

  return {
    question_type: questionType,
    prompt: question.prompt.trim(),
    image_url: normalizeOptionalText(question.image_url),
    order_index: index + 1,
    points: question.points,
    options:
      questionType === "single_choice"
        ? question.options.map((option, optionIndex) => ({
            option_key: OPTION_KEYS[optionIndex] ?? `OPT_${optionIndex + 1}`,
            option_text: option.option_text.trim(),
            image_url: normalizeOptionalText(option.image_url),
            is_correct: option.is_correct,
          }))
        : [],
    ...(questionType === "text" && acceptedAnswers.length > 0
      ? { accepted_answers: acceptedAnswers }
      : {}),
  };
}

export function mapTeacherExamFormToPayload(
  values: TeacherExamFormValues,
): TeacherCreateExamRequest {
  return {
    title: values.title.trim(),
    description: normalizeOptionalText(values.description),
    image_url: normalizeOptionalText(values.image_url),
    duration_minutes: values.duration_minutes,
    is_published: values.is_published,
    is_active: values.is_active,
    questions: values.questions.map(mapQuestion),
  };
}

export const teacherExamFormSchema = Yup.object({
  title: Yup.string().trim().required("Tiêu đề bài thi là bắt buộc"),
  description: Yup.string(),
  image_url: Yup.string().url("Link hình ảnh không hợp lệ").optional().nullable(),
  duration_minutes: Yup.number()
    .typeError("Thời lượng phải là số")
    .moreThan(0, "Thời lượng phải lớn hơn 0")
    .required("Thời lượng là bắt buộc"),
  is_published: Yup.boolean().required(),
  is_active: Yup.boolean().required(),
  questions: Yup.array()
    .of(
      Yup.object({
        question_type: Yup.string()
          .transform((value, originalValue) =>
            originalValue === undefined ||
            originalValue === null ||
            originalValue === ""
              ? DEFAULT_TEACHER_EXAM_QUESTION_TYPE
              : value,
          )
          .oneOf(
            [...TEACHER_EXAM_QUESTION_TYPES],
            "Loại câu hỏi không hợp lệ",
          )
          .required("Loại câu hỏi là bắt buộc"),
        prompt: Yup.string().trim().required("Nội dung câu hỏi là bắt buộc"),
        image_url: Yup.string()
          .url("Link hình ảnh không hợp lệ")
          .optional()
          .nullable(),
        points: Yup.number()
          .typeError("Điểm phải là số")
          .moreThan(0, "Điểm phải lớn hơn 0")
          .required("Điểm là bắt buộc"),
        accepted_answers: Yup.string().when("question_type", {
          is: "text",
          then: (schema) =>
            schema
              .trim()
              .required("Cần nhập đáp án cho câu hỏi tự luận"),
          otherwise: (schema) => schema.notRequired(),
        }),
        options: Yup.array().when("question_type", {
          is: "single_choice",
          then: (schema) =>
            schema
              .of(
                Yup.object({
                  option_text: Yup.string()
                    .trim()
                    .required("Nội dung đáp án là bắt buộc"),
                  image_url: Yup.string()
                    .url("Link hình ảnh không hợp lệ")
                    .optional()
                    .nullable(),
                  is_correct: Yup.boolean().required(),
                }),
              )
              .min(2, "Mỗi câu hỏi cần ít nhất 2 đáp án")
              .test(
                "single-correct-option",
                "Mỗi câu hỏi phải có đúng 1 đáp án đúng",
                (options) =>
                  (options?.filter((option) => option.is_correct).length ?? 0) ===
                  1,
              ),
          otherwise: (schema) => schema.notRequired(),
        }),
      }),
    )
    .min(1, "Cần ít nhất 1 câu hỏi")
    .required("Cần ít nhất 1 câu hỏi"),
});
