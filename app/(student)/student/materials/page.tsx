"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { BookOpenText, RefreshCcw, Sparkles, FileText } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { SurfacePanel } from "@/components/shared/surface-panel";
import type { Document } from "@/types/document.types";
import {
  getStudentSystemDocuments,
  getDocumentPreviewKind,
  type StudentDocumentSortOption,
} from "@/lib/student-system-documents";
import { DocumentList } from "@/components/features/document/document-list";
import { DocumentToastProvider } from "@/components/features/document/document-toast";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<StudentDocumentSortOption>("recent");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      setIsLoadingDocuments(true);
      setLoadError(null);

      try {
        const items = await getStudentSystemDocuments({ throwOnError: true });

        if (!isMounted) {
          return;
        }

        setDocuments(items);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDocuments([]);
        setLoadError(getErrorMessage(error, "Không thể tải thư viện tài liệu."));
      } finally {
        if (isMounted) {
          setIsLoadingDocuments(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const classroomCount = useMemo(
    () =>
      new Set(
        documents
          .map((document) => document.classroomName?.trim())
          .filter((value): value is string => Boolean(value)),
      ).size,
    [documents],
  );

  const previewReadyCount = useMemo(
    () =>
      documents.filter((document) => getDocumentPreviewKind(document) !== "other")
        .length,
    [documents],
  );

  function retryLoadDocuments() {
    setReloadKey((value) => value + 1);
  }

  return (
    <DocumentToastProvider>
      <div className="space-y-6">
        <PageHero
          eyebrow="Thư viện tài liệu"
          title="Kho học liệu hiện đại dành cho học sinh"
          description="Tìm, xem trước và tải xuống tài liệu học tập trong một trải nghiệm rõ ràng, nhanh và phù hợp trên mọi thiết bị."
          icon={Sparkles}
          actions={
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={retryLoadDocuments}
            >
              <RefreshCcw className="size-4" />
              Làm mới
            </Button>
          }
          metrics={[
            {
              label: "Tài liệu hiện có",
              value: isLoadingDocuments ? "--" : documents.length,
              description: "Học liệu hệ thống và theo lớp học.",
              icon: FileText,
              tone: "primary",
            },
            {
              label: "Lớp học có tài liệu",
              value: isLoadingDocuments ? "--" : classroomCount || "0",
              description: "Số lớp đang chia sẻ học liệu.",
              icon: BookOpenText,
              tone: "secondary",
            },
            {
              label: "Xem trước hỗ trợ",
              value: isLoadingDocuments ? "--" : previewReadyCount,
              description: "PDF, hình ảnh và văn bản hỗ trợ xem nhanh.",
              icon: Sparkles,
              tone: "tertiary",
            },
          ]}
        />

        {loadError ? (
          <SurfacePanel tone="muted" className="border border-red-200/70 bg-red-50/70">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">
                  Không thể tải thư viện tài liệu
                </p>
                <p className="mt-2 text-sm leading-7 text-red-700/90 dark:text-red-200/90">
                  {loadError}
                </p>
              </div>
              <Button type="button" variant="outline" onClick={retryLoadDocuments}>
                Thử lại
              </Button>
            </div>
          </SurfacePanel>
        ) : null}

        <DocumentList
          documents={documents}
          isLoading={isLoadingDocuments}
          search={deferredSearch}
          sortBy={sortBy}
          onSearchChange={setSearch}
          onSortChange={setSortBy}
          selectedDocument={selectedDocument}
          onSelectedDocumentChange={setSelectedDocument}
          emptyTitle="Chưa có học liệu nào"
          emptyDescription="Hiện chưa có tài liệu học tập nào được xuất bản cho học sinh. Hãy quay lại sau khi giáo viên cập nhật thêm nội dung."
        />
      </div>
    </DocumentToastProvider>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}
