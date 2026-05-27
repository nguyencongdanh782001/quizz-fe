import type { TeacherDocumentQuery } from "@/types/document.types";

const teacherDocumentRootQueryKey = ["teacher-documents"] as const;

export const teacherDocumentQueryKeys = {
  all: teacherDocumentRootQueryKey,
  lists: () => [...teacherDocumentRootQueryKey, "list"] as const,
  list: (query: TeacherDocumentQuery) =>
    [...teacherDocumentRootQueryKey, "list", query] as const,
} as const;
