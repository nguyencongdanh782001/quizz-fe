import { client } from "../client";
import type {
  StudentAttemptResultResponse,
  StudentClassListResponse,
  StudentExamDetailResponse,
  StudentJoinClassRequest,
  StudentJoinClassResponse,
  StudentSaveAttemptAnswersRequest,
  StudentSaveAttemptAnswersResponse,
  StudentSubmitAttemptResponse,
  StudentStartExamAttemptResponse,
  StudentSystemDocumentListResponse,
  StudentSystemExamListResponse,
  StudentSystemResultListResponse,
  ExamAssignmentType,
} from "../types";

interface ExamListParams {
  limit?: number;
  offset?: number;
  assignment_type?: ExamAssignmentType;
  search?: string;
  grade?: string;
  sort?: string;
}

function buildExamListParams(
  params?: ExamListParams,
): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  if (typeof params.limit === "number") out.limit = params.limit;
  if (typeof params.offset === "number") out.offset = params.offset;
  if (params.assignment_type) out.assignment_type = params.assignment_type;
  if (params.search?.trim()) out.search = params.search.trim();
  if (params.grade?.trim()) out.grade = params.grade.trim();
  if (params.sort) out.sort = params.sort;
  return Object.keys(out).length > 0 ? out : undefined;
}

export const api = {
  student: {
    results: () =>
      client.get<StudentSystemResultListResponse>("/student/results"),
    system: {
      exams: (params?: ExamListParams) =>
        client.get<StudentSystemExamListResponse>("/student/system/exams", {
          params: buildExamListParams(params),
        }),
      documents: () =>
        client.get<StudentSystemDocumentListResponse>(
          "/student/system/documents",
        ),
      results: () =>
        client.get<StudentSystemResultListResponse>("/student/system/results"),
    },
    classes: {
      list: () => client.get<StudentClassListResponse>("/student/classes"),
      join: (data: StudentJoinClassRequest) =>
        client.post<StudentJoinClassResponse>("/student/classes/join", data),
      exams: (classId: string | number, params?: ExamListParams) =>
        client.get<StudentSystemExamListResponse>(
          `/student/classes/${classId}/exams`,
          { params: buildExamListParams(params) },
        ),
      results: (classId: string | number) =>
        client.get<StudentSystemResultListResponse>(
          `/student/classes/${classId}/results`,
        ),
      documents: (classId: string | number) =>
        client.get<StudentSystemDocumentListResponse>(
          `/student/classes/${classId}/documents`,
        ),
    },
    exams: {
      detail: (examId: string | number) =>
        client.get<StudentExamDetailResponse>(`/student/exams/${examId}`),
      startAttempt: (examId: string | number) =>
        client.post<StudentStartExamAttemptResponse>(
          `/student/exams/${examId}/attempts`,
        ),
      explore: (
        params?: ExamListParams & {
          search?: string;
          grade?: string;
          sort?: string;
        },
      ) =>
        client.get<StudentSystemExamListResponse>("/student/exams/explore", {
          params: buildExamListParams(params) as Record<
            string,
            string | number
          >,
        }),
    },
    attempts: {
      saveAnswers: (
        attemptId: string | number,
        data: StudentSaveAttemptAnswersRequest,
      ) =>
        client.put<StudentSaveAttemptAnswersResponse>(
          `/student/attempts/${attemptId}/answers`,
          data,
        ),
      submit: (attemptId: string | number) =>
        client.post<StudentSubmitAttemptResponse>(
          `/student/attempts/${attemptId}/submit`,
        ),
      result: (attemptId: string | number) =>
        client.get<StudentAttemptResultResponse>(
          `/student/attempts/${attemptId}/result`,
        ),
    },
  },
} as const;
