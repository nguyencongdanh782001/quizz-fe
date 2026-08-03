"use client";

import { useFormikContext, getIn } from "formik";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ListChecks,
  Plus,
  Trash2,
  Pencil,
  FileText,
  Check,
  X,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TeacherExamFormValues, TeacherExamQuestionType } from "./types";
import { QuestionDeleteDialog } from "./question-delete-dialog";
import { TextBatchModal } from "./text-batch-modal";
import {
  createEmptyOption,
  createEmptyQuestion,
  normalizeTeacherExamQuestionType,
  applyTeacherExamQuestionType,
  reindexTeacherExamQuestions,
  reindexTeacherExamOptions,
} from "./utils";

const QUESTION_TYPE_OPTIONS: Array<{
  label: string;
  value: TeacherExamQuestionType;
}> = [
  { value: "single_choice", label: "Một đáp án" },
  { value: "multiple_choice", label: "Nhiều đáp án" },
  { value: "true_false", label: "Đúng / sai" },
  { value: "short_answer", label: "Trả lời ngắn" },
  { value: "text", label: "Tự luận" },
];

function RichTextToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-[6px] border border-b-0 border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#475569]">
      <select className="h-6 rounded border border-[#CBD5E1] bg-white px-1 text-[11px] font-medium outline-none text-[#1E293B]">
        <option>Normal</option>
        <option>Heading 1</option>
        <option>Heading 2</option>
        <option>Heading 3</option>
      </select>

      <div className="h-4 w-px bg-[#CBD5E1] mx-0.5" />

      <button type="button" className="px-1.5 py-0.5 font-bold hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="In đậm (Bold)">B</button>
      <button type="button" className="px-1.5 py-0.5 italic hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="In nghiêng (Italic)">I</button>
      <button type="button" className="px-1.5 py-0.5 underline hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="Gạch chân (Underline)">U</button>
      <button type="button" className="px-1.5 py-0.5 font-semibold text-[#3B82F6] hover:bg-[#E2E8F0] rounded" title="Màu chữ">A</button>
      <button type="button" className="px-1.5 py-0.5 text-[11px] hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="Chỉ số dưới">x₂</button>
      <button type="button" className="px-1.5 py-0.5 text-[11px] hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="Chỉ số trên">x²</button>

      <div className="h-4 w-px bg-[#CBD5E1] mx-0.5" />

      <button type="button" className="px-1.5 py-0.5 hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="Trích dẫn">&ldquo;</button>
      <button type="button" className="px-1.5 py-0.5 font-mono text-[11px] hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="Mã nguồn">&lt;/&gt;</button>

      <div className="h-4 w-px bg-[#CBD5E1] mx-0.5" />

      <button type="button" className="px-1.5 py-0.5 hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="Danh sách chấm">⋮≡</button>
      <button type="button" className="px-1.5 py-0.5 hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="Danh sách số">1.≡</button>

      <div className="h-4 w-px bg-[#CBD5E1] mx-0.5" />

      <button type="button" className="px-1.5 py-0.5 hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="Chèn liên kết">🔗</button>
      <button type="button" className="px-1.5 py-0.5 hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="Chèn hình ảnh">🖼️</button>
      <button type="button" className="px-1.5 py-0.5 hover:bg-[#E2E8F0] rounded text-[#1E293B]" title="Chèn bảng">📊</button>
      <button type="button" className="px-1.5 py-0.5 font-serif italic text-blue-600 font-bold hover:bg-[#E2E8F0] rounded" title="Công thức toán học">fx</button>
    </div>
  );
}

export function QuestionBuilderStep() {
  const { values, setFieldValue } = useFormikContext<TeacherExamFormValues>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingDeleteQuestion, setPendingDeleteQuestion] = useState<{
    id: string;
    index: number;
  } | null>(null);

  // Ensure selectedIndex is within valid bounds
  const safeIndex = Math.min(
    Math.max(0, selectedIndex),
    Math.max(0, values.questions.length - 1),
  );
  const activeQuestion = values.questions[safeIndex];

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function handleSaveQuestion() {
    showToast(`Đã lưu câu hỏi ${safeIndex + 1} thành công!`);
  }

  function handleSaveDraft() {
    if (activeQuestion) {
      void setFieldValue(`questions.${safeIndex}.is_draft`, true);
    }
    showToast(`Đã lưu nháp câu hỏi ${safeIndex + 1}!`);
  }

  function handleSaveAndCreateNext() {
    showToast(`Đã lưu câu hỏi ${safeIndex + 1} & tạo câu hỏi mới!`);
    handleAddQuestion();
  }

  function handleAddQuestion() {
    const nextQuestion = createEmptyQuestion(
      undefined,
      values.questions.length + 1,
    );
    const updated = [...values.questions, nextQuestion];
    void setFieldValue("questions", updated);
    setSelectedIndex(updated.length - 1);
  }

  function handleRemoveQuestion(indexToRemove: number) {
    const updated = reindexTeacherExamQuestions(
      values.questions.filter((_, index) => index !== indexToRemove),
    );
    void setFieldValue("questions", updated);
    if (safeIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
  }

  function handleQuestionTypeChange(newType: TeacherExamQuestionType) {
    if (!activeQuestion) return;
    const updatedQuestion = applyTeacherExamQuestionType(
      activeQuestion,
      newType,
    );
    const nextQuestions = [...values.questions];
    nextQuestions[safeIndex] = updatedQuestion;
    void setFieldValue("questions", nextQuestions);
  }

  function handleAddOption() {
    if (!activeQuestion) return;
    const newOpt = createEmptyOption(false);
    const updatedOptions = reindexTeacherExamOptions([...activeQuestion.options, newOpt]);
    void setFieldValue(`questions.${safeIndex}.options`, updatedOptions);
  }

  function handleRemoveOption(optIndex: number) {
    if (!activeQuestion) return;
    const updatedOptions = activeQuestion.options.filter((_, idx) => idx !== optIndex);
    void setFieldValue(`questions.${safeIndex}.options`, updatedOptions);
  }

  function handleSetSingleCorrect(optId: string) {
    if (!activeQuestion) return;
    const updatedOptions = activeQuestion.options.map((opt) => ({
      ...opt,
      is_correct: opt.client_id === optId,
    }));
    void setFieldValue(`questions.${safeIndex}.options`, updatedOptions);
  }

  function handleToggleMultipleCorrect(optId: string) {
    if (!activeQuestion) return;
    const updatedOptions = activeQuestion.options.map((opt) =>
      opt.client_id === optId ? { ...opt, is_correct: !opt.is_correct } : opt,
    );
    void setFieldValue(`questions.${safeIndex}.options`, updatedOptions);
  }

  const activeQuestionType = activeQuestion
    ? normalizeTeacherExamQuestionType(activeQuestion.question_type)
    : "single_choice";
  const isMultipleChoice = activeQuestionType === "multiple_choice";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
      {/* LEFT COLUMN: Danh sách câu hỏi (col-span-4) - sticky sidebar */}
      <div className="lg:col-span-4 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E293B]">
              Danh sách câu hỏi
            </span>
            <span className="text-xs font-semibold text-[#64748B]">
              {values.questions.length} câu
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-1 rounded-[6px] bg-[#3F63F3] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#3451D1] transition-colors"
            >
              <Plus className="size-3.5" />
              <span>Thêm câu hỏi</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTextModalOpen(true)}
              className="flex items-center gap-1 rounded-[6px] bg-[#3F63F3] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#3451D1] transition-colors cursor-pointer"
            >
              <FileText className="size-3.5" />
              <span>Thêm bằng văn bản</span>
            </button>
          </div>

          {/* Square Question Number Grid - scrollable if many questions */}
          <div className="flex flex-wrap gap-1.5 pt-1 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300">
            {values.questions.length === 0 ? (
              <div className="my-4 text-center text-xs font-medium text-[#94A3B8] w-full">
                Không tìm thấy câu hỏi nào!
              </div>
            ) : (
              values.questions.map((q, idx) => {
                const isSelected = idx === safeIndex;
                return (
                  <button
                    key={q.client_id}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-[4px] text-xs font-bold transition-all cursor-pointer shrink-0",
                      isSelected
                        ? "bg-[#3F63F3] text-white shadow-sm"
                        : "border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC]",
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Soạn câu hỏi Editor (col-span-8) */}
      <div className="lg:col-span-8">
        <div className="rounded-[10px] border border-[#DDE2EB] bg-white p-4.5 shadow-xs space-y-3.5">
          {values.questions.length === 0 ? (
            <div className="my-16 text-center space-y-3">
              <p className="text-sm font-semibold text-[#64748B]">
                Chưa có câu hỏi nào trong đề thi
              </p>
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="bg-[#3F63F3] hover:bg-[#3451D1] text-white font-bold text-xs"
              >
                <Plus className="mr-1.5 size-4" />
                Tạo câu hỏi mới ngay
              </Button>
            </div>
          ) : activeQuestion ? (
            <>
              {/* Header Title */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1E293B]">
                  Thêm câu hỏi mới (Câu {safeIndex + 1})
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setPendingDeleteQuestion({
                      id: activeQuestion.client_id,
                      index: safeIndex,
                    })
                  }
                  className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                  title="Xoá câu hỏi hiện tại"
                >
                  <Trash2 className="size-3.5" />
                  <span>Xoá câu hỏi</span>
                </button>
              </div>

              {/* 1. Loại câu hỏi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E293B]">
                  Loại câu hỏi
                </label>
                <div className="relative w-full sm:w-64 max-w-xs">
                  <select
                    value={activeQuestionType}
                    onChange={(e) =>
                      handleQuestionTypeChange(
                        e.target.value as TeacherExamQuestionType,
                      )
                    }
                    className="block w-full appearance-none rounded-[6px] border border-[#CBD5E1] bg-white pl-3 pr-8 py-1.5 text-xs font-semibold text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3] cursor-pointer"
                  >
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#64748B]" />
                </div>
              </div>

              {/* 2. Soạn câu hỏi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E293B]">
                  Soạn câu hỏi
                </label>
                <div className="rounded-[6px] overflow-hidden">
                  <RichTextToolbar />
                  <textarea
                    value={activeQuestion.prompt || ""}
                    onChange={(e) =>
                      void setFieldValue(
                        `questions.${safeIndex}.prompt`,
                        e.target.value,
                      )
                    }
                    placeholder="Nhập nội dung câu hỏi"
                    rows={4}
                    className="w-full rounded-b-[6px] border border-[#CBD5E1] bg-white p-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#8B5CF6]"
                  />
                </div>
              </div>


              {/* 4. Câu trả lời */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-[#1E293B] block">
                  Câu trả lời
                </label>

                {activeQuestion.options.map((opt, optIdx) => (
                  <div key={opt.client_id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#1E293B] cursor-pointer">
                        <input
                          type={isMultipleChoice ? "checkbox" : "radio"}
                          name={`question-${safeIndex}-correct`}
                          checked={opt.is_correct}
                          onChange={() => {
                            if (isMultipleChoice) {
                              handleToggleMultipleCorrect(opt.client_id);
                            } else {
                              handleSetSingleCorrect(opt.client_id);
                            }
                          }}
                          className="size-4 accent-[#3B82F6] cursor-pointer"
                        />
                        <span>Đáp án {optIdx + 1}</span>
                      </label>

                      {activeQuestion.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(optIdx)}
                          className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Xoá đáp án</span>
                        </button>
                      )}
                    </div>

                    <div className="rounded-[6px] overflow-hidden">
                      <RichTextToolbar />
                      <textarea
                        value={opt.option_text || ""}
                        onChange={(e) =>
                          void setFieldValue(
                            `questions.${safeIndex}.options.${optIdx}.option_text`,
                            e.target.value,
                          )
                        }
                        placeholder="Nhập nội dung đáp án"
                        rows={2.5}
                        className="w-full rounded-b-[6px] border border-[#CBD5E1] bg-white p-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#8B5CF6]"
                      />
                    </div>
                  </div>
                ))}

                {/* + Thêm đáp án Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-1.5 rounded-[6px] bg-gradient-to-r from-[#FF758C] to-[#FF7EB3] px-4 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    <Plus className="size-3.5 stroke-[3]" />
                    <span>Thêm đáp án</span>
                  </button>
                </div>
              </div>

              {/* 5. Giải thích */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-[#1E293B]">
                  Giải thích
                </label>
                <div className="rounded-[6px] overflow-hidden">
                  <RichTextToolbar />
                  <textarea
                    value={activeQuestion.explanation || ""}
                    onChange={(e) =>
                      void setFieldValue(
                        `questions.${safeIndex}.explanation`,
                        e.target.value,
                      )
                    }
                    placeholder="Nhập nội dung giải thích đáp án"
                    rows={3}
                    className="w-full rounded-b-[6px] border border-[#CBD5E1] bg-white p-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#8B5CF6]"
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* FULL-WIDTH BOTTOM FOOTER BAR (MATCHING IMAGE 2) */}
      <div className="lg:col-span-12 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-xs flex items-center justify-between">
        <div>
          {toastMessage && (
            <span className="text-xs font-semibold text-emerald-600 animate-in fade-in-0 duration-200">
              ✓ {toastMessage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveQuestion}
            className="rounded-[6px] bg-[#3F63F3] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#3451D1] cursor-pointer shadow-sm"
          >
            Lưu câu hỏi
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-[6px] border border-[#CBD5E1] bg-white px-5 py-2.5 text-xs font-bold text-[#334155] transition-colors hover:bg-[#F8FAFC] cursor-pointer shadow-sm"
          >
            Lưu nháp
          </button>

          <button
            type="button"
            onClick={handleSaveAndCreateNext}
            className="rounded-[6px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-5 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-95 cursor-pointer shadow-sm"
          >
            Lưu nháp và Tiếp tục tạo mới
          </button>
        </div>
      </div>

      <QuestionDeleteDialog
        open={pendingDeleteQuestion !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteQuestion(null);
          }
        }}
        onConfirm={() => {
          if (!pendingDeleteQuestion) return;
          handleRemoveQuestion(pendingDeleteQuestion.index);
          setPendingDeleteQuestion(null);
        }}
      />

      <TextBatchModal
        open={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onImport={(newQuestions) => {
          const updated = reindexTeacherExamQuestions([
            ...values.questions,
            ...newQuestions,
          ]);
          void setFieldValue("questions", updated);
        }}
      />
    </div>
  );
}
