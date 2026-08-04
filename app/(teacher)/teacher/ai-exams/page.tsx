import { TeacherAIExamScreen } from "@/components/features/teacher-ai-exam/teacher-ai-exam-screen";
import type { AIExamScope } from "@/components/features/teacher-ai-exam/types";

type TeacherAIExamPageSearchParams = Promise<{
  classId?: string | string[];
  jobId?: string | string[];
  scope?: string | string[];
}>;

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TeacherAIExamPage({
  searchParams,
}: {
  searchParams: TeacherAIExamPageSearchParams;
}) {
  const params = await searchParams;
  const classId = getSingleValue(params.classId) ?? null;
  const jobIdParam = getSingleValue(params.jobId);
  const parsedJobId = Number(jobIdParam);
  const initialJobId =
    Number.isInteger(parsedJobId) && parsedJobId > 0 ? parsedJobId : null;
  const scopeParam = getSingleValue(params.scope);
  const initialScope: AIExamScope =
    scopeParam === "class" && classId ? "class" : "system";

  return (
    <TeacherAIExamScreen
      initialScope={initialScope}
      initialJobId={initialJobId}
      classId={classId}
    />
  );
}
