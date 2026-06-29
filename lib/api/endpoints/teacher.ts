import { client } from "../client";
import type {
  MessageResponse,
  TeacherClassExamDetailResponse,
  TeacherClassDocumentListResponse,
  TeacherClassExamListResponse,
  TeacherClassListResponse,
  TeacherDocumentListResponse,
  TeacherCreateSystemDocumentResponse,
  TeacherCreateClassExamResponse,
  TeacherCreateExamRequest,
  TeacherCreateClassRequest,
  TeacherCreateClassResponse,
  TeacherClassStudentListResponse,
  TeacherUpdateClassRequest,
  TeacherUpdateClassResponse,
  TeacherUpdateClassExamRequest,
  TeacherUpdateClassExamResponse,
  TeacherExamAttemptResultResponse,
  TeacherExamResultListResponse,
} from "../types";

export const api = {
  teacher: {
    documents: {
      list: (params?: Record<string, string | number | boolean>) =>
        client.get<TeacherDocumentListResponse>("/teacher/system/documents", {
          params,
        }),
      create: (data: FormData) =>
        client.post<TeacherCreateSystemDocumentResponse>(
          "/teacher/documents",
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        ),
      delete: (documentId: number) =>
        client.delete<MessageResponse>(`/teacher/documents/${documentId}`),
    },
    classes: {
      list: () => client.get<TeacherClassListResponse>("/teacher/classes"),
      create: (data: TeacherCreateClassRequest) =>
        client.post<TeacherCreateClassResponse>("/teacher/classes", data),
      update: (classId: string | number, data: TeacherUpdateClassRequest) =>
        client.put<TeacherUpdateClassResponse>(
          `/teacher/classes/${classId}`,
          data,
        ),
      delete: (classId: string | number) =>
        client.delete<MessageResponse>(`/teacher/classes/${classId}`),
      students: (classId: string | number) =>
        client.get<TeacherClassStudentListResponse>(
          `/teacher/classes/${classId}/students`,
        ),
      documents: (classId: string | number) =>
        client.get<TeacherClassDocumentListResponse>(
          `/teacher/classes/${classId}/documents`,
        ),
      deleteDocument: (classId: string | number, documentId: string | number) =>
        client.delete<MessageResponse>(
          `/teacher/classes/${classId}/documents/${documentId}`,
        ),
      createDocument: (classId: string | number, data: FormData) =>
        client.post<TeacherCreateSystemDocumentResponse>(
          `/teacher/classes/${classId}/documents`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        ),
      exams: (classId: string | number) =>
        client.get<TeacherClassExamListResponse>(
          `/teacher/classes/${classId}/exams`,
        ),
      examDetail: (classId: string | number, examId: string | number) =>
        client.get<TeacherClassExamDetailResponse>(
          `/teacher/classes/${classId}/exams/${examId}`,
        ),
      examResults: (classId: string | number, examId: string | number) =>
        client.get<TeacherExamResultListResponse>(
          `/teacher/classes/${classId}/exams/${examId}/results`,
        ),
      examAttemptResult: (
        classId: string | number,
        examId: string | number,
        attemptId: string | number,
      ) =>
        client.get<TeacherExamAttemptResultResponse>(
          `/teacher/classes/${classId}/exams/${examId}/attempts/${attemptId}`,
        ),
      createExam: (classId: string | number, data: TeacherCreateExamRequest) =>
        client.post<TeacherCreateClassExamResponse>(
          `/teacher/classes/${classId}/exams`,
          data,
        ),
      updateExam: (
        classId: string | number,
        examId: string | number,
        data: TeacherUpdateClassExamRequest,
      ) =>
        client.put<TeacherUpdateClassExamResponse>(
          `/teacher/classes/${classId}/exams/${examId}`,
          data,
        ),
      removeStudent: (classId: string | number, studentId: string | number) =>
        client.delete<MessageResponse>(
          `/teacher/classes/${classId}/students/${studentId}`,
        ),
    },
  },
} as const;
