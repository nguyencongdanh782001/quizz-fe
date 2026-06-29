import { api as teacherApi } from "@/lib/api/endpoints/teacher";
import type {
  TeacherExamAttemptAnswerSchema,
  TeacherExamAttemptResultSchema,
  TeacherExamResultListItemSchema,
  TeacherExamResultListResponse,
  TeacherExamResultSummarySchema,
} from "@/lib/api/types";
import type { TeacherExamQuestionType } from "@/types/exam";

export interface TeacherExamResultSummaryData {
  submittedCount: number;
  averageScorePercent: number;
}

export interface TeacherExamResultItemData {
  attemptId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatarUrl: string | null;
  score: number;
  totalPoints: number;
  scorePercent: number;
  correctAnswersCount: number;
  totalQuestions: number;
  isPassed: boolean;
  startedAt: string;
  submittedAt: string;
}

export interface TeacherExamResultListData {
  summary: TeacherExamResultSummaryData;
  items: TeacherExamResultItemData[];
}

export interface TeacherExamAttemptAnswerData {
  questionId: string;
  questionType: TeacherExamQuestionType;
  prompt: string;
  explanation: string | null;
  questionImageUrl: string | null;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  selectedOptionImageUrl: string | null;
  submittedAnswerText: string | null;
  correctOptionId: string | null;
  correctOptionText: string | null;
  correctOptionImageUrl: string | null;
  acceptedAnswers: string[];
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
}

export interface TeacherExamAttemptResultData {
  attemptId: string;
  examId: string;
  examTitle: string;
  status: "in_progress" | "submitted";
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatarUrl: string | null;
  score: number;
  totalPoints: number;
  scorePercent: number;
  correctAnswersCount: number;
  totalQuestions: number;
  startedAt: string;
  submittedAt: string;
  answers: TeacherExamAttemptAnswerData[];
}

function mapTeacherExamResultSummary(
  summary?: TeacherExamResultSummarySchema | null,
): TeacherExamResultSummaryData {
  return {
    submittedCount: summary?.submitted_count ?? 0,
    averageScorePercent: summary?.average_score_percent ?? 0,
  };
}

function mapTeacherExamResultItem(
  item: TeacherExamResultListItemSchema,
): TeacherExamResultItemData {
  return {
    attemptId: String(item.attempt_id),
    studentId: String(item.student_id),
    studentName: item.student_name,
    studentEmail: item.student_email,
    studentAvatarUrl: item.student_avatar_url ?? null,
    score: item.score,
    totalPoints: item.total_points,
    scorePercent: item.score_percent,
    correctAnswersCount: item.correct_answers_count,
    totalQuestions: item.total_questions,
    isPassed: item.is_passed,
    startedAt: item.started_at,
    submittedAt: item.submitted_at,
  };
}

function mapTeacherExamResults(
  data: TeacherExamResultListResponse,
): TeacherExamResultListData {
  return {
    summary: mapTeacherExamResultSummary(data.summary),
    items: (data.items ?? []).map(mapTeacherExamResultItem),
  };
}

function mapTeacherExamAttemptAnswer(
  answer: TeacherExamAttemptAnswerSchema,
): TeacherExamAttemptAnswerData {
  return {
    questionId: String(answer.question_id),
    questionType: answer.question_type,
    prompt: answer.prompt,
    explanation: answer.explanation ?? null,
    questionImageUrl: answer.question_image_url ?? null,
    selectedOptionId:
      answer.selected_option_id === null
        ? null
        : String(answer.selected_option_id),
    selectedOptionText: answer.selected_option_text ?? null,
    selectedOptionImageUrl: answer.selected_option_image_url ?? null,
    submittedAnswerText: answer.submitted_answer_text ?? null,
    correctOptionId:
      answer.correct_option_id === null
        ? null
        : String(answer.correct_option_id),
    correctOptionText: answer.correct_option_text ?? null,
    correctOptionImageUrl: answer.correct_option_image_url ?? null,
    acceptedAnswers: answer.accepted_answers ?? [],
    isCorrect: answer.is_correct,
    pointsEarned: answer.points_earned,
    maxPoints: answer.max_points,
  };
}

function mapTeacherExamAttemptResult(
  result: TeacherExamAttemptResultSchema,
): TeacherExamAttemptResultData {
  return {
    attemptId: String(result.attempt_id),
    examId: String(result.exam_id),
    examTitle: result.exam_title,
    status: result.status,
    studentId: String(result.student_id),
    studentName: result.student_name,
    studentEmail: result.student_email,
    studentAvatarUrl: result.student_avatar_url ?? null,
    score: result.score,
    totalPoints: result.total_points,
    scorePercent: result.score_percent,
    correctAnswersCount: result.correct_answers_count,
    totalQuestions: result.total_questions,
    startedAt: result.started_at,
    submittedAt: result.submitted_at,
    answers: (result.answers ?? []).map(mapTeacherExamAttemptAnswer),
  };
}

export function createEmptyTeacherExamResults(): TeacherExamResultListData {
  return {
    summary: mapTeacherExamResultSummary(),
    items: [],
  };
}

export async function getTeacherClassExamResults(
  classId: string,
  examId: string,
): Promise<TeacherExamResultListData> {
  const response = await teacherApi.teacher.classes.examResults(classId, examId);
  return mapTeacherExamResults(response.data);
}

export async function getTeacherClassExamAttemptResult(
  classId: string,
  examId: string,
  attemptId: string,
): Promise<TeacherExamAttemptResultData> {
  const response = await teacherApi.teacher.classes.examAttemptResult(
    classId,
    examId,
    attemptId,
  );

  return mapTeacherExamAttemptResult(response.data.result);
}
