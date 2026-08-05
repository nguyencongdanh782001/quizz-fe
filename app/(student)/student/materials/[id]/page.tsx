"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpenText,
  Maximize2,
  FileText,
  Sparkles,
} from "lucide-react";
import { useBreadcrumbLabel } from "@/components/shared/breadcrumb-labels";
import { PageHero } from "@/components/shared/page-hero";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getStudentClassDocument,
  getStudentSystemDocument,
  formatDocumentDateTime,
  formatDocumentTypeLabel,
  formatFileSize,
} from "@/lib/student-system-documents";
import type { Document } from "@/types/document.types";
import {
  DocumentPreviewContent,
  DocumentViewer,
  useDocumentPreview,
} from "@/components/features/document/document-viewer";
import { DocumentDownloadButton } from "@/components/features/document/document-download-button";
import { DocumentToastProvider } from "@/components/features/document/document-toast";

export default function StudentMaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const documentBreadcrumbHref = `/student/materials/${id}`;
  const documentBreadcrumbLabel =
    document?.title?.trim() || (isLoadingDocument ? null : "Chi tiết tài liệu");

  useBreadcrumbLabel(documentBreadcrumbHref, documentBreadcrumbLabel);

  useEffect(() => {
    let isMounted = true;

    async function loadDocument() {
      try {
        const item = classId
          ? await getStudentClassDocument(classId, id)
          : await getStudentSystemDocument(id);

        if (!isMounted) {
          return;
        }

        setDocument(item);
      } finally {
        if (isMounted) {
          setIsLoadingDocument(false);
        }
      }
    }

    void loadDocument();

    return () => {
      isMounted = false;
    };
  }, [classId, id]);

  const previewState = useDocumentPreview(document, Boolean(document));

  if (isLoadingDocument) {
    return (
      <div className="space-y-6">
        <PageHero
          eyebrow="Tài liệu"
          title="Đang tải tài liệu..."
          description="Chỉ mất một chút thời gian để kéo thông tin và bản xem trước của học liệu."
          icon={Sparkles}
        />
        <SurfacePanel className="py-20 text-center text-muted-foreground">
          Đang tải tài liệu...
        </SurfacePanel>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="space-y-6">
        <Link
          href="/student/materials"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="size-4" />
          Quay lại thư viện tài liệu
        </Link>

        <SurfacePanel className="py-20 text-center text-muted-foreground">
          <p className="font-medium text-on-surface">Không tìm thấy tài liệu</p>
          <p className="mt-2 text-sm">
            Tài liệu này có thể đã được gỡ bỏ hoặc bạn không còn quyền truy cập.
          </p>
        </SurfacePanel>
      </div>
    );
  }

  return (
    <DocumentToastProvider>
      <div className="space-y-6">
        <Link
          href="/student/materials"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="size-4" />
          Quay lại thư viện tài liệu
        </Link>

        <PageHero
          eyebrow="Chi tiết tài liệu"
          title={document.title}
          description={
            document.description || "Tài liệu học tập dành cho học sinh."
          }
          icon={BookOpenText}
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setIsViewerOpen(true)}
              >
                <Maximize2 className="size-4" />
                Mở toàn màn hình
              </Button>
              <DocumentDownloadButton
                document={document}
                label="Tải xuống"
                size="lg"
              />
            </>
          }
          metrics={[
            {
              label: "Loại file",
              value: formatDocumentTypeLabel(document),
              description: "Định dạng tài liệu được hệ thống ghi nhận.",
              icon: BookOpenText,
              tone: "primary",
            },
            {
              label: "Dung lượng",
              value: formatFileSize(document.fileSize),
              description: "Dung lượng gốc của file tài liệu.",
              icon: FileText,
              tone: "secondary",
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <SurfacePanel className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Xem trước</Badge>
              {document.classroomName ? (
                <Badge variant="outline">{document.classroomName}</Badge>
              ) : null}
              <Badge variant="outline">
                {formatDocumentDateTime(document.createdAt)}
              </Badge>
            </div>

            <DocumentPreviewContent
              document={document}
              textContent={previewState.textContent}
              isLoadingText={previewState.isLoadingText}
              textError={previewState.textError}
            />
          </SurfacePanel>

          <SurfacePanel className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Thông tin tài liệu
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-on-surface">
                Xem nhanh mọi chi tiết
              </h2>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <DetailRow label="Tiêu đề" value={document.title} />
              <DetailRow
                label="Mô tả"
                value={document.description || "Chưa có mô tả"}
              />
              <DetailRow
                label="Tên file"
                value={document.fileName || "Chưa có"}
              />
              <DetailRow
                label="Loại file"
                value={formatDocumentTypeLabel(document)}
              />
              <DetailRow
                label="Dung lượng"
                value={formatFileSize(document.fileSize)}
              />
              <DetailRow
                label="Ngày đăng"
                value={formatDocumentDateTime(document.createdAt)}
              />
              <DetailRow
                label="Lớp học"
                value={document.classroomName || "Tài liệu hệ thống"}
              />
              <DetailRow
                label="Người đăng"
                value={document.uploadedByName || "Chưa rõ"}
              />
            </div>
          </SurfacePanel>
        </div>

        <DocumentViewer
          document={document}
          open={isViewerOpen}
          onOpenChange={setIsViewerOpen}
        />
      </div>
    </DocumentToastProvider>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-surface-container-lowest px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm text-on-surface">{value}</p>
    </div>
  );
}
