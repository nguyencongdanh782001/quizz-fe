"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTeacherDocuments } from "@/services/document.service";
import type { TeacherDocumentQuery } from "@/types/document.types";
import { teacherDocumentQueryKeys } from "./teacher-document.query-keys";

export function useTeacherDocuments(query: TeacherDocumentQuery) {
  return useQuery({
    queryKey: teacherDocumentQueryKeys.list(query),
    queryFn: async () => getTeacherDocuments(query),
    placeholderData: keepPreviousData,
  });
}
