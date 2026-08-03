"use client";

import type { ComponentType } from "react";
import { CalendarDays, Eye, FileText, HardDrive, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function DocumentCard({ document, onView, className }: DocumentCardProps) {
  return (
    <article className={cn("flex h-full flex-col rounded-[8px] border border-[#DDE2EB] bg-white p-4 transition-colors hover:border-[#BFC8D8]", className)}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#EEF2FF] text-[#4F62F2]">
          <FileText className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-[6px] bg-[#EEF2FF] px-2 py-1 text-[10px] font-semibold text-[#4F62F2]">{formatDocumentTypeLabel(document)}</span>
            {document.classroomName ? <span className="rounded-[6px] bg-[#F1F5F9] px-2 py-1 text-[10px] font-semibold text-[#526079]">{document.classroomName}</span> : null}
          </div>
          <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-[#1E293B]">{document.title}</h3>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-[#64748B]">
        {document.description || "Tài liệu này chưa có phần mô tả."}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Meta icon={CalendarDays} value={formatDocumentDateTime(document.createdAt)} />
        <Meta icon={HardDrive} value={formatFileSize(document.fileSize)} />
        {document.uploadedByName ? <Meta icon={UserRound} value={document.uploadedByName} className="col-span-2" /> : null}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#E9EDF3] pt-3">
        <Button type="button" variant="outline" className="h-9 rounded-[6px] text-xs" onClick={() => onView(document)}>
          <Eye className="size-4" />Xem
        </Button>
        <DocumentDownloadButton document={document} variant="default" label="Tải xuống" className="h-9 rounded-[6px] text-xs" />
      </div>
    </article>
  );
}

function Meta({ icon: Icon, value, className }: { icon: ComponentType<{ className?: string }>; value: string; className?: string }) {
  return <div className={cn("flex min-w-0 items-center gap-1.5 rounded-[6px] bg-[#F7F8FB] px-2.5 py-2 text-[10.5px] text-[#526079]", className)}><Icon className="size-3.5 shrink-0 text-[#7C879B]" /><span className="truncate">{value}</span></div>;
}
