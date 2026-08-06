"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { ExamCard } from "@/components/features/exam/exam-card";
import { useStudentExploreExams } from "@/hooks/queries/use-student-explore-exams";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ExamDifficulty } from "@/types/exam.types";

const ALL_GRADES = "__all_grades__";
const ALL_SUBJECTS = "__all_subjects__";
const ALL_DIFFICULTIES = "__all_difficulties__";

const DIFFICULTY_OPTIONS: Array<{
  value: ExamDifficulty;
  label: string;
}> = [
  {
    value: "easy",
    label: "Dễ",
  },
  {
    value: "medium",
    label: "Trung bình",
  },
  {
    value: "hard",
    label: "Khó",
  },
];

export default function ExploreExamsPage() {
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<ExamDifficulty | "">("");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStudentExploreExams({
    assignmentType: "exam",
    sort: "newest",
  });

  const exams = data?.items ?? [];
  const totalExams = data?.total ?? 0;

  const gradeOptions = useMemo(() => {
    return Array.from(
      new Set(
        exams
          .map((exam) => exam.grade)
          .filter(
            (value): value is number => typeof value === "number" && value > 0,
          ),
      ),
    ).sort((left, right) => left - right);
  }, [exams]);

  const subjectOptions = useMemo(() => {
    return Array.from(
      new Set(
        exams
          .map((exam) => exam.subject?.trim())
          .filter(
            (value): value is string =>
              Boolean(value) &&
              value !== "Đề thi" &&
              value !== "Đề thi hệ thống",
          ),
      ),
    ).sort((left, right) => left.localeCompare(right, "vi"));
  }, [exams]);

  const filteredExams = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");

    return exams.filter((exam) => {
      if (
        keyword &&
        ![
          exam.title,
          exam.description ?? "",
          exam.subject ?? "",
          exam.classroomName ?? "",
        ].some((value) => value.toLocaleLowerCase("vi").includes(keyword))
      ) {
        return false;
      }

      if (grade !== "" && exam.grade !== grade) {
        return false;
      }

      if (subject && exam.subject !== subject) {
        return false;
      }

      if (difficulty && exam.difficulty !== difficulty) {
        return false;
      }

      return true;
    });
  }, [difficulty, exams, grade, search, subject]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    grade !== "" ||
    subject !== "" ||
    difficulty !== "";

  function resetFilters() {
    setSearch("");
    setGrade("");
    setSubject("");
    setDifficulty("");
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-[#1E293B]">Khám phá đề thi</h1>

        <p className="mt-1 text-xs leading-5 text-[#64748B]">
          Các đề thi được công khai bởi giáo viên và hệ thống. Tự do ôn luyện
          bất kỳ lúc nào.
        </p>
      </header>

      <div className="flex flex-col items-start gap-4 lg:flex-row">
        {/* Bộ lọc bên trái */}
        <aside className="w-full shrink-0 rounded-[10px] border border-[#DDE2EB] bg-white p-5 shadow-[0_1px_3px_rgba(30,41,59,0.05)] lg:w-[280px]">
          <div className="flex items-center gap-2 border-b border-[#E3E7EE] pb-4">
            <SlidersHorizontal className="size-4 text-[#4F62F2]" />

            <h2 className="text-sm font-bold text-[#1E293B]">Lọc kết quả</h2>
          </div>

          <div className="mt-5 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#526079]">
                Lớp
              </label>

              <Select
                value={grade === "" ? ALL_GRADES : String(grade)}
                onValueChange={(value) =>
                  setGrade(value === ALL_GRADES ? "" : Number(value))
                }
              >
                <SelectTrigger className="h-11 w-full rounded-[7px] border-[#DDE2EB] bg-white text-xs shadow-none">
                  <SelectValue placeholder="Tất cả lớp" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={ALL_GRADES}>Tất cả lớp</SelectItem>

                  {gradeOptions.map((gradeOption) => (
                    <SelectItem key={gradeOption} value={String(gradeOption)}>
                      Lớp {gradeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#526079]">
                Môn học
              </label>

              <Select
                value={subject || ALL_SUBJECTS}
                onValueChange={(value) =>
                  setSubject(value === ALL_SUBJECTS ? "" : value)
                }
              >
                <SelectTrigger className="h-11 w-full rounded-[7px] border-[#DDE2EB] bg-white text-xs shadow-none">
                  <SelectValue placeholder="Tất cả môn học" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={ALL_SUBJECTS}>Tất cả môn học</SelectItem>

                  {subjectOptions.map((subjectOption) => (
                    <SelectItem key={subjectOption} value={subjectOption}>
                      {subjectOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#526079]">
                Mức độ
              </label>

              <Select
                value={difficulty || ALL_DIFFICULTIES}
                onValueChange={(value) =>
                  setDifficulty(
                    value === ALL_DIFFICULTIES ? "" : (value as ExamDifficulty),
                  )
                }
              >
                <SelectTrigger className="h-11 w-full rounded-[7px] border-[#DDE2EB] bg-white text-xs shadow-none">
                  <SelectValue placeholder="Tất cả mức độ" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={ALL_DIFFICULTIES}>
                    Tất cả mức độ
                  </SelectItem>

                  {DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-[7px] border-[#DDE2EB] text-xs font-semibold"
              disabled={!hasActiveFilters}
              onClick={resetFilters}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </aside>

        {/* Danh sách đề bên phải */}
        <section className="min-w-0 flex-1 overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.04)]">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#E3E7EE] p-3.5">
            <div className="relative min-w-60 flex-1 sm:max-w-[400px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />

              <input
                type="search"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-[8px] border border-[#DDE2EB] bg-white pl-9 pr-3 text-xs text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#3F63F3]"
              />
            </div>

            <span className="ml-auto shrink-0 text-xs text-[#1E293B]">
              <strong className="text-[#3F63F3]">{filteredExams.length}</strong>{" "}
              kết quả
            </span>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="py-16 text-center text-xs text-[#94A3B8]">
                Đang tải danh sách đề thi...
              </div>
            ) : isError ? (
              <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-center">
                <p className="text-sm font-semibold text-red-800">
                  Không thể tải danh sách đề thi
                </p>

                <p className="mt-1 text-xs text-red-700">
                  {error instanceof Error
                    ? error.message
                    : "Đã xảy ra lỗi khi tải dữ liệu."}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => void refetch()}
                >
                  Thử lại
                </Button>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-[#475569]">
                  Không tìm thấy đề thi phù hợp
                </p>

                <p className="mt-2 text-xs text-[#94A3B8]">
                  Thử thay đổi từ khóa hoặc đặt lại bộ lọc.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} compact />
                  ))}
                </div>

                {hasNextPage ? (
                  <div className="mt-6 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isFetchingNextPage}
                      onClick={() => void fetchNextPage()}
                    >
                      {isFetchingNextPage
                        ? "Đang tải thêm..."
                        : "Tải thêm đề thi"}
                    </Button>
                  </div>
                ) : (
                  <p className="mt-6 text-center text-xs text-[#94A3B8]">
                    Đã hiển thị tất cả {totalExams} đề thi.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
