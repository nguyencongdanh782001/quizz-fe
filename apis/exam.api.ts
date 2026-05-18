import { client } from "@/lib/api/client";
import type { MessageResponse } from "@/lib/api/types";

export type DeleteExamResponse = MessageResponse;

export async function deleteExam(examId: number): Promise<DeleteExamResponse> {
  const response = await client.delete<DeleteExamResponse>(
    `/teacher/exams/${examId}`,
  );

  return response.data;
}
