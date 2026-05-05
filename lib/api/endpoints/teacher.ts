import { client } from "../client";
import type {
  MessageResponse,
  TeacherClassListResponse,
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
      removeStudent: (classId: string | number, studentId: string | number) =>
        client.delete<MessageResponse>(
          `/teacher/classes/${classId}/students/${studentId}`,
        ),
    },
  },
} as const;
