import { api as studentApi } from '@/lib/api/endpoints/student';
import type {
  StudentSystemResultListResponse,
  StudentSystemResultSchema,
  StudentSystemResultSummarySchema,
} from '@/lib/api/types';

export interface StudentSystemResultSummaryData {
  totalCompletedExams: number;
  passedExams: number;
  averageScorePercent: number;
}

export interface StudentSystemResultItemData {
  attemptId: string;
  examId: string;
  examTitle: string;
  examDescription: string;
  examImageUrl: string | null;
  scope: string;
  classroomId: string | null;
  classroomName: string | null;
  score: number;
  totalPoints: number;
  scorePercent: number;
  correctAnswersCount: number;
  totalQuestions: number;
  isPassed: boolean;
  startedAt: string;
  submittedAt: string;
}

export interface StudentSystemResultListData {
  summary: StudentSystemResultSummaryData;
  items: StudentSystemResultItemData[];
}

function mapStudentSystemResultSummary(
  summary?: StudentSystemResultSummarySchema | null,
): StudentSystemResultSummaryData {
  return {
    totalCompletedExams: summary?.total_completed_exams ?? 0,
    passedExams: summary?.passed_exams ?? 0,
    averageScorePercent: summary?.average_score_percent ?? 0,
  };
}

function mapStudentSystemResultItem(
  item: StudentSystemResultSchema,
): StudentSystemResultItemData {
  return {
    attemptId: String(item.attempt_id),
    examId: String(item.exam_id),
    examTitle: item.exam_title,
    examDescription: item.exam_description,
    examImageUrl: item.exam_image_url ?? null,
    scope: item.scope,
    classroomId: item.classroom_id ? String(item.classroom_id) : null,
    classroomName: item.classroom_name,
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

function mapStudentSystemResults(
  data: StudentSystemResultListResponse,
): StudentSystemResultListData {
  const items = [...(data.items ?? [])]
    .sort(
      (left, right) =>
        new Date(right.submitted_at).getTime() -
        new Date(left.submitted_at).getTime(),
    )
    .map(mapStudentSystemResultItem);

  return {
    summary: mapStudentSystemResultSummary(data.summary),
    items,
  };
}

export function createEmptyStudentSystemResults(): StudentSystemResultListData {
  return {
    summary: mapStudentSystemResultSummary(),
    items: [],
  };
}

export async function getStudentResults(): Promise<StudentSystemResultListData> {
  const response = await studentApi.student.results();
  return mapStudentSystemResults(response.data);
}

export async function getStudentSystemResults(): Promise<StudentSystemResultListData> {
  const response = await studentApi.student.system.results();
  return mapStudentSystemResults(response.data);
}

export async function getStudentClassResults(
  classId: string,
): Promise<StudentSystemResultListData> {
  const response = await studentApi.student.classes.results(classId);
  return mapStudentSystemResults(response.data);
}
