"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookOpenText,
  CalendarDays,
  FileText,
  LibraryBig,
  LoaderCircle,
  RefreshCcw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ClassDocumentListItem {
  id: string | number;
  title: string;
  description?: string | null;
  createdAt?: string | null;
  scopeLabel?: string;
  statusLabel?: string;
  classroomName?: string | null;
  href?: string;
}

export interface ClassDocumentListProps {
  title?: string;
  items: ClassDocumentListItem[];
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void | Promise<void>;
  renderAction?: (item: ClassDocumentListItem) => ReactNode;
}

function formatDocumentDate(value?: string | null): string {
  if (!value) {
    return "Chưa có ngày tạo";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Chưa có ngày tạo";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function ClassDocumentList({
  title = "Tài liệu lớp học",
  items,
  isLoading,
  error,
  onRetry,
  renderAction,
}: ClassDocumentListProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-[#1E293B]">
        {title}
      </h2>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center rounded-[10px] border border-[#DDE2EB] bg-white text-sm text-[#64748B] shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
          <LoaderCircle className="mr-2 size-4 animate-spin" />
          Đang tải danh sách tài liệu...
        </div>
      ) : error ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-[10px] border border-rose-200 bg-white px-6 text-center shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
          <p className="text-sm text-rose-600">{error}</p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void onRetry()}
          >
            <RefreshCcw className="size-3.5" />
            Thử lại
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-[10px] border border-[#DDE2EB] bg-white px-6 py-10 text-center shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
          <FileText className="size-8 text-[#A6AFBF]" />

          <h3 className="mt-3 text-sm font-semibold text-[#1E293B]">
            Chưa có tài liệu nào
          </h3>

          <p className="mt-1 max-w-xl text-xs leading-5 text-[#64748B]">
            Tài liệu được thêm cho lớp sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex h-full min-w-0 flex-col rounded-[8px] border border-[#DDE2EB] bg-white p-4 shadow-[0_1px_3px_rgba(30,41,59,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#C5CCF9] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge variant="success">
                    {item.statusLabel ?? "Đã chia sẻ"}
                  </Badge>

                  {item.classroomName ? (
                    <Badge variant="outline" className="max-w-32 truncate">
                      {item.classroomName}
                    </Badge>
                  ) : null}
                </div>

                {renderAction ? (
                  <div className="shrink-0">{renderAction(item)}</div>
                ) : null}
              </div>

              <div className="mt-4 min-w-0">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="line-clamp-2 font-display text-lg font-semibold leading-6 text-on-surface transition-colors hover:text-primary"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <h3 className="line-clamp-2 font-display text-lg font-semibold leading-6 text-on-surface">
                    {item.title}
                  </h3>
                )}

                <p className="mt-2 line-clamp-3 min-h-15 text-xs leading-5 text-muted-foreground">
                  {item.description || "Không có mô tả."}
                </p>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <div className="flex min-w-0 items-center gap-2 rounded-[6px] bg-surface-container-low px-3 py-2.5">
                  <CalendarDays className="size-4 shrink-0 text-primary" />

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                      Ngày tạo
                    </p>

                    <p className="mt-1 truncate text-xs text-on-surface">
                      {formatDocumentDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-2 rounded-[6px] bg-surface-container-low px-3 py-2.5">
                  <BookOpenText className="size-4 shrink-0 text-primary" />

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                      Phạm vi hiển thị
                    </p>

                    <p className="mt-1 truncate text-xs text-on-surface">
                      {item.classroomName || "Tài liệu lớp học"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-start gap-2 border-t border-[#E9EDF3] pt-4 text-[11px] leading-5 text-muted-foreground">
                <LibraryBig className="mt-0.5 size-3.5 shrink-0" />

                {item.href ? (
                  <Link
                    href={item.href}
                    className="line-clamp-2 transition-colors hover:text-primary"
                  >
                    Chọn tài liệu để xem nội dung chi tiết.
                  </Link>
                ) : (
                  <span className="line-clamp-2">
                    Chọn tài liệu để xem nội dung chi tiết.
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
