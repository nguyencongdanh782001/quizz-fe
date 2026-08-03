import { BookOpenText, CalendarDays, LibraryBig } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDocumentPublishStatusLabel, getDocumentScopeLabel } from "@/lib/teacher-document-filters";
import type { Document } from "@/types/document.types";
import { DocumentContextMenu } from "./document-context-menu";

function formatDocumentDate(value: string): string {
  if (!value) {
    return "Chưa có ngày tạo";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Chưa có ngày tạo";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function getPublishedBadgeVariant(isPublished: boolean | undefined) {
  return isPublished ? "success" : "warning";
}

export function TeacherDocumentList({
  deletingDocumentId,
  documents,
  onDeleteRequest,
}: {
  deletingDocumentId: string | null;
  documents: Document[];
  onDeleteRequest: (document: Document) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {documents.map((document) => (
        <article
          key={document.id}
          className="rounded-[8px] border border-white/70 bg-white/82 p-5 shadow-[0_1px_3px_rgba(30,41,59,0.05)] backdrop-blur-xl transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge variant="info">{getDocumentScopeLabel(document.scope)}</Badge>
              <Badge variant={getPublishedBadgeVariant(document.isPublished)}>
                {getDocumentPublishStatusLabel(document.isPublished)}
              </Badge>
              {document.classroomName ? (
                <Badge variant="outline">{document.classroomName}</Badge>
              ) : null}
            </div>

            <DocumentContextMenu
              document={document}
              isDeleting={deletingDocumentId === document.id}
              onDeleteRequest={onDeleteRequest}
            />
          </div>

          <h2 className="mt-4 font-display text-xl font-semibold text-on-surface">
            {document.title}
          </h2>

          <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
            {document.description}
          </p>

          <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-[6px] bg-surface-container-low px-3 py-2.5">
              <CalendarDays className="size-4 text-primary" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Ngày tạo
                </p>
                <p className="mt-1 text-on-surface">
                  {formatDocumentDate(document.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-[6px] bg-surface-container-low px-3 py-2.5">
              <BookOpenText className="size-4 text-primary" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Phạm vi hiển thị
                </p>
                <p className="mt-1 text-on-surface">
                  {document.scope === "classroom"
                    ? document.classroomName || "Lớp học"
                    : "Tài liệu hệ thống"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <LibraryBig className="size-4" />
            <span>Tìm kiếm áp dụng theo tiêu đề và mô tả tài liệu.</span>
          </div>
        </article>
      ))}
    </div>
  );
}
