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
} from "../types";

export const api = {
  student: {
    system: {
      exams: () =>
        client.get<StudentSystemExamListResponse>("/student/system/exams"),
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
      exams: (classId: string | number) =>
        client.get<StudentSystemExamListResponse>(
          `/student/classes/${classId}/exams`,
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
