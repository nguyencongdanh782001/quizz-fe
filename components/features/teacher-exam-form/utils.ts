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
  DEFAULT_TEACHER_EXAM_SCOPE,
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
  return acceptedAnswers
    .map((answer) => answer.trim())
    .filter(Boolean);
}

export function isTextQuestionType(
  questionType: TeacherExamQuestionType,
): boolean {
  return questionType === "text";
}

export function isChoiceQuestionType(
  questionType: TeacherExamQuestionType,
): questionType is Exclude<TeacherExamQuestionType, "text"> {
  return questionType === "single_choice" || questionType === "multiple_choice";
}

function createDefaultChoiceOptions(
  questionType: Exclude<TeacherExamQuestionType, "text">,
): TeacherExamOptionFormValues[] {
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
  questionType: Exclude<TeacherExamQuestionType, "text">,
  options: TeacherExamOptionFormValues[],
): TeacherExamOptionFormValues[] {
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
  if (nextQuestionType === "text") {
    return {
      ...question,
      question_type: nextQuestionType,
      options: [],
      accepted_answers: [""],
    };
  }

  const nextOptions = isTextQuestionType(question.question_type)
    ? createDefaultChoiceOptions(nextQuestionType)
    : normalizeChoiceOptions(nextQuestionType, question.options);

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
    image_url: "",
    order_index: orderIndex,
    points: 1,
    accepted_answers: normalizedQuestionType === "text" ? [""] : [],
    options:
      normalizedQuestionType === "text"
        ? []
        : createDefaultChoiceOptions(normalizedQuestionType),
  };
}

export function createInitialTeacherExamFormValues(): TeacherExamFormValues {
  return {
    title: "",
    description: "",
    image_url: "",
    scope: DEFAULT_TEACHER_EXAM_SCOPE,
    classroom_id: null,
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

export function normalizeTeacherExamQuestionType(
  questionType: string | null | undefined,
): TeacherExamQuestionType {
  if (questionType === "text" || questionType === "multiple_choice") {
    return questionType;
  }

  return DEFAULT_TEACHER_EXAM_QUESTION_TYPE;
}

export function reindexTeacherExamQuestions(
  questions: TeacherExamQuestionFormValues[],
): TeacherExamQuestionFormValues[] {
  return questions.map((question, index) => {
    const questionType = normalizeTeacherExamQuestionType(question.question_type);

    return {
      ...question,
      order_index: index + 1,
      options: isChoiceQuestionType(questionType)
        ? reindexTeacherExamOptions(question.options)
        : [],
      accepted_answers: isTextQuestionType(questionType)
        ? question.accepted_answers
        : [],
    };
  });
}

function mapQuestion(
  question: TeacherExamQuestionFormValues,
  index: number,
): TeacherCreateExamQuestionRequest {
  const questionType = normalizeTeacherExamQuestionType(question.question_type);
  const acceptedAnswers = normalizeAcceptedAnswers(question.accepted_answers);
  const options = isChoiceQuestionType(questionType)
    ? reindexTeacherExamOptions(question.options)
    : [];

  return {
    question_type: questionType,
    prompt: question.prompt.trim(),
    image_url: normalizeOptionalText(question.image_url),
    order_index: index + 1,
    points: question.points,
    options: isChoiceQuestionType(questionType)
      ? options.map((option, optionIndex) => ({
          option_key: option.option_key || createOptionKey(optionIndex),
          option_text: option.option_text.trim(),
          image_url: normalizeOptionalText(option.image_url),
          is_correct: option.is_correct,
        }))
      : [],
    accepted_answers: questionType === "text" ? acceptedAnswers : [],
  };
}

function buildExamPayload(values: TeacherExamFormValues): TeacherCreateExamRequest {
  return {
    title: values.title.trim(),
    description: normalizeOptionalText(values.description),
    image_url: normalizeOptionalText(values.image_url),
    duration_minutes: values.duration_minutes,
    is_published: values.is_published,
    is_active: values.is_active,
    questions: reindexTeacherExamQuestions(values.questions).map(mapQuestion),
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
    scope: values.scope.trim() || DEFAULT_TEACHER_EXAM_SCOPE,
    classroom_id: values.classroom_id,
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
          option_text: option.option_text.trim(),
          image_url: option.image_url ?? "",
          is_correct: option.is_correct,
        }));

        return {
          id: question.id,
          client_id: createFormId("question"),
          question_type: questionType,
          prompt: question.prompt,
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
          accepted_answers: isTextQuestionType(questionType)
            ? normalizeAcceptedAnswers(question.accepted_answers).length > 0
              ? normalizeAcceptedAnswers(question.accepted_answers)
              : [""]
            : [],
        };
      }),
  );

  return {
    title: exam.title,
    description: exam.description ?? "",
    image_url: exam.image_url ?? "",
    scope: exam.scope ?? DEFAULT_TEACHER_EXAM_SCOPE,
    classroom_id: exam.classroom_id ?? null,
    duration_minutes: exam.duration_minutes,
    is_published: exam.is_published,
    is_active: exam.is_active,
    questions: mappedQuestions,
  };
}

export const teacherExamFormSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required(EXAM_FLOW_MESSAGES.validation.examTitleRequired),
  description: Yup.string(),
  scope: Yup.string().trim().required(),
  classroom_id: Yup.number().nullable(),
  image_url: Yup.string().url("Link hình ảnh không hợp lệ").optional().nullable(),
  duration_minutes: Yup.number()
    .typeError("Thời lượng phải là số")
    .moreThan(0, EXAM_FLOW_MESSAGES.validation.durationGreaterThanZero)
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
        prompt: Yup.string()
          .trim()
          .required(EXAM_FLOW_MESSAGES.validation.questionPromptRequired),
        image_url: Yup.string()
          .url("Link hình ảnh không hợp lệ")
          .optional()
          .nullable(),
        order_index: Yup.number().min(1).required(),
        points: Yup.number()
          .typeError("Điểm phải là số")
          .moreThan(0, EXAM_FLOW_MESSAGES.validation.pointsGreaterThanZero)
          .required("Điểm là bắt buộc"),
        accepted_answers: Yup.array()
          .of(Yup.string().trim().required("Đáp án không được để trống"))
          .when("question_type", {
            is: "text",
            then: (schema) =>
              schema.min(1, EXAM_FLOW_MESSAGES.validation.minAcceptedAnswers),
            otherwise: (schema) => schema.max(0).default([]),
          }),
        options: Yup.array().when("question_type", {
          is: (questionType: TeacherExamQuestionType) =>
            questionType === "single_choice" ||
            questionType === "multiple_choice",
          then: (schema) =>
            schema
              .of(
                Yup.object({
                  option_key: Yup.string()
                    .trim()
                    .required("Ký hiệu đáp án là bắt buộc"),
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

                  if (questionType !== "single_choice") {
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
                function validateChoiceOptions(options) {
                  const questionType = normalizeTeacherExamQuestionType(
                    this.parent.question_type,
                  );
                  const correctOptionCount =
                    options?.filter((option) => option.is_correct).length ?? 0;

                  return questionType === "text"
                    ? true
                    : correctOptionCount >= 1;
                },
              ),
          otherwise: (schema) => schema.max(0).default([]),
        }),
      }),
    )
    .min(1, EXAM_FLOW_MESSAGES.validation.examMustHaveQuestions)
    .required(EXAM_FLOW_MESSAGES.validation.examMustHaveQuestions),
});
