"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStudentClasses } from "@/lib/student-classes";
import { getStudentClassExams } from "@/lib/student-system-exams";
import { getStudentResults } from "@/lib/student-system-results";
import { useStudentSystemExams } from "@/hooks/queries/use-student-system-exams";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type StudentLibraryTab = "tests" | "exams";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value?: string | null) {
  if (!value) return "Không giới hạn";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa cập nhật"
    : dateTimeFormatter.format(date);
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
            className="h-9 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-2 pr-7 font-semibold text-[#3F63F3] outline-none"
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

export default function StudentLibraryPage() {
  const [activeTab, setActiveTab] = useState<StudentLibraryTab>("tests");
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const classesQuery = useQuery({
    queryKey: ["student", "library", "classes"],
    queryFn: getStudentClasses,
    staleTime: 60_000,
  });

  const resultsQuery = useQuery({
    queryKey: ["student", "library", "results"],
    queryFn: getStudentResults,
    staleTime: 60_000,
  });

  const systemExamsQuery = useStudentSystemExams({ limit: 50 });

  const classes = classesQuery.data ?? [];
  const classIds = classes.map((item) => item.id);

  const classExamsQuery = useQuery({
    queryKey: ["student", "library", "class-exams", classIds],
    queryFn: async () => {
      const groups = await Promise.all(
        classes.map(async (classroom) => ({
          classroom,
          result: await getStudentClassExams(classroom.id, { limit: 100 }),
        })),
      );
      return groups.flatMap(({ classroom, result }) =>
        result.items.map((exam) => ({ exam, classroom })),
      );
    },
    enabled: classesQuery.isSuccess && classes.length > 0,
    staleTime: 60_000,
  });

  const resultsMap = useMemo(() => {
    const map = new Map<string, { score: number; scorePercent: number; isPassed: boolean; submittedAt: string }>();
    for (const item of resultsQuery.data?.items ?? []) {
      if (!map.has(item.examId)) {
        map.set(item.examId, {
          score: item.score,
          scorePercent: item.scorePercent,
          isPassed: item.isPassed,
          submittedAt: item.submittedAt,
        });
      }
    }
    return map;
  }, [resultsQuery.data?.items]);

  const keyword = search.trim().toLocaleLowerCase("vi");

  const testsList = useMemo(() => {
    return (classExamsQuery.data ?? []).filter(({ exam, classroom }) => {
      if (
        keyword &&
        ![exam.title, exam.description, classroom.name].some((val) =>
          val.toLocaleLowerCase("vi").includes(keyword),
        )
      ) {
        return false;
      }
      if (scopeFilter !== "all" && classroom.id !== scopeFilter) {
        return false;
      }
      const attempt = resultsMap.get(exam.id);
      if (statusFilter === "completed" && !attempt) return false;
      if (statusFilter === "uncompleted" && attempt) return false;
      return true;
    });
  }, [classExamsQuery.data, keyword, resultsMap, scopeFilter, statusFilter]);

  const examsList = useMemo(() => {
    const items = systemExamsQuery.data?.items ?? [];
    return items.filter((exam) => {
      if (
        keyword &&
        ![exam.title, exam.description, exam.classroomName ?? ""].some((val) =>
          val.toLocaleLowerCase("vi").includes(keyword),
        )
      ) {
        return false;
      }
      if (scopeFilter !== "all" && String(exam.grade) !== scopeFilter) {
        return false;
      }
      return true;
    });
  }, [keyword, scopeFilter, systemExamsQuery.data?.items]);

  const isTestsTab = activeTab === "tests";
  const currentListLength = isTestsTab ? testsList.length : examsList.length;
  const totalPages = Math.max(1, Math.ceil(currentListLength / pageSize));

  const visibleTests = useMemo(() => {
    const start = (page - 1) * pageSize;
    return testsList.slice(start, start + pageSize);
  }, [page, pageSize, testsList]);

  const visibleExams = useMemo(() => {
    const start = (page - 1) * pageSize;
    return examsList.slice(start, start + pageSize);
  }, [examsList, page, pageSize]);

  const isLoading = isTestsTab
    ? classesQuery.isLoading || classExamsQuery.isLoading
    : systemExamsQuery.isLoading;

  const isFetching = isTestsTab
    ? classExamsQuery.isFetching
    : systemExamsQuery.isFetching;

  function selectTab(tab: StudentLibraryTab) {
    setActiveTab(tab);
    setSearch("");
    setScopeFilter("all");
    setStatusFilter("all");
    setPage(1);
  }

  function refreshActiveTab() {
    if (isTestsTab) {
      void classExamsQuery.refetch();
    } else {
      void systemExamsQuery.refetch();
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Tab Bar matching Teacher Giao đề style */}
      <nav
        className="relative flex items-center rounded-[2px] border border-[#DDE2EB] bg-white px-2 shadow-[0_1px_3px_rgba(30,41,59,0.04)]"
        aria-label="Loại bài tập thư viện"
      >
        <button
          type="button"
          onClick={() => selectTab("tests")}
          className={`relative px-4 py-4 text-sm font-semibold transition-colors ${
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
          className={`relative px-4 py-4 text-sm font-semibold transition-colors ${
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

      {/* Header section with Title and Refresh Button */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-bold text-[#1E293B]">
            {isTestsTab ? "Danh sách bài tập kiểm tra" : "Danh sách đề thi hệ thống"}
          </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            {isTestsTab
              ? "Theo dõi các bài kiểm tra được giao theo từng lớp học và mở nhanh trang làm bài."
              : "Khám phá các đề thi hệ thống để tự ôn luyện nâng cao kiến thức."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refreshActiveTab}
          className="h-9 gap-2 text-xs font-semibold text-[#1E293B]"
        >
          <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
          Làm mới
        </Button>
      </div>

      {/* Main Single Column Card Table matching Teacher Giao đề style */}
      <section className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.08)]">
        {/* Search and Filters Bar */}
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
              : [10, 11, 12].map((grade) => (
                  <option key={grade} value={String(grade)}>
                    Khối {grade}
                  </option>
                ))}
          </select>

          {isTestsTab ? (
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-[7px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none focus:border-[#7889FA] md:w-[170px]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="uncompleted">Chưa nộp</option>
              <option value="completed">Đã nộp</option>
            </select>
          ) : null}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isTestsTab ? (
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#1E293B]">
                <tr>
                  <th className="px-3.5 py-3.5">Bài kiểm tra</th>
                  <th className="px-3.5 py-3.5">Lớp học</th>
                  <th className="px-3.5 py-3.5">Câu hỏi</th>
                  <th className="px-3.5 py-3.5">Thời lượng</th>
                  <th className="px-3.5 py-3.5">Hạn nộp</th>
                  <th className="px-3.5 py-3.5">Trạng thái nộp</th>
                  <th className="px-3.5 py-3.5">Trạng thái</th>
                  <th className="px-3.5 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EE] text-xs text-[#1E293B]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#7C879B]">
                      Đang tải danh sách bài kiểm tra...
                    </td>
                  </tr>
                ) : visibleTests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#7C879B]">
                      Không tìm thấy bài kiểm tra nào!
                    </td>
                  </tr>
                ) : (
                  visibleTests.map(({ exam, classroom }) => {
                    const attempt = resultsMap.get(exam.id);
                    return (
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
                          {exam.questionCount} câu
                        </td>
                        <td className="px-3.5 py-2.5 text-[#526079]">
                          {exam.duration} phút
                        </td>
                        <td className="px-3.5 py-2.5 text-[#526079]">
                          {formatDateTime(exam.updatedAt)}
                        </td>
                        <td className="px-3.5 py-2.5 font-medium">
                          {attempt ? (
                            <span className="font-semibold text-emerald-600">
                              Đã nộp ({Math.round(attempt.scorePercent)}%)
                            </span>
                          ) : (
                            <span className="text-[#94A3B8]">Chưa nộp</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="rounded-[4px] bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Đang diễn ra
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <Link
                            href={
                              attempt
                                ? `/student/exam/${exam.id}/result`
                                : `/student/exam/${exam.id}`
                            }
                            className="inline-flex items-center rounded-[6px] bg-[#3F63F3] px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#3451D1]"
                          >
                            {attempt ? "Xem kết quả" : "Vào thi"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#1E293B]">
                <tr>
                  <th className="px-3.5 py-3.5">Đề thi</th>
                  <th className="px-3.5 py-3.5">Khối / Lớp</th>
                  <th className="px-3.5 py-3.5">Câu hỏi</th>
                  <th className="px-3.5 py-3.5">Thời lượng</th>
                  <th className="px-3.5 py-3.5">Mức độ</th>
                  <th className="px-3.5 py-3.5">Trạng thái</th>
                  <th className="px-3.5 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EE] text-xs text-[#1E293B]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#7C879B]">
                      Đang tải danh sách đề thi...
                    </td>
                  </tr>
                ) : visibleExams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#7C879B]">
                      Không tìm thấy đề thi nào!
                    </td>
                  </tr>
                ) : (
                  visibleExams.map((exam) => (
                    <tr
                      key={exam.id}
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
                        {exam.classroomName || `Khối ${exam.grade || "hệ thống"}`}
                      </td>
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        {exam.questionCount} câu
                      </td>
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        {exam.duration} phút
                      </td>
                      <td className="px-3.5 py-2.5 text-[#526079]">
                        {exam.difficulty === "easy"
                          ? "Dễ"
                          : exam.difficulty === "hard"
                            ? "Khó"
                            : "Trung bình"}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="rounded-[4px] bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Công khai
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <Link
                          href={`/student/exam/${exam.id}`}
                          className="inline-flex items-center rounded-[6px] bg-[#3F63F3] px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#3451D1]"
                        >
                          Vào thi
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Standardized Pagination Footer matching Image 2 */}
        <PaginationFooter
          page={page}
          pageSize={pageSize}
          total={currentListLength}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </section>
    </div>
  );
}
