import { client } from "../client";
import type {
  MessageResponse,
  TeacherClassExamDetailResponse,
  TeacherClassDocumentListResponse,
  TeacherClassExamListResponse,
  TeacherClassListResponse,
  TeacherCreateDocumentRequest,
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
} from "../types";

export const api = {
  teacher: {
    documents: {
      list: (params?: Record<string, string | number | boolean>) =>
        client.get<TeacherDocumentListResponse>("/teacher/system/documents", {
          params,
        }),
      create: (data: TeacherCreateDocumentRequest) =>
        client.post<TeacherCreateSystemDocumentResponse>(
          "/teacher/documents",
          data,
        ),
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
      exams: (classId: string | number) =>
        client.get<TeacherClassExamListResponse>(
          `/teacher/classes/${classId}/exams`,
        ),
      examDetail: (classId: string | number, examId: string | number) =>
        client.get<TeacherClassExamDetailResponse>(
          `/teacher/classes/${classId}/exams/${examId}`,
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
