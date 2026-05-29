import { client } from "@/lib/api/client";
import type { TeacherExamImageUploadResponse } from "@/lib/api/types";

export async function uploadExamImage(
  file: File,
): Promise<TeacherExamImageUploadResponse> {
  const formData = new FormData();

  formData.append("image", file);

  const response = await client.post<TeacherExamImageUploadResponse>(
    "/teacher/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}
