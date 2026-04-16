export interface ClassStudent {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade: number;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  examCount: number;
  createdAt: string;
  inviteCode: string;
  coverColor: string;
  students: ClassStudent[];
}

export interface ClassFilter {
  subject?: string;
  grade?: number;
  search?: string;
}
