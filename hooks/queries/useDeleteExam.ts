"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExam } from "@/apis/exam.api";
import { teacherExamQueryKeys } from "./exam.query-keys";

export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: number) => deleteExam(examId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teacherExamQueryKeys.all,
      });
    },
  });
}
