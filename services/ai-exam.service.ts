import { client } from "@/lib/api/client";
import type {
  AIExamGenerationJobResponse,
  AIQuestionDraftResponse,
  GenerateExamRequest,
  GenerateMoreQuestionsRequest,
  SaveAIExamToQuizRequest,
  SaveAIExamToQuizResponse,
  UpdateAIQuestionDraftRequest,
} from "@/lib/api/types";

const AI_EXAM_REQUEST_TIMEOUT_MS = 120_000;

export async function generateAIExam(
  data: GenerateExamRequest,
): Promise<AIExamGenerationJobResponse> {
  const response = await client.post<AIExamGenerationJobResponse>(
    "/api/ai-exams/generate/",
    data,
    {
      timeout: AI_EXAM_REQUEST_TIMEOUT_MS,
    },
  );

  return response.data;
}

export async function getAIExamJob(
  jobId: number | string,
): Promise<AIExamGenerationJobResponse> {
  const response = await client.get<AIExamGenerationJobResponse>(
    `/api/ai-exams/jobs/${jobId}/`,
  );

  return response.data;
}

export async function generateMoreAIQuestions(
  jobId: number | string,
  data: GenerateMoreQuestionsRequest,
): Promise<AIExamGenerationJobResponse> {
  const response = await client.post<AIExamGenerationJobResponse>(
    `/api/ai-exams/jobs/${jobId}/generate-more/`,
    data,
    {
      timeout: AI_EXAM_REQUEST_TIMEOUT_MS,
    },
  );

  return response.data;
}

export async function updateAIQuestionDraft(
  draftId: number | string,
  data: UpdateAIQuestionDraftRequest,
): Promise<AIQuestionDraftResponse> {
  const response = await client.patch<AIQuestionDraftResponse>(
    `/api/ai-exams/question-drafts/${draftId}/`,
    data,
  );

  return response.data;
}

export async function saveAIExamToQuiz(
  jobId: number | string,
  data: SaveAIExamToQuizRequest,
): Promise<SaveAIExamToQuizResponse> {
  const response = await client.post<SaveAIExamToQuizResponse>(
    `/api/ai-exams/jobs/${jobId}/save-to-quiz/`,
    data,
  );

  return response.data;
}
