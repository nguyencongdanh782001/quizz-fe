"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  LoaderCircle,
  MoreVertical,
  Pencil,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExamVisibilityToggle } from "@/components/exams/ExamVisibilityToggle";
import { VisibilityStatusBadge } from "@/components/exams/ExamVisibilityToggle";
import { mergeClassExamPublishUpdate } from "@/components/exams/exam-publish-utils";
import type { ToggleVisibilityResponse } from "@/hooks/queries/useToggleExamVisibility";
import { cn } from "@/lib/utils";
import type { Exam } from "@/types/exam.types";
import { teacherClassDetailQueryKeys } from "../query-keys";

export function ExamTable({
  classId,
  exams,
  isLoading,
  error,
  onRetry,
  onToggleVisibility,
  onToggleError,
}: {
  classId: string;
  exams: Exam[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void | Promise<void>;
  onToggleVisibility: (response: ToggleVisibilityResponse) => void;
  onToggleError: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const keyword = search.trim().toLocaleLowerCase("vi");
  const filteredExams = useMemo(
    () =>
      exams.filter((exam) =>
        [exam.title, exam.description].some((value) =>
          value?.toLocaleLowerCase("vi").includes(keyword),
        ),
      ),
    [exams, keyword],
  );
  const pageCount = Math.max(1, Math.ceil(filteredExams.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleExams = filteredExams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleToggleSuccess(response: ToggleVisibilityResponse) {
    queryClient.setQueryData<Exam[] | undefined>(
      teacherClassDetailQueryKeys.exams(classId),
      (current) =>
        current?.map((exam) =>
          exam.id === String(response.exam.id)
            ? mergeClassExamPublishUpdate(exam, response.exam)
            : exam,
        ),
    );
    void queryClient.invalidateQueries({
      queryKey: teacherClassDetailQueryKeys.exams(classId),
    });
    onToggleVisibility(response);
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.08)]">
      <div className="border-b border-[#DDE2EB] p-3">
        <label className="relative block max-w-[360px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7C879B]" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm bài thi..."
            className="h-10 w-full rounded-[6px] border border-[#DDE2EB] bg-white pl-9 pr-3 text-xs outline-none placeholder:text-[#A6AFBF] focus:border-[#7889FA]"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
          <tr className="border-b border-[#DDE2EB]">
            {[
              "Bài thi",
              "Thời lượng",
              "Điểm tối đa",
              "Trạng thái",
              "Hành động",
            ].map((heading) => (
              <th
                key={heading}
                className="px-3.5 py-3.5 text-left"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
          {isLoading ? (
            <tr>
              <td colSpan={5} className="h-28 px-4 text-center text-[#64748B]">
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Đang tải danh sách bài thi...
                </span>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={5} className="h-28 px-4 text-center">
                <div className="flex flex-col items-center gap-2 text-rose-600">
                  <span>{error}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-[4px]"
                    onClick={() => void onRetry()}
                  >
                    <RefreshCcw className="size-3.5" />
                    Thử lại
                  </Button>
                </div>
              </td>
            </tr>
          ) : visibleExams.length === 0 ? (
            <tr>
              <td colSpan={5} className="h-28 px-4 text-center text-[#64748B]">
                Không tìm thấy dữ liệu nào!
              </td>
            </tr>
          ) : visibleExams.map((exam) => (
            <tr
              key={exam.id}
              className="transition-colors hover:bg-[#F8FAFC]"
            >
              <td className="px-3.5 py-2.5">
                <p className="font-medium text-[#111827]">
                  {exam.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {exam.description}
                </p>
              </td>
              <td className="px-3.5 py-2.5 text-[#526079]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {exam.duration} phút
                </span>
              </td>
              <td className="px-3.5 py-2.5 text-[#526079]">
                {exam.totalPoints ?? exam.passingScore}
              </td>
              <td className="px-3.5 py-2.5">
                <div className="flex flex-wrap gap-2">
                  <VisibilityStatusBadge
                    isPublished={Boolean(
                      exam.isPublished ?? exam.status === "published",
                    )}
                  />
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      (exam.isActive ?? exam.status === "published")
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {(exam.isActive ?? exam.status === "published")
                      ? "Đang hoạt động"
                      : "Tạm ngưng"}
                  </span>
                </div>
              </td>
              <td className="px-3.5 py-2.5">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-[4px] text-muted-foreground hover:text-on-surface"
                        aria-label="Thao tác"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/teacher/classes/${classId}/exams/${exam.id}/results`}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <History className="h-4 w-4" />
                          Kết quả
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/teacher/classes/${classId}/exams/edit?edit=${exam.id}`}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <ExamVisibilityToggle
                        examId={exam.id}
                        examTitle={exam.title}
                        isPublished={Boolean(
                          exam.isPublished ?? exam.status === "published",
                        )}
                        trigger="menu-item"
                        onSuccess={handleToggleSuccess}
                        onError={onToggleError}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="flex min-h-16 flex-col gap-3 border-t border-[#DDE2EB] px-4 py-3 text-xs text-[#526079] sm:flex-row sm:items-center sm:justify-between">
        <p>
          Hiển thị tối đa {pageSize} hàng, tổng số{" "}
          <span className="font-semibold text-[#1E293B]">{filteredExams.length}</span>{" "}
          bài thi
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" disabled={currentPage === 1} onClick={() => setPage(1)} aria-label="Trang đầu">
            <ChevronFirst className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Trang trước">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="flex size-8 items-center justify-center rounded-[4px] bg-[#4169F7] font-semibold text-white">{currentPage}</span>
          <Button variant="ghost" size="icon-sm" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label="Trang sau">
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={currentPage === pageCount} onClick={() => setPage(pageCount)} aria-label="Trang cuối">
            <ChevronLast className="size-4" />
          </Button>
        </div>
        <p>Trang {currentPage}/{pageCount}</p>
      </div>
    </div>
  );
}
