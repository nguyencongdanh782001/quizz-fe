"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ExamCard } from "@/components/features/exam/exam-card";
import { getStudentSystemExams } from "@/lib/student-system-exams";
import { Exam, ExamDifficulty } from "@/types/exam.types";
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
  { value: "", label: "Tất cả mức" },
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
];

const ALL_SUBJECTS = "__all_subjects__";
const ALL_GRADES = "__all_grades__";
const ALL_DIFFICULTIES = "__all_difficulties__";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [search, setSearch] = useState("");
  const [classroom, setClassroom] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [difficulty, setDifficulty] = useState<ExamDifficulty | "">("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadExams() {
      try {
        const items = await getStudentSystemExams();

        if (!isMounted) {
          return;
        }

        setExams(items);
      } finally {
        if (isMounted) {
          setIsLoadingExams(false);
        }
      }
    }

    void loadExams();

    return () => {
      isMounted = false;
    };
  }, []);

  const classroomOptions = Array.from(
    new Set(
      exams
        .map((exam) => exam.classroomName?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b, "vi"));

  const gradeOptions = Array.from(
    new Set(exams.map((exam) => exam.grade).filter((item) => item > 0)),
  ).sort((a, b) => a - b);

  const filtered = exams.filter((exam) => {
    const keyword = search.trim().toLowerCase();

    if (
      keyword &&
      ![exam.title, exam.description, exam.classroomName ?? ""]
        .some((value) => value.toLowerCase().includes(keyword))
    ) {
      return false;
    }
    if (classroom && exam.classroomName !== classroom) return false;
    if (grade && exam.grade !== grade) return false;
    if (difficulty && exam.difficulty !== difficulty) return false;
    return true;
  });

  const activeFilterCount = [classroom, grade, difficulty].filter(Boolean)
    .length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Thư viện đề thi
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLoadingExams
            ? "Đang tải đề thi hệ thống..."
            : `${exams.length} đề thi hệ thống — tìm kiếm và làm bài ngay`}
        </p>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm đề thi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest pl-10 pr-4 shadow-none"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
            "border transition-colors shrink-0",
            showFilters || activeFilterCount > 0
              ? "bg-primary text-white border-primary"
              : "bg-surface-container-lowest text-on-surface border-outline/20 hover:bg-surface-container-low",
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-outline/10 bg-surface-container-lowest p-4 shadow-[0_18px_44px_-32px_rgba(7,30,39,0.18)] sm:grid-cols-3">
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
                {gradeOptions.map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Lớp {g}
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
                {difficultyOptions.map((opt) => (
                  <SelectItem
                    key={opt.value || ALL_DIFFICULTIES}
                    value={opt.value || ALL_DIFFICULTIES}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoadingExams ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Đang tải đề thi</p>
          <p className="text-sm mt-1">Vui lòng chờ trong giây lát</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">
            {exams.length === 0
              ? "Chưa có đề thi hệ thống nào"
              : "Không tìm thấy đề thi nào"}
          </p>
          <p className="text-sm mt-1">
            {exams.length === 0
              ? "Hãy quay lại sau khi hệ thống cập nhật thêm đề thi"
              : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Hiển thị {filtered.length} trong {exams.length} đề thi
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
