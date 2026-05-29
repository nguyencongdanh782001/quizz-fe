"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  publishTeacherExam,
  privateTeacherExam,
} from "@/services/exam.service";
import type {
  TeacherPublishExamResponse,
  TeacherPrivateExamResponse,
} from "@/lib/api/types";
import type { TeacherExam, TeacherExamListResult } from "@/types/exam";
import { mergeTeacherExamPublishUpdate } from "@/components/exams/exam-publish-utils";
import { teacherExamQueryKeys } from "./exam.query-keys";

export type ToggleVisibilityResponse =
  | TeacherPublishExamResponse
  | TeacherPrivateExamResponse;

interface ToggleVisibilityVariables {
  examId: number | string;
  currentIsPublished: boolean;
}

interface ToggleVisibilitySnapshot {
  previousLists: Array<
    [readonly unknown[], TeacherExamListResult | undefined]
  >;
  previousDetails: Array<[readonly unknown[], TeacherExam | undefined]>;
}

function updateListPublishedState(
  data: TeacherExamListResult | undefined,
  examId: number | string,
  isPublished: boolean,
): TeacherExamListResult | undefined {
  if (!data) return data;

  return {
    ...data,
    items: data.items.map((exam) =>
      String(exam.id) === String(examId)
        ? { ...exam, is_published: isPublished }
        : exam,
    ),
  };
}

function updateDetailPublishedState(
  data: TeacherExam | undefined,
  examId: number | string,
  isPublished: boolean,
): TeacherExam | undefined {
  if (!data || String(data.id) !== String(examId)) return data;

  return { ...data, is_published: isPublished };
}

function mergeResponseIntoList(
  data: TeacherExamListResult | undefined,
  response: ToggleVisibilityResponse,
): TeacherExamListResult | undefined {
  if (!data) return data;

  return {
    ...data,
    items: data.items.map((exam) =>
      mergeTeacherExamPublishUpdate(exam, response.exam),
    ),
  };
}

function mergeResponseIntoDetail(
  data: TeacherExam | undefined,
  response: ToggleVisibilityResponse,
): TeacherExam | undefined {
  if (!data) return data;

  return mergeTeacherExamPublishUpdate(data, response.exam);
}

export function useToggleExamVisibility() {
  const queryClient = useQueryClient();

  return useMutation<
    ToggleVisibilityResponse,
    unknown,
    ToggleVisibilityVariables,
    ToggleVisibilitySnapshot
  >({
    mutationFn: async ({ examId, currentIsPublished }) => {
      if (currentIsPublished) {
        return privateTeacherExam(examId);
      }

      return publishTeacherExam(examId);
    },
    onMutate: async ({ examId, currentIsPublished }) => {
      await queryClient.cancelQueries({
        queryKey: teacherExamQueryKeys.all,
      });

      const previousLists =
        queryClient.getQueriesData<TeacherExamListResult>({
          queryKey: teacherExamQueryKeys.lists(),
        });
      const previousDetails = queryClient.getQueriesData<TeacherExam>({
        queryKey: teacherExamQueryKeys.details(),
      });
      const nextIsPublished = !currentIsPublished;

      queryClient.setQueriesData<TeacherExamListResult>(
        { queryKey: teacherExamQueryKeys.lists() },
        (current) =>
          updateListPublishedState(current, examId, nextIsPublished),
      );
      queryClient.setQueriesData<TeacherExam>(
        { queryKey: teacherExamQueryKeys.details() },
        (current) =>
          updateDetailPublishedState(current, examId, nextIsPublished),
      );

      return { previousLists, previousDetails };
    },
    onError: (_error, _variables, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousDetails.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (response) => {
      queryClient.setQueriesData<TeacherExamListResult>(
        { queryKey: teacherExamQueryKeys.lists() },
        (current) => mergeResponseIntoList(current, response),
      );
      queryClient.setQueriesData<TeacherExam>(
        { queryKey: teacherExamQueryKeys.details() },
        (current) => mergeResponseIntoDetail(current, response),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: teacherExamQueryKeys.all,
      });
    },
  });
}
