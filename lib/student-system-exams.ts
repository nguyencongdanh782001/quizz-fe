import { api as studentApi } from '@/lib/api/endpoints/student';
import type {
  StudentExamDetailResponse,
  StudentAttemptAnswerPayloadItem,
  StudentExamAttemptSchema,
  StudentExamQuestionSchema,
  StudentSubmittedAnswerSchema,
  StudentSubmitAttemptResultSchema,
  StudentSystemExamSchema,
} from '@/lib/api/types';
import type {
  Exam,
  ExamDifficulty,
  Question,
  QuestionType,
  StudentAnswersByQuestion,
} from '@/types/exam.types';
import {
  getSelectedOptionIds,
  hasStudentAnswer,
  normalizeStudentAnswer,
  type StudentAnswerStateValue,
} from '@/lib/student-exam-answers';

interface StudentFetchOptions {
  throwOnError?: boolean;
}

function inferDifficulty(
  durationMinutes: number,
  questionCount: number,
): ExamDifficulty {
  if (durationMinutes >= 60 || questionCount >= 40) {
    return 'hard';
  }

  if (durationMinutes <= 20 || questionCount <= 10) {
    return 'easy';
  }

  return 'medium';
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
  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    subject: item.classroom_name ?? 'Đề thi hệ thống',
    grade: inferGrade(item.classroom_name),
    difficulty: inferDifficulty(item.duration_minutes, item.question_count),
    duration: item.duration_minutes,
    passingScore: 0,
    questionCount: item.question_count,
    attemptCount: 0,
    status: item.is_active ? 'published' : 'archived',
    createdBy: 'system',
    createdAt: '',
    updatedAt: '',
    thumbnailUrl: item.image_url ?? undefined,
    tags: item.scope ? [item.scope] : [],
    classIds: item.classroom_id ? [String(item.classroom_id)] : [],
    classroomName: item.classroom_name,
    totalPoints: item.total_points,
    scope: item.scope,
    isActive: item.is_active,
  };
}

function mapStudentQuestionType(questionType: string): QuestionType {
  switch (questionType) {
    case 'single_choice':
      return 'single';
    case 'multiple_choice':
      return 'multiple';
    case 'true_false':
      return 'true_false';
    case 'text':
      return 'text';
    default:
      return 'single';
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
      explanation: question.explanation ?? undefined,
      options: (question.options ?? []).map((option) => ({
        id: String(option.id),
        text: option.option_text,
      })),
    }));
}

function mapStudentExamDetailExam(item: StudentExamDetailResponse): Exam {
  return mapStudentSystemExam({
    id: item.id,
    title: item.title,
    description: item.description,
    scope: item.scope,
    classroom_id: item.classroom_id,
    classroom_name: item.classroom_name,
    duration_minutes: item.duration_minutes,
    total_points: item.total_points,
    question_count: item.question_count,
    is_active: item.is_active,
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

export interface StudentSubmittedAnswerData {
  questionId: string;
  questionType: QuestionType;
  prompt: string;
  explanation?: string | null;
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

const ATTEMPT_RESULT_STORAGE_KEY_PREFIX = 'attempt-result-';

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

function mapSubmittedAnswer(
  answer: StudentSubmittedAnswerSchema,
): StudentSubmittedAnswerData {
  return {
    questionId: String(answer.question_id),
    questionType: mapStudentQuestionType(answer.question_type),
    prompt: answer.prompt,
    explanation: answer.explanation ?? null,
    selectedOptionId:
      answer.selected_option_id !== null
        ? String(answer.selected_option_id)
        : null,
    selectedOptionText: answer.selected_option_text,
    submittedAnswerText: answer.submitted_answer_text,
    correctOptionId:
      answer.correct_option_id !== null ? String(answer.correct_option_id) : null,
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
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = sessionStorage.getItem(
    getStudentAttemptResultStorageKey(attemptId),
  );

  return stored ? (JSON.parse(stored) as StudentSubmitAttemptResultData) : null;
}

export function readAllCachedStudentAttemptResults(): StudentSubmitAttemptResultData[] {
  if (typeof window === 'undefined') {
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
      console.error(`Failed to parse cached attempt result for key ${key}`, error);
    }
  }

  return results;
}

export function writeCachedStudentAttemptResult(
  result: StudentSubmitAttemptResultData,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(
    getStudentAttemptResultStorageKey(result.attemptId),
    JSON.stringify(result),
  );
}

export async function getStudentSystemExams(): Promise<Exam[]> {
  try {
    const response = await studentApi.student.system.exams();
    const data = response.data;

    return (data.items ?? [])
      .filter((item) => item.is_active)
      .map(mapStudentSystemExam);
  } catch (error) {
    console.error('Failed to fetch student system exams', error);
    return [];
  }
}

export async function getStudentClassExams(
  classId: string,
  options: StudentFetchOptions = {},
): Promise<Exam[]> {
  try {
    const response = await studentApi.student.classes.exams(classId);
    const data = response.data;

    return (data.items ?? [])
      .filter((item) => item.is_active)
      .map(mapStudentSystemExam);
  } catch (error) {
    console.error(`Failed to fetch class exams for ${classId}`, error);
    if (options.throwOnError) {
      throw error;
    }
    return [];
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

function buildAttemptAnswerPayload(
  question: Question,
  answer: StudentAnswerStateValue | undefined,
): StudentAttemptAnswerPayloadItem[] {
  const normalizedAnswer = normalizeStudentAnswer(question, answer);

  if (!normalizedAnswer || !hasStudentAnswer(question, normalizedAnswer)) {
    return [];
  }

  if (question.type === 'text') {
    return [
      {
        question_id: Number(question.id),
        selected_option_id: null,
        answer_text: normalizedAnswer.text_answer?.trim() ?? '',
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
  const answers = buildStudentAttemptAnswersPayload(questions, answersByQuestion);

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
