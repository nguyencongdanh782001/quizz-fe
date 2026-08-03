"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowDownToLine,
  BookOpenText,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchDocumentText,
  formatDocumentDateTime,
  formatDocumentTypeLabel,
  formatFileSize,
  getDocumentPreviewKind,
  resolveDocumentAssetUrl,
} from "@/lib/student-system-documents";
import type { Document } from "@/types/document.types";
import { cn } from "@/lib/utils";
import { DocumentDownloadButton } from "./document-download-button";

interface DocumentViewerProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

interface DocumentPreviewContentProps {
  document: Document;
  textContent: string;
  isLoadingText: boolean;
  textError: string | null;
}

interface PreviewState {
  textContent: string;
  isLoadingText: boolean;
  textError: string | null;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Không thể tải nội dung tài liệu.";
}

export function useDocumentPreview(
  document: Document | null,
  enabled: boolean,
) {
  const [state, setState] = useState<PreviewState>({
    textContent: "",
    isLoadingText: false,
    textError: null,
  });

  const previewKind = useMemo(
    () => (document ? getDocumentPreviewKind(document) : "other"),
    [document],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadTextPreview() {
      if (!document || !enabled || previewKind !== "text") {
        setState({
          textContent: "",
          isLoadingText: false,
          textError: null,
        });
        return;
      }

      if (document.content?.trim()) {
        setState({
          textContent: document.content,
          isLoadingText: false,
          textError: null,
        });
        return;
      }

      setState((current) => ({
        ...current,
        isLoadingText: true,
        textError: null,
      }));

      try {
        const text = await fetchDocumentText(document);

        if (!isMounted) {
          return;
        }

        setState({
          textContent: text,
          isLoadingText: false,
          textError: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          textContent: "",
          isLoadingText: false,
          textError: getErrorMessage(error),
        });
      }
    }

    void loadTextPreview();

    return () => {
      isMounted = false;
    };
  }, [document, enabled, previewKind]);

  return state;
}

function PreviewFrameSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-88 w-full rounded-[1.4rem]" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-20 rounded-[1.2rem]" />
        <Skeleton className="h-20 rounded-[1.2rem]" />
      </div>
    </div>
  );
}

export function DocumentPreviewContent({
  document,
  textContent,
  isLoadingText,
  textError,
}: DocumentPreviewContentProps) {
  const previewKind = getDocumentPreviewKind(document);
  const assetUrl = resolveDocumentAssetUrl(document.fileUrl);

  if (isLoadingText) {
    return <PreviewFrameSkeleton />;
  }

  if (previewKind === "pdf") {
    return assetUrl ? (
      <div className="overflow-hidden rounded-[0.5rem] border border-outline/10 bg-surface-container-lowest">
        <iframe
          src={assetUrl}
          title={document.title}
          className="h-[min(65vh,54rem)] w-full bg-white"
        />
      </div>
    ) : (
      <PreviewUnavailable document={document} />
    );
  }

  if (previewKind === "image") {
    return assetUrl ? (
      <div className="overflow-hidden rounded-[1.4rem] border border-outline/10 bg-surface-container-lowest p-3">
        <Image
          src={assetUrl}
          alt={document.title}
          width={1600}
          height={1200}
          unoptimized
          className="h-auto max-h-[70vh] w-full rounded-[1.1rem] object-contain"
        />
      </div>
    ) : (
      <PreviewUnavailable document={document} />
    );
  }

  if (previewKind === "text") {
    if (textError) {
      return (
        <PreviewError
          document={document}
          title="Không thể tải nội dung văn bản"
          description={textError}
        />
      );
    }

    return (
      <div className="overflow-hidden rounded-[1.4rem] border border-outline/10 bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-outline/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
            <FileText className="size-4 text-primary" />
            Nội dung văn bản
          </div>
          <Badge variant="outline">Xem nhanh</Badge>
        </div>
        <pre className="max-h-[min(68vh,46rem)] overflow-auto whitespace-pre-wrap px-4 py-4 text-sm leading-7 text-on-surface">
          {textContent ||
            document.content ||
            "Tài liệu này hiện chưa có nội dung hiển thị."}
        </pre>
      </div>
    );
  }

  return <PreviewUnavailable document={document} />;
}

function PreviewUnavailable({ document }: { document: Document }) {
  return (
    <div className="grid gap-4 rounded-[1.4rem] border border-dashed border-outline/15 bg-surface-container-lowest p-6 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-center">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
          <AlertTriangle className="size-4 text-amber-600" />
          Xem trước chưa được hỗ trợ
        </div>
        <p className="text-sm leading-7 text-muted-foreground">
          Tệp này không thể hiển thị trực tiếp trong trình xem. Bạn vẫn có thể
          mở thông tin chi tiết hoặc tải tệp xuống để xem bằng ứng dụng phù hợp.
        </p>
      </div>
      <div className="rounded-[1.2rem] bg-white/70 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-on-surface">
          {document.fileName || document.title}
        </p>
        <p className="mt-1">{formatDocumentTypeLabel(document)}</p>
        <p className="mt-1">{formatFileSize(document.fileSize)}</p>
      </div>
    </div>
  );
}

function PreviewError({
  document,
  title,
  description,
}: {
  document: Document;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-red-200/70 bg-red-50/85 p-6 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" />
        <div className="space-y-2">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm leading-7">{description}</p>
          <p className="text-sm leading-7 opacity-80">
            {document.fileName || document.title}
          </p>
        </div>
      </div>
    </div>
  );
}

function DocumentDetailsSidebar({ document }: { document: Document }) {
  const previewKind = getDocumentPreviewKind(document);

  return (
    <aside className="space-y-4 rounded-[1.4rem] border border-outline/10 bg-surface-container-lowest p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Thông tin tài liệu
          </p>
          <h3 className="mt-2 line-clamp-2 font-display text-xl font-semibold text-on-surface">
            {document.title}
          </h3>
        </div>
        <Badge variant="info">{formatDocumentTypeLabel(document)}</Badge>
      </div>

      <div className="grid gap-3 text-sm text-muted-foreground">
        <MetaRow
          icon={FileText}
          label="Tên file"
          value={document.fileName || "Chưa có"}
        />
        <MetaRow
          icon={CalendarDays}
          label="Ngày đăng"
          value={formatDocumentDateTime(document.createdAt)}
        />
        <MetaRow
          icon={BookOpenText}
          label="Lớp học"
          value={document.classroomName || "Tài liệu hệ thống"}
        />
        <MetaRow
          icon={ImageIcon}
          label="Xem trước"
          value={
            previewKind === "other"
              ? "Không hỗ trợ"
              : previewKind === "text"
                ? "Văn bản"
                : previewKind === "image"
                  ? "Hình ảnh"
                  : "PDF"
          }
        />
        <MetaRow
          icon={ArrowDownToLine}
          label="Dung lượng"
          value={formatFileSize(document.fileSize)}
        />
      </div>

      {document.description ? (
        <div className="rounded-[1.2rem] bg-white/76 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Mô tả
          </p>
          <p className="mt-2 text-sm leading-7 text-on-surface">
            {document.description}
          </p>
        </div>
      ) : null}

      <div className="rounded-[1.2rem] bg-primary/6 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-on-surface">Người đăng</p>
        <p className="mt-1">{document.uploadedByName || "Chưa rõ"}</p>
      </div>
    </aside>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[1.1rem] bg-white/72 p-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 wrap-break-word text-sm text-on-surface">{value}</p>
      </div>
    </div>
  );
}

export function DocumentViewer({
  document,
  open,
  onOpenChange,
  className,
}: DocumentViewerProps) {
  const { textContent, isLoadingText, textError } = useDocumentPreview(
    document,
    open,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "h-dvh w-screen max-h-none rounded-none border-0 bg-surface/96 p-0 sm:h-[min(100dvh-1.5rem,52rem)] sm:w-[min(100vw-1.5rem,82rem)] sm:rounded-[32px] sm:border sm:border-outline/10",
          className,
        )}
        showCloseButton={false}
      >
        <div className=" flex h-full flex-col overflow-hidden">
          <div className="rounded-[1.4rem] flex items-center justify-between gap-3 border-b border-outline/10 bg-surface-container-lowest/90 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <DialogTitle className="line-clamp-1 text-lg sm:text-xl">
                {document.title}
              </DialogTitle>
              <DialogDescription className="mt-1 line-clamp-1">
                {document.fileName || formatDocumentTypeLabel(document)}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="hidden sm:inline-flex"
              >
                <X className="size-4" />
                Đóng
              </Button>
              <DocumentDownloadButton
                document={document}
                label="Tải xuống"
                variant="default"
                size="sm"
              />
            </div>
          </div>

          <div className="grid flex-1 gap-4 overflow-hidden p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-h-0 overflow-auto">
              <DocumentPreviewContent
                document={document}
                textContent={textContent}
                isLoadingText={isLoadingText}
                textError={textError}
              />
            </div>

            <div className="min-h-0 overflow-auto">
              <DocumentDetailsSidebar document={document} />
            </div>
          </div>

          <DialogFooter className="border-t border-outline/10 bg-surface-container-lowest/90 px-4 py-4 sm:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
              Đóng
            </Button>
            <DocumentDownloadButton
              document={document}
              label="Tải xuống"
              variant="default"
            />
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
