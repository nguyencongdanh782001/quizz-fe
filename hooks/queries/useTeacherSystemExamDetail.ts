"use client";

import { useQuery } from "@tanstack/react-query";
import { getTeacherSystemExamDetail } from "@/services/exam.service";
import { teacherExamQueryKeys } from "./exam.query-keys";

interface UseTeacherSystemExamDetailOptions {
  enabled?: boolean;
}

export function useTeacherSystemExamDetail(
  examId: string | number | null,
  options?: UseTeacherSystemExamDetailOptions,
) {
  return useQuery({
    queryKey: teacherExamQueryKeys.detail(examId ?? "missing"),
    queryFn: async () => {
      if (examId === null) {
        throw new Error("Thiếu mã bài thi.");
      }

      return getTeacherSystemExamDetail(examId);
    },
    enabled: (options?.enabled ?? true) && examId !== null,
  });
}
