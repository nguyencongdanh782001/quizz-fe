export const teacherClassDetailQueryKeys = {
  detail: (classId: string) => ["teacher-class-detail", classId] as const,
  students: (classId: string) =>
    ["teacher-classroom-students", classId] as const,
  exams: (classId: string) => ["teacher-classroom-exams", classId] as const,
  examDetails: (classId: string) =>
    ["teacher-classroom-exam-detail", classId] as const,
  examDetail: (classId: string, examId: string) =>
    ["teacher-classroom-exam-detail", classId, examId] as const,
  documents: (classId: string) =>
    ["teacher-classroom-documents", classId] as const,
} as const;
