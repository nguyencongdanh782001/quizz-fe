"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
} from "lucide-react";
import { ExamCard } from "@/components/features/exam/exam-card";
import { ExamDifficulty } from "@/types/exam.types";
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
import { PageHero } from "@/components/shared/page-hero";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { AppEmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

const difficultyOptions: { value: ExamDifficulty | ""; label: string }[] = [
  { value: "", label: "Tất cả mức" },
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
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Thư viện đề thi"
        title="Khám phá đề thi phù hợp với nhịp học của bạn"
        description="Tìm kiếm nhanh theo lớp, mức độ và chủ đề để bước vào bài thi phù hợp ngay mà không cần rời khỏi luồng học tập."
        icon={Sparkles}
        actions={
          <Button asChild variant="outline" size="lg">
            <a href="#bo-loc-de-thi">Đi đến bộ lọc</a>
          </Button>
        }
        metrics={[
          {
            label: "Tổng đề thi",
            value: isLoading ? "--" : totalExams,
            description: "Đề thi hệ thống sẵn sàng để bắt đầu ngay.",
            icon: BookOpen,
            tone: "primary",
          },
          {
            label: "Mức độ hiển thị",
            value: isLoading ? "--" : difficultyOptions.length - 1,
            description: "Các nhóm độ khó để bạn chọn nhịp ôn luyện phù hợp.",
            icon: Trophy,
            tone: "secondary",
          },
        ]}
      />

      <SurfacePanel tone="muted" className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm đề thi..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest pl-10 pr-4 shadow-none"
          />
        </div>
        <button
          onClick={() => setShowFilters((value) => !value)}
          className={cn(
            "cursor-pointer flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium",
            "border transition-colors shrink-0",
            showFilters || activeFilterCount > 0
              ? "bg-primary text-white border-primary"
              : "bg-surface-container-lowest text-on-surface border-outline/20 hover:bg-surface-container-low",
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Bộ lọc
          {activeFilterCount > 0 ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </SurfacePanel>

      {showFilters ? (
        <SurfacePanel
          tone="muted"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div>
            <Label className="mb-2 block text-xs font-medium text-on-surface-variant">
              Lớp học
            </Label>
            <Select
              value={classroom || ALL_SUBJECTS}
              onValueChange={(value) =>
                setClassroom(value === ALL_SUBJECTS ? "" : value)
              }
            >
              <SelectTrigger className="h-12 rounded-2xl border-outline/15 bg-surface shadow-none">
                <SelectValue placeholder="Tất cả lớp học" />
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
            <Label className="mb-2 block text-xs font-medium text-on-surface-variant">
              Khối lớp
            </Label>
            <Select
              value={grade === "" ? ALL_GRADES : String(grade)}
              onValueChange={(value) =>
                setGrade(value === ALL_GRADES ? "" : Number(value))
              }
            >
              <SelectTrigger className="h-12 rounded-2xl border-outline/15 bg-surface shadow-none">
                <SelectValue placeholder="Tất cả khối" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={ALL_GRADES}>Tất cả khối</SelectItem>
                {gradeOptions.map((gradeOption) => (
                  <SelectItem key={gradeOption} value={String(gradeOption)}>
                    Lớp {gradeOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-xs font-medium text-on-surface-variant">
              Mức độ
            </Label>
            <Select
              value={difficulty || ALL_DIFFICULTIES}
              onValueChange={(value) =>
                setDifficulty(
                  value === ALL_DIFFICULTIES ? "" : (value as ExamDifficulty),
                )
              }
            >
              <SelectTrigger className="h-12 rounded-2xl border-outline/15 bg-surface shadow-none">
                <SelectValue placeholder="Tất cả mức" />
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
        </SurfacePanel>
      ) : null}

      {isLoading ? (
        <SurfacePanel className="py-12 text-center text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Đang tải đề thi</p>
          <p className="text-sm mt-1">Vui lòng chờ trong giây lát</p>
        </SurfacePanel>
      ) : filtered.length === 0 ? (
        <AppEmptyState
          icon={BookOpen}
          title={
            items.length === 0
              ? "Chưa có đề thi hệ thống nào"
              : "Không tìm thấy đề thi nào"
          }
          description={
            items.length === 0
              ? "Hệ thống sẽ hiển thị đề thi mới tại đây ngay khi có dữ liệu."
              : "Thử thay đổi bộ lọc hoặc từ khóa để khám phá thêm đề thi phù hợp."
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Hiển thị {filtered.length} trong {items.length} đề thi
            {items.length < totalExams ? ` (tổng ${totalExams})` : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
          <div ref={sentinelRef} className="h-10" aria-hidden />
          <p className="text-center text-sm text-muted-foreground">
            {isFetchingNextPage
              ? "Đang tải thêm..."
              : !hasNextPage
                ? `Đã hiển thị tất cả ${totalExams} đề thi.`
                : null}
          </p>
        </>
      )}
    </div>
  );
}
