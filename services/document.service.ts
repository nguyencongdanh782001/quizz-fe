import { api as teacherApi } from "@/lib/api/endpoints/teacher";
import { APP_MESSAGES } from "@/lib/app-messages";
import type { TeacherDocumentSchema } from "@/lib/api/types";
import type { Document, TeacherDocumentQuery } from "@/types/document.types";

function inferGrade(classroomName: string | null): number {
  if (!classroomName) {
    return 0;
  }

  const match = classroomName.match(/(?:lop|lớp)\s*(\d{1,2})|(\d{1,2})/i);
  const grade = Number(match?.[1] ?? match?.[2]);

  if (Number.isNaN(grade) || grade < 1 || grade > 12) {
    return 0;
  }

  return grade;
}

function mapTeacherDocument(item: TeacherDocumentSchema): Document {
  return {
    id: String(item.id),
    title: item.title,
    description: item.summary,
    type: "doc",
    url: "/teacher/documents",
    subject: item.classroom_name ?? "Tài liệu hệ thống",
    grade: inferGrade(item.classroom_name),
    uploadedBy: "teacher",
    uploadedByName: "Giáo viên",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    fileSize: item.file_size_bytes ?? undefined,
    downloadCount: 0,
    tags: [item.scope, item.is_published ? "published" : "draft"].filter(
      Boolean,
    ),
    content: item.content,
    scope: item.scope === "classroom" ? "classroom" : "system",
    classroomId: item.classroom_id ? String(item.classroom_id) : null,
    classroomName: item.classroom_name,
    isPublished: item.is_published,
  };
}

function toApiParams(
  query: TeacherDocumentQuery,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};

  if (query.search?.trim()) {
    params.search = query.search.trim();
  }

  if (query.scope) {
    params.scope = query.scope;
  }

  if (typeof query.is_published === "boolean") {
    params.is_published = query.is_published;
  }

  if (typeof query.classroom_id === "number") {
    params.classroom_id = query.classroom_id;
  }

  return params;
}

export async function getTeacherDocuments(
  query: TeacherDocumentQuery = {},
): Promise<Document[]> {
  const response = await teacherApi.teacher.documents.list(toApiParams(query));

  return (response.data.items ?? []).map(mapTeacherDocument);
}

export async function createTeacherDocument(
  formData: FormData,
): Promise<string> {
  const response = await teacherApi.teacher.documents.create(formData);

  return response.data.message || APP_MESSAGES.CREATE_DOCUMENT_SUCCESS;
}

export async function deleteTeacherDocument(
  documentId: number,
): Promise<string> {
  await teacherApi.teacher.documents.delete(documentId);

  return APP_MESSAGES.DELETE_DOCUMENT_SUCCESS;
}
