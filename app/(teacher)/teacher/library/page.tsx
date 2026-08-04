"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  HelpCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceEmpty } from "@/components/shared/workspace-tabs";
import { TeacherDocumentsScreen } from "@/app/(teacher)/teacher/documents/teacher-documents-screen";
import { DEFAULT_TEACHER_DOCUMENT_FILTERS } from "@/lib/teacher-document-filters";
import { useTeacherSystemExams } from "@/hooks/queries/useTeacherSystemExams";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Chưa cập nhật" : dateFormatter.format(date);
}

function ExamLibraryContent() {
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("all");
  const examsQuery = useTeacherSystemExams({
    sort_by: "updated_at",
    sort_order: "desc",
  });
  const items = useMemo(
    () => examsQuery.data?.items ?? [],
    [examsQuery.data?.items],
  );
  const keyword = search.trim().toLocaleLowerCase("vi");
  const grades = useMemo(
    () => Array.from(new Set(items.filter((item) => item.is_published).map((item) => item.grade).filter(Boolean))).sort(),
    [items],
  );
  const filtered = useMemo(
    () =>
      items.filter((exam) => {
        if (!exam.is_published) return false;
        if (
          keyword &&
          ![exam.title, exam.description, exam.grade].some((value) =>
            value.toLocaleLowerCase("vi").includes(keyword),
          )
        ) {
          return false;
        }
        if (grade !== "all" && exam.grade !== grade) return false;
        return true;
      }),
    [grade, items, keyword],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#1E293B]">Ngân hàng đề thi</h1>
        <p className="mt-1 text-xs text-[#64748B]">
          Tìm kiếm, rà soát và mở lại các đề thi hệ thống của bạn.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit space-y-4 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
          <div className="flex items-center gap-2 border-b border-[#E3E7EE] pb-3">
            <SlidersHorizontal className="size-4 text-[#4F62F2]" />
            <h2 className="text-sm font-bold text-[#1E293B]">Lọc kết quả</h2>
          </div>
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold text-[#526079]">Trình độ</span>
            <select value={grade} onChange={(event) => setGrade(event.target.value)} className="h-10 w-full rounded-[6px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none focus:border-[#7889FA]">
              <option value="all">Tất cả trình độ</option>
              {grades.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-[6px] text-xs font-semibold"
            onClick={() => {
              setSearch("");
              setGrade("all");
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </aside>

        <section className="min-w-0 overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
          <div className="flex flex-col gap-3 border-b border-[#DDE2EB] p-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-[320px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7C879B]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nhập từ khóa tìm kiếm..."
                className="h-10 w-full rounded-[6px] border border-[#DDE2EB] bg-white pl-9 pr-3 text-xs outline-none transition-colors placeholder:text-[#A6AFBF] focus:border-[#7889FA]"
              />
            </label>
            <p className="shrink-0 text-sm text-[#1E293B]">
              <span className="font-bold text-[#4F62F2]">{filtered.length}</span> kết quả
            </p>
          </div>

          <div className="p-4">
            {examsQuery.isLoading ? (
              <div className="px-6 py-20 text-center text-xs text-[#7C879B]">Đang tải ngân hàng đề thi...</div>
            ) : examsQuery.isError ? (
              <div className="rounded-[6px] border border-rose-200 bg-rose-50 px-6 py-20 text-center text-xs text-rose-600">Không thể tải ngân hàng đề thi.</div>
            ) : filtered.length === 0 ? (
              <WorkspaceEmpty title="Không tìm thấy đề thi phù hợp." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filtered.map((exam) => (
                  <article key={exam.id} className="overflow-hidden rounded-[6px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.08)] transition-all hover:border-[#B8C2FF] hover:shadow-md">
                    <div
                      className="flex h-32 w-full items-center justify-center bg-[#EEF2FF] bg-cover bg-center"
                      style={exam.image_url ? { backgroundImage: `url(${exam.image_url})` } : undefined}
                    >
                      {!exam.image_url ? (
                        <div className="flex flex-col items-center gap-2 text-[#7C879B]">
                          <BookOpen className="size-8 text-[#4F62F2]" />
                          <span className="text-[11px]">Chưa có ảnh</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-[4px] bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#4050DC]">{exam.grade || "Chưa phân loại"}</span>
                        <span className={exam.is_published ? "rounded-[4px] bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700" : "rounded-[4px] bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"}>
                          {exam.is_published ? "Đã xuất bản" : "Bản nháp"}
                        </span>
                      </div>
                      <h3 className="mt-2 truncate text-xs font-bold leading-5 text-[#1E293B]" title={exam.title}>{exam.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#526079]">
                        <span className="inline-flex items-center gap-1"><HelpCircle className="size-3.5" />{exam.question_count} câu hỏi</span>
                        <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{formatDate(exam.updated_at)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-[#E3E7EE] pt-2">
                        <span className="text-[10.5px] text-[#7C879B]">{exam.attempt_count} lượt làm</span>
                        <Link href={`/teacher/exams/edit?edit=${exam.id}`} className="rounded-[4px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:opacity-95">
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
export default function TeacherLibraryPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "documents" ? "documents" : "exams";

  return (
    <div className="space-y-4">
      {activeTab === "documents" ? (
        <TeacherDocumentsScreen
          initialFilters={DEFAULT_TEACHER_DOCUMENT_FILTERS}
          embeddedInLibrary
        />
      ) : (
        <ExamLibraryContent />
      )}
    </div>
  );
}
