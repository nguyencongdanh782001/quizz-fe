"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNow } from "@/hooks/use-now";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  Play,
  RefreshCw,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getStudentClasses } from "@/lib/student-classes";
import { getStudentClassExams } from "@/lib/student-system-exams";
import type { Exam } from "@/types/exam.types";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type LibraryTab = "tests" | "exams";
type ClassExamAssignmentType = "test" | "exam";
type EffectiveExamStatus = "upcoming" | "active" | "closed";
type StatusFilter = "all" | EffectiveExamStatus;

function getEffectiveExamStatus(
  exam: {
    isActive?: boolean;
    startTime?: string | null;
    endTime?: string | null;
  },
  now: Date,
): EffectiveExamStatus {
  const nowTime = now.getTime();

  const startTime = exam.startTime
    ? new Date(exam.startTime).getTime()
    : Number.NaN;

  const endTime = exam.endTime ? new Date(exam.endTime).getTime() : Number.NaN;

  if (Number.isFinite(startTime) && nowTime < startTime) {
    return "upcoming";
  }

  if (Number.isFinite(endTime) && nowTime >= endTime) {
    return "closed";
  }

  if (!exam.isActive) {
    return "closed";
  }

  return "active";
}

function getStatusLabel(status: EffectiveExamStatus): string {
  if (status === "upcoming") {
    return "Chưa mở";
  }

  if (status === "closed") {
    return "Đã hết hạn";
  }

  return "Đang diễn ra";
}

function getStatusClassName(status: EffectiveExamStatus): string {
  if (status === "upcoming") {
    return "inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] bg-amber-50 px-2 py-1 text-[10.5px] font-semibold text-amber-700";
  }

  if (status === "closed") {
    return "inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] bg-rose-50 px-2 py-1 text-[10.5px] font-semibold text-rose-700";
  }

  return "inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] bg-emerald-50 px-2 py-1 text-[10.5px] font-semibold text-emerald-700";
}

function matchesStatusFilter(
  exam: Exam,
  statusFilter: StatusFilter,
  now: Date,
): boolean {
  if (statusFilter === "all") {
    return true;
  }

  return getEffectiveExamStatus(exam, now) === statusFilter;
}

function ExamStatusBadge({ exam, now }: { exam: Exam; now: Date }) {
  const status = getEffectiveExamStatus(exam, now);

  return (
    <span className={getStatusClassName(status)}>
      <CheckCircle2 className="size-3" />
      {getStatusLabel(status)}
    </span>
  );
}

function StudentExamAction({ exam, now }: { exam: Exam; now: Date }) {
  const status = getEffectiveExamStatus(exam, now);

  if (status === "active") {
    return (
      <Link
        href={`/student/exam/${exam.id}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-[#3F63F3] px-3 text-[11px] font-semibold text-white transition-colors hover:bg-[#3554D8]"
      >
        <Play className="size-3.5" />
        Làm bài
      </Link>
    );
  }

  if (status === "upcoming") {
    return (
      <span className="inline-flex h-8 cursor-not-allowed items-center rounded-[4px] bg-amber-50 px-3 text-[11px] font-semibold text-amber-700">
        Chưa mở
      </span>
    );
  }

  if ((exam.attemptCount ?? 0) > 0) {
    return (
      <Link
        href="/student/results"
        className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-[#DDE2EB] px-3 text-[11px] font-semibold text-[#4050DC] transition-colors hover:bg-[#EEF2FF]"
      >
        <BarChart3 className="size-3.5" />
        Xem kết quả
      </Link>
    );
  }

  return (
    <span className="inline-flex h-8 cursor-not-allowed items-center rounded-[4px] bg-[#EEF0F4] px-3 text-[11px] font-semibold text-[#98A2B3]">
      Đã hết hạn
    </span>
  );
}

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "Không giới hạn";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Chưa cập nhật"
    : dateTimeFormatter.format(date);
}

function normalizeText(value?: string | null): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("vi");
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

    if (!Number.isFinite(requestedPage)) {
      return;
    }

    onPageChange(Math.min(Math.max(requestedPage, 1), Math.max(totalPages, 1)));
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
          max={Math.max(totalPages, 1)}
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

export default function StudentLibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("tests");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const now = useNow();

  const classesQuery = useQuery({
    queryKey: ["student", "library", "classes"],
    queryFn: getStudentClasses,
    staleTime: 60_000,
  });

  const classes = classesQuery.data ?? [];

  const classIds = useMemo(
    () => classes.map((classroom) => classroom.id),
    [classes],
  );

  async function fetchAssignmentsByType(
    assignmentType: ClassExamAssignmentType,
  ) {
    const groups = await Promise.all(
      classes.map(async (classroom) => {
        const result = await getStudentClassExams(classroom.id, {
          assignmentType,
          limit: 100,
          includeInactive: true,
          throwOnError: true,
        });

        return {
          classroom,
          exams: result.items,
        };
      }),
    );

    return groups.flatMap(({ classroom, exams }) =>
      exams.map((exam) => ({
        exam,
        classroom,
      })),
    );
  }

  const testsQuery = useQuery({
    queryKey: ["student", "library", "assigned-tests", classIds],
    queryFn: () => fetchAssignmentsByType("test"),
    enabled:
      activeTab === "tests" && classesQuery.isSuccess && classes.length > 0,
    staleTime: 60_000,
  });

  const examsQuery = useQuery({
    queryKey: ["student", "library", "assigned-exams", classIds],
    queryFn: () => fetchAssignmentsByType("exam"),
    enabled:
      activeTab === "exams" && classesQuery.isSuccess && classes.length > 0,
    staleTime: 60_000,
  });

  const keyword = normalizeText(search);

  const tests = useMemo(
    () =>
      (testsQuery.data ?? []).filter(({ exam, classroom }) => {
        if (
          keyword &&
          ![exam.title, exam.description, classroom.name].some((value) =>
            normalizeText(value).includes(keyword),
          )
        ) {
          return false;
        }

        if (classFilter !== "all" && String(classroom.id) !== classFilter) {
          return false;
        }

        if (!matchesStatusFilter(exam, statusFilter, now)) {
          return false;
        }

        return true;
      }),
    [classFilter, keyword, now, statusFilter, testsQuery.data],
  );

  const assignedExams = useMemo(
    () =>
      (examsQuery.data ?? []).filter(({ exam, classroom }) => {
        if (
          keyword &&
          ![exam.title, exam.description, classroom.name].some((value) =>
            normalizeText(value).includes(keyword),
          )
        ) {
          return false;
        }

        if (classFilter !== "all" && String(classroom.id) !== classFilter) {
          return false;
        }

        if (!matchesStatusFilter(exam, statusFilter, now)) {
          return false;
        }

        return true;
      }),
    [classFilter, examsQuery.data, keyword, now, statusFilter],
  );

  const isTestsTab = activeTab === "tests";

  const activeItems = isTestsTab ? tests : assignedExams;

  const activeTotal = activeItems.length;
  const totalPages = Math.max(1, Math.ceil(activeTotal / pageSize));
  const currentPage = Math.min(page, totalPages);
  const sliceStart = (currentPage - 1) * pageSize;

  const visibleItems = activeItems.slice(sliceStart, sliceStart + pageSize);

  const activeQuery = isTestsTab ? testsQuery : examsQuery;

  const isLoading =
    classesQuery.isLoading || (classes.length > 0 && activeQuery.isLoading);

  const isError = classesQuery.isError || activeQuery.isError;

  const isFetching = classesQuery.isFetching || activeQuery.isFetching;

  function selectTab(tab: LibraryTab) {
    setActiveTab(tab);
    setSearch("");
    setClassFilter("all");
    setStatusFilter("all");
    setPage(1);
  }

  function changePage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), Math.max(totalPages, 1)));
  }

  function changePageSize(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  function refreshActiveTab() {
    void classesQuery.refetch();

    if (isTestsTab) {
      void testsQuery.refetch();
    } else {
      void examsQuery.refetch();
    }
  }

  return (
    <div className="space-y-4">
      <nav
        className="relative flex items-center rounded-[2px] border border-[#DDE2EB] bg-white px-2 shadow-[0_1px_3px_rgba(30,41,59,0.04)]"
        aria-label="Loại đề trong thư viện"
      >
        <button
          type="button"
          onClick={() => selectTab("tests")}
          className={`relative px-4 pb-4 pt-4 text-sm font-semibold transition-colors ${
            isTestsTab
              ? "text-[#E11D48]"
              : "text-[#526079] hover:text-[#1E293B]"
          }`}
        >
          Bài tập kiểm tra
          {isTestsTab ? (
            <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#E11D48]" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => selectTab("exams")}
          className={`relative px-4 pb-4 pt-4 text-sm font-semibold transition-colors ${
            !isTestsTab
              ? "text-[#E11D48]"
              : "text-[#526079] hover:text-[#1E293B]"
          }`}
        >
          Đề thi
          {!isTestsTab ? (
            <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#E11D48]" />
          ) : null}
        </button>
      </nav>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-bold text-[#1E293B]">
            {isTestsTab ? "Danh sách bài tập kiểm tra" : "Danh sách đề thi"}
          </h1>

          <p className="mt-1 text-xs text-[#64748B]">
            {isTestsTab
              ? "Các bài kiểm tra được giao trong những lớp bạn đã tham gia."
              : "Các đề thi được giao trong những lớp bạn đã tham gia."}
          </p>
        </div>

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
            value={classFilter}
            onChange={(event) => {
              setClassFilter(event.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-[7px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none focus:border-[#7889FA] md:w-[190px]"
          >
            <option value="all">Tất cả lớp học</option>

            {classes.map((classroom) => (
              <option key={classroom.id} value={String(classroom.id)}>
                {classroom.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter);
              setPage(1);
            }}
            className="h-9 w-full rounded-[7px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none focus:border-[#7889FA] md:w-[170px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="upcoming">Chưa mở</option>
            <option value="active">Đang diễn ra</option>
            <option value="closed">Đã hết hạn</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
              <tr>
                <th className="px-3.5 py-3.5">
                  {isTestsTab ? "Bài kiểm tra" : "Đề thi"}
                </th>
                <th className="px-3.5 py-3.5">Lớp học</th>
                <th className="px-3.5 py-3.5">Câu hỏi</th>
                <th className="px-3.5 py-3.5">Thời lượng</th>
                <th className="px-3.5 py-3.5">Hạn nộp</th>
                <th className="px-3.5 py-3.5">Lượt làm</th>
                <th className="px-3.5 py-3.5">Trạng thái</th>
                <th className="px-3.5 py-3.5 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-[#7C879B]"
                  >
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-rose-600"
                  >
                    Không thể tải danh sách được giao.
                  </td>
                </tr>
              ) : visibleItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-[#1E293B]"
                  >
                    {classes.length === 0
                      ? "Bạn chưa tham gia lớp học nào."
                      : isTestsTab
                        ? "Chưa có bài kiểm tra nào được giao."
                        : "Chưa có đề thi nào được giao."}
                  </td>
                </tr>
              ) : (
                visibleItems.map(({ exam, classroom }) => (
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
                      {exam.attemptCount ?? 0}
                    </td>

                    <td className="px-3.5 py-2.5">
                      <ExamStatusBadge exam={exam} now={now} />
                    </td>

                    <td className="px-3.5 py-2.5 text-right">
                      <StudentExamAction exam={exam} now={now} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
    </div>
  );
}
