import { TeacherClassExamResultsScreen } from "./teacher-class-exam-results-screen";

export default async function TeacherClassExamResultsPage({
  params,
}: {
  params: Promise<{ id: string; examId: string }>;
}) {
  const { id, examId } = await params;

  return <TeacherClassExamResultsScreen classId={id} examId={examId} />;
}
