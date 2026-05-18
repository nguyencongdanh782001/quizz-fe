import type { TeacherExamQuery } from "@/types/exam";

const teacherExamRootQueryKey = ["teacher-exams"] as const;

export const teacherExamQueryKeys = {
  all: teacherExamRootQueryKey,
  details: () => [...teacherExamRootQueryKey, "detail"] as const,
  detail: (examId: string | number) =>
    [...teacherExamRootQueryKey, "detail", examId] as const,
  lists: () => [...teacherExamRootQueryKey, "list"] as const,
  list: (query: TeacherExamQuery) =>
    [...teacherExamRootQueryKey, "list", query] as const,
} as const;
