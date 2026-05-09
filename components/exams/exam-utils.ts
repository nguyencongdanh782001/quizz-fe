import type {
  TeacherExam,
  TeacherExamActiveFilter,
  TeacherExamFilterFormValues,
  TeacherExamPublishedFilter,
  TeacherExamQuestionType,
  TeacherExamSortKey,
} from "@/types/exam";

export const EXAMS_PAGE_SIZE = 9;

export const EXAM_PUBLISHED_OPTIONS: Array<{
  value: TeacherExamPublishedFilter;
  label: string;
}> = [
  { value: "all", label: "Tất cả xuất bản" },
  { value: "published", label: "Đã xuất bản" },
  { value: "unpublished", label: "Chưa xuất bản" },
];

export const EXAM_ACTIVE_OPTIONS: Array<{
  value: TeacherExamActiveFilter;
  label: string;
}> = [
  { value: "all", label: "Tất cả hoạt động" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Tạm ngưng" },
];

export const EXAM_SORT_OPTIONS: Array<{
  value: TeacherExamSortKey;
  label: string;
}> = [
  { value: "created_at", label: "Ngày tạo" },
  { value: "updated_at", label: "Ngày cập nhật" },
  { value: "attempt_count", label: "Số lượt làm" },
  { value: "question_count", label: "Số câu hỏi" },
];

export const DEFAULT_EXAM_FILTER_VALUES: TeacherExamFilterFormValues = {
  search: "",
  published: "all",
  active: "all",
  sort_by: "updated_at",
  sort_order: "desc",
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("vi-VN");

export function formatExamDateTime(value: string): string {
  if (!value) {
    return "Chưa có";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Chưa có";
  }

  return DATE_TIME_FORMATTER.format(parsed);
}

export function formatExamNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

export function getPublishedBadgeConfig(isPublished: boolean) {
  return isPublished
    ? {
        label: "Đã xuất bản",
        className:
          "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300",
      }
    : {
        label: "Chưa xuất bản",
        className:
          "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300",
      };
}

export function getActiveBadgeConfig(isActive: boolean) {
  return isActive
    ? {
        label: "Đang hoạt động",
        className:
          "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-300",
      }
    : {
        label: "Tạm ngưng",
        className:
          "border-slate-200/90 bg-slate-100 text-slate-700 dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-slate-300",
      };
}

export function getQuestionTypeLabel(
  examQuestionType: TeacherExamQuestionType,
): string {
  return examQuestionType === "text" ? "Tự luận" : "Một đáp án";
}

export function buildStudentExamLink(examId: number): string {
  if (typeof window === "undefined") {
    return `/student/exam/${examId}`;
  }

  return `${window.location.origin}/student/exam/${examId}`;
}

export function matchesClientFilters(
  exam: TeacherExam,
  filters: TeacherExamFilterFormValues,
  debouncedSearch: string,
): boolean {
  const keyword = debouncedSearch.trim().toLowerCase();

  if (keyword) {
    const searchTargets = [
      exam.title,
      exam.description,
      exam.classroom_name ?? "",
    ].map((value) => value.toLowerCase());

    if (!searchTargets.some((value) => value.includes(keyword))) {
      return false;
    }
  }

  if (filters.published === "published" && !exam.is_published) {
    return false;
  }

  if (filters.published === "unpublished" && exam.is_published) {
    return false;
  }

  if (filters.active === "active" && !exam.is_active) {
    return false;
  }

  if (filters.active === "inactive" && exam.is_active) {
    return false;
  }

  return true;
}

function getSortableValue(exam: TeacherExam, sortBy: TeacherExamSortKey): number {
  switch (sortBy) {
    case "attempt_count":
      return exam.attempt_count;
    case "question_count":
      return exam.question_count;
    case "created_at":
      return new Date(exam.created_at).getTime() || 0;
    case "updated_at":
      return new Date(exam.updated_at).getTime() || 0;
    default:
      return 0;
  }
}

export function sortExams(
  exams: TeacherExam[],
  sortBy: TeacherExamSortKey,
  sortOrder: TeacherExamFilterFormValues["sort_order"],
): TeacherExam[] {
  return [...exams].sort((left, right) => {
    const diff = getSortableValue(left, sortBy) - getSortableValue(right, sortBy);

    if (diff === 0) {
      return left.title.localeCompare(right.title, "vi");
    }

    return sortOrder === "asc" ? diff : diff * -1;
  });
}

export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}
