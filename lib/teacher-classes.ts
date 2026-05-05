import { api as teacherApi } from '@/lib/api/endpoints/teacher';
import type {
  TeacherClassSchema,
  TeacherClassStudentSchema,
  TeacherCreateClassRequest,
} from '@/lib/api/types';
import type { ClassInfo, ClassStudent } from '@/types/class.types';

const CLASS_COVER_COLORS = [
  '#00464a',
  '#29695b',
  '#663000',
  '#4a0040',
  '#1a4a00',
  '#004a4a',
  '#6b3200',
  '#320064',
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

function mapTeacherClass(item: TeacherClassSchema): ClassInfo {
  const id = String(item.id);

  return {
    id,
    name: item.name,
    description: item.description,
    subject: 'Lớp học',
    grade: inferGradeFromClassName(item.name),
    studentCount: item.student_count,
    examCount: item.exam_count,
    documentCount: item.document_count,
    createdAt: item.created_at,
    inviteCode: item.join_code,
    joinCode: item.join_code,
    coverColor: getClassCoverColor(id),
    students: [],
  };
}

function mapTeacherClassStudent(item: TeacherClassStudentSchema): ClassStudent {
  return {
    id: String(item.id),
    name: item.full_name || item.username,
    email: item.email ?? "",
    joinedAt: item.joined_at,
  };
}

export async function getTeacherClasses(): Promise<ClassInfo[]> {
  const response = await teacherApi.teacher.classes.list();
  return (response.data.items ?? []).map(mapTeacherClass);
}

export async function getTeacherClassById(
  classId: string,
): Promise<ClassInfo | null> {
  const classes = await getTeacherClasses();
  return classes.find((item) => item.id === classId) ?? null;
}

export async function getTeacherClassStudents(
  classId: string,
): Promise<ClassStudent[]> {
  const response = await teacherApi.teacher.classes.students(classId);
  return (response.data.items ?? []).map(mapTeacherClassStudent);
}

export async function removeTeacherClassStudent(
  classId: string,
  studentId: string,
): Promise<string> {
  const response = await teacherApi.teacher.classes.removeStudent(
    classId,
    studentId,
  );

  return response.data.message;
}

function normalizeJoinCode(joinCode: string): string {
  return joinCode.trim().toUpperCase();
}

export async function createTeacherClass(
  data: TeacherCreateClassRequest,
): Promise<ClassInfo> {
  const payload: TeacherCreateClassRequest = {
    name: data.name.trim(),
    description: data.description.trim(),
    join_code: normalizeJoinCode(data.join_code),
  };

  const response = await teacherApi.teacher.classes.create(payload);
  return mapTeacherClass(response.data.classroom);
}
