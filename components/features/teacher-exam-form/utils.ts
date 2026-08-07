import * as Yup from "yup";
import type {
  TeacherCreateExamQuestionRequest,
  TeacherCreateExamRequest,
  TeacherUpdateExamRequest,
} from "@/lib/api/types";
import type { TeacherExam } from "@/types/exam";
import { EXAM_FLOW_MESSAGES } from "@/components/exams/exam-flow-messages";
import type {
  TeacherExamFormValues,
  TeacherExamOptionFormValues,
  TeacherExamQuestionFormValues,
  TeacherExamQuestionType,
} from "./types";
import {
  DEFAULT_TEACHER_EXAM_POINT_MODE,
  DEFAULT_TEACHER_EXAM_SCOPE,
  DEFAULT_TEACHER_EXAM_QUESTION_TYPE,
  DEFAULT_TEACHER_EXAM_TOTAL_POINTS,
  TEACHER_EXAM_QUESTION_TYPES,
} from "./types";

const OPTION_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const POINT_PRECISION = 6;
const POINT_DISPLAY_PRECISION = 2;

export function getTeacherExamQuestionPoints(
  questionIndex: number,
  questionCount: number,
  totalPoints = DEFAULT_TEACHER_EXAM_TOTAL_POINTS,
): number {
  if (questionCount <= 0) {
    return 0;
  }

  const precisionFactor = 10 ** POINT_PRECISION;
  const basePoints =
    Math.floor((totalPoints / questionCount) * precisionFactor) /
    precisionFactor;

  if (questionIndex === questionCount - 1) {
    return Number(
      (totalPoints - basePoints * (questionCount - 1)).toFixed(POINT_PRECISION),
    );
  }

  return basePoints;
}

export function getTeacherExamTotalPoints(questionCount: number): number {
  return questionCount > 0 ? DEFAULT_TEACHER_EXAM_TOTAL_POINTS : 0;
}

export function formatTeacherExamPoints(points: number): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: POINT_DISPLAY_PRECISION,
  }).format(points);
}

function createFormId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()
    .toString(36)
    .slice(-4)}`;
}

export function createEmptyOption(
  isCorrect = false,
): TeacherExamOptionFormValues {
  return {
    client_id: createFormId("option"),
    option_key: "",
    option_text: "",
    image_url: "",
    is_correct: isCorrect,
  };
}

export function createOptionKey(index: number): string {
  return OPTION_KEYS[index] ?? `OPT_${index + 1}`;
}

export function normalizeAcceptedAnswers(acceptedAnswers: string[]): string[] {
  return acceptedAnswers.map((answer) => answer.trim()).filter(Boolean);
}

export function richTextToPlainText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote|pre|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\u200B/g, "")
    .trim();
}

export function hasRichTextContent(value: string | null | undefined): boolean {
  return richTextToPlainText(value ?? "").length > 0;
}

export function sanitizeRichTextHtml(value: string): string {
  return value
    .replace(
      /<(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi,
      "",
    )
    .replace(/<(script|style|iframe|object|embed|form)[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .trim();
}

export function isAcceptedAnswerQuestionType(
  questionType: TeacherExamQuestionType,
): questionType is Extract<
  TeacherExamQuestionType,
  "fill_in_blank" | "short_answer"
> {
  return questionType === "fill_in_blank" || questionType === "short_answer";
}

export function isEssayQuestionType(
  questionType: TeacherExamQuestionType,
): questionType is Extract<TeacherExamQuestionType, "text"> {
  return questionType === "text";
}

/**
 * Nhóm câu hỏi không sử dụng danh sách lựa chọn.
 * Giữ helper này để tương thích với các component đang import từ trước.
 */
export function isTextQuestionType(
  questionType: TeacherExamQuestionType,
): questionType is Extract<
  TeacherExamQuestionType,
  "fill_in_blank" | "short_answer" | "text"
> {
  return (
    isAcceptedAnswerQuestionType(questionType) ||
    isEssayQuestionType(questionType)
  );
}

export function isChoiceQuestionType(
  questionType: TeacherExamQuestionType,
): questionType is Extract<
  TeacherExamQuestionType,
  "single_choice" | "multiple_choice" | "true_false"
> {
  return (
    questionType === "single_choice" ||
    questionType === "multiple_choice" ||
    questionType === "true_false"
  );
}

type ChoiceQuestionType = Extract<
  TeacherExamQuestionType,
  "single_choice" | "multiple_choice" | "true_false"
>;

function createTrueFalseOptions(
  correctAnswer: "true" | "false" = "true",
): TeacherExamOptionFormValues[] {
  return reindexTeacherExamOptions([
    {
      ...createEmptyOption(correctAnswer === "true"),
      option_text: "Đúng",
    },
    {
      ...createEmptyOption(correctAnswer === "false"),
      option_text: "Sai",
    },
  ]);
}

function normalizeTrueFalseOptions(
  options: TeacherExamOptionFormValues[],
): TeacherExamOptionFormValues[] {
  const correctOption = options.find((option) => option.is_correct);
  const normalizedCorrectText = richTextToPlainText(
    correctOption?.option_text ?? "",
  ).toLocaleLowerCase("vi-VN");
  const falseIsCorrect =
    normalizedCorrectText === "sai" ||
    normalizedCorrectText === "false" ||
    correctOption?.option_key.toUpperCase() === "B";

  return createTrueFalseOptions(falseIsCorrect ? "false" : "true");
}

function createDefaultChoiceOptions(
  questionType: ChoiceQuestionType,
): TeacherExamOptionFormValues[] {
  if (questionType === "true_false") {
    return createTrueFalseOptions();
  }

  const defaultOptions = [createEmptyOption(true), createEmptyOption(false)];

  return questionType === "single_choice"
    ? reindexTeacherExamOptions(
        defaultOptions.map((option, index) => ({
          ...option,
          is_correct: index === 0,
        })),
      )
    : reindexTeacherExamOptions(defaultOptions);
}

export function reindexTeacherExamOptions(
  options: TeacherExamOptionFormValues[],
): TeacherExamOptionFormValues[] {
  return options.map((option, index) => ({
    ...option,
    option_key: createOptionKey(index),
  }));
}

export function normalizeChoiceOptions(
  questionType: ChoiceQuestionType,
  options: TeacherExamOptionFormValues[],
): TeacherExamOptionFormValues[] {
  if (questionType === "true_false") {
    return normalizeTrueFalseOptions(options);
  }

  const nextOptions = reindexTeacherExamOptions(
    options.length > 0 ? options : createDefaultChoiceOptions(questionType),
  );

  while (nextOptions.length < 2) {
    nextOptions.push(createEmptyOption(false));
  }

  const reindexedOptions = reindexTeacherExamOptions(nextOptions);

  if (questionType === "single_choice") {
    const selectedIndex = Math.max(
      reindexedOptions.findIndex((option) => option.is_correct),
      0,
    );

    return reindexedOptions.map((option, index) => ({
      ...option,
      is_correct: index === selectedIndex,
    }));
  }

  const hasCorrectOption = reindexedOptions.some((option) => option.is_correct);

  return reindexedOptions.map((option, index) => ({
    ...option,
    is_correct: hasCorrectOption ? option.is_correct : index === 0,
  }));
}

export function applyTeacherExamQuestionType(
  question: TeacherExamQuestionFormValues,
  nextQuestionType: TeacherExamQuestionType,
): TeacherExamQuestionFormValues {
  if (isAcceptedAnswerQuestionType(nextQuestionType)) {
    const acceptedAnswers =
      question.accepted_answers.length > 0 ? question.accepted_answers : [""];

    return {
      ...question,
      question_type: nextQuestionType,
      options: [],
      accepted_answers: acceptedAnswers,
    };
  }

  if (isEssayQuestionType(nextQuestionType)) {
    return {
      ...question,
      question_type: nextQuestionType,
      options: [],
      accepted_answers: [],
    };
  }

  const nextOptions = isChoiceQuestionType(question.question_type)
    ? normalizeChoiceOptions(nextQuestionType, question.options)
    : createDefaultChoiceOptions(nextQuestionType);

  return {
    ...question,
    question_type: nextQuestionType,
    options: nextOptions,
    accepted_answers: [],
  };
}

export function createEmptyQuestion(
  questionType: TeacherExamQuestionType = DEFAULT_TEACHER_EXAM_QUESTION_TYPE,
  orderIndex = 1,
): TeacherExamQuestionFormValues {
  const normalizedQuestionType = normalizeTeacherExamQuestionType(questionType);

  return {
    client_id: createFormId("question"),
    question_type: normalizedQuestionType,
    prompt: "",
    explanation: "",
    image_url: "",
    order_index: orderIndex,
    points: 1,
    accepted_answers: isAcceptedAnswerQuestionType(normalizedQuestionType)
      ? [""]
      : [],
    options: isChoiceQuestionType(normalizedQuestionType)
      ? createDefaultChoiceOptions(normalizedQuestionType)
      : [],
  };
}

export function createInitialTeacherExamFormValues(): TeacherExamFormValues {
  return {
    title: "",
    description: "",
    grade: "",
    image_url: "/image/hình tạo đề 1.jpeg",
    scope: DEFAULT_TEACHER_EXAM_SCOPE,
    classroom_id: null,
    duration_minutes: 45,
    start_time: "",
    end_time: "",
    is_published: false,
    is_active: true,
    questions: [createEmptyQuestion()],
  };
}

function normalizeText(value: string): string {
  return value.trim();
}

function formatApiIsoToInput(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(trimmed);

  return match ? `${match[1]}T${match[2]}` : trimmed;
}

export function normalizeTeacherExamQuestionType(
  questionType: string | null | undefined,
): TeacherExamQuestionType {
  if (
    questionType === "single_choice" ||
    questionType === "multiple_choice" ||
    questionType === "true_false" ||
    questionType === "fill_in_blank" ||
    questionType === "short_answer" ||
    questionType === "text"
  ) {
    return questionType;
  }

  // Luồng AI dùng "essay"; payload đề chính dùng "text".
  if (questionType === "essay") {
    return "text";
  }

  return DEFAULT_TEACHER_EXAM_QUESTION_TYPE;
}

export function reindexTeacherExamQuestions(
  questions: TeacherExamQuestionFormValues[],
): TeacherExamQuestionFormValues[] {
  return questions.map((question, index) => {
    const questionType = normalizeTeacherExamQuestionType(
      question.question_type,
    );

    return {
      ...question,
      question_type: questionType,
      order_index: index + 1,
      options: isChoiceQuestionType(questionType)
        ? reindexTeacherExamOptions(question.options)
        : [],
      accepted_answers: isAcceptedAnswerQuestionType(questionType)
        ? question.accepted_answers.length > 0
          ? question.accepted_answers
          : [""]
        : [],
    };
  });
}

function mapQuestion(
  question: TeacherExamQuestionFormValues,
  index: number,
  points: number,
): TeacherCreateExamQuestionRequest {
  const questionType = normalizeTeacherExamQuestionType(question.question_type);
  const acceptedAnswers = normalizeAcceptedAnswers(question.accepted_answers);
  const options = isChoiceQuestionType(questionType)
    ? reindexTeacherExamOptions(question.options)
    : [];

  return {
    question_type: questionType,
    prompt: sanitizeRichTextHtml(question.prompt),
    explanation: sanitizeRichTextHtml(question.explanation),
    image_url: normalizeText(question.image_url),
    order_index: index + 1,
    points,
    options: isChoiceQuestionType(questionType)
      ? options.map((option, optionIndex) => ({
          option_key: option.option_key || createOptionKey(optionIndex),
          option_text: sanitizeRichTextHtml(option.option_text),
          image_url: normalizeText(option.image_url),
          is_correct: option.is_correct,
        }))
      : [],
    accepted_answers: isAcceptedAnswerQuestionType(questionType)
      ? acceptedAnswers
      : [],
  };
}

export function mapTeacherExamDetailToFormValues(
  exam: TeacherExam,
): TeacherExamFormValues {
  const mappedQuestions = reindexTeacherExamQuestions(
    [...(exam.questions ?? [])]
      .sort((left, right) => left.order_index - right.order_index)
      .map((question, index) => {
        const questionType = normalizeTeacherExamQuestionType(
          question.question_type,
        );
        const mappedOptions = question.options.map((option, optionIndex) => ({
          id: option.id,
          client_id: createFormId("option"),
          option_key: option.option_key || createOptionKey(optionIndex),
          option_text: option.option_text,
          image_url: option.image_url ?? "",
          is_correct: option.is_correct,
        }));
        const normalizedAcceptedAnswers = normalizeAcceptedAnswers(
          question.accepted_answers,
        );

        return {
          id: question.id,
          client_id: createFormId("question"),
          question_type: questionType,
          prompt: question.prompt,
          explanation: question.explanation ?? "",
          image_url: question.image_url ?? "",
          order_index: question.order_index || index + 1,
          points: question.points,
          options: isChoiceQuestionType(questionType)
            ? normalizeChoiceOptions(
                questionType,
                mappedOptions.length > 0
                  ? mappedOptions
                  : createDefaultChoiceOptions(questionType),
              )
            : [],
          accepted_answers: isAcceptedAnswerQuestionType(questionType)
            ? normalizedAcceptedAnswers.length > 0
              ? normalizedAcceptedAnswers
              : [""]
            : [],
        };
      }),
  );

  return {
    title: exam.title,
    description: exam.description ?? "",
    grade: exam.grade ?? "",
    image_url: exam.image_url ?? "",
    scope: exam.is_published
      ? (exam.is_active ? "public" : "unlisted")
      : "private",
    classroom_id: exam.classroom_id ?? null,
    duration_minutes: exam.duration_minutes,
    start_time: formatApiIsoToInput(exam.start_time),
    end_time: formatApiIsoToInput(exam.end_time),
    is_published: exam.is_published,
    is_active: exam.is_active,
    questions: mappedQuestions,
  };
}

function buildExamPayload(
  values: TeacherExamFormValues,
): TeacherCreateExamRequest {
  const startTime = values.start_time.trim();
  const endTime = values.end_time.trim();
  const questions = reindexTeacherExamQuestions(values.questions);

  return {
    title: values.title.trim(),
    description: normalizeText(values.description),
    grade: normalizeText(values.grade),
    image_url: normalizeText(values.image_url),
    scope: values.classroom_id ? "class" : "system",
    classroom_id: values.classroom_id ?? undefined,
    duration_minutes: values.duration_minutes,
    start_time: startTime || undefined,
    end_time: endTime || undefined,
    is_published: values.is_published,
    is_active: values.is_active,
    total_points: DEFAULT_TEACHER_EXAM_TOTAL_POINTS,
    point_mode: DEFAULT_TEACHER_EXAM_POINT_MODE,
    assignment_type: "exam",
    max_attempts: null,
    questions: questions.map((question, index) =>
      mapQuestion(
        question,
        index,
        getTeacherExamQuestionPoints(index, questions.length),
      ),
    ),
  };
}

export function mapTeacherExamFormToPayload(
  values: TeacherExamFormValues,
): TeacherCreateExamRequest {
  return buildExamPayload(values);
}

export function mapTeacherExamFormToUpdatePayload(
  values: TeacherExamFormValues,
): TeacherUpdateExamRequest {
  return {
    ...buildExamPayload(values),
  };
}

function richTextRequired(message: string) {
  return Yup.string().test("rich-text-required", message, (value) =>
    hasRichTextContent(value),
  );
}

export const teacherExamFormSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required(EXAM_FLOW_MESSAGES.validation.examTitleRequired),
  description: Yup.string(),
  grade: Yup.string()
    .trim()
    .required(EXAM_FLOW_MESSAGES.validation.gradeRequired),
  scope: Yup.string().trim().required(),
  classroom_id: Yup.number().nullable(),
  image_url: Yup.string().optional().nullable(),
  duration_minutes: Yup.number()
    .typeError("Thời lượng phải là số")
    .moreThan(0, EXAM_FLOW_MESSAGES.validation.durationGreaterThanZero)
    .required("Thời lượng là bắt buộc"),
  start_time: Yup.string(),
  end_time: Yup.string().test(
    "end-after-start",
    EXAM_FLOW_MESSAGES.validation.endTimeAfterStart,
    function validateEndAfterStart(value) {
      const startTime = this.parent.start_time;

      if (!value || !startTime) {
        return true;
      }

      return new Date(value).getTime() > new Date(startTime).getTime();
    },
  ),
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
          .oneOf([...TEACHER_EXAM_QUESTION_TYPES], "Loại câu hỏi không hợp lệ")
          .required("Loại câu hỏi là bắt buộc"),
        prompt: richTextRequired(
          EXAM_FLOW_MESSAGES.validation.questionPromptRequired,
        ),
        explanation: Yup.string(),
        image_url: Yup.string().optional().nullable(),
        order_index: Yup.number().min(1).required(),
        points: Yup.number()
          .typeError("Điểm phải là số")
          .moreThan(0, EXAM_FLOW_MESSAGES.validation.pointsGreaterThanZero)
          .required("Điểm là bắt buộc"),
        accepted_answers: Yup.array()
          .of(Yup.string().trim().required("Đáp án không được để trống"))
          .when("question_type", {
            is: (questionType: TeacherExamQuestionType) =>
              questionType === "fill_in_blank" ||
              questionType === "short_answer",
            then: (schema) =>
              schema.min(1, EXAM_FLOW_MESSAGES.validation.minAcceptedAnswers),
            otherwise: (schema) => schema.max(0).default([]),
          }),
        options: Yup.array().when("question_type", {
          is: (questionType: TeacherExamQuestionType) =>
            questionType === "single_choice" ||
            questionType === "multiple_choice" ||
            questionType === "true_false",
          then: (schema) =>
            schema
              .of(
                Yup.object({
                  option_key: Yup.string()
                    .trim()
                    .required("Ký hiệu đáp án là bắt buộc"),
                  option_text: richTextRequired("Nội dung đáp án là bắt buộc"),
                  image_url: Yup.string().optional().nullable(),
                  is_correct: Yup.boolean().required(),
                }),
              )
              .min(2, EXAM_FLOW_MESSAGES.validation.minOptions)
              .test(
                "unique-option-keys",
                EXAM_FLOW_MESSAGES.validation.duplicateOptionKeys,
                (options) => {
                  const normalizedOptionKeys = (options ?? [])
                    .map((option) => option.option_key.trim().toUpperCase())
                    .filter(Boolean);

                  return (
                    new Set(normalizedOptionKeys).size ===
                    normalizedOptionKeys.length
                  );
                },
              )
              .test(
                "single-question-only-one-correct",
                EXAM_FLOW_MESSAGES.validation.singleQuestionOnlyOneCorrect,
                function validateSingleQuestion(options) {
                  const questionType = normalizeTeacherExamQuestionType(
                    this.parent.question_type,
                  );

                  if (
                    questionType !== "single_choice" &&
                    questionType !== "true_false"
                  ) {
                    return true;
                  }

                  const correctOptionCount =
                    options?.filter((option) => option.is_correct).length ?? 0;

                  return correctOptionCount === 1;
                },
              )
              .test(
                "choice-min-correct-options",
                EXAM_FLOW_MESSAGES.validation.minCorrectOptions,
                (options) =>
                  (options?.filter((option) => option.is_correct).length ??
                    0) >= 1,
              ),
          otherwise: (schema) => schema.max(0).default([]),
        }),
      }),
    )
    .min(1, EXAM_FLOW_MESSAGES.validation.examMustHaveQuestions)
    .required(EXAM_FLOW_MESSAGES.validation.examMustHaveQuestions),
});
