import { api as studentApi } from '@/lib/api/endpoints/student';
import type {
  StudentClassSchema,
  StudentJoinClassRequest,
} from '@/lib/api/types';
import type { ClassInfo } from '@/types/class.types';

const CLASS_COVER_COLORS = [
  '#4f46e5',
  '#06b6d4',
  '#7c3aed',
  '#0f766e',
  '#2563eb',
  '#9333ea',
  '#0891b2',
  '#4338ca',
] as const;

function inferGradeFromClassName(className: string): number {
  const match = className.match(/(?:lop|lớp)\s*(\d{1,2})|(\d{1,2})/i);
  const grade = Number(match?.[1] ?? match?.[2]);

  if (Number.isNaN(grade) || grade < 1 || grade > 12) {
    return 0;
  }

  return grade;
}

function getClassCoverColor(classId: string): string {
  const hash = Array.from(classId).reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );

  return CLASS_COVER_COLORS[hash % CLASS_COVER_COLORS.length];
}

function mapStudentClass(item: StudentClassSchema): ClassInfo {
  const id = String(item.id);

  return {
    id,
    name: item.name,
    description: item.description,
    subject: 'Lớp học',
    grade: inferGradeFromClassName(item.name),
    examCount: item.exam_count,
    documentCount: item.document_count,
    createdAt: item.joined_at,
    inviteCode: item.join_code,
    joinCode: item.join_code,
    coverColor: getClassCoverColor(id),
    students: [],
    joinedAt: item.joined_at,
  };
}

function normalizeJoinCode(joinCode: string): string {
  return joinCode.trim().toUpperCase();
}

export async function getStudentClasses(): Promise<ClassInfo[]> {
  try {
    const response = await studentApi.student.classes.list();
    return (response.data.items ?? []).map(mapStudentClass);
  } catch (error) {
    console.error('Failed to fetch student classes', error);
    return [];
  }
}

export async function joinStudentClass(joinCode: string): Promise<ClassInfo> {
  const payload: StudentJoinClassRequest = {
    join_code: normalizeJoinCode(joinCode),
  };
  const response = await studentApi.student.classes.join(payload);
  return mapStudentClass(response.data.classroom);
}

export async function getStudentClassById(
  classId: string,
): Promise<ClassInfo | null> {
  const classes = await getStudentClasses();
  return classes.find((cls) => cls.id === classId) ?? null;
}
