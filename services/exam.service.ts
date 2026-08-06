import { client } from "@/lib/api/client";
import { APP_MESSAGES } from "@/lib/app-messages";
import type {
  MessageResponse,
  TeacherCreateExamRequest,
  TeacherCreateSystemExamResponse,
  TeacherUpdateSystemExamResponse,
  TeacherUpdateExamRequest,
  TeacherPublishExamResponse,
  TeacherPrivateExamResponse,
  TeacherSystemExamDetailResponse,
  TeacherSystemExamListResponse,
} from "@/lib/api/types";
import { mapTeacherExam } from "@/lib/teacher-exam-mapper";
import { pickDefaultExamImage } from "@/lib/exam-default-images";
import type {
  TeacherExam,
  TeacherExamListResult,
  TeacherExamQuery,
} from "@/types/exam";

function toApiParams(
  query: TeacherExamQuery,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};

  if (query.search?.trim()) {
    params.search = query.search.trim();
  }

  if (typeof query.is_published === "boolean") {
    params.is_published = query.is_published;
  }

  if (typeof query.is_active === "boolean") {
    params.is_active = query.is_active;
  }

  if (query.sort_by) {
    params.sort_by = query.sort_by;
  }

  if (query.sort_order) {
    params.sort_order = query.sort_order;
  }

  if (query.assignment_type) {
    params.assignment_type = query.assignment_type;
  }

  if (typeof query.limit === "number") {
    params.limit = query.limit;
  }

  if (typeof query.offset === "number") {
    params.offset = query.offset;
  }

  return params;
}

export async function getTeacherSystemExams(
  query: TeacherExamQuery = {},
): Promise<TeacherExamListResult> {
  const response = await client.get<TeacherSystemExamListResponse>(
    "/teacher/system/exams",
    {
      params: toApiParams(query),
    },
  );

  return {
    items: (response.data.items ?? []).map(mapTeacherExam),
  };
}

export async function getTeacherExploreExams(
  query: TeacherExamQuery = {},
): Promise<TeacherExamListResult> {
  const response = await client.get<TeacherSystemExamListResponse>(
    "/teacher/exams/explore",
    {
      params: toApiParams(query),
    },
  );

  return {
    items: (response.data.items ?? []).map(mapTeacherExam),
  };
}

export async function getTeacherSystemExamDetail(
  examId: number | string,
): Promise<TeacherExam> {
  const response = await client.get<TeacherSystemExamDetailResponse>(
    `/teacher/exams/${examId}`,
  );

  return mapTeacherExam(response.data);
}

export async function deleteTeacherSystemExam(
  examId: number | string,
): Promise<string> {
  await client.delete<MessageResponse>(`/teacher/exams/${examId}`);

  return APP_MESSAGES.DELETE_EXAM_SUCCESS;
}

export async function publishTeacherExam(
  examId: number | string,
): Promise<TeacherPublishExamResponse> {
  const response = await client.post<TeacherPublishExamResponse>(
    `/teacher/exams/${examId}/publish`,
  );

  return response.data;
}

export async function privateTeacherExam(
  examId: number | string,
): Promise<TeacherPrivateExamResponse> {
  const response = await client.post<TeacherPrivateExamResponse>(
    `/teacher/exams/${examId}/private`,
  );

  return response.data;
}

export async function updateTeacherSystemExamPublishState(
  examId: number | string,
  _isPublished: boolean,
): Promise<string> {
  void _isPublished;

  await publishTeacherExam(examId);

  return APP_MESSAGES.PUBLISH_EXAM_SUCCESS;
}

export async function createSystemExam(
  data: TeacherCreateExamRequest,
): Promise<{ message: string; exam: TeacherExam }> {
  const finalData: TeacherCreateExamRequest = {
    ...data,
    image_url: data.image_url?.trim() || pickDefaultExamImage(),
  };

  const response = await client.post<TeacherCreateSystemExamResponse>(
    "/teacher/system/exams",
    finalData,
  );

  return {
    message: APP_MESSAGES.CREATE_EXAM_SUCCESS,
    exam: mapTeacherExam(response.data.exam),
  };
}

export const createTeacherSystemExam = createSystemExam;

export async function updateSystemExam(
  examId: number | string,
  data: TeacherUpdateExamRequest,
): Promise<{ message: string; exam: TeacherExam }> {
  const response = await client.put<TeacherUpdateSystemExamResponse>(
    `/teacher/exams/${examId}`,
    data,
  );

  return {
    message: response.data.message || APP_MESSAGES.UPDATE_EXAM_SUCCESS,
    exam: mapTeacherExam(response.data.exam),
  };
}

export const updateTeacherExam = updateSystemExam;
