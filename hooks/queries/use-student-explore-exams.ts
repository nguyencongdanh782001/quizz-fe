"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getStudentExploreExams,
  type StudentSystemExamListParams,
  type StudentSystemExamListResult,
} from "@/lib/student-system-exams";
import type { Exam } from "@/types/exam.types";
import { studentExamQueryKeys } from "./student-exam.query-keys";

interface StudentExploreExamsInfiniteData {
  pages: StudentSystemExamListResult[];
  items: Exam[];
  total: number;
}

export function useStudentExploreExams(
  params: StudentSystemExamListParams = {},
) {
  const limit = params.limit ?? 50;
  const initialOffset = params.offset ?? 0;
  const { limit: _limit, offset: _offset, ...staticParams } = params;

  return useInfiniteQuery<
    StudentSystemExamListResult,
    Error,
    StudentExploreExamsInfiniteData,
    ReturnType<typeof studentExamQueryKeys.exploreList>,
    number
  >({
    queryKey: studentExamQueryKeys.exploreList({
      ...params,
      limit,
      offset: initialOffset,
    }),
    queryFn: ({ pageParam }) =>
      getStudentExploreExams({
        ...staticParams,
        limit,
        offset: pageParam,
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
    staleTime: 60_000,
  });
}
