import type { TeacherExamPublishSchema } from "@/lib/api/types";
import type { TeacherExam } from "@/types/exam";
import type { Exam } from "@/types/exam.types";

function isSameExamId(left: number | string, right: number | string): boolean {
  return String(left) === String(right);
}

function getPublishedTag(isPublished: boolean): string {
  return isPublished ? "published" : "draft";
}

export function mergeTeacherExamPublishUpdate(
  exam: TeacherExam,
  update: TeacherExamPublishSchema,
): TeacherExam {
  if (!isSameExamId(exam.id, update.id)) {
    return exam;
  }

  return {
    ...exam,
    title: update.title,
    description: update.description,
    image_url: update.image_url,
    scope: update.scope,
    classroom_id: update.classroom_id,
    classroom_name: update.classroom_name,
    duration_minutes: update.duration_minutes,
    total_points: update.total_points,
    question_count: update.question_count,
    attempt_count: update.attempt_count,
    is_published: update.is_published,
    is_active: update.is_active,
    created_at: update.created_at ?? exam.created_at,
    updated_at: update.updated_at ?? exam.updated_at,
  };
}

export function mergeClassExamPublishUpdate(
  exam: Exam,
  update: TeacherExamPublishSchema,
): Exam {
  if (!isSameExamId(exam.id, update.id)) {
    return exam;
  }

  const nextPublishedTag = getPublishedTag(update.is_published);
  const tagsWithoutPublishState = exam.tags.filter(
    (tag) => tag !== "published" && tag !== "draft",
  );

  return {
    ...exam,
    title: update.title,
    description: update.description,
    duration: update.duration_minutes,
    questionCount: update.question_count,
    attemptCount: update.attempt_count,
    status: update.is_published ? "published" : "draft",
    updatedAt: update.updated_at ?? exam.updatedAt,
    thumbnailUrl: update.image_url ?? undefined,
    tags: [...tagsWithoutPublishState, nextPublishedTag],
    classIds:
      update.classroom_id !== null ? [String(update.classroom_id)] : [],
    classroomName: update.classroom_name,
    totalPoints: update.total_points,
    scope: update.scope,
    isPublished: update.is_published,
    isActive: update.is_active,
  };
}
