import { TeacherClassExamAttemptResultScreen } from "./teacher-class-exam-attempt-result-screen";

export default async function TeacherClassExamAttemptResultPage({
  params,
}: {
  params: Promise<{ id: string; examId: string; attemptId: string }>;
}) {
  const { id, examId, attemptId } = await params;

  return (
    <TeacherClassExamAttemptResultScreen
      classId={id}
      examId={examId}
      attemptId={attemptId}
    />
  );
}
