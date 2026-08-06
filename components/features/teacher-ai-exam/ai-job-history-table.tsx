"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FolderOpen,
  History,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusLabel, isJobFailed, isJobRunning } from "./utils";

export interface AIExamHistoryItem {
  approvedCount: number;
  classId: string | null;
  createdAt: string;
  grade?: string;
  id: number;
  qcCost?: number;
  questionCount: number;
  scope: "system" | "class";
  status: string;
  subject?: string;
  title: string;
  topic?: string;
  updatedAt: string;
}

interface AIJobHistoryTableProps {
  items: AIExamHistoryItem[];
  onOpen: (jobId: number) => void;
  onRefresh: () => void;
}

const PAGE_SIZE = 5;
const ALL_CATEGORIES = "__all_categories__";
const ALL_STATUSES = "__all_statuses__";

function formatDateTime(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Vừa tạo";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function getCategory(item: AIExamHistoryItem): string {
  const subject = item.subject?.trim() || "Chưa xác định";
  const grade = item.grade?.trim();

  return grade ? `${subject} - ${grade}` : subject;
}

function getInputLabel(item: AIExamHistoryItem): string {
  const parts = [item.topic, item.subject, item.grade]
    .map((value) => value?.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(" - ") : item.title;
}

function getStatusGroup(status: string): "failed" | "running" | "completed" {
  if (isJobFailed(status)) {
    return "failed";
  }

  if (isJobRunning(status)) {
    return "running";
  }

  return "completed";
}

export function AIJobHistoryTable({
  items,
  onOpen,
  onRefresh,
}: AIJobHistoryTableProps) {
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [status, setStatus] = useState(ALL_STATUSES);
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => Array.from(new Set(items.map(getCategory))).sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (category !== ALL_CATEGORIES && getCategory(item) !== category) {
        return false;
      }

      if (status !== ALL_STATUSES && getStatusGroup(item.status) !== status) {
        return false;
      }

      return true;
    });
  }, [category, items, status]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function changeCategory(nextValue: string) {
    setCategory(nextValue);
    setPage(1);
  }

  function changeStatus(nextValue: string) {
    setStatus(nextValue);
    setPage(1);
  }

  return (
    <section className="overflow-hidden rounded-[8px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
      <div className="flex flex-col gap-3 border-b border-[#E8ECF2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <div>
            <h2 className="text-sm font-bold text-[#1E293B]">
              Lịch sử tác vụ AI
            </h2>
            <p className="mt-0.5 text-[11px] text-[#64748B]">
              Theo dõi các lần tạo đề, trạng thái xử lý và mở lại nội dung nháp.
            </p>
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="size-3.5" />
          Làm mới
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8ECF2] px-4 py-3">
        <select
          value={category}
          onChange={(event) => changeCategory(event.target.value)}
          className="h-9 min-w-44 rounded-[6px] border border-[#DDE2EB] bg-white px-3 text-xs text-[#334155] outline-none focus:border-primary"
        >
          <option value={ALL_CATEGORIES}>Tất cả phân loại</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => changeStatus(event.target.value)}
          className="h-9 min-w-40 rounded-[6px] border border-[#DDE2EB] bg-white px-3 text-xs text-[#334155] outline-none focus:border-primary"
        >
          <option value={ALL_STATUSES}>Tất cả trạng thái</option>
          <option value="completed">Hoàn tất</option>
          <option value="running">Đang xử lý</option>
          <option value="failed">Có lỗi</option>
        </select>

        <span className="ml-auto text-xs font-semibold text-primary">
          {filteredItems.length} tác vụ
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-xs">
          <thead className="bg-[#F6F7FA] text-[#334155]">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Thời gian</th>
              <th className="px-4 py-3 font-semibold">Phân loại</th>
              <th className="px-4 py-3 font-semibold">Dữ liệu đầu vào</th>
              <th className="px-4 py-3 text-center font-semibold">EduToken</th>
              <th className="px-4 py-3 text-center font-semibold">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-right font-semibold">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E8ECF2]">
            {pageItems.length > 0 ? (
              pageItems.map((item) => {
                const failed = isJobFailed(item.status);
                const running = isJobRunning(item.status);

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[#334155]">
                      EA-{String(item.id).padStart(6, "0")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#64748B]">
                      {formatDateTime(item.updatedAt || item.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#334155]">
                      {getCategory(item)}
                    </td>
                    <td className="max-w-[360px] px-4 py-3">
                      <p className="truncate font-medium text-[#334155]">
                        {getInputLabel(item)}
                      </p>
                      <p className="mt-1 text-[11px] text-[#94A3B8]">
                        {item.approvedCount}/{item.questionCount} câu đã duyệt
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-[#334155]">
                      {item.qcCost ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          failed
                            ? "destructive"
                            : running
                              ? "warning"
                              : "success"
                        }
                      >
                        {getStatusLabel(item.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpen(item.id)}
                        >
                          <Eye className="size-3.5" />
                          Xem
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onOpen(item.id)}
                        >
                          <FolderOpen className="size-3.5" />
                          Mở lại
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-[#94A3B8]"
                >
                  Chưa có tác vụ AI phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#E8ECF2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#64748B]">
          Hiển thị {pageItems.length} / {filteredItems.length} tác vụ
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={safePage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="flex size-8 items-center justify-center rounded-[6px] bg-primary text-xs font-bold text-white">
            {safePage}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={safePage >= totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
