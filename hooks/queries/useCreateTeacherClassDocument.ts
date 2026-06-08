"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeacherClassDocument } from "@/lib/teacher-classes";
import { teacherClassQueryKeys } from "./useTeacherClasses";
import { teacherClassDetailQueryKeys } from "@/app/(teacher)/teacher/classes/[id]/query-keys";

interface CreateTeacherClassDocumentInput {
  classId: string;
  formData: FormData;
}

export function useCreateTeacherClassDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, formData }: CreateTeacherClassDocumentInput) =>
      createTeacherClassDocument(classId, formData),
    onSuccess: async (_message, { classId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherClassQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: teacherClassDetailQueryKeys.detail(classId),
        }),
        queryClient.invalidateQueries({
          queryKey: teacherClassDetailQueryKeys.documents(classId),
        }),
      ]);
    },
  });
}
