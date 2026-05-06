import { TeacherClassExamCreateScreen } from "./teacher-class-exam-create-screen";

export default async function TeacherClassExamCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TeacherClassExamCreateScreen classId={id} />;
}
