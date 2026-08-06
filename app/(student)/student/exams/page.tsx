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
import type { Exam } from "@/types/exam.types";

const ALL_CLASSES = "__all_classes__";
const ALL_SUBJECTS = "__all_subjects__";
const ALL_TOPICS = "__all_topics__";

function getClassificationTag(
  exam: Exam,
  prefix: "class" | "subject" | "topic",
): string {
  const marker = `${prefix}:`;
  const tag = exam.tags.find((item) => item.startsWith(marker));

  return tag?.slice(marker.length).trim() ?? "";
}

function normalizeText(value?: string | null): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("vi");
}

export default function ExploreExamsPage() {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(ALL_CLASSES);
  const [selectedSubject, setSelectedSubject] = useState(ALL_SUBJECTS);
  const [selectedTopic, setSelectedTopic] = useState(ALL_TOPICS);

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

  const exams = useMemo(() => data?.items ?? [], [data?.items]);
  const totalExams = data?.total ?? 0;

  const classifiedExams = useMemo(
    () =>
      exams.map((exam) => ({
        exam,
        className:
          getClassificationTag(exam, "class") ||
          (exam.grade > 0
            ? `Lớp ${exam.grade}`
            : exam.classroomName?.trim() || "Chưa phân loại"),
        subjectName:
          getClassificationTag(exam, "subject") || exam.subject?.trim() || "",
        topicName: getClassificationTag(exam, "topic"),
      })),
    [exams],
  );

  const classOptions = useMemo(
    () =>
      Array.from(
        new Set(
          classifiedExams.map(({ className }) => className).filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right, "vi")),
    [classifiedExams],
  );

  const subjectOptions = useMemo(
    () =>
      Array.from(
        new Set(
          classifiedExams
            .filter(({ className }) => {
              return (
                selectedClass === ALL_CLASSES || className === selectedClass
              );
            })
            .map(({ subjectName }) => subjectName)
            .filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right, "vi")),
    [classifiedExams, selectedClass],
  );

  const topicOptions = useMemo(
    () =>
      Array.from(
        new Set(
          classifiedExams
            .filter(({ className, subjectName }) => {
              if (
                selectedClass !== ALL_CLASSES &&
                className !== selectedClass
              ) {
                return false;
              }

              if (
                selectedSubject !== ALL_SUBJECTS &&
                subjectName !== selectedSubject
              ) {
                return false;
              }

              return true;
            })
            .map(({ topicName }) => topicName)
            .filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right, "vi")),
    [classifiedExams, selectedClass, selectedSubject],
  );

  const filteredExams = useMemo(() => {
    const keyword = normalizeText(search);

    return classifiedExams
      .filter(({ exam, className, subjectName, topicName }) => {
        if (keyword) {
          const matchesKeyword = [
            exam.title,
            exam.description,
            className,
            subjectName,
            topicName,
            exam.classroomName,
          ].some((value) => normalizeText(value).includes(keyword));

          if (!matchesKeyword) {
            return false;
          }
        }

        if (selectedClass !== ALL_CLASSES && className !== selectedClass) {
          return false;
        }

        if (
          selectedSubject !== ALL_SUBJECTS &&
          subjectName !== selectedSubject
        ) {
          return false;
        }

        if (selectedTopic !== ALL_TOPICS && topicName !== selectedTopic) {
          return false;
        }

        return true;
      })
      .map(({ exam }) => exam);
  }, [classifiedExams, search, selectedClass, selectedSubject, selectedTopic]);

  function resetFilters() {
    setSearch("");
    setSelectedClass(ALL_CLASSES);
    setSelectedSubject(ALL_SUBJECTS);
    setSelectedTopic(ALL_TOPICS);
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

      <div className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-[10px] border border-[#DDE2EB] bg-white p-5 shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
          <div className="flex items-center gap-2 border-b border-[#E3E7EE] pb-4">
            <SlidersHorizontal className="size-4 text-[#4F62F2]" />

            <h2 className="text-sm font-bold text-[#1E293B]">Lọc kết quả</h2>
          </div>

          <div className="mt-5 space-y-5">
            <label className="block space-y-2">
              <span className="text-xs font-semibold text-[#526079]">Lớp</span>

              <Select
                value={selectedClass}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  setSelectedSubject(ALL_SUBJECTS);
                  setSelectedTopic(ALL_TOPICS);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-[7px] border-[#DDE2EB] bg-white text-xs shadow-none">
                  <SelectValue placeholder="Tất cả lớp" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={ALL_CLASSES}>Tất cả lớp</SelectItem>

                  {classOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold text-[#526079]">
                Môn học
              </span>

              <Select
                value={selectedSubject}
                onValueChange={(value) => {
                  setSelectedSubject(value);
                  setSelectedTopic(ALL_TOPICS);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-[7px] border-[#DDE2EB] bg-white text-xs shadow-none">
                  <SelectValue placeholder="Tất cả môn học" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={ALL_SUBJECTS}>Tất cả môn học</SelectItem>

                  {subjectOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold text-[#526079]">
                Chủ đề
              </span>

              <Select
                value={selectedTopic}
                disabled={selectedSubject === ALL_SUBJECTS}
                onValueChange={setSelectedTopic}
              >
                <SelectTrigger className="h-11 w-full rounded-[7px] border-[#DDE2EB] bg-white text-xs shadow-none disabled:cursor-not-allowed disabled:bg-[#F5F7FA] disabled:text-[#94A3B8]">
                  <SelectValue
                    placeholder={
                      selectedSubject === ALL_SUBJECTS
                        ? "Chọn môn học trước"
                        : "Tất cả chủ đề"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={ALL_TOPICS}>Tất cả chủ đề</SelectItem>

                  {topicOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-[7px] border-[#DDE2EB] text-xs font-semibold"
              onClick={resetFilters}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.04)]">
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
                <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
