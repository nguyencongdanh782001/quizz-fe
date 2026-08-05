import { BookOpenText, CalendarDays, LibraryBig } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDocumentPublishStatusLabel } from "@/lib/teacher-document-filters";
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
    <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((document) => (
        <article
          key={document.id}
          className="flex h-full min-w-0 flex-col rounded-[8px] border border-white/70 bg-white/82 p-4 shadow-[0_1px_3px_rgba(30,41,59,0.05)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <Badge variant={getPublishedBadgeVariant(document.isPublished)}>
              {getDocumentPublishStatusLabel(document.isPublished)}
            </Badge>

            <DocumentContextMenu
              document={document}
              isDeleting={deletingDocumentId === document.id}
              onDeleteRequest={onDeleteRequest}
            />
          </div>

          <h2 className="mt-4 line-clamp-2 font-display text-lg font-semibold leading-6 text-on-surface">
            {document.title}
          </h2>

          {document.description ? (
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
              {document.description}
            </p>
          ) : (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Chưa có mô tả tài liệu.
            </p>
          )}

          <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
            <div className="flex min-w-0 items-center gap-2 rounded-[6px] bg-surface-container-low px-3 py-2.5">
              <CalendarDays className="size-4 shrink-0 text-primary" />

              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  Ngày tạo
                </p>

                <p className="mt-1 truncate text-xs text-on-surface">
                  {formatDocumentDate(document.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2 rounded-[6px] bg-surface-container-low px-3 py-2.5">
              <BookOpenText className="size-4 shrink-0 text-primary" />

              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  Phạm vi hiển thị
                </p>

                <p className="mt-1 truncate text-xs text-on-surface">
                  {document.scope === "classroom"
                    ? document.classroomName || "Tài liệu lớp học"
                    : "Tài liệu lớp học"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-start gap-2 border-t border-outline/10 pt-4 text-[11px] leading-5 text-muted-foreground">
            <LibraryBig className="mt-0.5 size-3.5 shrink-0" />

            <span className="line-clamp-2">
              Tìm kiếm áp dụng theo tiêu đề và mô tả tài liệu.
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
