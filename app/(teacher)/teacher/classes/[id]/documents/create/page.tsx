import { TeacherClassDocumentCreateScreen } from "./teacher-class-document-create-screen";

export default async function TeacherClassDocumentCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TeacherClassDocumentCreateScreen classId={id} />;
}
