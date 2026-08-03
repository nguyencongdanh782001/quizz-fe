"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document } from "@/types/document.types";
import {
  type StudentDocumentSortOption,
  matchesStudentDocumentSearch,
  sortStudentDocuments,
} from "@/lib/student-system-documents";
import { DocumentCard } from "./document-card";
import { DocumentViewer } from "./document-viewer";
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
  { value: "title-asc", label: "Tên A-Z" },
  { value: "title-desc", label: "Tên Z-A" },
];

function DocumentListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <SurfacePanel key={index} className="space-y-4 p-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-16 w-full" />
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
  className,
}: DocumentListProps) {
  const [gradeFilter, setGradeFilter] = useState("all");
  const [classroomFilter, setClassroomFilter] = useState("all");

  const gradeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          documents
            .map((doc) => doc.grade)
            .filter((g): g is number => Boolean(g) && g > 0),
        ),
      ).sort((a, b) => a - b),
    [documents],
  );

  const classroomOptions = useMemo(
    () =>
      Array.from(
        new Set(
          documents
            .map((doc) => doc.classroomName?.trim())
            .filter((c): c is string => Boolean(c)),
        ),
      ).sort((a, b) => a.localeCompare(b, "vi")),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const matched = documents.filter((doc) => {
      if (!matchesStudentDocumentSearch(doc, search)) return false;
      if (gradeFilter !== "all" && String(doc.grade) !== gradeFilter) return false;
      if (
        classroomFilter !== "all" &&
        doc.classroomName !== classroomFilter
      ) {
        return false;
      }
      return true;
    });

    return sortStudentDocuments(matched, sortBy);
  }, [documents, search, gradeFilter, classroomFilter, sortBy]);

  const isFilteredEmpty = !isLoading && filteredDocuments.length === 0;

  function resetFilters() {
    onSearchChange("");
    setGradeFilter("all");
    setClassroomFilter("all");
    onSortChange("recent");
  }

  return (
    <div className={cn("grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]", className)}>
      {/* Left Filter Sidebar matching Teacher Kho học liệu */}
      <aside className="h-fit space-y-4 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
        <div className="flex items-center gap-2 border-b border-[#E3E7EE] pb-3">
          <SlidersHorizontal className="size-4 text-[#4F62F2]" />
          <h2 className="text-sm font-bold text-[#1E293B]">Lọc kết quả</h2>
        </div>

        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-[#526079]">Trình độ</span>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="h-10 w-full rounded-[6px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none transition-colors focus:border-[#7889FA]"
          >
            <option value="all">Tất cả trình độ</option>
            {gradeOptions.map((g) => (
              <option key={g} value={String(g)}>
                Khối {g}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-[#526079]">Lớp học</span>
          <select
            value={classroomFilter}
            onChange={(e) => setClassroomFilter(e.target.value)}
            className="h-10 w-full rounded-[6px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none transition-colors focus:border-[#7889FA]"
          >
            <option value="all">Tất cả lớp học</option>
            {classroomOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-[#526079]">Sắp xếp</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as StudentDocumentSortOption)}
            className="h-10 w-full rounded-[6px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none transition-colors focus:border-[#7889FA]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-[6px] text-xs font-semibold"
          onClick={resetFilters}
        >
          Đặt lại bộ lọc
        </Button>
      </aside>

      {/* Right Main Content Panel */}
      <section className="min-w-0 overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
        <div className="flex flex-col gap-3 border-b border-[#DDE2EB] p-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-[320px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7C879B]" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nhập từ khóa tìm kiếm..."
              className="h-10 w-full rounded-[6px] border border-[#DDE2EB] bg-white pl-9 pr-3 text-xs outline-none transition-colors placeholder:text-[#A6AFBF] focus:border-[#7889FA]"
            />
          </label>
          <p className="shrink-0 text-sm text-[#1E293B]">
            <span className="font-bold text-[#4F62F2]">{filteredDocuments.length}</span> kết quả
          </p>
        </div>

        <div className="p-4">
          {isLoading ? (
            <DocumentListSkeleton />
          ) : isFilteredEmpty ? (
            <div className="py-16 text-center text-xs text-[#94A3B8]">
              Không tìm thấy tài liệu nào.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onView={onSelectedDocumentChange}
                />
              ))}
            </div>
          )}
        </div>
      </section>

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
    </div>
  );
}
