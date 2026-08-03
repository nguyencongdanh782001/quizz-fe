"use client";

/**
 * useInfiniteQuery for the class-scoped student exam list.
 *
 * Mirrors useStudentSystemExams but pinned to a single classId.
 * Tab-activation is handled via the `enabled` option — pass
 * `enabled: activeTab === 'exams'` from the page.
 */
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getStudentClassExams,
  type StudentSystemExamListParams,
  type StudentSystemExamListResult,
} from "@/lib/student-system-exams";
import type { Exam } from "@/types/exam.types";
import { studentExamQueryKeys } from "./student-exam.query-keys";

interface StudentClassExamsInfiniteData {
  pages: StudentSystemExamListResult[];
  items: Exam[];
  total: number;
}

interface StudentClassExamsOptions {
  throwOnError?: boolean;
  enabled?: boolean;
}

export function useStudentClassExams(
  classId: string | number,
  params: StudentSystemExamListParams = {},
  options: StudentClassExamsOptions = {},
) {
  const limit = params.limit ?? 50;
  const initialOffset = params.offset ?? 0;

  return useInfiniteQuery<
    StudentSystemExamListResult,
    Error,
    StudentClassExamsInfiniteData,
    ReturnType<typeof studentExamQueryKeys.classList>,
    number
  >({
    queryKey: studentExamQueryKeys.classList(classId, {
      ...params,
      limit,
      offset: initialOffset,
    }),
    queryFn: ({ pageParam }) =>
      getStudentClassExams(String(classId), {
        limit,
        offset: pageParam,
        throwOnError: options.throwOnError,
      }),
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
    enabled: options.enabled ?? true,
    staleTime: 60_000,
  });
}
