"use client";

import type { ComponentType } from "react";
import {
  BookOpenText,
  CalendarDays,
  FileText,
  LibraryBig,
  MessageSquareText,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { cn } from "@/lib/utils";
import type { Document } from "@/types/document.types";
import {
  formatDocumentDateTime,
  formatDocumentTypeLabel,
  formatFileSize,
} from "@/lib/student-system-documents";
import { DocumentDownloadButton } from "./document-download-button";

interface DocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  className?: string;
}

export function DocumentCard({
  document,
  onView,
  className,
}: DocumentCardProps) {
  return (
    <SurfacePanel
      as="article"
      className={cn(
        "group flex h-full flex-col gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_-40px_rgba(15,23,42,0.28)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info" className="rounded-full px-3 py-1">
              {formatDocumentTypeLabel(document)}
            </Badge>
            {document.classroomName ? (
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {document.classroomName}
              </Badge>
            ) : null}
          </div>

          <h3 className="line-clamp-2 font-display text-xl font-semibold leading-tight text-on-surface">
            {document.title}
          </h3>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileText className="size-5" />
        </div>
      </div>

      <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
        {document.description || "Tài liệu này chưa có phần mô tả."}
      </p>

      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <MetaPill icon={MessageSquareText} label="Tên file" value={document.fileName || "Chưa có"} />
        <MetaPill icon={LibraryBig} label="Loại file" value={formatDocumentTypeLabel(document)} />
        <MetaPill icon={CalendarDays} label="Ngày đăng" value={formatDocumentDateTime(document.createdAt)} />
        <MetaPill icon={BookOpenText} label="Dung lượng" value={formatFileSize(document.fileSize)} />
      </div>

      {document.uploadedByName ? (
        <div className="rounded-[1.1rem] bg-white/72 px-4 py-3 text-sm text-muted-foreground">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Được đăng bởi
          </p>
          <p className="mt-1 font-medium text-on-surface">{document.uploadedByName}</p>
        </div>
      ) : null}

      <div className="mt-auto grid gap-3 pt-1 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => onView(document)}
        >
          <Eye className="size-4" />
          Xem tài liệu
        </Button>
        <DocumentDownloadButton
          document={document}
          variant="default"
          label="Tải xuống"
          className="h-11 rounded-xl"
        />
      </div>
    </SurfacePanel>
  );
}

function MetaPill({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-[1rem] bg-surface-container-lowest px-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 line-clamp-1 text-sm text-on-surface">{value}</p>
      </div>
    </div>
  );
}
