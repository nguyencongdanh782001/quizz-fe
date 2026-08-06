import { api as studentApi } from "@/lib/api/endpoints/student";
import { getToken } from "@/lib/api/token-client";
import type { StudentSystemDocumentSchema } from "@/lib/api/types";
import type { Document, DocumentType } from "@/types/document.types";

export type StudentDocumentSortOption =
  | "recent"
  | "oldest"
  | "title-asc"
  | "title-desc";

interface StudentDocumentFetchOptions {
  throwOnError?: boolean;
}

const TEXT_FILE_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "json",
  "xml",
  "html",
  "htm",
  "csv",
  "log",
]);

function inferGrade(classroomName: string | null): number {
  if (!classroomName) {
    return 0;
  }

  const match = classroomName.match(/(?:lop|lớp)\s*(\d{1,2})|(\d{1,2})/i);
  const grade = Number(match?.[1] ?? match?.[2]);

  if (Number.isNaN(grade) || grade < 1 || grade > 12) {
    return 0;
  }

  return grade;
}

function getFileNameFromUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url, "http://localhost");
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.at(-1) ?? null;
  } catch {
    const segments = url.split("/").filter(Boolean);
    return segments.at(-1) ?? null;
  }
}

function getDocumentFileName(item: StudentSystemDocumentSchema): string {
  return (
    item.file_name?.trim() || getFileNameFromUrl(item.file_url) || item.title
  );
}

function getExtension(value: string): string {
  const clean = value.split("?")[0].split("#")[0];
  const dotIndex = clean.lastIndexOf(".");

  if (dotIndex < 0) {
    return "";
  }

  return clean.slice(dotIndex + 1).toLowerCase();
}

function detectDocumentType(item: StudentSystemDocumentSchema): DocumentType {
  const contentType = item.file_content_type?.toLowerCase() ?? "";
  const fileName = getDocumentFileName(item).toLowerCase();
  const extension = getExtension(fileName);

  if (contentType.includes("pdf") || extension === "pdf") {
    return "pdf";
  }

  if (contentType.startsWith("image/")) {
    return "image";
  }

  if (contentType.startsWith("text/") || TEXT_FILE_EXTENSIONS.has(extension)) {
    return "text";
  }

  if (
    contentType.includes("word") ||
    ["doc", "docx", "rtf", "odt"].includes(extension)
  ) {
    return "doc";
  }

  if (
    contentType.includes("video") ||
    ["mp4", "webm", "mov", "m4v"].includes(extension)
  ) {
    return "video";
  }

  if (
    contentType.includes("link") ||
    ["url", "webloc", "lnk"].includes(extension)
  ) {
    return "link";
  }

  return "doc";
}

function getTimestamp(value?: string | null): number {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

function getDocumentRequestHeaders(): HeadersInit {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

/**
 * Chỉ gửi cookie và Authorization tới frontend hiện tại hoặc API backend.
 *
 * Không gửi credentials tới Cloudinary/CDN bên ngoài vì response dùng
 * Access-Control-Allow-Origin: *; fetch với credentials="include" sẽ bị
 * trình duyệt chặn bởi CORS dù URL mở trực tiếp vẫn trả 200.
 */
function shouldAuthenticateAssetRequest(url: string): boolean {
  try {
    const fallbackOrigin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost";

    const assetOrigin = new URL(url, fallbackOrigin).origin;
    const allowedOrigins = new Set<string>();

    if (typeof window !== "undefined") {
      allowedOrigins.add(window.location.origin);
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (apiBaseUrl) {
      allowedOrigins.add(new URL(apiBaseUrl, fallbackOrigin).origin);
    }

    return allowedOrigins.has(assetOrigin);
  } catch {
    return false;
  }
}

function getDocumentAssetRequestInit(url: string): RequestInit {
  const shouldAuthenticate = shouldAuthenticateAssetRequest(url);

  return {
    credentials: shouldAuthenticate ? "include" : "omit",
    headers: shouldAuthenticate ? getDocumentRequestHeaders() : undefined,
  };
}

export function resolveDocumentAssetUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost");

    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

function formatPublisher(scope: Document["scope"]): string {
  if (scope === "classroom") {
    return "Giáo viên";
  }

  return "Hệ thống";
}

function mapStudentDocument(
  item: StudentSystemDocumentSchema,
  fallbackClassId?: string | number | null,
): Document {
  const documentId = String(item.id);
  const classroomId =
    item.classroom_id != null
      ? String(item.classroom_id)
      : fallbackClassId != null
        ? String(fallbackClassId)
        : null;
  const normalizedScope = item.scope?.trim().toLowerCase();
  const scope: NonNullable<Document["scope"]> =
    normalizedScope === "class" ||
    normalizedScope === "classroom" ||
    classroomId
      ? "classroom"
      : "system";
  const fileName = getDocumentFileName(item);
  const fileType = detectDocumentType(item);
  const url =
    scope === "classroom" && classroomId
      ? `/student/materials/${documentId}?classId=${encodeURIComponent(classroomId)}`
      : `/student/materials/${documentId}`;

  return {
    id: documentId,
    title: item.title,
    description: item.summary,
    type: fileType,
    url,
    fileName,
    fileUrl: item.file_url ?? null,
    fileContentType: item.file_content_type ?? null,
    subject:
      item.classroom_name ??
      (scope === "classroom" ? "Tài liệu lớp học" : "Tài liệu hệ thống"),
    grade: inferGrade(item.classroom_name),
    uploadedBy: scope,
    uploadedByName: formatPublisher(scope),
    createdAt: item.created_at,
    fileSize: item.file_size_bytes ?? undefined,
    downloadCount: 0,
    tags: [scope],
    content: item.content,
    scope,
    classroomId,
    classroomName: item.classroom_name,
    actionLabel: "Xem tài liệu",
  };
}

export function formatDocumentDate(value: string): string {
  const timestamp = getTimestamp(value);

  if (!timestamp) {
    return "Chưa có ngày";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function formatDocumentDateTime(value: string): string {
  const timestamp = getTimestamp(value);

  if (!timestamp) {
    return "Chưa có ngày";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) {
    return "Chưa rõ dung lượng";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatDocumentTypeLabel(document: Document): string {
  switch (document.type) {
    case "pdf":
      return "PDF";
    case "image":
      return "Hình ảnh";
    case "video":
      return "Video";
    case "link":
      return "Liên kết";
    case "text":
      return "Văn bản";
    default:
      return "Tệp";
  }
}

export function getDocumentPreviewKind(
  document: Document,
): "pdf" | "image" | "text" | "other" {
  if (document.type === "pdf") {
    return "pdf";
  }

  if (document.type === "image") {
    return "image";
  }

  if (document.type === "text") {
    return "text";
  }

  return "other";
}

export async function fetchDocumentText(document: Document): Promise<string> {
  if (document.content?.trim()) {
    return document.content;
  }

  const assetUrl = resolveDocumentAssetUrl(document.fileUrl);

  if (!assetUrl) {
    return "";
  }

  const response = await fetch(assetUrl, getDocumentAssetRequestInit(assetUrl));

  if (!response.ok) {
    throw new Error("Không thể tải nội dung tài liệu.");
  }

  return response.text();
}

function sanitizeDownloadFileName(value: string): string {
  let decodedValue = value;

  try {
    decodedValue = decodeURIComponent(value);
  } catch {
    // Giữ nguyên tên nếu chuỗi không phải URI hợp lệ.
  }

  return (
    decodedValue
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "-")
      .replace(/\s+/g, " ")
      .replace(/[. ]+$/g, "") || "tai-lieu"
  );
}

function getExtensionFromContentType(contentType: string): string {
  const normalizedType = contentType.split(";")[0].trim().toLowerCase();

  const extensionByContentType: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "text/plain": "txt",
    "text/csv": "csv",
  };

  return extensionByContentType[normalizedType] ?? "";
}

function getDownloadFileName(
  document: Document,
  assetUrl: string | null,
  blob: Blob,
): string {
  const sourceName =
    document.fileName?.trim() ||
    document.title.trim() ||
    getFileNameFromUrl(assetUrl) ||
    "tai-lieu";

  const safeName = sanitizeDownloadFileName(sourceName);

  if (getExtension(safeName)) {
    return safeName;
  }

  const extensionFromUrl = assetUrl
    ? getExtension(getFileNameFromUrl(assetUrl) ?? "")
    : "";
  const extension =
    extensionFromUrl ||
    getExtensionFromContentType(blob.type) ||
    getExtension(document.fileContentType ?? "");

  return extension ? `${safeName}.${extension}` : safeName;
}

export async function downloadStudentDocument(
  document: Document,
): Promise<void> {
  const assetUrl = resolveDocumentAssetUrl(document.fileUrl);

  if (!assetUrl && !document.content?.trim()) {
    throw new Error("Tài liệu này chưa có nguồn tải xuống.");
  }

  if (!assetUrl) {
    const blob = new Blob([document.content ?? document.description ?? ""], {
      type: document.fileContentType || "text/plain;charset=utf-8",
    });

    triggerBrowserDownload(blob, getDownloadFileName(document, null, blob));
    return;
  }

  let response: Response;

  try {
    response = await fetch(assetUrl, getDocumentAssetRequestInit(assetUrl));
  } catch (error) {
    console.error("Failed to fetch document asset", {
      assetUrl,
      error,
    });

    throw new Error(
      "Không thể kết nối tới nơi lưu trữ tài liệu. Vui lòng thử lại.",
    );
  }

  if (!response.ok) {
    throw new Error(`Không thể tải tài liệu (mã lỗi ${response.status}).`);
  }

  const blob = await response.blob();

  if (blob.size === 0) {
    throw new Error("Tệp tải xuống không có dữ liệu.");
  }

  triggerBrowserDownload(blob, getDownloadFileName(document, assetUrl, blob));
}

function triggerBrowserDownload(blob: Blob, fileName: string): void {
  if (typeof window === "undefined") {
    throw new Error("Chức năng tải xuống chỉ khả dụng trên trình duyệt.");
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";

  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}

export function matchesStudentDocumentSearch(
  document: Document,
  search: string,
): boolean {
  const normalizedSearch = normalizeQuery(search);

  if (!normalizedSearch) {
    return true;
  }

  const haystack = [
    document.title,
    document.description,
    document.fileName ?? "",
    document.content ?? "",
    document.classroomName ?? "",
    document.uploadedByName ?? "",
    document.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedSearch);
}

export function sortStudentDocuments(
  documents: Document[],
  sortBy: StudentDocumentSortOption,
): Document[] {
  const items = [...documents];

  return items.sort((left, right) => {
    const leftTimestamp = getTimestamp(left.updatedAt ?? left.createdAt);
    const rightTimestamp = getTimestamp(right.updatedAt ?? right.createdAt);

    switch (sortBy) {
      case "oldest":
        return leftTimestamp - rightTimestamp;
      case "title-asc":
        return left.title.localeCompare(right.title, "vi");
      case "title-desc":
        return right.title.localeCompare(left.title, "vi");
      case "recent":
      default:
        return rightTimestamp - leftTimestamp;
    }
  });
}

export async function getStudentSystemDocuments(
  options: StudentDocumentFetchOptions = {},
): Promise<Document[]> {
  try {
    const response = await studentApi.student.system.documents();
    return (response.data.items ?? []).map(mapStudentDocument);
  } catch (error) {
    console.error("Failed to fetch student system documents", error);
    if (options.throwOnError) {
      throw error;
    }
    return [];
  }
}

export async function getStudentSystemDocument(
  documentId: string,
): Promise<Document | null> {
  const documents = await getStudentSystemDocuments();
  return documents.find((document) => document.id === documentId) ?? null;
}

export async function getStudentClassDocuments(
  classId: string,
  options: StudentDocumentFetchOptions = {},
): Promise<Document[]> {
  try {
    const response = await studentApi.student.classes.documents(classId);
    return (response.data.items ?? []).map((item) =>
      mapStudentDocument(item, classId),
    );
  } catch (error) {
    console.error(`Failed to fetch class documents for ${classId}`, error);
    if (options.throwOnError) {
      throw error;
    }
    return [];
  }
}

export async function getStudentClassDocument(
  classId: string,
  documentId: string,
): Promise<Document | null> {
  const documents = await getStudentClassDocuments(classId);
  return documents.find((document) => document.id === documentId) ?? null;
}
