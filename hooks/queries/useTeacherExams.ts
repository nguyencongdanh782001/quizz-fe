"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTeacherSystemExams } from "@/services/exam.service";
import type { TeacherExamQuery } from "@/types/exam";
import { teacherExamQueryKeys } from "./exam.query-keys";

export function useTeacherExams(query: TeacherExamQuery) {
  return useQuery({
    queryKey: teacherExamQueryKeys.list(query),
    queryFn: async () => getTeacherSystemExams(query),
    placeholderData: keepPreviousData,
  });
}
