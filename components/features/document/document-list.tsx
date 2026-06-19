"use client";

import { useMemo } from "react";
import { BookOpenText, LoaderCircle, Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document } from "@/types/document.types";
import {
  type StudentDocumentSortOption,
  formatDocumentDateTime,
  matchesStudentDocumentSearch,
  sortStudentDocuments,
} from "@/lib/student-system-documents";
import { DocumentCard } from "./document-card";
import { DocumentViewer } from "./document-viewer";
import { EmptyDocumentState } from "./empty-document-state";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  search: string;
  sortBy: StudentDocumentSortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: StudentDocumentSortOption) => void;
  selectedDocument: Document | null;
  onSelectedDocumentChange: (document: Document | null) => void;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  className?: string;
}

const SORT_OPTIONS: Array<{ value: StudentDocumentSortOption; label: string }> = [
  { value: "recent", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "title-asc", label: "A-Z" },
  { value: "title-desc", label: "Z-A" },
];

function DocumentListSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <SurfacePanel key={index} className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="size-11 rounded-2xl" />
          </div>
          <Skeleton className="h-7 w-4/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-16 rounded-[1rem]" />
            <Skeleton className="h-16 rounded-[1rem]" />
            <Skeleton className="h-16 rounded-[1rem] sm:col-span-2" />
            <Skeleton className="h-16 rounded-[1rem] sm:col-span-2" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </SurfacePanel>
      ))}
    </div>
  );
}

export function DocumentList({
  documents,
  isLoading,
  search,
  sortBy,
  onSearchChange,
  onSortChange,
  selectedDocument,
  onSelectedDocumentChange,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  className,
}: DocumentListProps) {
  const filteredDocuments = useMemo(() => {
    const matched = documents.filter((document) =>
      matchesStudentDocumentSearch(document, search),
    );

    return sortStudentDocuments(matched, sortBy);
  }, [documents, search, sortBy]);

  const isFilteredEmpty = !isLoading && filteredDocuments.length === 0;
  const hasSearch = search.trim().length > 0;
  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? "Mới nhất";
  const latestDocument = useMemo(
    () => sortStudentDocuments(filteredDocuments, "recent")[0] ?? null,
    [filteredDocuments],
  );

  return (
    <section className={cn("space-y-5", className)}>
      <SurfacePanel tone="muted" className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpenText className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Thư viện tài liệu
                </p>
                <h2 className="font-display text-2xl font-semibold text-on-surface">
                  {isLoading
                    ? "Đang tải tài liệu"
                    : `${filteredDocuments.length} tài liệu phù hợp`}
                </h2>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Tìm theo tiêu đề, tên file, từ khóa trong nội dung hoặc mô tả. Sau
              đó sắp xếp tài liệu theo cách bạn muốn đọc.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <Badge variant="outline" className="gap-2 rounded-full px-3 py-1.5">
                <LoaderCircle className="size-3.5 animate-spin" />
                Đang tải
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm theo tiêu đề, tên file hoặc từ khóa..."
              className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest pl-11 shadow-none"
            />
          </div>

          <Select
            value={sortBy}
            onValueChange={(value) => onSortChange(value as StudentDocumentSortOption)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest shadow-none">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent position="popper">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="size-4 text-muted-foreground" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            {isLoading
              ? "Đang cập nhật danh sách..."
              : `${filteredDocuments.length} / ${documents.length} tài liệu`}
          </span>
          {hasSearch ? (
            <Badge variant="outline" className="rounded-full px-3 py-1">
              Đang lọc theo từ khóa
            </Badge>
          ) : null}
          <Badge variant="outline" className="rounded-full px-3 py-1">
            {activeSortLabel}
          </Badge>
        </div>
      </SurfacePanel>

      {isLoading ? (
        <DocumentListSkeleton />
      ) : isFilteredEmpty ? (
        <EmptyDocumentState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onView={onSelectedDocumentChange}
              />
            ))}
          </div>
          {latestDocument ? (
            <p className="text-xs text-muted-foreground">
              Cập nhật gần nhất:{" "}
              {formatDocumentDateTime(
                latestDocument.updatedAt ?? latestDocument.createdAt ?? "",
              )}
            </p>
          ) : null}
        </>
      )}

      {selectedDocument ? (
        <DocumentViewer
          document={selectedDocument}
          open={Boolean(selectedDocument)}
          onOpenChange={(open) => {
            if (!open) {
              onSelectedDocumentChange(null);
            }
          }}
        />
      ) : null}
    </section>
  );
}
