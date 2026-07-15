import type { StudentSystemExamListParams } from "@/lib/student-system-exams";

const studentExamRootQueryKey = ["student-exams"] as const;

export const studentExamQueryKeys = {
  all: studentExamRootQueryKey,
  system: () => [...studentExamRootQueryKey, "system"] as const,
  systemTotal: () =>
    [...studentExamRootQueryKey, "system", "total"] as const,
  systemList: (params: StudentSystemExamListParams = {}) =>
    [...studentExamRootQueryKey, "system", "list", params] as const,
  classes: () => [...studentExamRootQueryKey, "classes"] as const,
  classList: (
    classId: string | number,
    params: StudentSystemExamListParams = {},
  ) =>
    [...studentExamRootQueryKey, "classes", classId, "list", params] as const,
} as const;
