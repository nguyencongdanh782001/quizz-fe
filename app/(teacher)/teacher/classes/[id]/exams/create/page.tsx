import { TeacherClassExamCreateScreen } from "./teacher-class-exam-create-screen";

export default async function TeacherClassExamCreatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const editId = Array.isArray(edit) ? edit[0] : edit;

  return <TeacherClassExamCreateScreen classId={id} editId={editId} />;
}
