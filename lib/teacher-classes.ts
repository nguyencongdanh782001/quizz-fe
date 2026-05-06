import { api as teacherApi } from '@/lib/api/endpoints/teacher';
import type {
  TeacherClassDocumentSchema,
  TeacherClassExamSchema,
  TeacherClassSchema,
  TeacherClassStudentSchema,
  TeacherCreateClassExamRequest,
  TeacherCreateClassRequest,
} from '@/lib/api/types';
import type { ClassInfo, ClassStudent } from '@/types/class.types';
import type { Document } from '@/types/document.types';
import type { Exam, ExamDifficulty } from '@/types/exam.types';

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

function mapTeacherClassDocument(item: TeacherClassDocumentSchema): Document {
  return {
    id: String(item.id),
    title: item.title,
    description: item.summary,
    type: 'doc',
    url: `/teacher/documents`,
    subject: item.classroom_name ?? 'Tài liệu lớp học',
    grade: inferGrade(item.classroom_name),
    uploadedBy: 'teacher',
    uploadedByName: 'Giáo viên',
    createdAt: item.created_at,
    downloadCount: 0,
    tags: [item.scope, item.is_published ? 'published' : 'draft'].filter(Boolean),
    content: item.content,
    scope: item.scope,
    classroomId: item.classroom_id ? String(item.classroom_id) : null,
    classroomName: item.classroom_name,
    actionLabel: item.is_published ? 'Xem tài liệu' : 'Chỉnh sửa tài liệu',
  };
}

function inferDifficulty(
  durationMinutes: number,
  questionCount: number,
): ExamDifficulty {
  if (durationMinutes >= 60 || questionCount >= 40) {
    return 'hard';
  }

  if (durationMinutes <= 20 || questionCount <= 10) {
    return 'easy';
  }

  return 'medium';
}

function mapTeacherClassExam(item: TeacherClassExamSchema): Exam {
  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    subject: item.classroom_name ?? 'Bài thi lớp học',
    grade: inferGrade(item.classroom_name),
    difficulty: inferDifficulty(item.duration_minutes, item.question_count),
    duration: item.duration_minutes,
    passingScore: 0,
    questionCount: item.question_count,
    attemptCount: item.attempt_count,
    status: item.is_published ? 'published' : 'draft',
    createdBy: 'teacher',
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    thumbnailUrl: item.image_url ?? undefined,
    tags: [item.scope, item.is_published ? 'published' : 'draft'].filter(Boolean),
    classIds: item.classroom_id ? [String(item.classroom_id)] : [],
    classroomName: item.classroom_name,
    totalPoints: item.total_points,
    scope: item.scope,
    isActive: item.is_active,
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

export async function getTeacherClassDocuments(
  classId: string,
): Promise<Document[]> {
  const response = await teacherApi.teacher.classes.documents(classId);
  return (response.data.items ?? []).map(mapTeacherClassDocument);
}

export async function getTeacherClassExams(
  classId: string,
): Promise<Exam[]> {
  const response = await teacherApi.teacher.classes.exams(classId);
  return (response.data.items ?? []).map(mapTeacherClassExam);
}

export async function createTeacherClassExam(
  classId: string,
  data: TeacherCreateClassExamRequest,
): Promise<string> {
  const response = await teacherApi.teacher.classes.createExam(classId, data);
  return response.data.message;
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
