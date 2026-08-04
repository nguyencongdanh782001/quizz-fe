"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StudentResultsTable } from "@/components/features/student/student-results-table";
import { getStudentResults } from "@/lib/student-system-results";

export default function StudentRecentPage() {
  const resultsQuery = useQuery({
    queryKey: ["student", "recent", "results"],
    queryFn: getStudentResults,
    staleTime: 60_000,
  });
  const items = useMemo(
    () => resultsQuery.data?.items ?? [],
    [resultsQuery.data?.items],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#1E293B]">Truy cập gần đây</h1>
        <p className="mt-1 text-xs text-[#64748B]">
          Các đề thi gần nhất được xác định từ lịch sử nộp bài của bạn.
        </p>
      </div>

      <StudentResultsTable
        items={items}
        isLoading={resultsQuery.isLoading}
        isError={resultsQuery.isError}
        countLabel="đề thi"
        emptyMessage="Không tìm thấy đề thi nào."
        loadingMessage="Đang tải hoạt động gần đây..."
        errorMessage="Không thể tải hoạt động gần đây. Vui lòng thử lại."
      />
    </div>
  );
}
