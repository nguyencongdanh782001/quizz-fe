"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { exportTeacherStudentsToExcel } from "@/lib/export-teacher-students";
import {
  getTeacherStudents,
  type TeacherStudentRecord,
} from "@/lib/teacher-classes";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function formatJoinedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StudentRow({ student }: { student: TeacherStudentRecord }) {
  return (
    <tr className="transition-colors hover:bg-[#F8FAFC]">
      <td className="px-4 py-3 font-medium text-[#111827]">
        {student.studentCode || student.id}
      </td>
      <td className="px-3.5 py-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={student.avatarUrl}
            fullName={student.name}
            className="size-9"
          />
          <span className="font-semibold text-[#1E293B]">{student.name}</span>
        </div>
      </td>
      <td className="px-3.5 py-3 text-[#475569]">
        {student.email || "Chưa cập nhật"}
      </td>
      <td className="px-3.5 py-3 text-[#1E293B]">{student.classroomName}</td>
      <td className="px-3.5 py-3 text-[#475569]">
        {formatJoinedDate(student.joinedAt)}
      </td>
      <td className="px-3.5 py-3">
        <Button
          asChild
          size="sm"
          className="h-9 rounded-[5px] bg-[#4F46E5] px-3 text-xs text-white hover:bg-[#4338CA]"
        >
          <Link href={`/teacher/classes/${student.classroomId}`}>
            <ExternalLink className="size-4" />
            Mở lớp
          </Link>
        </Button>
      </td>
    </tr>
  );
}

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  const [classroomId, setClassroomId] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const studentsQuery = useQuery({
    queryKey: ["teacher-students"],
    queryFn: getTeacherStudents,
  });

  const students = studentsQuery.data ?? [];
  const classrooms = Array.from(
    new Map(
      students.map((student) => [
        student.classroomId,
        student.classroomName,
      ]),
    ),
  );
  const normalizedSearch = search.trim().toLocaleLowerCase("vi");
  const filteredStudents = students.filter((student) => {
    const matchesClassroom =
      classroomId === "all" || student.classroomId === classroomId;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [student.name, student.email, student.studentCode, student.classroomName]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(normalizedSearch);

    return matchesClassroom && matchesSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleStudents = filteredStudents.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const canGoBack = safePage > 1;
  const canGoForward = safePage < totalPages;

  function changeFilters(next: () => void) {
    next();
    setPage(1);
  }

  async function handleExportExcel() {
    if (filteredStudents.length === 0 || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await exportTeacherStudentsToExcel(filteredStudents);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1E293B]">
            Quản lý học sinh
          </h1>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Theo dõi học sinh theo từng lớp và xuất danh sách khi cần.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="h-9 rounded-[4px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-3.5 text-xs font-semibold text-white shadow-sm hover:opacity-95"
            onClick={() => void handleExportExcel()}
            disabled={filteredStudents.length === 0 || isExporting}
          >
            {isExporting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="size-4" />
            )}
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button
            type="button"
            className="h-9 rounded-[4px] bg-[#3F63F3] px-3.5 text-xs font-semibold text-white hover:bg-[#3554D8]"
            onClick={() => void studentsQuery.refetch()}
            disabled={studentsQuery.isFetching}
          >
            <RefreshCw
              className={`size-4 ${studentsQuery.isFetching ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.08)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E3E7EE] p-3">
          <label className="relative block w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="search"
              value={search}
              onChange={(event) =>
                changeFilters(() => setSearch(event.target.value))
              }
              placeholder="Nhập từ khóa tìm kiếm..."
              className="h-10 w-full rounded-[7px] border border-[#DDE2EB] bg-white pl-10 pr-3 text-xs text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4F62F2]"
            />
          </label>

          <label className="relative block w-full sm:w-64">
            <select
              value={classroomId}
              onChange={(event) =>
                changeFilters(() => setClassroomId(event.target.value))
              }
              className="h-10 w-full appearance-none rounded-[7px] border border-[#DDE2EB] bg-white px-3 pr-9 text-xs text-[#475569] outline-none focus:border-[#4F62F2]"
              aria-label="Lọc theo lớp học"
            >
              <option value="all">Tất cả lớp học</option>
              {classrooms.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#DDE2EB] bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
                <th className="w-36 px-4 py-3.5">Mã học sinh</th>
                <th className="min-w-52 px-3.5 py-3.5">Họ tên</th>
                <th className="min-w-56 px-3.5 py-3.5">Email</th>
                <th className="min-w-44 px-3.5 py-3.5">Lớp học</th>
                <th className="w-36 px-3.5 py-3.5">Ngày tham gia</th>
                <th className="w-32 px-3.5 py-3.5">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE2EB] text-xs">
              {studentsQuery.isPending ? (
                <tr>
                  <td colSpan={6} className="h-28 text-center text-[#64748B]">
                    <LoaderCircle className="mr-2 inline size-4 animate-spin" />
                    Đang tải danh sách học sinh...
                  </td>
                </tr>
              ) : studentsQuery.isError ? (
                <tr>
                  <td colSpan={6} className="h-28 text-center text-red-600">
                    Không thể tải danh sách học sinh. Vui lòng thử lại.
                  </td>
                </tr>
              ) : visibleStudents.length > 0 ? (
                visibleStudents.map((student) => (
                  <StudentRow
                    key={`${student.classroomId}-${student.id}`}
                    student={student}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="h-28 text-center text-[#64748B]">
                    Không tìm thấy dữ liệu nào!
                  </td>
                </tr>
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
            <span>của tổng số {filteredStudents.length}</span>
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
      </section>
    </div>
  );
}
