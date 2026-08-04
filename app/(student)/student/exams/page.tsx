"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Filter, Search, X } from "lucide-react";
import { ExamCard } from "@/components/features/exam/exam-card";
import type { ExamDifficulty } from "@/types/exam.types";
import { useStudentSystemExams } from "@/hooks/queries/use-student-system-exams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const difficultyOptions: { value: ExamDifficulty | ""; label: string }[] = [
  { value: "", label: "Tất cả mức độ" },
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
];

const ALL_SUBJECTS = "__all_subjects__";
const ALL_GRADES = "__all_grades__";
const ALL_DIFFICULTIES = "__all_difficulties__";

export default function ExamsPage() {
  const [search, setSearch] = useState("");
  const [classroom, setClassroom] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [difficulty, setDifficulty] = useState<ExamDifficulty | "">("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStudentSystemExams();

  const items = data?.items ?? [];
  const totalExams = data?.total ?? 0;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const classroomOptions = Array.from(
    new Set(
      items
        .map((exam) => exam.classroomName?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b, "vi"));

  const gradeOptions = Array.from(
    new Set(items.map((exam) => exam.grade).filter((item) => item > 0)),
  ).sort((a, b) => a - b);

  const filtered = items.filter((exam) => {
    const keyword = search.trim().toLowerCase();

    if (
      keyword &&
      ![exam.title, exam.description, exam.classroomName ?? ""].some((value) =>
        value.toLowerCase().includes(keyword),
      )
    ) {
      return false;
    }
    if (classroom && exam.classroomName !== classroom) return false;
    if (grade && exam.grade !== grade) return false;
    if (difficulty && exam.difficulty !== difficulty) return false;
    return true;
  });

  const activeFilterCount = [classroom, grade, difficulty].filter(
    Boolean,
  ).length;

  function resetFilters() {
    setSearch("");
    setClassroom("");
    setGrade("");
    setDifficulty("");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#1E293B]">Đề thi</h1>
        <p className="mt-1 text-xs text-[#64748B]">
          Các đề thi gần nhất được xác định từ hệ thống học tập của bạn.
        </p>
      </div>

      {/* Main Container Card matching Truy cập gần đây (Image 3) */}
      <section className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.04)]">
        {/* Header row inside card: Count + Search + Filter Funnel Icon grouped on the left */}
        <div className="flex flex-wrap items-center gap-3.5 border-b border-[#E3E7EE] p-3.5">
          <span className="shrink-0 text-xs font-bold text-[#3F63F3]">
            {filtered.length} Đề thi
          </span>

          <div className="relative w-56 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 w-full rounded-[6px] border border-[#ECECEC] bg-white pl-9 pr-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3]"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowFilterDrawer(true)}
            className={cn(
              "relative size-9 shrink-0 rounded-[6px] border border-[#ECECEC] text-[#3F63F3] hover:bg-[#EEF2FF]",
              activeFilterCount > 0 && "border-[#3F63F3] bg-[#EEF2FF]",
            )}
            aria-label="Mở bộ lọc"
          >
            <Filter className="size-4" />
            {activeFilterCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#E11D48] text-[10px] font-bold text-white shadow-sm">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#94A3B8]">
              Đang tải danh sách đề thi...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#94A3B8]">
              Không tìm thấy đề thi nào.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
              <div ref={sentinelRef} className="h-10" aria-hidden />
              <p className="pt-2 text-center text-xs text-[#94A3B8]">
                {isFetchingNextPage
                  ? "Đang tải thêm..."
                  : !hasNextPage
                    ? `Đã hiển thị tất cả ${totalExams} đề thi.`
                    : null}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Slide-over Filter Drawer from Right Side (Matching Reference Image 2) */}
      <AnimatePresence>
        {showFilterDrawer ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterDrawer(false)}
              className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-[#DDE2EB] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#E3E7EE] px-5 py-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilterDrawer(false)}
                    className="rounded-[6px] p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
                    aria-label="Đóng bộ lọc"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <h2 className="text-base font-bold text-[#1E293B]">
                    Lọc kết quả
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilterDrawer(false)}
                  className="rounded-[6px] p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
                  aria-label="Đóng bộ lọc"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div>
                  <Label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">
                    Từ khóa tìm kiếm
                  </Label>
                  <Input
                    type="text"
                    placeholder="Nhập tên đề thi, mô tả..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-10 rounded-[8px] border-[#E3E7EE] text-xs outline-none focus:border-[#3F63F3]"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">
                    Lớp học
                  </Label>
                  <Select
                    value={classroom || ALL_SUBJECTS}
                    onValueChange={(value) =>
                      setClassroom(value === ALL_SUBJECTS ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-10 rounded-[8px] border-[#E3E7EE] bg-white text-xs shadow-none">
                      <SelectValue placeholder="Chọn Lớp học" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value={ALL_SUBJECTS}>Tất cả lớp học</SelectItem>
                      {classroomOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">
                    Khối lớp
                  </Label>
                  <Select
                    value={grade === "" ? ALL_GRADES : String(grade)}
                    onValueChange={(value) =>
                      setGrade(value === ALL_GRADES ? "" : Number(value))
                    }
                  >
                    <SelectTrigger className="h-10 rounded-[8px] border-[#E3E7EE] bg-white text-xs shadow-none">
                      <SelectValue placeholder="Chọn Khối lớp" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value={ALL_GRADES}>Tất cả khối</SelectItem>
                      {gradeOptions.map((gradeOption) => (
                        <SelectItem
                          key={gradeOption}
                          value={String(gradeOption)}
                        >
                          Khối {gradeOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">
                    Mức độ / Độ khó
                  </Label>
                  <Select
                    value={difficulty || ALL_DIFFICULTIES}
                    onValueChange={(value) =>
                      setDifficulty(
                        value === ALL_DIFFICULTIES
                          ? ""
                          : (value as ExamDifficulty),
                      )
                    }
                  >
                    <SelectTrigger className="h-10 rounded-[8px] border-[#E3E7EE] bg-white text-xs shadow-none">
                      <SelectValue placeholder="Chọn Mức độ" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {difficultyOptions.map((option) => (
                        <SelectItem
                          key={option.value || ALL_DIFFICULTIES}
                          value={option.value || ALL_DIFFICULTIES}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-[#E3E7EE] bg-white p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1 rounded-[8px] border-0 bg-[#F1F5F9] text-xs font-bold text-[#475569] hover:bg-[#E2E8F0]"
                  onClick={resetFilters}
                >
                  Xoá bộ lọc
                </Button>
                <Button
                  type="button"
                  className="h-10 flex-1 rounded-[8px] bg-[#3F63F3] text-xs font-bold text-white hover:bg-[#3151D8]"
                  onClick={() => setShowFilterDrawer(false)}
                >
                  Áp dụng
                </Button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
