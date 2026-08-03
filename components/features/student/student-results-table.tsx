"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  Eye,
  LoaderCircle,
  Search,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentSystemResultItemData } from "@/lib/student-system-results";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const formatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface StudentResultsTableProps {
  items: StudentSystemResultItemData[];
  isLoading: boolean;
  isError: boolean;
  countLabel: string;
  emptyMessage: string;
  loadingMessage: string;
  errorMessage: string;
  header?: ReactNode;
}

function ResultStatus({ isPassed }: { isPassed: boolean }) {
  return (
    <span
      className={
        isPassed
          ? "inline-flex items-center gap-1 rounded-[4px] bg-emerald-50 px-2 py-1 font-semibold text-emerald-700"
          : "inline-flex items-center gap-1 rounded-[4px] bg-rose-50 px-2 py-1 font-semibold text-rose-700"
      }
    >
      {isPassed ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <XCircle className="size-3.5" />
      )}
      {isPassed ? "Đạt" : "Chưa đạt"}
    </span>
  );
}

export function StudentResultsTable({
  items,
  isLoading,
  isError,
  countLabel,
  emptyMessage,
  loadingMessage,
  errorMessage,
  header,
}: StudentResultsTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const keyword = search.trim().toLocaleLowerCase("vi");
  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        keyword
          ? item.examTitle.toLocaleLowerCase("vi").includes(keyword)
          : true,
      ),
    [items, keyword],
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const canGoBack = safePage > 1;
  const canGoForward = safePage < totalPages;

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.08)]">
      {header}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E3E7EE] p-3">
        <span className="shrink-0 text-xs font-bold text-[#3F63F3]">
          {filteredItems.length} {countLabel}
        </span>
        <label className="relative block w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="h-10 w-full rounded-[7px] border border-[#DDE2EB] bg-white pl-10 pr-3 text-xs text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4F62F2]"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#DDE2EB] bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
              <th className="min-w-72 px-3.5 py-3.5">Đề thi</th>
              <th className="w-32 px-3.5 py-3.5">Điểm</th>
              <th className="w-32 px-3.5 py-3.5">Câu đúng</th>
              <th className="min-w-44 px-3.5 py-3.5">Nộp lúc</th>
              <th className="w-32 px-3.5 py-3.5">Trạng thái</th>
              <th className="w-32 px-3.5 py-3.5">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="h-28 text-center text-[#64748B]">
                  <LoaderCircle className="mr-2 inline size-4 animate-spin" />
                  {loadingMessage}
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="h-28 text-center text-rose-600">
                  {errorMessage}
                </td>
              </tr>
            ) : visibleItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-28 text-center text-[#64748B]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleItems.map((result) => (
                <tr
                  key={result.attemptId}
                  className="transition-colors hover:bg-[#F8FAFC]"
                >
                  <td className="max-w-80 px-3.5 py-2.5">
                    <p className="truncate font-bold text-[#1E293B]">
                      {result.examTitle}
                    </p>
                    <p className="mt-1 truncate text-[10.5px] text-[#7C879B]">
                      {result.classroomName || "Đề thi hệ thống"}
                    </p>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <p className="text-base font-bold text-[#1E293B]">
                      {Math.round(result.scorePercent)}%
                    </p>
                    <p className="text-[10.5px] text-[#7C879B]">
                      {result.score}/{result.totalPoints} điểm
                    </p>
                  </td>
                  <td className="px-3.5 py-2.5 text-[#526079]">
                    {result.correctAnswersCount}/{result.totalQuestions} câu
                  </td>
                  <td className="px-3.5 py-2.5 text-[#526079]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5" />
                      {formatter.format(new Date(result.submittedAt))}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <ResultStatus isPassed={result.isPassed} />
                  </td>
                  <td className="px-3.5 py-2.5">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[4px] px-3 text-[11px] font-semibold"
                    >
                      <Link
                        href={`/student/exam/${result.examId}/result?attemptId=${result.attemptId}`}
                      >
                        <Eye className="size-3.5" />
                        Chi tiết
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid items-center gap-3 border-t border-[#E3E7EE] px-4 py-3.5 text-xs text-[#1E293B] lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          <span>Số hàng hiển thị trên trang:</span>
          <label className="relative">
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-9 appearance-none border-0 bg-transparent py-0 pl-2 pr-7 font-semibold text-[#3F63F3] outline-none"
              aria-label="Số hàng hiển thị trên trang"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#3F63F3]" />
          </label>
          <span>của tổng số {filteredItems.length}</span>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <Button type="button" variant="ghost" size="icon" className="size-8" disabled={!canGoBack} onClick={() => setPage(1)} aria-label="Trang đầu">
            <ChevronsLeft className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" disabled={!canGoBack} onClick={() => setPage(safePage - 1)} aria-label="Trang trước">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="flex size-9 items-center justify-center rounded-full bg-[#3F63F3] font-bold text-white">
            {safePage}
          </span>
          <Button type="button" variant="ghost" size="icon" className="size-8" disabled={!canGoForward} onClick={() => setPage(safePage + 1)} aria-label="Trang sau">
            <ChevronRight className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" disabled={!canGoForward} onClick={() => setPage(totalPages)} aria-label="Trang cuối">
            <ChevronsRight className="size-4" />
          </Button>
        </div>

        <label className="flex items-center justify-center gap-3 lg:justify-end">
          <span>Chuyển đến trang:</span>
          <input
            key={safePage}
            type="number"
            min={1}
            max={totalPages}
            defaultValue={safePage}
            onBlur={(event) => {
              const nextPage = Number(event.currentTarget.value);
              if (Number.isFinite(nextPage)) {
                setPage(Math.min(Math.max(nextPage, 1), totalPages));
              }
            }}
            className="h-10 w-24 rounded-[7px] border border-[#DDE2EB] px-3 outline-none focus:border-[#4F62F2]"
            aria-label="Chuyển đến trang"
          />
        </label>
      </div>
    </div>
  );
}
