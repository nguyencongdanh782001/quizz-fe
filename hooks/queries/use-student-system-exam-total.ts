"use client";

/**
 * Lightweight hook: only the `total` count of system exams.
 * Uses limit=1, offset=0 to fetch minimum data.
 * Independently cacheable from the infinite list query so the metric can
 * stay warm without paying the cost of the list fetch.
 */
import { useQuery } from "@tanstack/react-query";
import { getStudentSystemExams } from "@/lib/student-system-exams";
import { studentExamQueryKeys } from "./student-exam.query-keys";

export function useStudentSystemExamTotal() {
  return useQuery({
    queryKey: studentExamQueryKeys.systemTotal(),
    queryFn: () => getStudentSystemExams({ limit: 1, offset: 0 }),
    select: (data) => data.total,
    staleTime: 60_000,
  });
}
