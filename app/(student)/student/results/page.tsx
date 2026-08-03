"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StudentResultsTable } from "@/components/features/student/student-results-table";
import { getStudentResults } from "@/lib/student-system-results";
import { cn } from "@/lib/utils";

type ResultTab = "classroom" | "contest";

const resultTabs: Array<{ value: ResultTab; label: string }> = [
  { value: "classroom", label: "Bài kiểm tra" },
  { value: "contest", label: "Kỳ thi" },
];

export default function StudentResultsPage() {
  const [activeTab, setActiveTab] = useState<ResultTab>("classroom");
  const resultsQuery = useQuery({
    queryKey: ["student", "results"],
    queryFn: getStudentResults,
    staleTime: 60_000,
  });
  const items = useMemo(
    () => resultsQuery.data?.items ?? [],
    [resultsQuery.data?.items],
  );
  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (activeTab === "classroom") return item.scope !== "system";
        if (activeTab === "contest") return item.scope === "system";
        return true;
      }),
    [activeTab, items],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#1E293B]">Kết quả thi</h1>
        <p className="mt-1 text-xs text-[#64748B]">
          Theo dõi điểm số và chi tiết các lượt nộp bài.
        </p>
      </div>

      <StudentResultsTable
        key={activeTab}
        items={visibleItems}
        isLoading={resultsQuery.isLoading}
        isError={resultsQuery.isError}
        countLabel="kết quả"
        emptyMessage="Chưa có dữ liệu kết quả thi trong mục này."
        loadingMessage="Đang tải kết quả..."
        errorMessage="Không thể tải kết quả thi. Vui lòng thử lại."
        header={
          <div className="overflow-x-auto border-b border-[#E3E7EE] px-4 pt-3">
            <div className="flex min-w-max gap-7">
              {resultTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "relative h-10 pb-3 text-xs font-semibold transition-colors",
                    activeTab === tab.value
                      ? "text-[#3B82F6]"
                      : "text-[#64748B] hover:text-[#1E293B]",
                  )}
                >
                  {tab.label}
                  {activeTab === tab.value ? (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#3B82F6]" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}
