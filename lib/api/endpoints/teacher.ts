import { client } from "../client";
import type {
  MessageResponse,
  TeacherClassDocumentListResponse,
  TeacherClassExamListResponse,
  TeacherClassListResponse,
  TeacherCreateClassExamResponse,
  TeacherCreateExamRequest,
  TeacherCreateClassRequest,
  TeacherCreateClassResponse,
  TeacherClassStudentListResponse,
} from "../types";

export const api = {
  teacher: {
    classes: {
      list: () => client.get<TeacherClassListResponse>("/teacher/classes"),
      create: (data: TeacherCreateClassRequest) =>
        client.post<TeacherCreateClassResponse>("/teacher/classes", data),
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
      createExam: (
        classId: string | number,
        data: TeacherCreateExamRequest,
      ) =>
        client.post<TeacherCreateClassExamResponse>(
          `/teacher/classes/${classId}/exams`,
          data,
        ),
      removeStudent: (classId: string | number, studentId: string | number) =>
        client.delete<MessageResponse>(
          `/teacher/classes/${classId}/students/${studentId}`,
        ),
    },
  },
} as const;
