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
import type { TeacherExamFormValues, TeacherExamQuestionType } from "./types";
import {
  EXAM_FLOW_MESSAGES,
  getExamClassroomLabel,
  getExamScopeLabel,
} from "@/components/exams/exam-flow-messages";
import {
  formatTeacherExamPoints,
  getTeacherExamQuestionPoints,
  getTeacherExamTotalPoints,
  isAcceptedAnswerQuestionType,
  isChoiceQuestionType,
  isEssayQuestionType,
  normalizeAcceptedAnswers,
  normalizeTeacherExamQuestionType,
  sanitizeRichTextHtml,
} from "./utils";
import { ReviewImagePreview } from "./review-image-preview";

const QUESTION_TYPE_LABELS: Record<TeacherExamQuestionType, string> = {
  single_choice: "Một đáp án",
  multiple_choice: "Nhiều đáp án",
  true_false: "Đúng / sai",
  fill_in_blank: "Điền vào chỗ trống",
  short_answer: "Trả lời ngắn",
  text: "Tự luận",
};

function getCorrectOptions(
  question: TeacherExamFormValues["questions"][number],
) {
  return question.options.filter((option) => option.is_correct);
}

function formatReviewDateTime(value: string): string {
  if (!value.trim()) {
    return "Chưa chọn";
  }

  const formatted = formatExamDateTime(value);

  return formatted || "Thời gian không hợp lệ";
}

function RichTextPreview({
  html,
  fallback,
  className,
}: {
  html: string;
  fallback: string;
  className?: string;
}) {
  const sanitizedHtml = sanitizeRichTextHtml(html);

  if (!sanitizedHtml) {
    return <p className={cn("text-[#94A3B8]", className)}>{fallback}</p>;
  }

  return (
    <div
      className={cn(
        "text-sm leading-6 text-[#1E293B]",
        "[&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic",
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:text-base [&_h4]:font-semibold",
        "[&_img]:max-w-full [&_img]:rounded [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-white",
        "[&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_.math-formula]:rounded [&_.math-formula]:bg-blue-50 [&_.math-formula]:px-1.5 [&_.math-formula]:py-0.5 [&_.math-formula]:font-mono [&_.math-formula]:text-blue-700",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export function ReviewStep({
  onRequestSubmit,
  submitLabel = "Lưu đề thi",
  submittingLabel = "Đang lưu đề thi...",
}: {
  onRequestSubmit: () => Promise<void> | void;
  submitLabel?: string;
  submittingLabel?: string;
}) {
  const { values, isSubmitting } = useFormikContext<TeacherExamFormValues>();
  const questionCount = values.questions.length;
  const totalPoints = getTeacherExamTotalPoints(questionCount);

  async function handleSaveExam() {
    await onRequestSubmit();
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="rounded-[10px] border border-[#DDE2EB] bg-white shadow-xs">
          <div className="flex items-center gap-3 border-b border-[#DDE2EB] p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#EEF2FF] text-[#3F63F3]">
              <ListChecks className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1E293B]">
                Xem lại danh sách câu hỏi
              </p>
              <p className="text-xs text-[#64748B]">
                Kiểm tra nhanh nội dung và đáp án trước khi lưu đề thi.
              </p>
            </div>
          </div>

          <div className="space-y-3 divide-y divide-[#F1F5F9] p-4">
            {questionCount === 0 ? (
              <div className="py-16 text-center text-xs font-medium text-[#94A3B8]">
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
                const isChoice = isChoiceQuestionType(questionType);
                const isAcceptedAnswer =
                  isAcceptedAnswerQuestionType(questionType);
                const isEssay = isEssayQuestionType(questionType);

                return (
                  <div
                    key={question.client_id}
                    className="space-y-3 rounded-[8px] border border-[#DDE2EB] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-[4px] bg-[#EEF2FF] px-2.5 py-0.5 text-[11px] font-bold text-[#3F63F3]">
                          Câu {questionIndex + 1}
                        </span>
                        <span className="inline-flex items-center rounded-[4px] border border-[#DDE2EB] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-medium text-[#64748B]">
                          {QUESTION_TYPE_LABELS[questionType]}
                        </span>
                      </div>
                      <div className="inline-flex shrink-0 items-center gap-1.5 rounded-[6px] border border-[#DDE2EB] bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-[#1E293B]">
                        <FileCheck2 className="size-3.5 text-[#3F63F3]" />
                        {formatTeacherExamPoints(questionPoints)} điểm
                      </div>
                    </div>

                    <RichTextPreview
                      html={question.prompt}
                      fallback="Chưa nhập nội dung câu hỏi"
                      className="font-medium"
                    />

                    <ReviewImagePreview
                      src={question.image_url}
                      alt={`Ảnh minh họa câu hỏi ${questionIndex + 1}`}
                      label="Ảnh minh họa"
                      variant="question"
                    />

                    {isChoice ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
                          Đáp án
                        </p>
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={option.client_id}
                              className={cn(
                                "flex items-start gap-2 rounded-[6px] border px-3 py-2 text-xs",
                                option.is_correct
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
                              )}
                            >
                              <span className="shrink-0 font-bold">
                                {option.option_key ||
                                  String.fromCharCode(65 + optionIndex)}
                                .
                              </span>
                              <RichTextPreview
                                html={option.option_text}
                                fallback="Chưa nhập đáp án"
                                className="min-w-0 flex-1 text-xs"
                              />
                              {option.is_correct ? (
                                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                              ) : null}
                            </div>
                          ))}
                        </div>

                        {correctOptions.length === 0 ? (
                          <p className="text-xs font-medium text-rose-500">
                            ⚠ Chưa chọn đáp án đúng
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {isAcceptedAnswer ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
                          Đáp án chấp nhận
                        </p>

                        {acceptedAnswers.length > 0 ? (
                          acceptedAnswers.map((answer, answerIndex) => (
                            <div
                              key={`${question.client_id}-${answerIndex}-${answer}`}
                              className="rounded-[6px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
                            >
                              ✓ {answer}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-[6px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                            Chưa nhập đáp án chấp nhận.
                          </div>
                        )}
                      </div>
                    ) : null}

                    {isEssay ? (
                      <div className="rounded-[6px] border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">
                        Học sinh trả lời bằng văn bản. Câu tự luận không sử dụng
                        danh sách đáp án đúng.
                      </div>
                    ) : null}

                    {question.explanation.trim() ? (
                      <div className="rounded-[6px] border border-[#DDE2EB] bg-[#F8FAFC] px-3 py-2">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
                          {EXAM_FLOW_MESSAGES.labels.explanation}
                        </p>
                        <RichTextPreview
                          html={question.explanation}
                          fallback=""
                          className="text-xs text-[#475569]"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-4">
        <div className="space-y-3 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#EEF2FF] text-[#3F63F3]">
              <Eye className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1E293B]">
                Bước 3. Xem lại & lưu
              </p>
              <p className="text-xs text-[#64748B]">Xác nhận thông số đề thi</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[8px] border border-[#DDE2EB] bg-[#F8FAFC] p-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
                Câu hỏi
              </p>
              <p className="mt-1 text-2xl font-bold text-[#1E293B]">
                {questionCount}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#DDE2EB] bg-[#F8FAFC] p-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
                Tổng điểm
              </p>
              <p className="mt-1 text-2xl font-bold text-[#1E293B]">
                {totalPoints}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-[8px] border border-[#DDE2EB] bg-[#F8FAFC] p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#64748B]">Trình độ</span>
              <span className="max-w-[60%] truncate text-right font-semibold text-[#1E293B]">
                {values.grade.trim() || "Chưa nhập"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#64748B]">Thời lượng</span>
              <span className="flex items-center gap-1 font-semibold text-[#1E293B]">
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
            <div className="mt-1 flex items-center justify-between border-t border-[#DDE2EB] pt-1 text-xs">
              <span className="font-medium text-[#64748B]">Trạng thái</span>
              <div className="flex flex-wrap items-center justify-end gap-1">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                    values.is_published
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700",
                  )}
                >
                  {values.is_published
                    ? EXAM_FLOW_MESSAGES.states.public
                    : EXAM_FLOW_MESSAGES.states.private}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                    values.is_active
                      ? "bg-[#EEF2FF] text-[#3F63F3]"
                      : "bg-[#F1F5F9] text-[#64748B]",
                  )}
                >
                  {values.is_active
                    ? EXAM_FLOW_MESSAGES.states.active
                    : EXAM_FLOW_MESSAGES.states.hidden}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-medium text-[#64748B]">Phạm vi</span>
            <span className="font-semibold text-[#1E293B]">
              {getExamScopeLabel(values.scope)}
            </span>
          </div>

          {values.classroom_id ? (
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="font-medium text-[#64748B]">Lớp học</span>
              <span className="font-semibold text-[#1E293B]">
                {getExamClassroomLabel(values.classroom_id)}
              </span>
            </div>
          ) : null}

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveExam}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] text-sm font-bold text-white shadow-sm hover:opacity-95"
          >
            {isSubmitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>{isSubmitting ? submittingLabel : submitLabel}</span>
          </Button>
        </div>

        <div className="space-y-2 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
            Tên đề thi
          </p>
          <p className="text-sm font-semibold text-[#1E293B]">
            {values.title.trim() || "Chưa nhập tên đề thi"}
          </p>

          {values.description.trim() ? (
            <>
              <p className="pt-1 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
                Mô tả
              </p>
              <p className="text-xs leading-relaxed text-[#475569]">
                {values.description}
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
