import { api as studentApi } from "@/lib/api/endpoints/student";
import type {
  StudentExamDetailResponse,
  StudentAttemptAnswerPayloadItem,
  StudentExamAttemptSchema,
  StudentExamAttemptDetailSchema,
  StudentExamQuestionSchema,
  StudentAttemptSavedAnswerSchema,
  StudentSubmittedAnswerSchema,
  StudentSubmitAttemptResultSchema,
  StudentSystemExamSchema,
  ExamAssignmentType,
} from "@/lib/api/types";
import type {
  Exam,
  ExamDifficulty,
  Question,
  QuestionType,
  StudentAnswersByQuestion,
} from "@/types/exam.types";
import {
  getSelectedOptionIds,
  hasStudentAnswer,
  normalizeStudentAnswer,
  type StudentAnswerStateValue,
} from "@/lib/student-exam-answers";

interface StudentFetchOptions {
  throwOnError?: boolean;
  includeInactive?: boolean;
}

type NamedValue = {
  name?: string | null;
};

type StudentExamClassificationFields = {
  grade?: string | number | null;
  grade_name?: string | null;
  class_name?: string | null;
  level_name?: string | null;
  subject?: string | NamedValue | null;
  subject_name?: string | null;
  topic?: string | NamedValue | null;
  topic_name?: string | null;
};

const SUBJECT_NAMES = [
  "Toán",
  "Toán học",
  "Ngữ văn",
  "Văn",
  "Tiếng Anh",
  "Anh",
  "Vật lý",
  "Vật lí",
  "Hóa học",
  "Hoá học",
  "Sinh học",
  "Lịch sử",
  "Địa lý",
  "Địa lí",
  "Tin học",
  "Công nghệ",
  "Giáo dục công dân",
  "GDCD",
  "Y học",
  "Dược học",
] as const;

const NORMALIZED_SUBJECT_NAMES = new Set(
  SUBJECT_NAMES.map((subject) => subject.trim().toLocaleLowerCase("vi")),
);

function normalizeClassificationText(value?: string | null): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("vi");
}

function getObjectName(value?: string | NamedValue | null): string {
  if (typeof value === "string") {
    return value.trim();
  }

  return value?.name?.trim() ?? "";
}

function getExamClassification(item: StudentSystemExamSchema): {
  className: string;
  subjectName: string;
  topicName: string;
} {
  const classification = item as StudentSystemExamSchema &
    StudentExamClassificationFields;

  const directClass =
    classification.class_name?.trim() ||
    classification.grade_name?.trim() ||
    classification.level_name?.trim() ||
    "";

  const directSubject =
    classification.subject_name?.trim() ||
    getObjectName(classification.subject);

  const directTopic =
    classification.topic_name?.trim() || getObjectName(classification.topic);

  const rawGrade = String(classification.grade ?? "").trim();

  const legacyParts = rawGrade
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean);

  const subjectIndex = legacyParts.findIndex((part) =>
    NORMALIZED_SUBJECT_NAMES.has(normalizeClassificationText(part)),
  );

  const detectedSubject = subjectIndex >= 0 ? legacyParts[subjectIndex] : "";

  const possibleClassParts =
    subjectIndex >= 0 ? legacyParts.slice(0, subjectIndex) : legacyParts;

  const detectedClass =
    possibleClassParts.find((part) => /^Lớp\s+\d+$/i.test(part)) ||
    [...possibleClassParts]
      .reverse()
      .find((part) =>
        /(Mầm non|Tiểu học|THCS|THPT|Trung cấp|Cao đẳng|Đại học)/i.test(part),
      ) ||
    (legacyParts.length === 1 ? legacyParts[0] : "") ||
    "";

  const detectedTopic =
    subjectIndex >= 0 && subjectIndex < legacyParts.length - 1
      ? legacyParts.slice(subjectIndex + 1).join(" - ")
      : "";

  return {
    className: directClass || detectedClass || rawGrade || "Chưa phân loại",
    subjectName: directSubject || detectedSubject || "",
    topicName: directTopic || detectedTopic || "",
  };
}

function buildClassificationTags({
  className,
  subjectName,
  topicName,
}: {
  className: string;
  subjectName: string;
  topicName: string;
}): string[] {
  return [
    className ? `class:${className}` : "",
    subjectName ? `subject:${subjectName}` : "",
    topicName ? `topic:${topicName}` : "",
  ].filter(Boolean);
}

function inferDifficulty(
  durationMinutes: number,
  questionCount: number,
): ExamDifficulty {
  if (durationMinutes >= 60 || questionCount >= 40) {
    return "hard";
  }

  if (durationMinutes <= 20 || questionCount <= 10) {
    return "easy";
  }

  return "medium";
}

function inferGrade(classroomName: string | null): number {
  if (!classroomName) {
    return 0;
  }

  const match = classroomName.match(/(?:lop|lớp)\s*(\d{1,2})|(\d{1,2})/i);
  const grade = Number(match?.[1] ?? match?.[2]);

  if (Number.isNaN(grade) || grade < 1 || grade > 12) {
    return 0;
  }

  return grade;
}

function mapStudentSystemExam(item: StudentSystemExamSchema): Exam {
  const normalizedScope = item.scope?.trim().toLowerCase();
  const scope =
    normalizedScope === "classroom" || normalizedScope === "class"
      ? "classroom"
      : "system";

  const normalizedSource = item.source?.trim().toLowerCase() ?? "";

  const isTeacherCreated =
    scope === "classroom" ||
    normalizedSource === "teacher" ||
    normalizedSource.startsWith("teacher_") ||
    normalizedSource.includes("giáo viên");

  const classification = getExamClassification(item);

  const gradeFromClassName = inferGrade(classification.className);
  const parsedGrade = Number(item.grade);

  const grade =
    gradeFromClassName > 0
      ? gradeFromClassName
      : Number.isFinite(parsedGrade) && parsedGrade >= 1 && parsedGrade <= 12
        ? parsedGrade
        : inferGrade(item.classroom_name);

  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    subject: classification.subjectName || "Đề thi",
    grade,
    difficulty: inferDifficulty(item.duration_minutes, item.question_count),
    duration: item.duration_minutes,
    passingScore: 0,
    questionCount: item.question_count,
    attemptCount: 0,
    status: item.is_active ? "published" : "archived",
    createdBy: isTeacherCreated ? "teacher" : "system",
    createdAt: "",
    updatedAt: "",
    startTime: item.start_time,
    endTime: item.end_time,
    assignmentType: item.assignment_type ?? "exam",
    examType: item.assignment_type ?? "exam",
    maxAttempts: item.max_attempts ?? null,
    thumbnailUrl: item.image_url ?? undefined,

    /**
     * Không đưa scope vào tags để tránh badge Hệ thống/Giáo viên.
     * Tags chỉ lưu metadata phân loại phục vụ card và bộ lọc.
     */
    tags: buildClassificationTags(classification),

    classIds: item.classroom_id ? [String(item.classroom_id)] : [],
    classroomName: item.classroom_name,
    totalPoints: item.total_points,
    scope,
    source: item.source,
    isActive: item.is_active,
  };
}

function mapStudentQuestionType(questionType: string): QuestionType {
  switch (questionType) {
    case "single_choice":
      return "single";
    case "multiple_choice":
      return "multiple";
    case "true_false":
      return "true_false";
    case "short_answer":
    case "text":
      return "text";
    default:
      return "single";
  }
}

function mapStudentExamQuestions(
  examId: string,
  questions: StudentExamQuestionSchema[],
): Question[] {
  return [...questions]
    .sort((a, b) => a.order_index - b.order_index)
    .map((question) => ({
      id: String(question.id),
      examId,
      text: question.prompt,
      type: mapStudentQuestionType(question.question_type),
      points: question.points,
      options: (question.options ?? []).map((option) => ({
        id: String(option.id),
        text: option.option_text,
      })),
    }));
}

function mapStudentExamDetailExam(item: StudentExamDetailResponse): Exam {
  // TODO: backend dependency — `StudentExamDetailResponse` does not yet
  // declare `start_time`/`end_time`. Once it does, drop the cast and read directly.
  const detail = item as unknown as Partial<StudentSystemExamSchema>;
  return mapStudentSystemExam({
    id: item.id,
    title: item.title,
    description: item.description,
    grade: "",
    scope: item.scope,
    source: item.source,
    classroom_id: item.classroom_id,
    classroom_name: item.classroom_name,
    duration_minutes: item.duration_minutes,
    start_time: detail.start_time ?? "",
    end_time: detail.end_time ?? "",
    total_points: item.total_points,
    question_count: item.question_count,
    is_active: item.is_active,
    assignment_type: item.assignment_type,
    max_attempts: item.max_attempts,
  });
}

export interface StudentExamDetailData {
  exam: Exam;
  questions: Question[];
  inProgressAttemptId: string | null;
}

export interface StudentExamAttemptData {
  id: string;
  examId: string;
  status: string;
  score: number;
  totalPoints: number;
  correctAnswersCount: number;
  totalQuestions: number;
  answeredCount: number;
  startedAt: string;
  submittedAt: string | null;
}

export interface StudentExamAttemptDetailData extends StudentExamAttemptData {
  answers: StudentAnswersByQuestion;
  expiresAt: string | null;
  serverNow: string | null;
  receivedAtMs: number;
}

export interface StudentSubmittedAnswerData {
  questionId: string;
  questionType: QuestionType;
  prompt: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  submittedAnswerText: string | null;
  correctOptionId: string | null;
  correctOptionText: string | null;
  acceptedAnswers: string[];
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
}

export interface StudentSubmitAttemptResultData {
  attemptId: string;
  examId: string;
  examTitle: string;
  status: string;
  score: number;
  totalPoints: number;
  correctAnswersCount: number;
  totalQuestions: number;
  startedAt: string;
  submittedAt: string;
  answers: StudentSubmittedAnswerData[];
}

const ATTEMPT_RESULT_STORAGE_KEY_PREFIX = "attempt-result-";

function mapStudentExamAttempt(
  attempt: StudentExamAttemptSchema,
): StudentExamAttemptData {
  return {
    id: String(attempt.id),
    examId: String(attempt.exam_id),
    status: attempt.status,
    score: attempt.score,
    totalPoints: attempt.total_points,
    correctAnswersCount: attempt.correct_answers_count,
    totalQuestions: attempt.total_questions,
    answeredCount: attempt.answered_count,
    startedAt: attempt.started_at,
    submittedAt: attempt.submitted_at,
  };
}

function mapAttemptSavedAnswers(
  answers: StudentAttemptSavedAnswerSchema[] | null | undefined,
  questions: Question[] = [],
): StudentAnswersByQuestion {
  const questionById = new Map(
    questions.map((question) => [question.id, question]),
  );
  const groupedAnswers: StudentAnswersByQuestion = {};

  for (const answer of answers ?? []) {
    const questionId = String(answer.question_id);
    const question = questionById.get(questionId);
    const answerText = answer.answer_text ?? answer.submitted_answer_text ?? "";
    const selectedIds = [
      ...(answer.selected_option_ids ?? []).map(String),
      ...(answer.selected_option_id !== null &&
      answer.selected_option_id !== undefined
        ? [String(answer.selected_option_id)]
        : []),
    ].filter(Boolean);

    if (question?.type === "text" || answerText) {
      groupedAnswers[questionId] = {
        question_id: questionId,
        text_answer: answerText,
      };
      continue;
    }

    if (question?.type === "multiple") {
      const previous = groupedAnswers[questionId]?.checkbox_answer ?? [];
      groupedAnswers[questionId] = {
        question_id: questionId,
        checkbox_answer: Array.from(new Set([...previous, ...selectedIds])),
      };
      continue;
    }

    if (selectedIds[0]) {
      groupedAnswers[questionId] = {
        question_id: questionId,
        radio_answer: selectedIds[0],
      };
    }
  }

  return groupedAnswers;
}

function mapStudentExamAttemptDetail(
  attempt: StudentExamAttemptDetailSchema,
  questions: Question[] = [],
): StudentExamAttemptDetailData {
  return {
    ...mapStudentExamAttempt(attempt),
    answers: mapAttemptSavedAnswers(attempt.answers, questions),
    expiresAt: attempt.expires_at ?? null,
    serverNow: attempt.server_now ?? null,
    receivedAtMs: Date.now(),
  };
}

function mapSubmittedAnswer(
  answer: StudentSubmittedAnswerSchema,
): StudentSubmittedAnswerData {
  return {
    questionId: String(answer.question_id),
    questionType: mapStudentQuestionType(answer.question_type),
    prompt: answer.prompt,
    selectedOptionId:
      answer.selected_option_id !== null
        ? String(answer.selected_option_id)
        : null,
    selectedOptionText: answer.selected_option_text,
    submittedAnswerText: answer.submitted_answer_text,
    correctOptionId:
      answer.correct_option_id !== null
        ? String(answer.correct_option_id)
        : null,
    correctOptionText: answer.correct_option_text,
    acceptedAnswers: answer.accepted_answers,
    isCorrect: answer.is_correct,
    pointsEarned: answer.points_earned,
    maxPoints: answer.max_points,
  };
}

function mapSubmitAttemptResult(
  result: StudentSubmitAttemptResultSchema,
): StudentSubmitAttemptResultData {
  return {
    attemptId: String(result.attempt_id),
    examId: String(result.exam_id),
    examTitle: result.exam_title,
    status: result.status,
    score: result.score,
    totalPoints: result.total_points,
    correctAnswersCount: result.correct_answers_count,
    totalQuestions: result.total_questions,
    startedAt: result.started_at,
    submittedAt: result.submitted_at,
    answers: (result.answers ?? []).map(mapSubmittedAnswer),
  };
}

export function getStudentAttemptResultStorageKey(attemptId: string): string {
  return `${ATTEMPT_RESULT_STORAGE_KEY_PREFIX}${attemptId}`;
}

export function readCachedStudentAttemptResult(
  attemptId: string,
): StudentSubmitAttemptResultData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = sessionStorage.getItem(
    getStudentAttemptResultStorageKey(attemptId),
  );

  return stored ? (JSON.parse(stored) as StudentSubmitAttemptResultData) : null;
}

export function readAllCachedStudentAttemptResults(): StudentSubmitAttemptResultData[] {
  if (typeof window === "undefined") {
    return [];
  }

  const results: StudentSubmitAttemptResultData[] = [];

  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);

    if (!key || !key.startsWith(ATTEMPT_RESULT_STORAGE_KEY_PREFIX)) {
      continue;
    }

    const stored = sessionStorage.getItem(key);

    if (!stored) {
      continue;
    }

    try {
      results.push(JSON.parse(stored) as StudentSubmitAttemptResultData);
    } catch (error) {
      console.error(
        `Failed to parse cached attempt result for key ${key}`,
        error,
      );
    }
  }

  return results;
}

export function writeCachedStudentAttemptResult(
  result: StudentSubmitAttemptResultData,
): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(
    getStudentAttemptResultStorageKey(result.attemptId),
    JSON.stringify(result),
  );
}

export interface StudentSystemExamListParams {
  limit?: number;
  offset?: number;
  assignmentType?: ExamAssignmentType;
  assignment_type?: ExamAssignmentType;
  search?: string;
  grade?: string;
  sort?: string;
}

const DEFAULT_EXAM_LIST_LIMIT = 50;
const MAX_EXAM_LIST_LIMIT = 100;

function normalizeStudentExamListParams(
  params: StudentSystemExamListParams = {},
): {
  limit: number;
  offset: number;
  assignment_type?: ExamAssignmentType;
  search?: string;
  grade?: string;
  sort?: string;
} {
  const {
    assignmentType,
    assignment_type,
    limit,
    offset,
    search,
    grade,
    sort,
  } = params;

  return {
    // Backend chỉ chấp nhận limit từ 1 đến 100.
    limit: Math.min(
      Math.max(limit ?? DEFAULT_EXAM_LIST_LIMIT, 1),
      MAX_EXAM_LIST_LIMIT,
    ),
    offset: Math.max(offset ?? 0, 0),
    assignment_type: assignment_type ?? assignmentType,
    search: search?.trim() || undefined,
    grade: grade?.trim() || undefined,
    sort,
  };
}

export interface StudentSystemExamListResult {
  items: Exam[];
  total: number;
  limit: number;
  offset: number;
}

const EMPTY_LIST_RESULT: StudentSystemExamListResult = {
  items: [],
  total: 0,
  limit: 0,
  offset: 0,
};

export async function getStudentSystemExams(
  params: StudentSystemExamListParams = {},
): Promise<StudentSystemExamListResult> {
  try {
    const response = await studentApi.student.system.exams(
      normalizeStudentExamListParams(params),
    );
    const data = response.data;
    const items = (data.items ?? [])
      .filter((item) => item.is_active)
      .map(mapStudentSystemExam);

    return {
      items,
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  } catch (error) {
    console.error("Failed to fetch student system exams", error);
    return EMPTY_LIST_RESULT;
  }
}

/**
 * Lấy danh sách đề thi công khai (scope=system, is_published=true) từ giáo viên hoặc admin.
 * Dùng cho trang "Khám phá đề thi" - gọi endpoint /student/exams/explore
 */
export async function getStudentExploreExams(
  params: StudentSystemExamListParams = {},
): Promise<StudentSystemExamListResult> {
  try {
    const response = await studentApi.student.exams.explore(
      normalizeStudentExamListParams(params),
    );
    const data = response.data;
    const items = (data.items ?? [])
      .filter((item) => item.is_active)
      .map(mapStudentSystemExam);

    return {
      items,
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  } catch (error) {
    console.warn("Failed to fetch explore exams", error);
    return EMPTY_LIST_RESULT;
  }
}

export async function getStudentClassExams(
  classId: string,
  params: StudentSystemExamListParams & StudentFetchOptions = {},
): Promise<StudentSystemExamListResult> {
  const { throwOnError, includeInactive = false, ...pagination } = params;

  try {
    const response = await studentApi.student.classes.exams(
      classId,
      normalizeStudentExamListParams(pagination),
    );
    const data = response.data;
    const items = (data.items ?? [])
      .filter((item) => includeInactive || item.is_active)
      .map(mapStudentSystemExam);

    return {
      items,
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  } catch (error) {
    console.error(`Failed to fetch class exams for ${classId}`, error);
    if (throwOnError) {
      throw error;
    }
    return EMPTY_LIST_RESULT;
  }
}

export async function getStudentExamDetail(
  examId: string,
): Promise<StudentExamDetailData | null> {
  try {
    const response = await studentApi.student.exams.detail(examId);
    const data = response.data;

    return {
      exam: mapStudentExamDetailExam(data),
      questions: mapStudentExamQuestions(String(data.id), data.questions ?? []),
      inProgressAttemptId: data.in_progress_attempt_id
        ? String(data.in_progress_attempt_id)
        : null,
    };
  } catch (error) {
    console.error(`Failed to fetch student exam detail for ${examId}`, error);
    return null;
  }
}

export async function startStudentExamAttempt(
  examId: string,
): Promise<StudentExamAttemptData> {
  const response = await studentApi.student.exams.startAttempt(examId);
  return mapStudentExamAttempt(response.data.attempt);
}

export async function getStudentActiveExamAttempt(
  examId: string,
  questions: Question[] = [],
): Promise<StudentExamAttemptDetailData | null> {
  try {
    const response = await studentApi.student.exams.activeAttempt(examId);
    return response.data.attempt
      ? mapStudentExamAttemptDetail(response.data.attempt, questions)
      : null;
  } catch (error) {
    console.warn(`Failed to fetch active attempt for exam ${examId}`, error);
    return null;
  }
}

export async function getStudentAttempt(
  attemptId: string,
  questions: Question[] = [],
): Promise<StudentExamAttemptDetailData | null> {
  try {
    const response = await studentApi.student.attempts.detail(attemptId);
    return mapStudentExamAttemptDetail(response.data.attempt, questions);
  } catch (error) {
    console.error(`Failed to fetch student attempt ${attemptId}`, error);
    return null;
  }
}

function buildAttemptAnswerPayload(
  question: Question,
  answer: StudentAnswerStateValue | undefined,
): StudentAttemptAnswerPayloadItem[] {
  const normalizedAnswer = normalizeStudentAnswer(question, answer);

  if (!normalizedAnswer || !hasStudentAnswer(question, normalizedAnswer)) {
    return [];
  }

  if (question.type === "text") {
    return [
      {
        question_id: Number(question.id),
        selected_option_id: null,
        answer_text: normalizedAnswer.text_answer?.trim() ?? "",
      },
    ];
  }

  const selectedIds = getSelectedOptionIds(question, normalizedAnswer);

  return selectedIds.map((selectedId) => ({
    question_id: Number(question.id),
    selected_option_id: Number(selectedId),
    answer_text: null,
  }));
}

export function buildStudentAttemptAnswersPayload(
  questions: Question[],
  answersByQuestion: StudentAnswersByQuestion,
): StudentAttemptAnswerPayloadItem[] {
  return questions.flatMap((question) =>
    buildAttemptAnswerPayload(question, answersByQuestion[question.id]),
  );
}

export async function saveStudentAttemptAnswers(
  attemptId: string,
  question: Question,
  answer: StudentAnswerStateValue | undefined,
): Promise<StudentExamAttemptData | null> {
  const answers = buildAttemptAnswerPayload(question, answer);

  if (answers.length === 0) {
    return null;
  }

  const response = await studentApi.student.attempts.saveAnswers(attemptId, {
    answers,
  });

  return mapStudentExamAttempt(response.data.attempt);
}

export async function saveStudentAttemptAnswerBatch(
  attemptId: string,
  questions: Question[],
  answersByQuestion: StudentAnswersByQuestion,
): Promise<StudentExamAttemptData | null> {
  const answers = buildStudentAttemptAnswersPayload(
    questions,
    answersByQuestion,
  );

  if (answers.length === 0) {
    return null;
  }

  const response = await studentApi.student.attempts.saveAnswers(attemptId, {
    answers,
  });

  return mapStudentExamAttempt(response.data.attempt);
}

export async function submitStudentAttempt(
  attemptId: string,
): Promise<StudentSubmitAttemptResultData> {
  const response = await studentApi.student.attempts.submit(attemptId);
  return mapSubmitAttemptResult(response.data.result);
}

export async function getStudentAttemptResult(
  attemptId: string,
): Promise<StudentSubmitAttemptResultData | null> {
  try {
    const response = await studentApi.student.attempts.result(attemptId);
    return mapSubmitAttemptResult(response.data.result);
  } catch (error) {
    console.error(`Failed to fetch attempt result for ${attemptId}`, error);
    return null;
  }
}
