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
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-[#1E293B]">Tài liệu</h1>
          <p className="mt-1 text-xs text-[#64748B]">
            Khám phá và xem trước các học liệu phục vụ học tập.
          </p>
        </div>

        {loadError ? (
          <div className="flex flex-col gap-4 rounded-[10px] border border-red-200 bg-red-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-red-800">
                Không thể tải thư viện tài liệu
              </p>
              <p className="mt-1 text-xs text-red-700">
                {loadError}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={retryLoadDocuments}>
              Thử lại
            </Button>
          </div>
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
