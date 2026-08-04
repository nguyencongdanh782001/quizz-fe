"use client";

import { useState, useMemo } from "react";
import { X, HelpCircle, FileCheck2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createEmptyOption, createEmptyQuestion } from "./utils";
import type { TeacherExamQuestionFormValues } from "./types";

interface ParsedOption {
  key: string;
  text: string;
  isCorrect: boolean;
}

interface ParsedQuestion {
  id: number;
  sectionTitle?: string;
  prompt: string;
  typeText: string;
  options: ParsedOption[];
}

const TAB_1_SAMPLE = `When we went back to the bookstore, the bookseller _ the book we wanted.
A. sold
*B. had sold
C. sells
D. has sold

By the end of last summer, the farmers _ all the crop.
A. harvested
*B. had harvested
C. harvest
D. are harvested`;

const TAB_2_SAMPLE = `She speaks English as _________as I do.
A. good
*B. fluently
C. very good
*D. well

I knew they were talking about me _________ they stopped when I entered the room.
*A. because
*B. as
C. despite
D. therefore`;

const TAB_3_SAMPLE = `[FILL]Background, in relation to computers, on the screen, the color on which characters are displayed. [For example], a white background may be used for black characters.

[FILL] [Generally], only multitasking operating systems are able to support background processing.`;

const TAB_4_SAMPLE = `[READ-5] Read the following passage and mark the letter A, B, C, or D on your answer sheet to indicate the correct answer to each of the questions.<br/>We get great pleasure from reading. The more advanced a man is, the greater delight he will find in reading. The ordinary man may think that subjects like philosophy or science are very difficult and that if philosophers and scientists read these subjects, it is not for pleasure. But this is not true. The mathematician finds the same pleasure in his mathematics as the school boy in an adventure story. For both, it is a play of the imagination, a mental recreation and exercise.`;

function parseQuestionsFromRawText(rawText: string): ParsedQuestion[] {
  if (!rawText.trim()) return [];

  const lines = rawText.split("\n");
  const questions: ParsedQuestion[] = [];
  let currentPromptLines: string[] = [];
  let currentOptions: ParsedOption[] = [];
  let questionCounter = 0;

  function finalizeQuestion() {
    const promptText = currentPromptLines
      .join("\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .trim();

    if (promptText) {
      questionCounter++;
      let typeText = "Một đáp án";
      const correctCount = currentOptions.filter((o) => o.isCorrect).length;
      if (correctCount > 1) {
        typeText = "Nhiều đáp án";
      }

      questions.push({
        id: questionCounter,
        prompt: promptText,
        typeText,
        options: [...currentOptions],
      });
    }
    currentPromptLines = [];
    currentOptions = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      if (currentPromptLines.length > 0 || currentOptions.length > 0) {
        finalizeQuestion();
      }
      continue;
    }

    const optionMatch = trimmedLine.match(
      /^(\*)?\s*([A-Za-d1-9])[\.\)]\s*(.+)$/i,
    );

    if (optionMatch) {
      const isCorrect = Boolean(optionMatch[1]);
      const key = optionMatch[2].toUpperCase();
      const text = optionMatch[3].trim();

      currentOptions.push({
        key,
        text,
        isCorrect,
      });
    } else {
      if (currentOptions.length > 0) {
        finalizeQuestion();
      }
      currentPromptLines.push(rawLine);
    }
  }

  finalizeQuestion();
  return questions;
}

interface TextBatchModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (newQuestions: TeacherExamQuestionFormValues[]) => void;
}

export function TextBatchModal({
  open,
  onClose,
  onImport,
}: TextBatchModalProps) {
  const [content, setContent] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideActiveTab, setGuideActiveTab] = useState<
    "tab1" | "tab2" | "tab3" | "tab4"
  >("tab1");
  const [isCopiedSuccess, setIsCopiedSuccess] = useState(false);

  const parsedQuestions = useMemo(
    () => parseQuestionsFromRawText(content),
    [content],
  );

  const activeQuestion =
    parsedQuestions[Math.min(selectedIndex, Math.max(0, parsedQuestions.length - 1))];

  if (!open) return null;

  function getActiveTabSampleText(): string {
    switch (guideActiveTab) {
      case "tab2":
        return TAB_2_SAMPLE;
      case "tab3":
        return TAB_3_SAMPLE;
      case "tab4":
        return TAB_4_SAMPLE;
      default:
        return TAB_1_SAMPLE;
    }
  }

  function handleUseGuideSample() {
    const textToUse = getActiveTabSampleText();
    setContent(textToUse);
    setSelectedIndex(0);
    setIsCopiedSuccess(true);
    setTimeout(() => {
      setIsCopiedSuccess(false);
      setShowGuideModal(false);
    }, 800);
  }

  function handleConfirmImport() {
    if (parsedQuestions.length === 0) return;

    const formattedQuestions: TeacherExamQuestionFormValues[] =
      parsedQuestions.map((q, idx) => {
        const isMultiple = q.typeText === "Nhiều đáp án";
        const baseQ = createEmptyQuestion(
          isMultiple ? "multiple_choice" : "single_choice",
          idx + 1,
        );

        return {
          ...baseQ,
          prompt: q.prompt,
          options:
            q.options.length > 0
              ? q.options.map((opt) => ({
                  ...createEmptyOption(opt.isCorrect),
                  option_key: opt.key,
                  option_text: opt.text,
                  is_correct: opt.isCorrect,
                }))
              : baseQ.options,
        };
      });

    onImport(formattedQuestions);
    setContent("");
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-0 duration-200">
        <div className="relative w-full max-w-5xl rounded-[12px] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Modal Header WITHOUT bottom line border */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <h2 className="text-base font-bold text-[#1E293B] text-center w-full">
              Thêm câu hỏi bằng văn bản
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto items-start">
            {/* Left Column: Textarea */}
            <div className="lg:col-span-7 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="flex items-center gap-1.5 rounded-[6px] bg-[#FF8A9B] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#FF758C] transition-colors cursor-pointer"
                >
                  <HelpCircle className="size-3.5" />
                  <span>Xem hướng dẫn</span>
                </button>

                {parsedQuestions.length > 0 && (
                  <span className="text-xs font-semibold text-emerald-600">
                    ✓ Trích xuất {parsedQuestions.length} câu hỏi
                  </span>
                )}
              </div>

              <div className="space-y-1 flex-1 flex flex-col">
                <label className="text-xs font-bold text-[#1E293B]">
                  Soạn câu hỏi
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Vui lòng soạn câu hỏi theo đúng cấu trúc"
                  rows={13}
                  className="w-full flex-1 min-h-[300px] rounded-[6px] border border-[#CBD5E1] bg-white p-3.5 text-xs font-mono text-[#1E293B] outline-none transition-colors focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>
            </div>

            {/* Right Column: Live Preview & Action Button */}
            <div className="lg:col-span-5 space-y-3.5">
              {/* 1. Xem trước Box (Height fits content) */}
              <div className="flex h-fit flex-col rounded-[8px] border border-[#CBD5E1] bg-white p-4">
                <h3 className="text-xs font-bold text-[#1E293B]">Xem trước</h3>

                {parsedQuestions.length === 0 ? (
                  <div className="my-10 text-center text-xs font-medium text-[#64748B]">
                    Vui lòng soạn câu hỏi theo hướng dẫn!
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    {/* Number grid */}
                    <div className="flex flex-wrap gap-1.5">
                      {parsedQuestions.map((q, idx) => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setSelectedIndex(idx)}
                          className={cn(
                            "flex size-7 items-center justify-center rounded-[4px] text-xs font-bold transition-all cursor-pointer",
                            selectedIndex === idx
                              ? "bg-[#3B82F6] text-white shadow-xs"
                              : "border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC]",
                          )}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Question preview box */}
                    {activeQuestion && (
                      <div className="rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] p-3 space-y-2 text-xs max-h-60 overflow-y-auto">
                        <p className="font-bold text-[#1E293B]">
                          Câu {activeQuestion.id} ({activeQuestion.typeText})
                        </p>
                        <p className="text-[#334155]">{activeQuestion.prompt}</p>
                        {activeQuestion.options.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {activeQuestion.options.map((opt) => (
                              <div
                                key={opt.key}
                                className={cn(
                                  "flex items-center gap-2 rounded border px-2 py-1 text-[11px]",
                                  opt.isCorrect
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold"
                                    : "border-[#E2E8F0] bg-white text-[#475569]",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white",
                                    opt.isCorrect ? "bg-emerald-500" : "bg-slate-300",
                                  )}
                                >
                                  {opt.key}
                                </span>
                                <span>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Confirm Import Button (OUTSIDE the Xem trước Box) */}
              <div>
                <button
                  type="button"
                  disabled={parsedQuestions.length === 0}
                  onClick={handleConfirmImport}
                  className={cn(
                    "flex items-center gap-1.5 rounded-[6px] px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shadow-xs",
                    parsedQuestions.length > 0
                      ? "bg-[#BFDBFE] text-[#1E40AF] hover:bg-[#93C5FD]"
                      : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed opacity-80",
                  )}
                >
                  <FileCheck2 className="size-4" />
                  <span>Xác nhận thêm câu hỏi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Syntax Guide Popup Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="relative flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[12px] bg-white shadow-2xl">
            {/* Modal Header without border-b line */}
            <div className="relative px-5 pt-4 pb-1 text-center">
              <h3 className="text-sm font-bold text-[#1E293B]">
                Cấu trúc soạn thảo câu hỏi bằng văn bản
              </h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="absolute right-3.5 top-3.5 rounded-full p-1 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#1E293B] cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs text-[#1E293B] [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/40 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/60">
              {/* General Rules */}
              <div className="space-y-1 text-[11px] leading-relaxed text-[#334155]">
                <h4 className="font-bold text-[#1E293B] text-xs mb-1">
                  Quy tắc soạn câu hỏi
                </h4>
                <p>
                  - Mỗi câu hỏi cách nhau{" "}
                  <strong className="text-[#1E293B]">1 dòng</strong> hoặc{" "}
                  <strong className="text-[#1E293B]">nhiều dòng</strong>
                </p>
                <p>- Đáp án đúng là đáp án có dấu * đằng trước</p>
                <p>
                  - Nếu muốn xuống dòng trong câu hỏi hoặc đáp án thì bạn cần bổ
                  sung thêm ký tự &lt;br /&gt; tại điểm muốn xuống dòng
                </p>
              </div>

              {/* Detail Examples Tabs Header */}
              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-[#1E293B] text-xs">
                  Ví dụ và hướng dẫn chi tiết từng loại câu hỏi:
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGuideActiveTab("tab1")}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer",
                      guideActiveTab === "tab1"
                        ? "bg-[#3B82F6] text-white shadow-xs"
                        : "border border-[#3B82F6] bg-white text-[#3B82F6] hover:bg-[#EEF2FF]",
                    )}
                  >
                    Dạng 1 đáp án
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideActiveTab("tab2")}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer",
                      guideActiveTab === "tab2"
                        ? "bg-[#3B82F6] text-white shadow-xs"
                        : "border border-[#3B82F6] bg-white text-[#3B82F6] hover:bg-[#EEF2FF]",
                    )}
                  >
                    Dạng nhiều đáp án
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideActiveTab("tab3")}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer",
                      guideActiveTab === "tab3"
                        ? "bg-[#3B82F6] text-white shadow-xs"
                        : "border border-[#3B82F6] bg-white text-[#3B82F6] hover:bg-[#EEF2FF]",
                    )}
                  >
                    Dạng điền từ
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideActiveTab("tab4")}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer",
                      guideActiveTab === "tab4"
                        ? "bg-[#3B82F6] text-white shadow-xs"
                        : "border border-[#3B82F6] bg-white text-[#3B82F6] hover:bg-[#EEF2FF]",
                    )}
                  >
                    Dạng đọc hiểu
                  </button>
                </div>
              </div>

              {/* Sub-rules for Tab 3 & Tab 4 */}
              {guideActiveTab === "tab3" && (
                <div className="space-y-0.5 text-[11px] text-[#334155] leading-relaxed rounded-[6px] bg-[#F8FAFC] p-2.5 border border-[#E2E8F0]">
                  <p className="font-bold text-[#1E293B]">Quy tắc điền từ</p>
                  <p>- Thêm <strong className="text-[#1E293B]">[FILL]</strong> đằng trước câu hỏi.</p>
                  <p>- Ô trống điền từ: <strong className="text-[#1E293B]">[đáp án đúng 1]</strong></p>
                </div>
              )}

              {guideActiveTab === "tab4" && (
                <div className="space-y-0.5 text-[11px] text-[#334155] leading-relaxed rounded-[6px] bg-[#F8FAFC] p-2.5 border border-[#E2E8F0]">
                  <p className="font-bold text-[#1E293B]">Quy tắc đọc hiểu</p>
                  <p>- Thêm <strong className="text-[#1E293B]">[READ-n]</strong> đằng trước câu hỏi bài đọc.</p>
                </div>
              )}

              {/* Code Box with subtle thin scrollbar */}
              <div className="relative max-h-[160px] overflow-y-auto rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] p-3 font-mono text-[11px] text-[#1E293B] leading-relaxed [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/40 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/60">
                <pre className="whitespace-pre-wrap break-words">
                  {getActiveTabSampleText()}
                </pre>
              </div>
            </div>

            {/* Modal Footer Action Button without top border line */}
            <div className="p-4 flex justify-end">
              <button
                type="button"
                onClick={handleUseGuideSample}
                className="flex items-center gap-1.5 rounded-[6px] bg-[#3B82F6] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#2563EB] transition-colors cursor-pointer"
              >
                {isCopiedSuccess ? (
                  <>
                    <Check className="size-4 stroke-[3]" />
                    <span>Đã dán mẫu thành công!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span>Sử dụng văn bản mẫu này</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
