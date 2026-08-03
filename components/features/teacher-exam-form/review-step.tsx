"use client";

import { useFormikContext } from "formik";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  ListChecks,
  LoaderCircle,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatExamDateTime } from "@/lib/date";
import type { TeacherExamFormValues } from "./types";
import {
  EXAM_FLOW_MESSAGES,
  getExamClassroomLabel,
  getExamScopeLabel,
  getTeacherExamQuestionTypeLabel,
} from "@/components/exams/exam-flow-messages";
import {
  formatTeacherExamPoints,
  getTeacherExamQuestionPoints,
  getTeacherExamTotalPoints,
  normalizeAcceptedAnswers,
  normalizeTeacherExamQuestionType,
} from "./utils";
import { ReviewImagePreview } from "./review-image-preview";

function getCorrectOptions(
  question: TeacherExamFormValues["questions"][number],
) {
  return question.options.filter((option) => option.is_correct);
}

/**
 * Display the start_time/end_time field on the review step as wall-clock.
 * Falls back to a localised placeholder when the field is empty or invalid.
 */
function formatReviewDateTime(value: string): string {
  if (!value.trim()) {
    return "Chưa chọn";
  }
  const formatted = formatExamDateTime(value);
  return formatted || "Thời gian không hợp lệ";
}

export function ReviewStep() {
  const { values, isSubmitting, submitForm, validateForm } =
    useFormikContext<TeacherExamFormValues>();
  const questionCount = values.questions.length;
  const totalPoints = getTeacherExamTotalPoints(questionCount);

  const handleSaveExam = async () => {
    await validateForm();
    await submitForm();
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
      {/* LEFT COLUMN: Danh sách câu hỏi để xem lại (col-span-8) */}
      <div className="lg:col-span-8">
        <div className="rounded-[10px] border border-[#DDE2EB] bg-white shadow-xs">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#DDE2EB] p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#EEF2FF] text-[#3F63F3]">
              <ListChecks className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1E293B]">
                Xem lại danh sách câu hỏi
              </p>
              <p className="text-xs text-[#64748B]">
                Kiểm tra nhanh nội dung, đáp án đúng trước khi lưu đề thi.
              </p>
            </div>
          </div>

          {/* Question List */}
          <div className="divide-y divide-[#F1F5F9] p-4 space-y-3">
            {questionCount === 0 ? (
              <div className="py-16 text-center text-xs text-[#94A3B8] font-medium">
                Chưa có câu hỏi nào trong đề thi.
              </div>
            ) : (
              values.questions.map((question, questionIndex) => {
                const questionType = normalizeTeacherExamQuestionType(
                  question.question_type,
                );
                const acceptedAnswers = normalizeAcceptedAnswers(
                  question.accepted_answers,
                );
                const correctOptions = getCorrectOptions(question);
                const questionPoints = getTeacherExamQuestionPoints(
                  questionIndex,
                  questionCount,
                );

                return (
                  <div
                    key={question.client_id}
                    className="rounded-[8px] border border-[#DDE2EB] bg-white p-4 space-y-3"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="inline-flex items-center rounded-[4px] bg-[#EEF2FF] px-2.5 py-0.5 text-[11px] font-bold text-[#3F63F3]">
                          Câu {questionIndex + 1}
                        </span>
                        <span className="inline-flex items-center rounded-[4px] bg-[#F8FAFC] border border-[#DDE2EB] px-2.5 py-0.5 text-[11px] font-medium text-[#64748B]">
                          {getTeacherExamQuestionTypeLabel(questionType)}
                        </span>
                      </div>
                      <div className="inline-flex shrink-0 items-center gap-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#DDE2EB] px-2.5 py-1 text-xs font-semibold text-[#1E293B]">
                        <FileCheck2 className="h-3.5 w-3.5 text-[#3F63F3]" />
                        {formatTeacherExamPoints(questionPoints)} điểm
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <p className="text-sm font-medium text-[#1E293B] leading-relaxed">
                      {question.prompt.trim() || "Chưa nhập nội dung câu hỏi"}
                    </p>

                    {/* Question Image */}
                    <ReviewImagePreview
                      src={question.image_url}
                      alt={`Ảnh minh họa câu hỏi ${questionIndex + 1}`}
                      label="Ảnh minh họa"
                      variant="question"
                    />

                    {/* Answers */}
                    {questionType === "text" ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Đáp án chấp nhận</p>
                        {acceptedAnswers.length > 0 ? (
                          acceptedAnswers.map((answer) => (
                            <div
                              key={`${question.client_id}-${answer}`}
                              className="rounded-[6px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 font-medium"
                            >
                              ✓ {answer}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-[6px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                            Chưa nhập đáp án cho câu hỏi tự luận này.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Đáp án</p>
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={option.client_id}
                              className={cn(
                                "rounded-[6px] border px-3 py-2 text-xs flex items-start gap-2",
                                option.is_correct
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
                              )}
                            >
                              <span className="font-bold shrink-0">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span className="flex-1 leading-relaxed">
                                {option.option_text.trim() || "Chưa nhập đáp án"}
                              </span>
                              {option.is_correct && (
                                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 mt-0.5" />
                              )}
                            </div>
                          ))}
                        </div>
                        {correctOptions.length === 0 && (
                          <p className="text-xs text-rose-500 font-medium">
                            ⚠ Chưa chọn đáp án đúng
                          </p>
                        )}
                      </div>
                    )}

                    {/* Explanation */}
                    {question.explanation.trim() && (
                      <div className="rounded-[6px] border border-[#DDE2EB] bg-[#F8FAFC] px-3 py-2">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B] mb-1">
                          {EXAM_FLOW_MESSAGES.labels.explanation}
                        </p>
                        <p className="text-xs text-[#475569] leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Tóm tắt & Nút Lưu (col-span-4) */}
      <div className="lg:col-span-4 space-y-4">
        {/* Summary card */}
        <div className="rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-xs space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-[#F1F5F9]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#EEF2FF] text-[#3F63F3]">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1E293B]">Bước 3. Xem lại & lưu</p>
              <p className="text-xs text-[#64748B]">Xác nhận thông số đề thi</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[8px] border border-[#DDE2EB] bg-[#F8FAFC] p-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Câu hỏi</p>
              <p className="mt-1 text-2xl font-bold text-[#1E293B]">{questionCount}</p>
            </div>
            <div className="rounded-[8px] border border-[#DDE2EB] bg-[#F8FAFC] p-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Tổng điểm</p>
              <p className="mt-1 text-2xl font-bold text-[#1E293B]">{totalPoints}</p>
            </div>
          </div>

          {/* Exam Details */}
          <div className="space-y-2 rounded-[8px] border border-[#DDE2EB] bg-[#F8FAFC] p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#64748B]">Trình độ</span>
              <span className="font-semibold text-[#1E293B] text-right max-w-[60%] truncate">
                {values.grade.trim() || "Chưa nhập"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#64748B]">Thời lượng</span>
              <span className="font-semibold text-[#1E293B] flex items-center gap-1">
                <Clock3 className="size-3 text-[#3F63F3]" />
                {values.duration_minutes} phút
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#64748B]">Bắt đầu</span>
              <span className="font-semibold text-[#1E293B]">
                {formatReviewDateTime(values.start_time)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#64748B]">Kết thúc</span>
              <span className="font-semibold text-[#1E293B]">
                {formatReviewDateTime(values.end_time)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#DDE2EB] mt-1">
              <span className="font-medium text-[#64748B]">Trạng thái</span>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                  values.is_published
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700",
                )}>
                  {values.is_published ? EXAM_FLOW_MESSAGES.states.public : EXAM_FLOW_MESSAGES.states.private}
                </span>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                  values.is_active
                    ? "bg-[#EEF2FF] text-[#3F63F3]"
                    : "bg-[#F1F5F9] text-[#64748B]",
                )}>
                  {values.is_active ? EXAM_FLOW_MESSAGES.states.active : EXAM_FLOW_MESSAGES.states.hidden}
                </span>
              </div>
            </div>
          </div>

          {/* Scope info */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-medium text-[#64748B]">Phạm vi</span>
            <span className="font-semibold text-[#1E293B]">{getExamScopeLabel(values.scope)}</span>
          </div>
          {values.classroom_id && (
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-medium text-[#64748B]">Lớp học</span>
              <span className="font-semibold text-[#1E293B]">{getExamClassroomLabel(values.classroom_id)}</span>
            </div>
          )}

          {/* Save Button */}
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveExam}
            className="w-full h-10 rounded-[8px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] text-sm font-bold text-white shadow-sm hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>{isSubmitting ? "Đang lưu đề thi..." : "Lưu đề thi"}</span>
          </Button>
        </div>

        {/* Exam title preview */}
        <div className="rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-xs space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Tên đề thi</p>
          <p className="text-sm font-semibold text-[#1E293B]">
            {values.title.trim() || "Chưa nhập tên đề thi"}
          </p>
          {values.description.trim() && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B] pt-1">Mô tả</p>
              <p className="text-xs text-[#475569] leading-relaxed">{values.description}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
