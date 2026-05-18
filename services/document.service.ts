import { api as teacherApi } from "@/lib/api/endpoints/teacher";
import type { TeacherCreateDocumentRequest } from "@/lib/api/types";

function normalizeTeacherDocumentPayload(
  data: TeacherCreateDocumentRequest,
): TeacherCreateDocumentRequest {
  return {
    ...data,
    title: data.title.trim(),
    summary: data.summary.trim(),
    content: data.content.trim(),
  };
}

export async function createTeacherDocument(
  data: TeacherCreateDocumentRequest,
): Promise<string> {
  const payload = normalizeTeacherDocumentPayload(data);
  const response = await teacherApi.teacher.documents.create(payload);

  return response.data.message || "Tải lên tài liệu thành công";
}
