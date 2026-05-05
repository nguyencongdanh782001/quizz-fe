import { api as studentApi } from '@/lib/api/endpoints/student';
import type { StudentSystemDocumentSchema } from '@/lib/api/types';
import type { Document } from '@/types/document.types';

interface StudentDocumentFetchOptions {
  throwOnError?: boolean;
}

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

function mapStudentDocument(item: StudentSystemDocumentSchema): Document {
  return {
    id: String(item.id),
    title: item.title,
    description: item.summary,
    type: 'doc',
    url: `/student/materials/${item.id}`,
    subject: item.classroom_name ?? 'Tài liệu hệ thống',
    grade: inferGrade(item.classroom_name),
    uploadedBy: 'system',
    uploadedByName: 'Hệ thống',
    createdAt: item.created_at,
    downloadCount: 0,
    tags: item.scope ? [item.scope] : [],
    content: item.content,
    scope: item.scope,
    classroomId: item.classroom_id ? String(item.classroom_id) : null,
    classroomName: item.classroom_name,
    actionLabel: 'Xem tài liệu',
  };
}

export async function getStudentSystemDocuments(): Promise<Document[]> {
  try {
    const response = await studentApi.student.system.documents();
    return (response.data.items ?? []).map(mapStudentDocument);
  } catch (error) {
    console.error('Failed to fetch student system documents', error);
    return [];
  }
}

export async function getStudentSystemDocument(
  documentId: string,
): Promise<Document | null> {
  const documents = await getStudentSystemDocuments();
  return documents.find((document) => document.id === documentId) ?? null;
}

export async function getStudentClassDocuments(
  classId: string,
  options: StudentDocumentFetchOptions = {},
): Promise<Document[]> {
  try {
    const response = await studentApi.student.classes.documents(classId);
    return (response.data.items ?? []).map(mapStudentDocument);
  } catch (error) {
    console.error(`Failed to fetch class documents for ${classId}`, error);
    if (options.throwOnError) {
      throw error;
    }
    return [];
  }
}

export async function getStudentClassDocument(
  classId: string,
  documentId: string,
): Promise<Document | null> {
  const documents = await getStudentClassDocuments(classId);
  return documents.find((document) => document.id === documentId) ?? null;
}
