"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Clock,
  LoaderCircle,
  RefreshCcw,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ClassExamStatusTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info";

export type ClassExamAvailability = "upcoming" | "active" | "closed";

export interface ClassExamTableItem {
  id: string | number;
  title: string;
  description?: string | null;
  durationMinutes: number;
  maximumScore: string;
  statusLabel: string;
  statusTone?: ClassExamStatusTone;
  availability?: ClassExamAvailability;
}

export interface ClassExamListProps {
  title: string;
  itemLabel: string;
  searchPlaceholder?: string;
  items: ClassExamTableItem[];
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void | Promise<void>;
  renderAction: (item: ClassExamTableItem) => ReactNode;
}

const STATUS_CLASSES: Record<ClassExamStatusTone, string> = {
  success: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border border-amber-200 bg-amber-50 text-amber-700",
  danger: "border border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border border-slate-200 bg-slate-50 text-slate-700",
  info: "border border-sky-200 bg-sky-50 text-sky-700",
};

export function ClassExamList({
  title,
  itemLabel,
  searchPlaceholder = "Tìm bài thi...",
  items,
  isLoading,
  error,
  onRetry,
  renderAction,
}: ClassExamListProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const keyword = search.trim().toLocaleLowerCase("vi");

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        [item.title, item.description].some((value) =>
          value?.toLocaleLowerCase("vi").includes(keyword),
        ),
      ),
    [items, keyword],
  );

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const currentPage = Math.min(page, pageCount);

  const visibleItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-[#1E293B]">
        {title}
      </h2>

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
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-[6px] border border-[#DDE2EB] bg-white pl-9 pr-3 text-xs outline-none placeholder:text-[#A6AFBF] focus:border-[#7889FA]"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-left">
            <colgroup>
              <col className="w-[44%]" />
              <col className="w-[15%]" />
              <col className="w-[13%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
            </colgroup>

            <thead className="bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
              <tr className="border-b border-[#DDE2EB]">
                <th className="px-4 py-3.5">{itemLabel}</th>
                <th className="px-4 py-3.5">Thời lượng</th>
                <th className="px-4 py-3.5">Điểm tối đa</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="h-28 px-4 text-center text-[#64748B]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="size-4 animate-spin" />
                      Đang tải danh sách...
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
              ) : visibleItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="h-28 px-4 text-center text-[#64748B]"
                  >
                    Không tìm thấy dữ liệu nào!
                  </td>
                </tr>
              ) : (
                visibleItems.map((item) => (
                  <tr
                    key={item.id}
                    className="h-[66px] transition-colors hover:bg-[#F8FAFC]"
                  >
                    <td className="align-middle px-4 py-2.5">
                      <p className="truncate font-medium text-[#111827]">
                        {item.title}
                      </p>

                      {item.description ? (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </td>

                    <td className="align-middle px-4 py-2.5 text-[#526079]">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="size-3.5" />
                        {item.durationMinutes} phút
                      </span>
                    </td>

                    <td className="align-middle px-4 py-2.5 text-[#526079]">
                      {item.maximumScore}
                    </td>

                    <td className="align-middle px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          STATUS_CLASSES[item.statusTone ?? "neutral"],
                        )}
                      >
                        {item.statusLabel}
                      </span>
                    </td>

                    <td className="align-middle px-4 py-2.5 text-right">
                      <div className="ml-auto flex w-[104px] items-center justify-end">
                        {renderAction(item)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="grid min-h-16 items-center gap-3 border-t border-[#DDE2EB] px-4 py-3 text-xs text-[#526079] sm:grid-cols-[1fr_auto_1fr]">
          <p>
            Hiển thị tối đa {pageSize} hàng, tổng số{" "}
            <span className="font-semibold text-[#1E293B]">
              {filteredItems.length}
            </span>{" "}
            {itemLabel.toLocaleLowerCase("vi")}
          </p>

          <div className="flex items-center justify-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={currentPage === 1}
              onClick={() => setPage(1)}
              aria-label="Trang đầu"
            >
              <ChevronFirst className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              aria-label="Trang trước"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <span className="flex size-8 items-center justify-center rounded-[4px] bg-[#4169F7] font-semibold text-white">
              {currentPage}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              aria-label="Trang sau"
            >
              <ChevronRight className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={currentPage === pageCount}
              onClick={() => setPage(pageCount)}
              aria-label="Trang cuối"
            >
              <ChevronLast className="size-4" />
            </Button>
          </div>

          <p className="text-right">
            Trang {currentPage}/{pageCount}
          </p>
        </div>
      </div>
    </div>
  );
}
