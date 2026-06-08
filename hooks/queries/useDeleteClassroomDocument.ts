"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeacherClassDocument } from "@/lib/teacher-classes";
import type { ClassInfo } from "@/types/class.types";
import type { Document } from "@/types/document.types";
import { teacherClassQueryKeys } from "./useTeacherClasses";
import { teacherClassDetailQueryKeys } from "@/app/(teacher)/teacher/classes/[id]/query-keys";

interface DeleteClassroomDocumentVariables {
  classId: string;
  documentId: number;
}

interface DeleteClassroomDocumentContext {
  classListSnapshot: ClassInfo[] | undefined;
  detailSnapshot: ClassInfo | null | undefined;
  documentsSnapshot: Document[] | undefined;
}

export function useDeleteClassroomDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    string,
    unknown,
    DeleteClassroomDocumentVariables,
    DeleteClassroomDocumentContext
  >({
    mutationFn: async ({ classId, documentId }) =>
      deleteTeacherClassDocument(classId, documentId),
    onMutate: async ({ classId, documentId }) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: teacherClassDetailQueryKeys.documents(classId),
        }),
        queryClient.cancelQueries({
          queryKey: teacherClassDetailQueryKeys.detail(classId),
        }),
        queryClient.cancelQueries({
          queryKey: teacherClassQueryKeys.all,
        }),
      ]);

      const documentsSnapshot = queryClient.getQueryData<Document[]>(
        teacherClassDetailQueryKeys.documents(classId),
      );
      const detailSnapshot = queryClient.getQueryData<ClassInfo | null>(
        teacherClassDetailQueryKeys.detail(classId),
      );
      const classListSnapshot = queryClient.getQueryData<ClassInfo[]>(
        teacherClassQueryKeys.all,
      );
      const documentIdText = String(documentId);

      queryClient.setQueryData<Document[]>(
        teacherClassDetailQueryKeys.documents(classId),
        (currentDocuments) =>
          currentDocuments?.filter(
            (document) => document.id !== documentIdText,
          ) ?? currentDocuments,
      );
      queryClient.setQueryData<ClassInfo | null>(
        teacherClassDetailQueryKeys.detail(classId),
        (currentClass) =>
          currentClass
            ? {
                ...currentClass,
                documentCount: Math.max(
                  (currentClass.documentCount ?? 0) - 1,
                  0,
                ),
              }
            : currentClass,
      );
      queryClient.setQueryData<ClassInfo[]>(
        teacherClassQueryKeys.all,
        (currentClasses) =>
          currentClasses?.map((classroom) =>
            classroom.id === classId
              ? {
                  ...classroom,
                  documentCount: Math.max(
                    (classroom.documentCount ?? 0) - 1,
                    0,
                  ),
                }
              : classroom,
          ) ?? currentClasses,
      );

      return {
        classListSnapshot,
        detailSnapshot,
        documentsSnapshot,
      };
    },
    onError: (_error, { classId }, context) => {
      if (context?.documentsSnapshot !== undefined) {
        queryClient.setQueryData(
          teacherClassDetailQueryKeys.documents(classId),
          context.documentsSnapshot,
        );
      }

      if (context?.detailSnapshot !== undefined) {
        queryClient.setQueryData(
          teacherClassDetailQueryKeys.detail(classId),
          context.detailSnapshot,
        );
      }

      if (context?.classListSnapshot !== undefined) {
        queryClient.setQueryData(
          teacherClassQueryKeys.all,
          context.classListSnapshot,
        );
      }
    },
    onSettled: async (_data, _error, { classId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherClassDetailQueryKeys.detail(classId),
        }),
        queryClient.invalidateQueries({
          queryKey: teacherClassDetailQueryKeys.documents(classId),
        }),
        queryClient.invalidateQueries({
          queryKey: teacherClassQueryKeys.all,
        }),
      ]);
    },
  });
}
