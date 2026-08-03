"use client";

/**
 * useInfiniteQuery for the student system exam list.
 *
 * First useInfiniteQuery in this codebase — offset-based pagination.
 * Pattern:
 *   - getNextPageParam: returns the next offset, or undefined when all items loaded.
 *   - queryKey includes params (offset/limit) so React Query caches each page.
 *   - select flattens pages into items + exposes the latest page metadata.
 *
 * Follow the same query-key + wrapper separation as useTeacherSystemExams.
 */
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getStudentSystemExams,
  type StudentSystemExamListParams,
  type StudentSystemExamListResult,
} from "@/lib/student-system-exams";
import type { Exam } from "@/types/exam.types";
import { studentExamQueryKeys } from "./student-exam.query-keys";

interface StudentSystemExamsInfiniteData {
  pages: StudentSystemExamListResult[];
  items: Exam[];
  total: number;
}

export function useStudentSystemExams(
  params: StudentSystemExamListParams = {},
) {
  const limit = params.limit ?? 50;
  const initialOffset = params.offset ?? 0;

  return useInfiniteQuery<
    StudentSystemExamListResult,
    Error,
    StudentSystemExamsInfiniteData,
    ReturnType<typeof studentExamQueryKeys.systemList>,
    number
  >({
    queryKey: studentExamQueryKeys.systemList({
      ...params,
      limit,
      offset: initialOffset,
    }),
    queryFn: ({ pageParam }) =>
      getStudentSystemExams({ limit, offset: pageParam }),
    initialPageParam: initialOffset,
    getNextPageParam: (lastPage) =>
      lastPage.offset + lastPage.limit < lastPage.total
        ? lastPage.offset + lastPage.limit
        : undefined,
    select: (data) => ({
      pages: data.pages,
      total: data.pages[0]?.total ?? 0,
      items: data.pages.flatMap((page) => page.items),
    }),
    staleTime: 60_000,
  });
}
