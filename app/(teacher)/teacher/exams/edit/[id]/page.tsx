import { TeacherSystemExamCreateScreen } from "../teacher-system-exam-create-screen";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeacherExamEditByIdPage({ params }: Props) {
  const { id } = await params;
  return <TeacherSystemExamCreateScreen editId={id} />;
}
