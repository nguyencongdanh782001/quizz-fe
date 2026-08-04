"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Search,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherExams } from "@/hooks/queries/useTeacherExams";
import { teacherExamQueryKeys } from "@/hooks/queries/exam.query-keys";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";
import { getTeacherSystemExamDetail } from "@/services/exam.service";
import type { TeacherExam, TeacherExamQuery } from "@/types/exam";

interface SystemExamSelectorDialogProps {
  onOpenChange: (open: boolean) => void;
  onSelectExam: (exam: TeacherExam) => void;
  open: boolean;
}

const PAGE_SIZE = 5;

function formatDate(value: string): string {
  if (!value) {
    return "Chưa có ngày tạo";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa có ngày tạo";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getQuestionTypeCount(exam: TeacherExam): string {
  const questions = exam.questions ?? [];

  if (questions.length === 0) {
    return "Chưa tải danh sách câu hỏi";
  }

  const textQuestionCount = questions.filter(
    (question) => question.question_type === "text",
  ).length;
  const choiceQuestionCount = questions.length - textQuestionCount;

  return `${choiceQuestionCount} câu trắc nghiệm, ${textQuestionCount} câu tự luận`;
}

export function SystemExamSelectorDialog({
  onOpenChange,
  onSelectExam,
  open,
}: SystemExamSelectorDialogProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const query = useMemo<TeacherExamQuery>(
    () => ({
      search: debouncedSearch,
      sort_by: "created_at",
      sort_order: "desc",
    }),
    [debouncedSearch],
  );
  const examsQuery = useTeacherExams(query);
  const exams = examsQuery.data?.items ?? [];
  const pageCount = Math.max(1, Math.ceil(exams.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleExams = exams.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const activeSelectedExamId =
    visibleExams.some((exam) => exam.id === selectedExamId)
      ? selectedExamId
      : visibleExams[0]?.id ?? null;
  const selectedSummary =
    activeSelectedExamId === null
      ? null
      : exams.find((exam) => exam.id === activeSelectedExamId) ?? null;
  const selectedDetailQuery = useQuery({
    queryKey:
      activeSelectedExamId === null
        ? teacherExamQueryKeys.detail("missing")
        : teacherExamQueryKeys.detail(activeSelectedExamId),
    queryFn: async () => {
      if (activeSelectedExamId === null) {
        throw new Error("Thiếu mã đề thi hệ thống.");
      }

      return getTeacherSystemExamDetail(activeSelectedExamId);
    },
    enabled: open && activeSelectedExamId !== null,
  });
  const selectedPreview = selectedDetailQuery.data ?? selectedSummary;
  const detailErrorMessage = selectedDetailQuery.isError
    ? getApiErrorMessage(
        selectedDetailQuery.error,
        "Không tìm thấy đề thi hệ thống",
      )
    : null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSearch("");
      setPage(1);
      setSelectedExamId(null);
    }

    onOpenChange(nextOpen);
  }

  function handleSelect() {
    if (!selectedDetailQuery.data || selectedDetailQuery.isLoading) {
      return;
    }

    onSelectExam(selectedDetailQuery.data);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[min(100%-1rem,78rem)] gap-0 p-0">
        <div className="border-b border-outline/10 px-5 py-5 sm:px-7">
          <DialogHeader className="pr-10">
            <DialogTitle>Chọn đề thi từ hệ thống</DialogTitle>
            <DialogDescription>
              Tìm đề thi hệ thống, xem nhanh nội dung rồi sao chép vào biểu mẫu
              lớp học để tiếp tục chỉnh sửa.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid max-h-[calc(85vh-10rem)] overflow-hidden lg:grid-cols-[1fr_0.82fr]">
          <div className="min-h-0 border-b border-outline/10 p-5 lg:border-r lg:border-b-0 sm:p-7">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                  setSelectedExamId(null);
                }}
                placeholder="Tìm kiếm đề thi..."
                className="pl-10"
              />
            </div>

            <div className="mt-4 h-[28rem] overflow-y-auto pr-1">
              {examsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-2xl" />
                  ))}
                </div>
              ) : visibleExams.length > 0 ? (
                <div className="space-y-3">
                  {visibleExams.map((exam) => {
                    const isSelected = exam.id === activeSelectedExamId;

                    return (
                      <button
                        key={exam.id}
                        type="button"
                        onClick={() => setSelectedExamId(exam.id)}
                        className={cn(
                          "w-full rounded-2xl border p-4 text-left transition-colors",
                          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/12",
                          isSelected
                            ? "border-primary/45 bg-primary/8"
                            : "border-outline/10 bg-surface hover:border-primary/25 hover:bg-surface-container-low",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="line-clamp-1 font-display text-base font-semibold text-on-surface">
                              {exam.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                              {exam.description || "Chưa có mô tả"}
                            </p>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                          ) : null}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
                            <BookOpen className="size-3.5" />
                            {exam.question_count} câu
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
                            <Clock className="size-3.5" />
                            {exam.duration_minutes} phút
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
                            <CalendarDays className="size-3.5" />
                            {formatDate(exam.created_at)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-outline/20 bg-surface p-6 text-center text-sm text-muted-foreground">
                  Không tìm thấy đề thi hệ thống phù hợp.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage <= 1}
              >
                <ChevronLeft />
                Trước
              </Button>
              <span className="text-xs font-medium text-muted-foreground">
                Trang {safePage}/{pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((current) => Math.min(pageCount, current + 1))
                }
                disabled={safePage >= pageCount}
              >
                Sau
                <ChevronRight />
              </Button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
            <p className="text-xs font-medium text-muted-foreground">
              Xem trước
            </p>

            {detailErrorMessage ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-center gap-2 font-medium">
                  <TriangleAlert className="size-4" />
                  {detailErrorMessage}
                </div>
              </div>
            ) : null}

            {selectedDetailQuery.isLoading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-8 w-2/3 rounded-xl" />
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
              </div>
            ) : selectedPreview ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-display text-xl font-semibold text-on-surface">
                    {selectedPreview.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {selectedPreview.description || "Chưa có mô tả"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">
                    {selectedPreview.question_count} câu hỏi
                  </Badge>
                  <Badge variant="secondary">
                    {selectedPreview.duration_minutes} phút
                  </Badge>
                  <Badge variant="outline">
                    {formatDate(selectedPreview.created_at)}
                  </Badge>
                </div>

                <div className="rounded-2xl border border-outline/10 bg-surface p-4">
                  <p className="text-sm font-semibold text-on-surface">
                    Cấu trúc câu hỏi
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getQuestionTypeCount(selectedPreview)}
                  </p>

                  {selectedPreview.questions?.length ? (
                    <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                      {selectedPreview.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="rounded-xl border border-outline/10 bg-surface-container-lowest p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-2 text-sm font-medium text-on-surface">
                              Câu {index + 1}: {question.prompt}
                            </p>
                            <span className="shrink-0 text-xs font-medium text-muted-foreground">
                              {question.points} điểm
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-outline/20 bg-surface p-6 text-center text-sm text-muted-foreground">
                Chọn một đề thi để xem trước.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-outline/10 px-5 py-4 sm:px-7">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSelect}
            disabled={!selectedDetailQuery.data || selectedDetailQuery.isLoading}
          >
            {selectedDetailQuery.isLoading ? (
              <Loader2 className="animate-spin" />
            ) : null}
            Chọn đề thi này
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
