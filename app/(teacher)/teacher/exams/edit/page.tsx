import { TeacherSystemExamCreateScreen } from "./teacher-system-exam-create-screen";

interface TeacherSystemExamCreatePageProps {
  searchParams: Promise<{
    edit?: string | string[] | undefined;
  }>;
}

export default async function TeacherSystemExamCreatePage({
  searchParams,
}: TeacherSystemExamCreatePageProps) {
  const { edit } = await searchParams;
  const editId = Array.isArray(edit) ? edit[0] : edit;

  return <TeacherSystemExamCreateScreen editId={editId ?? null} />;
}
