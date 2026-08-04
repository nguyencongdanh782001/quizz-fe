"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Search,
} from "lucide-react";
import { getStudentClasses, joinStudentClass } from "@/lib/student-classes";
import type { ClassInfo } from "@/types/class.types";
import { Button } from "@/components/ui/button";

const ALL_GRADES = "__all_grades__";
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

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

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [isJoiningClass, setIsJoiningClass] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let isMounted = true;

    async function loadClasses() {
      try {
        const joinedClasses = await getStudentClasses();

        if (!isMounted) {
          return;
        }

        setClasses(joinedClasses);
      } finally {
        if (isMounted) {
          setIsLoadingClasses(false);
        }
      }
    }

    void loadClasses();

    return () => {
      isMounted = false;
    };
  }, []);

  const gradeOptions = useMemo(
    () =>
      Array.from(
        new Set(classes.map((cls) => cls.grade).filter((g) => g > 0)),
      ).sort((a, b) => a - b),
    [classes],
  );

  const filtered = useMemo(() => {
    return classes.filter((cls) => {
      if (search && !cls.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (grade && cls.grade !== grade) return false;
      return true;
    });
  }, [classes, grade, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const visibleClasses = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  async function handleJoinClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedJoinCode = joinCode.trim().toUpperCase();

    if (!normalizedJoinCode) {
      setJoinError("Vui lòng nhập mã vào lớp.");
      setJoinSuccess(null);
      return;
    }

    setIsJoiningClass(true);
    setJoinError(null);
    setJoinSuccess(null);

    try {
      const joinedClass = await joinStudentClass(normalizedJoinCode);

      setClasses((current) => {
        const withoutDuplicate = current.filter(
          (cls) => cls.id !== joinedClass.id,
        );
        return [joinedClass, ...withoutDuplicate];
      });
      setJoinCode("");
      setJoinSuccess(`Đã tham gia lớp ${joinedClass.name}.`);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Không thể tham gia lớp học. Vui lòng thử lại.";

      setJoinError(message);
    } finally {
      setIsJoiningClass(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Clean Page Title Header */}
      <div>
        <h1 className="text-lg font-bold text-[#1E293B]">Lớp học của tôi</h1>
        <p className="mt-1 text-xs text-[#64748B]">
          Theo dõi các lớp học đang tham gia và nhập mã do giáo viên cung cấp để tham gia lớp mới.
        </p>
      </div>

      {/* Card: Tham gia lớp bằng mã */}
      <div className="rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-[0_1px_3px_rgba(30,41,59,0.04)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1E293B]">Tham gia lớp bằng mã</h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Nhập mã lớp do giáo viên cung cấp để thêm lớp học vào tài khoản của bạn.
            </p>
          </div>

          <form
            onSubmit={(event) => void handleJoinClass(event)}
            className="flex items-center gap-2 sm:w-auto"
          >
            <input
              type="text"
              placeholder="Ví dụ: IT01"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              className="h-9 w-44 rounded-[6px] border border-[#ECECEC] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3]"
              maxLength={30}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isJoiningClass}
              className="h-9 rounded-[6px] bg-[#3F63F3] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#3451D1]"
            >
              {isJoiningClass ? "Đang xử lý..." : "Tham gia lớp"}
            </Button>
          </form>
        </div>

        {joinError && (
          <p className="mt-2 text-xs font-medium text-red-600">{joinError}</p>
        )}

        {joinSuccess && (
          <p className="mt-2 text-xs font-medium text-emerald-600">{joinSuccess}</p>
        )}
      </div>

      {/* Main Container Card matching Table layout */}
      <section className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.04)]">
        {/* Header row: Count + Search grouped on left side */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E7EE] p-3.5">
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-xs font-bold text-[#3F63F3]">
              {filtered.length} Lớp học
            </span>

            <div className="relative w-56 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-full rounded-[6px] border border-[#ECECEC] bg-white pl-9 pr-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3]"
              />
            </div>
          </div>

          <select
            value={grade === "" ? ALL_GRADES : String(grade)}
            onChange={(e) => {
              setGrade(e.target.value === ALL_GRADES ? "" : Number(e.target.value));
              setPage(1);
            }}
            className="h-9 rounded-[6px] border border-[#ECECEC] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3]"
          >
            <option value={ALL_GRADES}>Tất cả khối</option>
            {gradeOptions.map((g) => (
              <option key={g} value={String(g)}>
                Khối {g}
              </option>
            ))}
          </select>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#1E293B]">
              <tr>
                <th className="px-3.5 py-3.5">Lớp học</th>
                <th className="px-3.5 py-3.5">Mã vào lớp</th>
                <th className="px-3.5 py-3.5">Đề thi</th>
                <th className="px-3.5 py-3.5">Tài liệu</th>
                <th className="px-3.5 py-3.5">Trạng thái</th>
                <th className="px-3.5 py-3.5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EE] text-xs text-[#1E293B]">
              {isLoadingClasses ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#94A3B8]">
                    Đang tải danh sách lớp học...
                  </td>
                </tr>
              ) : visibleClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-[#94A3B8]">
                    {classes.length === 0
                      ? "Bạn chưa tham gia lớp học nào."
                      : "Không tìm thấy lớp học nào."}
                  </td>
                </tr>
              ) : (
                visibleClasses.map((cls) => (
                  <tr
                    key={cls.id}
                    className="transition-colors hover:bg-[#F8FAFC]"
                  >
                    <td className="max-w-72 px-3.5 py-3">
                      <p className="truncate font-bold text-[#1E293B]">
                        {cls.name}
                      </p>
                      <p className="mt-0.5 truncate text-[10.5px] text-[#7C879B]">
                        {cls.description || "Lớp học của tôi"}
                      </p>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="rounded-[4px] border border-[#DDE2EB] bg-[#F7F8FB] px-2 py-0.5 font-mono text-[11px] font-bold text-[#3F63F3]">
                        {cls.joinCode || cls.inviteCode || "--"}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-[#526079]">
                      {cls.examCount ?? 0} đề thi
                    </td>
                    <td className="px-3.5 py-3 text-[#526079]">
                      {cls.documentCount ?? 0} tài liệu
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="rounded-[4px] bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Đã tham gia
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right">
                      <Link
                        href={`/student/classes/${cls.id}`}
                        className="inline-flex items-center rounded-[6px] bg-gradient-to-r from-[#4169F7] to-[#C837ED] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90"
                      >
                        <ExternalLink className="mr-1.5 size-3.5" />
                        Vào lớp
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Standardized Pagination Footer matching Image */}
        <PaginationFooter
          page={page}
          pageSize={pageSize}
          total={filtered.length}
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
