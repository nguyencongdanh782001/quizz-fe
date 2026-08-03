export interface ClassStudent {
  id: string;
  name: string;
  email: string;
  studentCode: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade: number;
  teacherId?: string;
  teacherName?: string | null;
  studentCount?: number | null;
  examCount: number;
  documentCount?: number;
  createdAt: string;
  updatedAt?: string | null;
  imageUrl?: string | null;
  inviteCode: string;
  joinCode?: string;
  coverColor: string;
  students: ClassStudent[];
  joinedAt?: string | null;
}

export interface ClassFilter {
  subject?: string;
  grade?: number;
  search?: string;
}
