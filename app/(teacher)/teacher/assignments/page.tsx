"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  FilePenLine,
  FilePlus2,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { updateSystemExam } from "@/services/exam.service";
import { DeleteExamDialog } from "@/components/exams/DeleteExamDialog";
import { Button } from "@/components/ui/button";
import { useDeleteExam } from "@/hooks/queries/useDeleteExam";
import { useTeacherClasses } from "@/hooks/queries/useTeacherClasses";
import { useTeacherSystemExams } from "@/hooks/queries/useTeacherSystemExams";
import { getTeacherClassExams } from "@/lib/teacher-classes";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type AssignmentTab = "tests" | "practice";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDateTime(value?: string | null) {
  if (!value) return "Không giới hạn";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa cập nhật"
    : dateTimeFormatter.format(date);
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa cập nhật"
    : dateFormatter.format(date);
}

function PaginationFooter({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  function commitJumpPage(value: string) {
    const requestedPage = Number.parseInt(value, 10);
    if (Number.isFinite(requestedPage)) {
      onPageChange(Math.min(Math.max(requestedPage, 1), totalPages));
    }
  }

  return (
    <div className="grid items-center gap-3 border-t border-[#E3E7EE] px-4 py-3.5 text-xs text-[#1E293B] lg:grid-cols-[1fr_auto_1fr]">
      <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
        <span>Số hàng hiển thị trên trang:</span>
        <label className="relative">
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
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
        <span>của tổng số {total}</span>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          className="size-8 rounded-[6px]"
          aria-label="Trang đầu"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="size-8 rounded-[6px]"
          aria-label="Trang trước"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="flex size-9 items-center justify-center rounded-full bg-[#3F63F3] font-bold text-white">
          {page}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="size-8 rounded-[6px]"
          aria-label="Trang sau"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="size-8 rounded-[6px]"
          aria-label="Trang cuối"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>

      <label className="flex items-center justify-center gap-3 lg:justify-end">
        <span>Chuyển đến trang:</span>
        <input
          key={page}
          type="number"
          min={1}
          max={totalPages}
          defaultValue={page}
          onBlur={(event) => commitJumpPage(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitJumpPage(event.currentTarget.value);
            }
          }}
          className="h-10 w-24 rounded-[7px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none focus:border-[#4F62F2]"
          aria-label="Chuyển đến trang"
        />
      </label>
    </div>
  );
}

export default function TeacherAssignmentsPage() {
  const [activeTab, setActiveTab] = useState<AssignmentTab>("tests");
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteCandidate, setDeleteCandidate] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const queryClient = useQueryClient();
  const [isUnassigning, setIsUnassigning] = useState(false);

  const classesQuery = useTeacherClasses();
  const classes = classesQuery.data ?? [];
  const classIds = classes.map((item) => item.id);
  const practiceQuery = useTeacherSystemExams({});
  const deleteExamMutation = useDeleteExam();

  const testsQuery = useQuery({
    queryKey: ["teacher", "assignments", classIds],
    queryFn: async () => {
      const groups = await Promise.all(
        classes.map(async (classroom) => ({
          classroom,
          exams: await getTeacherClassExams(classroom.id),
        })),
      );

      return groups.flatMap(({ classroom, exams }) =>
        exams.map((exam) => ({ exam, classroom })),
      );
    },
    enabled: classesQuery.isSuccess && classes.length > 0,
    staleTime: 60_000,
  });

  const keyword = search.trim().toLocaleLowerCase("vi");
  const tests = useMemo(
    () =>
      (testsQuery.data ?? []).filter(({ exam, classroom }) => {
        if (
          keyword &&
          ![exam.title, exam.description, classroom.name].some((value) =>
            value.toLocaleLowerCase("vi").includes(keyword),
          )
        ) {
          return false;
        }
        if (scopeFilter !== "all" && classroom.id !== scopeFilter) return false;
        if (statusFilter === "active" && !exam.isActive) return false;
        if (statusFilter === "closed" && exam.isActive) return false;
        return true;
      }),
    [keyword, scopeFilter, statusFilter, testsQuery.data],
  );

  const gradeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (practiceQuery.data?.items ?? [])
            .map((exam) => exam.grade.trim())
            .filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right, "vi")),
    [practiceQuery.data?.items],
  );

  const practiceExams = useMemo(
    () =>
      (practiceQuery.data?.items ?? []).filter((exam) => {
        if (
          keyword &&
          ![exam.title, exam.description, exam.grade].some((value) =>
            value.toLocaleLowerCase("vi").includes(keyword),
          )
        ) {
          return false;
        }
        if (scopeFilter !== "all" && exam.grade !== scopeFilter) return false;
        if (statusFilter === "active" && !exam.is_published) return false;
        if (statusFilter === "closed" && exam.is_published) return false;
        return true;
      }),
    [keyword, practiceQuery.data?.items, scopeFilter, statusFilter],
  );

  const activeTotal = activeTab === "tests" ? tests.length : practiceExams.length;
  const totalPages = Math.max(1, Math.ceil(activeTotal / pageSize));
  const currentPage = Math.min(page, totalPages);
  const sliceStart = (currentPage - 1) * pageSize;
  const visibleTests = tests.slice(sliceStart, sliceStart + pageSize);
  const visiblePracticeExams = practiceExams.slice(
    sliceStart,
    sliceStart + pageSize,
  );
  const isLoading =
    activeTab === "tests"
      ? classesQuery.isLoading || testsQuery.isLoading
      : practiceQuery.isLoading;
  const isError =
    activeTab === "tests"
      ? classesQuery.isError || testsQuery.isError
      : practiceQuery.isError;
  const isFetching =
    activeTab === "tests" ? testsQuery.isFetching : practiceQuery.isFetching;

  function selectTab(tab: AssignmentTab) {
    setActiveTab(tab);
    setSearch("");
    setScopeFilter("all");
    setStatusFilter("all");
    setPage(1);
  }

  function changePage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  function changePageSize(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  function refreshActiveTab() {
    if (activeTab === "tests") {
      void Promise.all([classesQuery.refetch(), testsQuery.refetch()]);
      return;
    }
    void practiceQuery.refetch();
  }

  async function confirmDeleteExam() {
    if (!deleteCandidate) return;

    try {
      setIsUnassigning(true);
      await updateSystemExam(deleteCandidate.id, {
        title: deleteCandidate.title,
        description: "",
        grade: "Lớp 12",
        image_url: "",
        scope: "system",
        classroom_id: null,
        duration_minutes: 45,
        is_published: false,
        is_active: true,
        total_points: 10,
        point_mode: "auto",
      });
      await queryClient.invalidateQueries();
      setDeleteCandidate(null);
    } catch (error) {
      console.error("Failed to unassign teacher exam", error);
    } finally {
      setIsUnassigning(false);
    }
  }

  const isTestsTab = activeTab === "tests";

  return (
    <div className="space-y-4">
      <nav
        className="relative flex items-center rounded-[2px] border border-[#DDE2EB] bg-white px-2 shadow-[0_1px_3px_rgba(30,41,59,0.04)]"
        aria-label="Loại đề đã giao"
      >
        <button
          type="button"
          onClick={() => selectTab("tests")}
          className={`relative px-4 pt-4 pb-4 text-sm font-semibold transition-colors ${
            isTestsTab
              ? "text-[#E11D48]"
              : "text-[#526079] hover:text-[#1E293B]"
          }`}
        >
          Bài tập kiểm tra
          {isTestsTab ? (
            <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[#E11D48]" />
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => selectTab("practice")}
          className={`relative px-4 pt-4 pb-4 text-sm font-semibold transition-colors ${
            !isTestsTab
              ? "text-[#E11D48]"
              : "text-[#526079] hover:text-[#1E293B]"
          }`}
        >
          Đề thi
          {!isTestsTab ? (
            <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[#E11D48]" />
          ) : null}
        </button>
      </nav>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-bold text-[#1E293B]">
            {isTestsTab
              ? "Danh sách bài tập kiểm tra"
              : "Danh sách đề thi"}
          </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            {isTestsTab
              ? "Theo dõi các đề kiểm tra đã giao theo từng lớp và mở nhanh trang kết quả."
              : "Quản lý các đề thi hệ thống và theo dõi lượt làm bài."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="h-9 rounded-[4px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-3.5 text-xs font-semibold text-white shadow-sm hover:opacity-95"
          >
            <Link href="/teacher/classes">
              <FilePlus2 className="size-4" />
              {isTestsTab ? "Giao bài kiểm tra mới" : "Giao đề thi mới"}
            </Link>
          </Button>
          <Button
            type="button"
            className="h-9 rounded-[4px] bg-[#3F63F3] px-3.5 text-xs font-semibold text-white hover:bg-[#3554D8]"
            onClick={refreshActiveTab}
            disabled={isFetching}
          >
            <RefreshCw
              className={isFetching ? "size-4 animate-spin" : "size-4"}
            />
            Làm mới
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.08)]">
        <div className="flex flex-col gap-2 border-b border-[#E3E7EE] p-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-[320px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Nhập từ khóa tìm kiếm..."
              className="h-9 w-full rounded-[7px] border border-[#DDE2EB] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#7889FA]"
            />
          </div>
          <select
            value={scopeFilter}
            onChange={(event) => {
              setScopeFilter(event.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-[7px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none focus:border-[#7889FA] md:w-[190px]"
          >
            <option value="all">
              {isTestsTab ? "Tất cả lớp học" : "Tất cả khối lớp"}
            </option>
            {isTestsTab
              ? classes.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))
              : gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-[7px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none focus:border-[#7889FA] md:w-[170px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">
              {isTestsTab ? "Đang diễn ra" : "Đã công khai"}
            </option>
            <option value="closed">
              {isTestsTab ? "Đã kết thúc" : "Riêng tư"}
            </option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {isTestsTab ? (
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
                <tr>
                  <th className="px-3.5 py-3.5">Bài kiểm tra</th>
                  <th className="px-3.5 py-3.5">Lớp học</th>
                  <th className="px-3.5 py-3.5">Câu hỏi</th>
                  <th className="px-3.5 py-3.5">Thời lượng</th>
                  <th className="px-3.5 py-3.5">Hạn nộp</th>
                  <th className="px-3.5 py-3.5">Đã nộp</th>
                  <th className="px-3.5 py-3.5">Trạng thái</th>
                  <th className="px-3.5 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#7C879B]">
                      Đang tải bài kiểm tra...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-rose-600">
                      Không thể tải danh sách bài kiểm tra.
                    </td>
                  </tr>
                ) : visibleTests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#1E293B]">
                      Không tìm thấy dữ liệu nào!
                    </td>
                  </tr>
                ) : (
                  visibleTests.map(({ exam, classroom }) => (
                    <tr
                      key={`${classroom.id}-${exam.id}`}
                      className="transition-colors hover:bg-[#F8FAFC]"
                    >
                      <td className="max-w-72 px-3.5 py-2.5">
                        <p className="truncate font-bold text-[#1E293B]">
                          {exam.title}
                        </p>
                        <p className="mt-1 truncate text-[10.5px] text-[#7C879B]">
                          Mã đề #{exam.id}
                        </p>
                      </td>
                      <td className="px-3.5 py-2.5 font-medium text-[#526079]">
                        {classroom.name}
                      </td>
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        {exam.questionCount}
                      </td>
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3.5" />
                          {exam.duration} phút
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        {formatDateTime(exam.endTime)}
                      </td>
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        {exam.attemptCount}/{classroom.studentCount ?? 0}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span
                          className={
                            exam.isActive
                              ? "inline-flex items-center gap-1 rounded-[4px] bg-emerald-50 px-2 py-1 text-[10.5px] font-semibold text-emerald-700"
                              : "inline-flex items-center gap-1 rounded-[4px] bg-slate-100 px-2 py-1 text-[10.5px] font-semibold text-slate-600"
                          }
                        >
                          <CheckCircle2 className="size-3" />
                          {exam.isActive ? "Đang diễn ra" : "Đã kết thúc"}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <Link
                          href={`/teacher/classes/${classroom.id}/exams/${exam.id}/results`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-[#DDE2EB] px-3 text-[11px] font-semibold text-[#4050DC] hover:bg-[#EEF2FF]"
                        >
                          <BarChart3 className="size-3.5" />
                          Kết quả
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[920px] text-left">
              <thead className="bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
                <tr>
                  <th className="px-3.5 py-3.5">Đề thi</th>
                  <th className="px-3.5 py-3.5">Trình độ</th>
                  <th className="px-3.5 py-3.5">Trường học</th>
                  <th className="px-3.5 py-3.5">Môn học</th>
                  <th className="px-3.5 py-3.5">Số câu hỏi</th>
                  <th className="px-3.5 py-3.5">Thời lượng</th>
                  <th className="px-3.5 py-3.5">Lượt làm</th>
                  <th className="px-3.5 py-3.5">Trạng thái</th>
                  <th className="px-3.5 py-3.5">Ngày tạo</th>
                  <th className="px-3.5 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-[#7C879B]">
                      Đang tải đề thi...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-rose-600">
                      Không thể tải danh sách đề thi.
                    </td>
                  </tr>
                ) : visiblePracticeExams.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-[#1E293B]">
                      Không tìm thấy dữ liệu nào!
                    </td>
                  </tr>
                ) : (
                  visiblePracticeExams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="transition-colors hover:bg-[#F8FAFC]"
                    >
                      <td className="max-w-80 px-3.5 py-2.5">
                        <p className="truncate font-bold text-[#1E293B]">
                          {exam.title}
                        </p>
                        <p className="mt-1 truncate text-[10.5px] text-[#7C879B]">
                          Mã đề #{exam.id}
                        </p>
                      </td>
                      {(() => {
                        const parts = (exam.grade || "")
                          .split(" - ")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        return (
                          <>
                            <td className="px-3.5 py-2.5 font-medium text-[#1E293B]">
                              {parts[0] || "Chưa phân loại"}
                            </td>
                            <td className="px-3.5 py-2.5 text-[#526079]">
                              {parts[1] || "--"}
                            </td>
                            <td className="px-3.5 py-2.5 text-[#526079]">
                              {parts[2] || "--"}
                            </td>
                          </>
                        );
                      })()}
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        {exam.question_count}
                      </td>
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3.5" />
                          {exam.duration_minutes} phút
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        {exam.attempt_count}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span
                          className={
                            exam.is_published
                              ? "inline-flex items-center gap-1 rounded-[4px] bg-emerald-50 px-2 py-1 text-[10.5px] font-semibold text-emerald-700"
                              : "inline-flex items-center gap-1 rounded-[4px] bg-slate-100 px-2 py-1 text-[10.5px] font-semibold text-slate-600"
                          }
                        >
                          <CheckCircle2 className="size-3" />
                          {exam.is_published ? "Đã công khai" : "Riêng tư"}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        {formatDate(exam.created_at)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/teacher/exams/edit?edit=${exam.id}`}
                            className="inline-flex size-8 items-center justify-center rounded-[6px] text-[#4050DC] hover:bg-[#EEF2FF] transition-colors"
                            aria-label={`Chỉnh sửa đề thi ${exam.title}`}
                            title="Chỉnh sửa"
                          >
                            <FilePenLine className="size-4" />
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-[6px] text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() =>
                              setDeleteCandidate({
                                id: exam.id,
                                title: exam.title,
                              })
                            }
                            disabled={deleteExamMutation.isPending}
                            aria-label={`Xóa đề thi ${exam.title}`}
                            title="Xóa đề thi"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <PaginationFooter
          page={currentPage}
          pageSize={pageSize}
          total={activeTotal}
          totalPages={totalPages}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
        />
      </section>

      <DeleteExamDialog
        examTitle={deleteCandidate?.title ?? null}
        isDeleting={isUnassigning}
        open={Boolean(deleteCandidate)}
        onConfirm={confirmDeleteExam}
        title="Xác nhận hủy giao đề thi"
        description={
          deleteCandidate?.title
            ? `Bài thi "${deleteCandidate.title}" sẽ được hủy giao khỏi lớp. Đề thi gốc vẫn được giữ nguyên vẹn trong mục Quản lý đề thi.`
            : "Bài thi sẽ được hủy giao khỏi lớp."
        }
        actionLabel="Hủy giao đề"
        onOpenChange={(open) => {
          if (!open && !isUnassigning) {
            setDeleteCandidate(null);
          }
        }}
      />
    </div>
  );
}
