"use client";

import { useQuery } from "@tanstack/react-query";
import { getTeacherExploreExams } from "@/services/exam.service";
import type { TeacherExamQuery } from "@/types/exam";
import { teacherExamQueryKeys } from "./exam.query-keys";

export function useTeacherSystemExams(query: TeacherExamQuery = {}) {
  return useQuery({
    queryKey: teacherExamQueryKeys.list(query),
    queryFn: async () => getTeacherExploreExams(query),
    staleTime: 60_000,
  });
}
