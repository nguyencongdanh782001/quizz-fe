import { TeacherAIExamScreen } from "./teacher-ai-exam-screen";

type TeacherAIExamPageSearchParams = {
  classId?: string | string[] | undefined;
  scope?: string | string[] | undefined;
};

function getFirstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TeacherAIExamPage({
  searchParams,
}: {
  searchParams: Promise<TeacherAIExamPageSearchParams>;
}) {
  const params = await searchParams;
  const scope = getFirstSearchValue(params.scope);
  const classId = getFirstSearchValue(params.classId);
  const initialScope = scope === "class" && classId ? "class" : "system";

  return (
    <TeacherAIExamScreen
      initialScope={initialScope}
      classId={classId ?? null}
    />
  );
}
