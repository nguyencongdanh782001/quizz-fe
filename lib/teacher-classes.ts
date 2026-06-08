import { api as teacherApi } from '@/lib/api/endpoints/teacher';
import { APP_MESSAGES } from '@/lib/app-messages';
import type {
  TeacherClassDocumentSchema,
  TeacherClassExamSchema,
  TeacherClassSchema,
  TeacherClassStudentSchema,
  TeacherCreateClassRequest,
  TeacherCreateExamRequest,
  TeacherUpdateClassExamRequest,
  TeacherUpdateClassRequest,
} from '@/lib/api/types';
import { mapTeacherExam } from '@/lib/teacher-exam-mapper';
import type { ClassInfo, ClassStudent } from '@/types/class.types';
import type { Document } from '@/types/document.types';
import type { TeacherExam } from '@/types/exam';
import type { Exam, ExamDifficulty } from '@/types/exam.types';

export interface UpdateTeacherClassroomResult {
  message: string;
  classroom: ClassInfo;
}

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
    studentCode: item.username,
    avatarUrl: item.avatar_url,
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
    updatedAt: item.updated_at,
    downloadCount: 0,
    tags: [item.scope, item.is_published ? 'published' : 'draft'].filter(Boolean),
    content: item.content,
    scope: item.scope === 'classroom' ? 'classroom' : 'system',
    classroomId: item.classroom_id ? String(item.classroom_id) : null,
    classroomName: item.classroom_name,
    isPublished: item.is_published,
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
    isPublished: item.is_published,
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

export async function deleteTeacherClassDocument(
  classId: string,
  documentId: number,
): Promise<string> {
  await teacherApi.teacher.classes.deleteDocument(classId, documentId);

  return APP_MESSAGES.DELETE_DOCUMENT_SUCCESS;
}

export async function createTeacherClassDocument(
  classId: string,
  formData: FormData,
): Promise<string> {
  await teacherApi.teacher.classes.createDocument(classId, formData);
  return APP_MESSAGES.CREATE_DOCUMENT_SUCCESS;
}

export async function getTeacherClassExams(
  classId: string,
): Promise<Exam[]> {
  const response = await teacherApi.teacher.classes.exams(classId);
  return (response.data.items ?? []).map(mapTeacherClassExam);
}

export async function createTeacherClassExam(
  classId: string,
  data: TeacherCreateExamRequest,
): Promise<string> {
  await teacherApi.teacher.classes.createExam(classId, data);
  return APP_MESSAGES.CREATE_EXAM_SUCCESS;
}

export async function getTeacherClassroomExamDetail(
  classId: string,
  examId: string,
): Promise<TeacherExam> {
  const response = await teacherApi.teacher.classes.examDetail(classId, examId);

  return mapTeacherExam(response.data);
}

export async function updateTeacherClassroomExam(
  classId: string,
  examId: string,
  data: TeacherUpdateClassExamRequest,
): Promise<string> {
  await teacherApi.teacher.classes.updateExam(
    classId,
    examId,
    data,
  );

  return APP_MESSAGES.UPDATE_EXAM_SUCCESS;
}

export async function removeTeacherClassStudent(
  classId: string,
  studentId: string,
): Promise<string> {
  await teacherApi.teacher.classes.removeStudent(
    classId,
    studentId,
  );

  return APP_MESSAGES.REMOVE_STUDENT_SUCCESS;
}

export async function deleteTeacherClassroom(classId: string): Promise<string> {
  await teacherApi.teacher.classes.delete(classId);
  return APP_MESSAGES.DELETE_CLASS_SUCCESS;
}

function normalizeJoinCode(joinCode: string): string {
  return joinCode.trim().toUpperCase();
}

function normalizeTeacherClassPayload<T extends { name: string; description: string; join_code: string }>(
  data: T,
): T {
  return {
    ...data,
    name: data.name.trim(),
    description: data.description.trim(),
    join_code: normalizeJoinCode(data.join_code),
  };
}

export async function createTeacherClass(
  data: TeacherCreateClassRequest,
): Promise<ClassInfo> {
  const payload = normalizeTeacherClassPayload(data);

  const response = await teacherApi.teacher.classes.create(payload);
  return mapTeacherClass(response.data.classroom);
}

export async function updateTeacherClassroom(
  classId: string,
  data: TeacherUpdateClassRequest,
): Promise<UpdateTeacherClassroomResult> {
  const payload = normalizeTeacherClassPayload(data);
  const response = await teacherApi.teacher.classes.update(classId, payload);

  return {
    message: APP_MESSAGES.UPDATE_CLASS_SUCCESS,
    classroom: mapTeacherClass(response.data.classroom),
  };
}
