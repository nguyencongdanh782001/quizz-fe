"use client";

import { useState, useEffect } from "react";
import {
  X,
  Info,
  CheckCircle2,
  ClipboardCheck,
  BookOpen,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeacherClasses } from "@/hooks/queries/useTeacherClasses";
import { useQueryClient } from "@tanstack/react-query";
import { createTeacherClassExam } from "@/lib/teacher-classes";
import { getTeacherSystemExamDetail } from "@/services/exam.service";
import type { TeacherExam } from "@/types/exam";

export type AssignmentType = "test" | "exam" | "practice";

interface AssignExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: TeacherExam | null;
  type: AssignmentType;
  onSuccess?: (message: string) => void;
}

function formatNowForInput(offsetHours = 0): string {
  const d = new Date();
  d.setHours(d.getHours() + offsetHours);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AssignExamDialog({
  open,
  onOpenChange,
  exam,
  type,
  onSuccess,
}: AssignExamDialogProps) {
  const queryClient = useQueryClient();
  const { data: classesData, isLoading: isLoadingClasses } = useTeacherClasses();
  const classes = classesData ?? [];

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [allowRetake, setAllowRetake] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const assignmentType = type === "practice" ? "exam" : type;
  const isTest = assignmentType === "test";

  useEffect(() => {
    if (open && exam) {
      setAssignmentTitle(
        assignmentType === "test"
          ? `Bài kiểm tra: ${exam.title}`
          : `Đề thi: ${exam.title}`,
      );
      setSelectedClassId(exam.classroom_id ? String(exam.classroom_id) : "");
      setStartTime(formatNowForInput(0));
      setEndTime(formatNowForInput(24));
      setDurationMinutes(exam.duration_minutes || 45);
      setAllowRetake(false);
      setErrorMessage(null);
    }
  }, [assignmentType, open, exam]);

  if (!open || !exam) return null;

  const titleText = isTest
    ? "Cấu hình giao bài tập kiểm tra"
    : "Cấu hình giao đề thi";

  async function handleSubmit() {
    if (!exam) return;
    if (!selectedClassId) {
      setErrorMessage("Vui lòng chọn Lớp học để giao bài!");
      return;
    }
    if (!assignmentTitle.trim()) {
      setErrorMessage("Vui lòng nhập tên bài tập!");
      return;
    }
    if (isTest && (!startTime || !endTime)) {
      setErrorMessage("Vui lòng chọn thời gian mở và kết thúc bài kiểm tra!");
      return;
    }
    if (
      startTime &&
      endTime &&
      new Date(endTime).getTime() <= new Date(startTime).getTime()
    ) {
      setErrorMessage("Thời gian kết thúc phải sau thời gian mở bài!");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Fetch full exam details to ensure all questions and options are intact
      let fullQuestions = exam.questions ?? [];
      try {
        const detail = await getTeacherSystemExamDetail(exam.id);
        if (detail && detail.questions && detail.questions.length > 0) {
          fullQuestions = detail.questions;
        }
      } catch (err) {
        console.warn("Detail fetch failed, using fallback summary questions", err);
      }

      // 2. Create a new class exam instance for the selected class (preserving master exam in repository)
      await createTeacherClassExam(selectedClassId, {
        title: assignmentTitle.trim(),
        description: exam.description ?? "",
        grade: exam.grade?.trim() || "Lớp 12",
        image_url: exam.image_url ?? "",
        duration_minutes: durationMinutes,
        start_time: isTest ? startTime || undefined : undefined,
        end_time: isTest ? endTime || undefined : undefined,
        is_published: true,
        is_active: true,
        total_points: 10,
        point_mode: "auto",
        assignment_type: assignmentType,
        max_attempts: isTest && !allowRetake ? 1 : null,
        questions: fullQuestions.map((q, idx) => ({
          prompt: q.prompt || `Câu hỏi ${idx + 1}`,
          question_type: q.question_type || "single_choice",
          order_index: idx + 1,
          points: 1,
          explanation: q.explanation ?? "",
          image_url: q.image_url ?? "",
          accepted_answers: q.accepted_answers ?? [],
          options: (q.options ?? []).map((opt) => ({
            option_key: opt.option_key || "A",
            option_text: opt.option_text || "",
            is_correct: !!opt.is_correct,
            image_url: opt.image_url ?? "",
          })),
        })),
      });

      // 3. Invalidate React Query cache to refresh lists immediately
      void queryClient.invalidateQueries();

      const targetClassName =
        classes.find((c) => String(c.id) === selectedClassId)?.name ||
        "Lớp học";

      onOpenChange(false);
      if (onSuccess) {
        onSuccess(
          `✓ Đã ${isTest ? "giao bài tập kiểm tra" : "giao đề thi"} thành công cho ${targetClassName}!`,
        );
      }
    } catch (err: unknown) {
      console.error("Failed to assign exam", err);
      setErrorMessage("Không thể giao bài tập. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-xl rounded-[12px] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex items-center gap-2">
            {isTest ? (
              <ClipboardCheck className="size-5 text-[#3F63F3]" />
            ) : (
              <BookOpen className="size-5 text-[#10B981]" />
            )}
            <h2 className="text-base font-bold text-[#1E293B]">{titleText}</h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-8 items-center justify-center rounded-full text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {errorMessage && (
            <div className="rounded-[6px] border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600">
              ⚠ {errorMessage}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Tên bài tập */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1E293B]">
                Tên {isTest ? "bài tập kiểm tra" : "đề thi"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                placeholder={`Nhập tên ${isTest ? "bài tập kiểm tra" : "đề thi"}`}
                className="h-9 w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3]"
              />
            </div>

            {/* Lớp học */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1E293B]">
                Lớp học <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="h-9 w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3] cursor-pointer"
              >
                <option value="">-- Chọn Lớp học --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.grade || "Cả lớp"})
                  </option>
                ))}
              </select>
              {isLoadingClasses && (
                <p className="text-[11px] text-[#64748B]">Đang tải danh sách lớp...</p>
              )}
            </div>

            {/* Callout Info */}
            <div className="flex items-start gap-2.5 rounded-[6px] border border-[#BAE6FD] bg-[#F0F9FF] p-3 text-xs text-[#0369A1]">
              <Info className="size-4 shrink-0 mt-0.5" />
              <span>
                Chọn các lớp học mà bạn muốn giao bài tập này. Học viên trong các
                lớp học này sẽ có thể truy cập đề thi làm bài tập.
              </span>
            </div>

            {/* Thời gian mở bài */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1E293B]">
                Thời gian mở bài tập <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3]"
                />
              </div>
            </div>

            {/* Thời gian kết thúc */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1E293B]">
                Thời gian kết thúc <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-9 w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3]"
                />
              </div>
            </div>

            {/* Thời gian làm bài (Phút) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1E293B]">
                Thời gian làm bài tập <span className="text-rose-500">*</span>
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="h-9 w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3] cursor-pointer"
              >
                <option value={15}>15 phút</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút</option>
                <option value={90}>90 phút</option>
                <option value={120}>120 phút</option>
              </select>
            </div>

            {/* Checkbox tham gia kiểm tra lại */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={allowRetake}
                onChange={(e) => setAllowRetake(e.target.checked)}
                className="size-4 rounded border-[#CBD5E1] text-[#3F63F3] focus:ring-[#3F63F3]"
              />
              <span className="text-xs font-semibold text-[#1E293B]">
                Cho phép học viên tham gia kiểm tra lại nhiều lần
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 rounded-[6px] border border-[#CBD5E1] bg-white px-4 text-xs font-bold text-[#475569] hover:bg-[#F1F5F9] cursor-pointer"
          >
            Hủy
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-8 rounded-[6px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-5 text-xs font-bold text-white shadow-sm hover:opacity-95 cursor-pointer"
          >
            {isSubmitting ? (
              <LoaderCircle className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 size-3.5" />
            )}
            <span>{isSubmitting ? "Đang xử lý..." : "Xác nhận giao bài"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
