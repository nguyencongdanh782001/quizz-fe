import { TeacherClassDetailScreen } from "./teacher-class-detail-screen";

export default async function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TeacherClassDetailScreen classId={id} />;
}
