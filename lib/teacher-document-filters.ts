import type {
  DocumentScope,
  TeacherDocumentFilterState,
  TeacherDocumentQuery,
  TeacherDocumentSearchParamRecord,
} from "@/types/document.types";

export const ALL_DOCUMENT_SCOPES_VALUE = "__all_document_scopes__";
export const ALL_DOCUMENT_PUBLISH_STATES_VALUE =
  "__all_document_publish_states__";
export const ALL_DOCUMENT_CLASSROOMS_VALUE = "__all_document_classrooms__";

export const DEFAULT_TEACHER_DOCUMENT_FILTERS: TeacherDocumentFilterState = {
  search: "",
  scope: "",
  is_published: "",
  classroom_id: "",
};

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isDocumentScope(value: string | undefined): value is DocumentScope {
  return value === "system" || value === "classroom";
}

function normalizePublishedValue(
  value: string | undefined,
): TeacherDocumentFilterState["is_published"] {
  if (value === "true" || value === "false") {
    return value;
  }

  return "";
}

function normalizeClassroomId(value: string | undefined): string {
  if (!value) {
    return "";
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? String(parsed) : "";
}

export function normalizeTeacherDocumentFilters(
  filters: TeacherDocumentFilterState,
): TeacherDocumentFilterState {
  return {
    search: filters.search,
    scope: isDocumentScope(filters.scope) ? filters.scope : "",
    is_published: normalizePublishedValue(filters.is_published),
    classroom_id:
      filters.scope === "classroom"
        ? normalizeClassroomId(filters.classroom_id)
        : "",
  };
}

export function parseTeacherDocumentFilters(
  searchParams: TeacherDocumentSearchParamRecord,
): TeacherDocumentFilterState {
  const scope = getSingleValue(searchParams.scope);
  const isPublished = getSingleValue(searchParams.is_published);
  const classroomId = getSingleValue(searchParams.classroom_id);
  const search = getSingleValue(searchParams.search)?.trim() ?? "";

  return normalizeTeacherDocumentFilters({
    search,
    scope: isDocumentScope(scope) ? scope : "",
    is_published: normalizePublishedValue(isPublished),
    classroom_id: normalizeClassroomId(classroomId),
  });
}

export function toTeacherDocumentQuery(
  filters: TeacherDocumentFilterState,
): TeacherDocumentQuery {
  const normalized = normalizeTeacherDocumentFilters(filters);
  const search = normalized.search.trim();
  const classroomId = normalized.classroom_id
    ? Number(normalized.classroom_id)
    : undefined;

  return {
    search: search || undefined,
    scope: normalized.scope || undefined,
    is_published:
      normalized.is_published === ""
        ? undefined
        : normalized.is_published === "true",
    classroom_id:
      normalized.scope === "classroom" && classroomId
        ? classroomId
        : undefined,
  };
}

export function buildTeacherDocumentSearchParams(
  filters: TeacherDocumentFilterState,
): URLSearchParams {
  const query = toTeacherDocumentQuery(filters);
  const searchParams = new URLSearchParams();

  if (query.search) {
    searchParams.set("search", query.search);
  }

  if (query.scope) {
    searchParams.set("scope", query.scope);
  }

  if (typeof query.is_published === "boolean") {
    searchParams.set("is_published", String(query.is_published));
  }

  if (typeof query.classroom_id === "number") {
    searchParams.set("classroom_id", String(query.classroom_id));
  }

  return searchParams;
}

export function hasActiveTeacherDocumentFilters(
  filters: TeacherDocumentFilterState,
): boolean {
  return buildTeacherDocumentSearchParams(filters).toString().length > 0;
}

export function getDocumentScopeLabel(
  scope: DocumentScope | string | null | undefined,
): string {
  const normalizedScope = scope?.trim().toLowerCase();

  if (normalizedScope === "system") {
    return "Hệ thống";
  }

  if (normalizedScope === "classroom") {
    return "Giáo viên";
  }

  return scope?.trim() || "Hệ thống";
}

export function getDocumentPublishStatusLabel(
  isPublished: boolean | null | undefined,
): string {
  return isPublished ? "Đã xuất bản" : "Chưa xuất bản";
}
