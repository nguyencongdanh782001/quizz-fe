import type {
  Question,
  QuestionType,
  StudentAnswer,
  StudentAnswersByQuestion,
} from "@/types/exam.types";

export const TEXT_ANSWER_REQUIRED_MESSAGE = "Vui lòng nhập câu trả lời";

export type StudentAnswerStateValue = StudentAnswer | string[];
export type StudentAnswerLookup = Partial<
  Record<string, StudentAnswerStateValue>
>;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function isSingleChoiceQuestionType(type: QuestionType): boolean {
  return type === "single" || type === "multiple_choice" || type === "true_false";
}

export function isMultipleChoiceQuestionType(type: QuestionType): boolean {
  return type === "multiple";
}

export function createChoiceStudentAnswer(
  question: Question,
  selectedOptionIds: string[],
): StudentAnswer {
  if (isMultipleChoiceQuestionType(question.type)) {
    return {
      question_id: question.id,
      checkbox_answer: selectedOptionIds,
    };
  }

  return {
    question_id: question.id,
    radio_answer: selectedOptionIds[0],
  };
}

export function createTextStudentAnswer(
  questionId: string,
  value: string,
): StudentAnswer {
  return {
    question_id: questionId,
    text_answer: value,
  };
}

export function normalizeStudentAnswer(
  question: Question,
  answer: StudentAnswerStateValue | undefined,
): StudentAnswer | undefined {
  if (!answer) {
    return undefined;
  }

  if (isStringArray(answer)) {
    if (question.type === "text") {
      return {
        question_id: question.id,
        text_answer: answer[0] ?? "",
      };
    }

    if (isMultipleChoiceQuestionType(question.type)) {
      return {
        question_id: question.id,
        checkbox_answer: answer,
      };
    }

    return {
      question_id: question.id,
      radio_answer: answer[0],
    };
  }

  return {
    question_id: answer.question_id || question.id,
    radio_answer: answer.radio_answer,
    checkbox_answer: answer.checkbox_answer,
    text_answer: answer.text_answer,
  };
}

export function getSelectedOptionIds(
  question: Question,
  answer: StudentAnswerStateValue | undefined,
): string[] {
  const normalizedAnswer = normalizeStudentAnswer(question, answer);

  if (!normalizedAnswer || question.type === "text") {
    return [];
  }

  if (isMultipleChoiceQuestionType(question.type)) {
    return normalizedAnswer.checkbox_answer?.filter(Boolean) ?? [];
  }

  return normalizedAnswer.radio_answer ? [normalizedAnswer.radio_answer] : [];
}

export function getTextAnswerValue(
  question: Question,
  answer: StudentAnswerStateValue | undefined,
): string {
  if (question.type !== "text") {
    return "";
  }

  return normalizeStudentAnswer(question, answer)?.text_answer ?? "";
}

export function hasStudentAnswer(
  question: Question,
  answer: StudentAnswerStateValue | undefined,
): boolean {
  if (question.type === "text") {
    return getTextAnswerValue(question, answer).trim().length > 0;
  }

  return getSelectedOptionIds(question, answer).length > 0;
}

export function getAnsweredQuestionIds(
  questions: Question[],
  answers: StudentAnswerLookup,
): Set<string> {
  return new Set(
    questions
      .filter((question) => hasStudentAnswer(question, answers[question.id]))
      .map((question) => question.id),
  );
}

export function findFirstUnansweredTextQuestionIndex(
  questions: Question[],
  answers: StudentAnswerLookup,
): number {
  return questions.findIndex(
    (question) =>
      question.type === "text" && !hasStudentAnswer(question, answers[question.id]),
  );
}

export function getTextAnswerValidationErrors(
  questions: Question[],
  answers: StudentAnswersByQuestion,
): Record<string, string> {
  return questions.reduce<Record<string, string>>((errors, question) => {
    if (
      question.type === "text" &&
      !hasStudentAnswer(question, answers[question.id])
    ) {
      errors[question.id] = TEXT_ANSWER_REQUIRED_MESSAGE;
    }

    return errors;
  }, {});
}
