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

function getSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Backend có thể trả scope là "class", trong khi frontend đang dùng
 * "classroom". Chuẩn hóa cả hai về "classroom" để không bị nhận nhầm
 * thành tài liệu hệ thống.
 */
function normalizeDocumentScope(
  value: string | null | undefined,
): TeacherDocumentFilterState["scope"] {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue === "system") {
    return "system";
  }

  if (normalizedValue === "class" || normalizedValue === "classroom") {
    return "classroom";
  }

  return "";
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
  const scope = normalizeDocumentScope(filters.scope);

  return {
    search: filters.search,
    scope,
    is_published: normalizePublishedValue(filters.is_published),
    classroom_id:
      scope === "classroom" ? normalizeClassroomId(filters.classroom_id) : "",
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
    scope: normalizeDocumentScope(scope),
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
      normalized.scope === "classroom" && classroomId ? classroomId : undefined,
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

  if (normalizedScope === "class" || normalizedScope === "classroom") {
    return "Giáo viên";
  }

  if (normalizedScope === "system") {
    return "Hệ thống";
  }

  // Không mặc định dữ liệu không xác định thành "Hệ thống".
  return "";
}

export function getDocumentPublishStatusLabel(
  isPublished: boolean | null | undefined,
): string {
  return isPublished ? "Đã xuất bản" : "Chưa xuất bản";
}
