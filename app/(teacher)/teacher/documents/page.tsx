import { parseTeacherDocumentFilters } from "@/lib/teacher-document-filters";
import type { TeacherDocumentSearchParamRecord } from "@/types/document.types";
import { TeacherDocumentsScreen } from "./teacher-documents-screen";

interface TeacherDocumentsPageProps {
  searchParams: Promise<TeacherDocumentSearchParamRecord>;
}

export default async function TeacherDocumentsPage({
  searchParams,
}: TeacherDocumentsPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <TeacherDocumentsScreen
      initialFilters={parseTeacherDocumentFilters(resolvedSearchParams)}
    />
  );
}
