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

const SUBJECT_NAMES = [
  "Toán",
  "Toán học",
  "Ngữ văn",
  "Tiếng Anh",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Lịch sử",
  "Địa lý",
  "Địa lí",
  "Tin học",
  "Công nghệ",
  "Giáo dục công dân",
  "GDCD",
  "Y học",
  "Dược học",
] as const;

const NORMALIZED_SUBJECT_NAMES = new Set(
  SUBJECT_NAMES.map((subject) => subject.trim().toLocaleLowerCase("vi")),
);

type NamedValue = {
  name?: string | null;
};

type ExamClassificationFields = {
  grade?: string | null;
  grade_name?: string | null;
  class_name?: string | null;
  level_name?: string | null;
  subject?: string | NamedValue | null;
  subject_name?: string | null;
  topic?: string | NamedValue | null;
  topic_name?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Chưa cập nhật"
    : dateFormatter.format(date);
}

function normalizeText(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("vi");
}

function getObjectName(value?: string | NamedValue | null): string {
  if (typeof value === "string") {
    return value.trim();
  }

  return value?.name?.trim() ?? "";
}

/**
 * Dữ liệu cũ có thể nằm chung trong grade:
 * "Khác - Đại học Y Dược - Sinh học - Khác"
 *
 * Hàm này tạm tách thành:
 * className: "Đại học Y Dược"
 * subjectName: "Sinh học"
 * topicName: "Khác"
 *
 * Khi backend trả riêng grade_name, subject_name, topic_name,
 * hàm sẽ ưu tiên các trường riêng đó.
 */
function getExamClassification(exam: ExamClassificationFields) {
  const directClass =
    exam.class_name?.trim() ||
    exam.grade_name?.trim() ||
    exam.level_name?.trim() ||
    "";

  const directSubject =
    exam.subject_name?.trim() || getObjectName(exam.subject);

  const directTopic = exam.topic_name?.trim() || getObjectName(exam.topic);

  const rawGrade = String(exam.grade ?? "").trim();

  if (!rawGrade) {
    return {
      className: directClass || "Chưa phân loại",
      subjectName: directSubject || "",
      topicName: directTopic || "",
    };
  }

  /*
   * Dữ liệu mới được lưu theo đúng bốn vị trí:
   *
   * Trình độ - Trường học - Môn học - Chủ đề
   *
   * Ví dụ khi Trường học đang trống:
   * "Lớp 12 -  - Toán học"
   *
   * Không được filter(Boolean), vì sẽ làm mất vị trí Trường học
   * và khiến Toán học bị đọc sai cột.
   */
  const positionalParts = rawGrade.split(" - ").map((item) => item.trim());

  const hasEmptyMiddlePosition = positionalParts.some((item) => item === "");

  if (hasEmptyMiddlePosition) {
    return {
      className: directClass || positionalParts[0] || "Chưa phân loại",

      subjectName: directSubject || positionalParts[2] || "",

      topicName: directTopic || positionalParts[3] || "",
    };
  }

  /*
   * Hỗ trợ dữ liệu cũ dạng rút gọn:
   * "Lớp 12 - Toán học"
   */
  if (
    positionalParts.length === 2 &&
    NORMALIZED_SUBJECT_NAMES.has(normalizeText(positionalParts[1]))
  ) {
    return {
      className: directClass || positionalParts[0] || "Chưa phân loại",

      subjectName: directSubject || positionalParts[1] || "",

      topicName: directTopic || "",
    };
  }

  /*
   * Hỗ trợ dữ liệu đầy đủ cũ:
   * "Khác - Đại học Y Dược - Sinh học - Khác"
   */
  const subjectIndex = positionalParts.findIndex((item) =>
    NORMALIZED_SUBJECT_NAMES.has(normalizeText(item)),
  );

  const detectedSubject =
    subjectIndex >= 0 ? positionalParts[subjectIndex] : "";

  const possibleClassParts =
    subjectIndex >= 0
      ? positionalParts.slice(0, subjectIndex)
      : positionalParts;

  const detectedClass =
    possibleClassParts.find((item) => /^Lớp\s+\d+$/i.test(item)) ||
    [...possibleClassParts]
      .reverse()
      .find((item) =>
        /(Mầm non|Tiểu học|THCS|THPT|Trung cấp|Cao đẳng|Đại học)/i.test(item),
      ) ||
    positionalParts[0] ||
    "";

  const detectedTopic =
    subjectIndex >= 0 && subjectIndex < positionalParts.length - 1
      ? positionalParts
          .slice(subjectIndex + 1)
          .filter(Boolean)
          .join(" - ")
      : "";

  return {
    className: directClass || detectedClass || "Chưa phân loại",

    subjectName: directSubject || detectedSubject || "",

    topicName: directTopic || detectedTopic || "",
  };
}

/**
 * API trả: /image/hình tạo đề 4.jpeg
 * File nằm tại: public/image/hình tạo đề 4.jpeg
 * Vì vậy phải giữ nguyên /image/, không đổi thành /images/.
 */
function resolveImageUrl(value?: string | null): string | null {
  const imageUrl = value?.trim();

  if (!imageUrl) return null;

  if (
    /^https?:\/\//i.test(imageUrl) ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return encodeURI(imageUrl);
  }

  const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return encodeURI(normalizedPath);
}

function ExamThumbnail({
  imageUrl,
  title,
}: {
  imageUrl?: string | null;
  title: string;
}) {
  const resolvedUrl = useMemo(() => resolveImageUrl(imageUrl), [imageUrl]);

  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const hasError = resolvedUrl !== null && failedUrl === resolvedUrl;

  if (!resolvedUrl || hasError) {
    return (
      <div className="flex h-32 w-full flex-col items-center justify-center gap-2 bg-[#EEF2FF] text-[#7C879B]">
        <BookOpen className="size-8 text-[#4F62F2]" />

        <span className="text-[11px]">
          {hasError ? "Không tải được ảnh" : "Chưa có ảnh"}
        </span>
      </div>
    );
  }

  return (
    <div className="h-32 w-full overflow-hidden bg-[#EEF2FF]">
      <img
        src={resolvedUrl}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        onError={() => {
          setFailedUrl(resolvedUrl);
        }}
      />
    </div>
  );
}

function ExamLibraryContent() {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");

  const examsQuery = useTeacherSystemExams({
    assignment_type: "exam",
    sort_by: "updated_at",
    sort_order: "desc",
  });

  const items = useMemo(
    () => examsQuery.data?.items ?? [],
    [examsQuery.data?.items],
  );

  const keyword = normalizeText(search);

  const classifiedItems = useMemo(
    () =>
      items.map((exam) => ({
        exam,
        ...getExamClassification(exam),
      })),
    [items],
  );

  const classOptions = useMemo(() => {
    return Array.from(
      new Set(
        classifiedItems
          .filter(({ exam }) => exam.is_published)
          .map(({ className }) => className)
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, "vi"));
  }, [classifiedItems]);

  const subjectOptions = useMemo(() => {
    return Array.from(
      new Set(
        classifiedItems
          .filter(({ exam, className }) => {
            if (!exam.is_published) return false;

            if (selectedClass !== "all" && className !== selectedClass) {
              return false;
            }

            return true;
          })
          .map(({ subjectName }) => subjectName)
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, "vi"));
  }, [classifiedItems, selectedClass]);

  const topicOptions = useMemo(() => {
    return Array.from(
      new Set(
        classifiedItems
          .filter(({ exam, className, subjectName }) => {
            if (!exam.is_published) return false;

            if (selectedClass !== "all" && className !== selectedClass) {
              return false;
            }

            if (selectedSubject !== "all" && subjectName !== selectedSubject) {
              return false;
            }

            return true;
          })
          .map(({ topicName }) => topicName)
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, "vi"));
  }, [classifiedItems, selectedClass, selectedSubject]);

  const filtered = useMemo(
    () =>
      classifiedItems.filter(({ exam, className, subjectName, topicName }) => {
        if (!exam.is_published) return false;

        if (keyword) {
          const searchableValues = [
            exam.title,
            exam.description,
            className,
            subjectName,
            topicName,
          ];

          const matchesKeyword = searchableValues.some((value) =>
            normalizeText(value).includes(keyword),
          );

          if (!matchesKeyword) return false;
        }

        if (selectedClass !== "all" && className !== selectedClass) {
          return false;
        }

        if (selectedSubject !== "all" && subjectName !== selectedSubject) {
          return false;
        }

        if (selectedTopic !== "all" && topicName !== selectedTopic) {
          return false;
        }

        return true;
      }),
    [classifiedItems, keyword, selectedClass, selectedSubject, selectedTopic],
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
            <span className="text-[11px] font-semibold text-[#526079]">
              Lớp
            </span>

            <select
              value={selectedClass}
              onChange={(event) => {
                setSelectedClass(event.target.value);
                setSelectedSubject("all");
                setSelectedTopic("all");
              }}
              className="h-10 w-full truncate rounded-[6px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none focus:border-[#7889FA]"
            >
              <option value="all">Tất cả lớp</option>

              {classOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-[11px] font-semibold text-[#526079]">
              Môn học
            </span>

            <select
              value={selectedSubject}
              onChange={(event) => {
                setSelectedSubject(event.target.value);
                setSelectedTopic("all");
              }}
              className="h-10 w-full truncate rounded-[6px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none focus:border-[#7889FA]"
            >
              <option value="all">Tất cả môn học</option>

              {subjectOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-[11px] font-semibold text-[#526079]">
              Chủ đề
            </span>

            <select
              value={selectedTopic}
              disabled={selectedSubject === "all"}
              onChange={(event) => {
                setSelectedTopic(event.target.value);
              }}
              className="h-10 w-full truncate rounded-[6px] border border-[#DDE2EB] bg-white px-3 text-xs outline-none disabled:cursor-not-allowed disabled:bg-[#F5F7FA] disabled:text-[#94A3B8] focus:border-[#7889FA]"
            >
              <option value="all">
                {selectedSubject === "all"
                  ? "Chọn môn học trước"
                  : "Tất cả chủ đề"}
              </option>

              {topicOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-[6px] text-xs font-semibold"
            onClick={() => {
              setSearch("");
              setSelectedClass("all");
              setSelectedSubject("all");
              setSelectedTopic("all");
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
              <span className="font-bold text-[#4F62F2]">
                {filtered.length}
              </span>{" "}
              kết quả
            </p>
          </div>

          <div className="p-4">
            {examsQuery.isLoading ? (
              <div className="px-6 py-20 text-center text-xs text-[#7C879B]">
                Đang tải ngân hàng đề thi...
              </div>
            ) : examsQuery.isError ? (
              <div className="rounded-[6px] border border-rose-200 bg-rose-50 px-6 py-20 text-center text-xs text-rose-600">
                Không thể tải ngân hàng đề thi.
              </div>
            ) : filtered.length === 0 ? (
              <WorkspaceEmpty title="Không tìm thấy đề thi phù hợp." />
            ) : (
              <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filtered.map(({ exam, className }) => (
                  <article
                    key={exam.id}
                    className="flex h-full min-w-0 flex-col overflow-hidden rounded-[6px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.08)] transition-all hover:border-[#B8C2FF] hover:shadow-md"
                  >
                    <ExamThumbnail
                      imageUrl={exam.image_url}
                      title={exam.title}
                    />

                    <div className="flex flex-1 flex-col p-3">
                      <div className="flex min-h-6 items-center justify-between gap-2">
                        <span
                          title={className || "Chưa phân loại"}
                          className="min-w-0 max-w-[150px] truncate whitespace-nowrap rounded-[4px] bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#4050DC]"
                        >
                          {className || "Chưa phân loại"}
                        </span>

                        <span
                          title={exam.is_published ? "Đã xuất bản" : "Bản nháp"}
                          className={
                            exam.is_published
                              ? "max-w-[82px] shrink-0 truncate whitespace-nowrap rounded-[4px] bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                              : "max-w-[82px] shrink-0 truncate whitespace-nowrap rounded-[4px] bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                          }
                        >
                          {exam.is_published ? "Đã xuất bản" : "Bản nháp"}
                        </span>
                      </div>

                      <h3
                        className="mt-2 min-h-10 line-clamp-2 text-xs font-bold leading-5 text-[#1E293B]"
                        title={exam.title}
                      >
                        {exam.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#526079]">
                        <span className="inline-flex items-center gap-1">
                          <HelpCircle className="size-3.5" />
                          {exam.question_count ?? 0} câu hỏi
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3.5" />
                          {formatDate(exam.updated_at)}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-[#E3E7EE] pt-2">
                        <span className="text-[10.5px] text-[#7C879B]">
                          {exam.attempt_count ?? 0} lượt làm
                        </span>

                        <Link
                          href={`/teacher/exams/edit?edit=${exam.id}`}
                          className="rounded-[4px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:opacity-95"
                        >
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

  const activeTab =
    searchParams.get("tab") === "documents" ? "documents" : "exams";

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
