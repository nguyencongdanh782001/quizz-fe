export type DocumentType = 'pdf' | 'doc' | 'video' | 'link' | 'image';
export type DocumentScope = 'system' | 'classroom';

export interface Document {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  url: string;
  thumbnailUrl?: string;
  subject: string;
  grade: number;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
  updatedAt?: string;
  fileSize?: number; // bytes
  downloadCount: number;
  tags: string[];
  content?: string;
  scope?: DocumentScope | null;
  classroomId?: string | null;
  classroomName?: string | null;
  isPublished?: boolean;
  actionLabel?: string;
}

export interface TeacherDocumentQuery {
  search?: string;
  scope?: DocumentScope;
  is_published?: boolean;
  classroom_id?: number;
}

export interface TeacherDocumentFilterState {
  search: string;
  scope: "" | DocumentScope;
  is_published: "" | "true" | "false";
  classroom_id: string;
}

export interface TeacherDocumentSearchParamRecord {
  search?: string | string[] | undefined;
  scope?: string | string[] | undefined;
  is_published?: string | string[] | undefined;
  classroom_id?: string | string[] | undefined;
}
