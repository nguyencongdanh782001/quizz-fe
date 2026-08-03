"use client";

import { useMemo, useState } from "react";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Mail,
  RefreshCcw,
  Search,
} from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import type { ClassStudent } from "@/types/class.types";
import { formatDate } from "../utils";
import { RemoveStudentButton } from "./remove-student-button";

export function StudentTable({
  students,
  isLoading,
  error,
  isRemovingStudent,
  onRetry,
  onRemoveStudent,
}: {
  students: ClassStudent[];
  isLoading: boolean;
  error: string | null;
  isRemovingStudent: boolean;
  onRetry: () => void | Promise<void>;
  onRemoveStudent: (student: ClassStudent) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const keyword = search.trim().toLocaleLowerCase("vi");
  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        [student.name, student.email, student.studentCode].some((value) =>
          value?.toLocaleLowerCase("vi").includes(keyword),
        ),
      ),
    [keyword, students],
  );
  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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
            placeholder="Tìm học sinh..."
            className="h-10 w-full rounded-[6px] border border-[#DDE2EB] bg-white pl-9 pr-3 text-xs outline-none placeholder:text-[#A6AFBF] focus:border-[#7889FA]"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead className="bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
          <tr className="border-b border-[#DDE2EB]">
            {["Học sinh", "Email / Mã học sinh", "Ngày tham gia", "Hành động"].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-3.5 py-3.5 text-left"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
          {isLoading ? (
            <tr>
              <td colSpan={4} className="h-28 px-4 text-center text-[#64748B]">
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Đang tải danh sách học sinh...
                </span>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={4} className="h-28 px-4 text-center">
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
          ) : visibleStudents.length === 0 ? (
            <tr>
              <td colSpan={4} className="h-28 px-4 text-center text-[#64748B]">
                Không tìm thấy dữ liệu nào!
              </td>
            </tr>
          ) : visibleStudents.map((student) => (
            <tr
              key={student.id}
              className="transition-colors hover:bg-[#F8FAFC]"
            >
              <td className="px-3.5 py-2.5">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    avatarUrl={student.avatarUrl}
                    fullName={student.name}
                    className="h-9 w-9"
                    fallbackClassName="text-sm"
                  />
                  <div>
                    <p className="font-medium text-[#111827]">
                      {student.name}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-3.5 py-2.5 text-[#526079]">
                <div className="space-y-1">
                  {student.email ? (
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      {student.email}
                    </span>
                  ) : (
                    <span>Chưa có email</span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Mã học sinh: {student.studentCode}
                  </p>
                </div>
              </td>
              <td className="px-3.5 py-2.5 text-[#526079]">
                {formatDate(student.joinedAt)}
              </td>
              <td className="px-3.5 py-2.5">
                <RemoveStudentButton
                  disabled={isRemovingStudent}
                  onClick={() => onRemoveStudent(student)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="flex min-h-16 flex-col gap-3 border-t border-[#DDE2EB] px-4 py-3 text-xs text-[#526079] sm:flex-row sm:items-center sm:justify-between">
        <p>
          Hiển thị tối đa {pageSize} hàng, tổng số{" "}
          <span className="font-semibold text-[#1E293B]">
            {filteredStudents.length}
          </span>{" "}
          học sinh
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" disabled={currentPage === 1} onClick={() => setPage(1)} aria-label="Trang đầu">
            <ChevronFirst className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Trang trước">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="flex size-8 items-center justify-center rounded-[4px] bg-[#4169F7] font-semibold text-white">
            {currentPage}
          </span>
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
