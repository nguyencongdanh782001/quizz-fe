export type DocumentType = 'pdf' | 'doc' | 'video' | 'link' | 'image';

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
  fileSize?: number; // bytes
  downloadCount: number;
  tags: string[];
  content?: string;
  scope?: string | null;
  classroomId?: string | null;
  classroomName?: string | null;
  actionLabel?: string;
}

export interface DocumentFilter {
  subject?: string;
  grade?: number;
  type?: DocumentType;
  search?: string;
}
