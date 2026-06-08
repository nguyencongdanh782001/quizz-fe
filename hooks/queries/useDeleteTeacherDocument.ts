"use client";

import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeacherDocument } from "@/services/document.service";
import type { Document } from "@/types/document.types";
import { teacherClassQueryKeys } from "./useTeacherClasses";
import { teacherDocumentQueryKeys } from "./teacher-document.query-keys";

interface DeleteTeacherDocumentMutationContext {
  snapshots: Array<{
    data: Document[] | undefined;
    queryKey: QueryKey;
  }>;
}

export function useDeleteTeacherDocument() {
  const queryClient = useQueryClient();

  return useMutation<
    string,
    unknown,
    number,
    DeleteTeacherDocumentMutationContext
  >({
    mutationFn: async (documentId) => deleteTeacherDocument(documentId),
    onMutate: async (documentId) => {
      await queryClient.cancelQueries({
        queryKey: teacherDocumentQueryKeys.all,
      });

      const snapshots = queryClient
        .getQueriesData<Document[]>({
          queryKey: teacherDocumentQueryKeys.all,
        })
        .map(([queryKey, data]) => ({
          queryKey,
          data,
        }));
      const documentIdText = String(documentId);

      queryClient.setQueriesData<Document[]>(
        {
          queryKey: teacherDocumentQueryKeys.all,
        },
        (currentDocuments) =>
          currentDocuments?.filter(
            (document) => document.id !== documentIdText,
          ) ?? currentDocuments,
      );

      return { snapshots };
    },
    onError: (_error, _documentId, context) => {
      for (const snapshot of context?.snapshots ?? []) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },
    onSettled: async () => {
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
