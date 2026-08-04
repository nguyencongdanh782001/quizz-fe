import { ExamCreationMethods } from "@/components/features/teacher-exam-form/exam-creation-methods";
import { TextExamCreateScreen } from "@/components/features/teacher-exam-form/text-exam-create-screen";
import { TeacherSystemExamCreateScreen } from "./teacher-system-exam-create-screen";

interface TeacherSystemExamCreatePageProps {
  searchParams: Promise<{
    edit?: string | string[] | undefined;
    mode?: string | string[] | undefined;
  }>;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TeacherSystemExamCreatePage({
  searchParams,
}: TeacherSystemExamCreatePageProps) {
  const params = await searchParams;
  const editId = getSingleValue(params.edit);
  const mode = getSingleValue(params.mode);

  if (mode === "text") {
    return <TextExamCreateScreen />;
  }

  if (!editId && mode !== "manual" && mode !== "import") {
    return <ExamCreationMethods />;
  }

  return (
    <TeacherSystemExamCreateScreen
      editId={editId ?? null}
      initialImportOpen={!editId && mode === "import"}
    />
  );
}