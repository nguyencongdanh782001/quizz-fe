"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TeacherUpdateExamRequest } from "@/lib/api/types";
import { updateTeacherExam } from "@/services/exam.service";
import { teacherExamQueryKeys } from "./exam.query-keys";

interface UpdateTeacherExamInput {
  examId: string | number;
  payload: TeacherUpdateExamRequest;
}

export function useUpdateTeacherExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, payload }: UpdateTeacherExamInput) =>
      updateTeacherExam(examId, payload),
    onSuccess: async (_, { examId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherExamQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: teacherExamQueryKeys.detail(examId),
        }),
      ]);
    },
  });
}
