"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeacherDocument } from "@/services/document.service";
import { teacherClassQueryKeys } from "./useTeacherClasses";
import { teacherDocumentQueryKeys } from "./teacher-document.query-keys";

export function useCreateTeacherDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => createTeacherDocument(formData),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherDocumentQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: teacherClassQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["teacher-class-detail"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["teacher-classroom-documents"],
        }),
      ]);
    },
  });
}
