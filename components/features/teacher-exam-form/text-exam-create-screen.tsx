"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  HelpCircle,
  X,
} from "lucide-react";
import { createSystemExam } from "@/services/exam.service";
import { cn } from "@/lib/utils";
import type { TeacherCreateExamRequest } from "@/lib/api/types";
import {
  DEFAULT_TEACHER_EXAM_POINT_MODE,
  DEFAULT_TEACHER_EXAM_TOTAL_POINTS,
} from "./types";
import { getTeacherExamQuestionPoints } from "./utils";

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
  acceptedAnswers: string[];
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

const TAB_3_SAMPLE = `[FILL] Bộ nhớ tạm của máy tính được gọi là [RAM].

[FILL] Thủ đô của Việt Nam là [Hà Nội | Ha Noi].`;

const TAB_4_SAMPLE = `[READ-5] Read the following passage and mark the letter A, B, C, or D on your answer sheet to indicate the correct answer to each of the questions.<br/>We get great pleasure from reading. The more advanced a man is, the greater delight he will find in reading. The ordinary man may think that subjects like philosophy or science are very difficult and that if philosophers and scientists read these subjects, it is not for pleasure. But this is not true. The mathematician finds the same pleasure in his mathematics as the school boy in an adventure story. For both, it is a play of the imagination, a mental recreation and exercise.<br/>The pleasure derived from this activity is common to all kinds of reading. But different types of books give us different types of pleasure. First in order of popularity is novel-reading. Novels contain pictures of`;

const GRADE_OPTIONS = [
  "Đại học",
  "Cao học",
  "Cao đẳng",
  "Trung học phổ thông",
  "Trung học cơ sở",
  "Tiểu học",
  "Trung tâm đào tạo",
  "Doanh nghiệp",
  "Khác",
];

const SCHOOL_OPTIONS = [
  "Đại học Bách Khoa",
  "Đại học Quốc Gia",
  "Đại học Kinh tế",
  "Đại học Sư phạm",
  "Đại học Y Dược",
  "Khác",
];

const SUBJECT_OPTIONS = [
  "Toán học",
  "Tiếng Anh",
  "Vật lý",
  "Hóa học",
  "Tin học",
  "Ngữ văn",
  "Sinh học",
  "Lịch sử",
  "Khác",
];

const TOPIC_OPTIONS = [
  "Ôn thi THPT",
  "Ngữ pháp",
  "Từ vựng",
  "Lý thuyết cơ bản",
  "Bài tập nâng cao",
  "Khác",
];

function parseFillQuestionPrompt(rawPrompt: string): {
  prompt: string;
  acceptedAnswers: string[];
} {
  const promptWithoutMarker = rawPrompt.replace(/^\s*\[FILL\]\s*/i, "").trim();

  const acceptedAnswers: string[] = [];
  const prompt = promptWithoutMarker
    .replace(/\[([^\[\]]+)\]/g, (_match, answerGroup: string) => {
      const answers = answerGroup
        .split("|")
        .map((answer) => answer.trim())
        .filter(Boolean);

      acceptedAnswers.push(...answers);
      return "_____";
    })
    .trim();

  return {
    prompt,
    acceptedAnswers: Array.from(new Set(acceptedAnswers)),
  };
}

function parseTextExamContent(rawText: string): {
  sections: string[];
  questions: ParsedQuestion[];
} {
  if (!rawText.trim()) {
    return { sections: [], questions: [] };
  }

  const lines = rawText.split("\n");
  const questions: ParsedQuestion[] = [];
  const sectionsSet = new Set<string>();

  let currentSection = "";
  let currentPromptLines: string[] = [];
  let currentOptions: ParsedOption[] = [];
  let questionCounter = 0;

  function finalizeQuestion() {
    const rawPromptText = currentPromptLines
      .join("\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .trim();

    if (rawPromptText) {
      questionCounter++;

      let prompt = rawPromptText;
      let typeText = "Một đáp án";
      let acceptedAnswers: string[] = [];

      if (/^\s*\[FILL\]/i.test(rawPromptText)) {
        typeText = "Điền từ";

        const parsedFillQuestion = parseFillQuestionPrompt(rawPromptText);
        prompt = parsedFillQuestion.prompt;
        acceptedAnswers = parsedFillQuestion.acceptedAnswers;
      } else if (/^\s*\[READ-\d+\]/i.test(rawPromptText)) {
        typeText = "Đọc hiểu";
      } else {
        const correctCount = currentOptions.filter((o) => o.isCorrect).length;

        if (correctCount > 1) {
          typeText = "Nhiều đáp án";
        } else if (correctCount === 0 && currentOptions.length > 0) {
          typeText = "Chưa chọn đáp án đúng";
        }
      }

      questions.push({
        id: questionCounter,
        sectionTitle: currentSection || undefined,
        prompt,
        typeText,
        options: [...currentOptions],
        acceptedAnswers,
      });
    }

    currentPromptLines = [];
    currentOptions = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();

    // Section header marker starts with ' (e.g., 'Phần 1)
    if (trimmedLine.startsWith("'")) {
      finalizeQuestion();
      currentSection = trimmedLine.replace(/^'+/, "").trim();
      if (currentSection) {
        sectionsSet.add(currentSection);
      }
      continue;
    }

    // Blank line indicates separation between questions
    if (!trimmedLine) {
      if (currentPromptLines.length > 0 || currentOptions.length > 0) {
        finalizeQuestion();
      }
      continue;
    }

    // Option line regex matching A. B. C. D. or *A. *B. or a. b. etc.
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

  return {
    sections: Array.from(sectionsSet),
    questions,
  };
}

interface TagComboboxProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options: string[];
  errorMessage?: string;
  className?: string;
}

function TagCombobox({
  label,
  required,
  value,
  onChange,
  placeholder,
  options,
  errorMessage,
  className,
}: TagComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(inputValue.toLowerCase().trim()),
    );
  }, [inputValue, options]);

  return (
    <div
      className={cn("space-y-1 relative", isOpen ? "z-30" : "z-10", className)}
      ref={containerRef}
    >
      <label className="text-xs font-bold text-[#1E293B]">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "min-h-9 w-full flex items-center justify-between gap-1.5 rounded-[6px] border bg-white px-2.5 py-1 text-xs outline-none transition-colors cursor-pointer",
          errorMessage
            ? "border-rose-500 focus-within:border-rose-500"
            : "border-[#CBD5E1] focus-within:border-[#8B5CF6]",
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {value ? (
            <span className="inline-flex items-center gap-1.5 rounded bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#334155] border border-[#CBD5E1]">
              <span>{value}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setInputValue("");
                }}
                className="rounded-full p-0.5 text-[#94A3B8] hover:bg-[#E2E8F0] hover:text-[#475569] focus:outline-none"
              >
                <X className="size-3" />
              </button>
            </span>
          ) : null}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim()) {
                e.preventDefault();
                onChange(inputValue.trim());
                setInputValue("");
                setIsOpen(false);
              }
            }}
            placeholder={value ? "" : placeholder}
            className="flex-1 bg-transparent text-xs text-[#1E293B] outline-none placeholder:text-[#94A3B8] min-w-[60px]"
          />
        </div>

        {isOpen ? (
          <ChevronUp className="size-4 shrink-0 text-[#64748B]" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-[#64748B]" />
        )}
      </div>

      {errorMessage && (
        <p className="text-[11px] text-rose-500 font-medium">{errorMessage}</p>
      )}

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-[6px] border border-[#CBD5E1] bg-white py-1 shadow-lg text-xs [scrollbar-width:thin]">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setInputValue("");
                  setIsOpen(false);
                }}
                className={cn(
                  "px-3 py-2 cursor-pointer text-[#1E293B] transition-colors hover:bg-[#F1F5F9]",
                  value === opt && "bg-[#F1F5F9] font-bold text-[#3B82F6]",
                )}
              >
                {opt}
              </div>
            ))
          ) : (
            <div
              onClick={() => {
                if (inputValue.trim()) {
                  onChange(inputValue.trim());
                  setInputValue("");
                  setIsOpen(false);
                }
              }}
              className="px-3 py-2 cursor-pointer text-[#3B82F6] hover:bg-[#F1F5F9] font-medium"
            >
              Thêm giá trị: "{inputValue}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TextExamCreateScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("public");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const [content, setContent] = useState("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3" | "tab4">(
    "tab1",
  );
  const [isCopiedSuccess, setIsCopiedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { sections, questions } = useMemo(() => {
    return parseTextExamContent(content);
  }, [content]);

  const activeQuestion = questions[selectedQuestionIndex] || questions[0];

  function showMessage(type: "success" | "error", message: string) {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }

  function getScopeSubtext() {
    if (scope === "private") {
      return "Chỉ bạn mới có quyền xem và làm đề thi này";
    }
    if (scope === "unlisted") {
      return "Chỉ những người có liên kết mới có thể truy cập đề thi này";
    }
    return "Mọi người có thể tìm kiếm đề thi của bạn trên hệ thống";
  }

  function handleInsertSample(sampleText: string) {
    setContent(sampleText);
    setSelectedQuestionIndex(0);
    setShowGuideModal(false);
    showMessage("success", "Đã dán mẫu văn bản thành công!");
  }

  function getActiveTabSampleText(): string {
    switch (activeTab) {
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

  async function handleCopyTabSample() {
    const textToCopy = getActiveTabSampleText();
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      // Fallback ignore clipboard write error
    }
    setContent(textToCopy);
    setSelectedQuestionIndex(0);
    setIsCopiedSuccess(true);
    setTimeout(() => {
      setIsCopiedSuccess(false);
    }, 3000);
  }

  async function handleCreateExam() {
    setShowErrors(true);

    if (!title.trim()) {
      showMessage("error", "Vui lòng nhập tên đề thi.");
      return;
    }

    if (!grade.trim()) {
      showMessage("error", "Vui lòng chọn trình độ.");
      return;
    }

    if (questions.length === 0) {
      showMessage(
        "error",
        "Vui lòng nhập ít nhất 1 câu hỏi hợp lệ theo hướng dẫn.",
      );
      return;
    }

    const invalidFillQuestion = questions.find(
      (question) =>
        question.typeText === "Điền từ" &&
        question.acceptedAnswers.length === 0,
    );

    if (invalidFillQuestion) {
      showMessage(
        "error",
        `Câu ${invalidFillQuestion.id} chưa có đáp án trong dấu [ ].`,
      );
      setSelectedQuestionIndex(invalidFillQuestion.id - 1);
      return;
    }

    setIsSubmitting(true);
    setNotification(null);
    try {
      const fullGradeParts = [
        grade.trim(),
        school.trim(),
        subject.trim(),
        topic.trim(),
      ].filter(Boolean);

      const finalGrade =
        fullGradeParts.length > 0
          ? fullGradeParts.join(" - ")
          : "Chưa phân loại";

      const payload: TeacherCreateExamRequest = {
        title: title.trim(),
        description: `Đề thi soạn thảo văn bản (${questions.length} câu)`,
        grade: finalGrade,
        image_url: "",
        duration_minutes: 45,
        is_published: scope === "public",
        is_active: scope !== "unlisted",
        total_points: DEFAULT_TEACHER_EXAM_TOTAL_POINTS,
        point_mode: DEFAULT_TEACHER_EXAM_POINT_MODE,
        assignment_type: "exam",
        max_attempts: null,
        questions: questions.map((q, idx) => {
          const isFillInBlank = q.typeText === "Điền từ";
          const isMultipleChoice = q.typeText === "Nhiều đáp án";
          const questionType = isMultipleChoice
            ? "multiple_choice"
            : isFillInBlank
              ? "fill_in_blank"
              : "single_choice";

          const acceptedAnswers = isFillInBlank ? q.acceptedAnswers : [];

          return {
            prompt: q.prompt,
            question_type: questionType,
            points: getTeacherExamQuestionPoints(idx, questions.length),
            order_index: idx + 1,
            explanation: "",
            image_url: "",
            accepted_answers: acceptedAnswers,
            options: q.options.map((opt) => ({
              option_key: opt.key,
              option_text: opt.text,
              is_correct: opt.isCorrect,
              image_url: "",
            })),
          };
        }),
      };

      await createSystemExam(payload);
      showMessage("success", "Tạo đề thi bằng soạn thảo văn bản thành công!");
      setTimeout(() => {
        router.push("/teacher/exams");
      }, 1000);
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message
          : "Tạo đề thi thất bại. Vui lòng thử lại.";
      showMessage("error", msg || "Tạo đề thi thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={cn(
            "fixed top-5 right-5 z-50 rounded-[6px] px-4 py-3 text-xs font-semibold text-white shadow-lg transition-all",
            notification.type === "success" ? "bg-[#10B981]" : "bg-[#EF4444]",
          )}
        >
          {notification.message}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1E293B]">Tạo đề thi nhanh</h1>
          <p className="text-xs text-[#64748B]">
            Soạn thảo văn bản trực tiếp để tự động trích xuất câu hỏi và xem
            trước kết quả.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/teacher/exams"
            className="flex h-9 items-center gap-1.5 rounded-[6px] bg-[#EF4444] px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#DC2626]"
          >
            <ArrowLeft className="size-3.5" />
            Trở về
          </Link>

          <button
            type="button"
            onClick={handleCreateExam}
            disabled={isSubmitting}
            className="flex h-9 min-w-24 items-center justify-center rounded-[6px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-4 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
          >
            {isSubmitting ? "Đang xử lý..." : "Tạo đề"}
          </button>
        </div>
      </div>

      {/* Main Grid Layout (2 Columns) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Column: Form & Textarea Editor */}
        <div className="space-y-4 rounded-[8px] border border-[#CBD5E1] bg-white p-5 shadow-xs lg:col-span-7">
          {/* Field 1: Tên đề thi */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1E293B]">
              Tên đề thi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên đề thi"
              className="h-9 w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#8B5CF6]"
            />
          </div>

          {/* Field 2: Chế độ chia sẻ (Compact half width) */}
          <div className="space-y-1 w-full sm:w-1/2">
            <label className="text-xs font-bold text-[#1E293B]">
              Chế độ chia sẻ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="h-9 w-full appearance-none rounded-[6px] border border-[#CBD5E1] bg-white pl-3 pr-9 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#8B5CF6] cursor-pointer"
              >
                <option value="public">Công khai</option>
                <option value="private">Riêng tư</option>
                <option value="unlisted">Không công khai</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
            </div>
            <p className="text-[11px] text-[#64748B]">{getScopeSubtext()}</p>
          </div>

          {/* Field 3: Trình độ & Expanding Cascading Fields */}
          {!grade ? (
            <TagCombobox
              label="Trình độ"
              required
              value={grade}
              onChange={(val) => setGrade(val)}
              placeholder="Chọn trình độ"
              options={GRADE_OPTIONS}
              className="w-full sm:w-1/2"
              errorMessage={
                showErrors && !grade.trim()
                  ? "Trường này là bắt buộc."
                  : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              {/* Row 1: Trình độ * & Trường học * (z-index 20) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 relative z-20">
                <TagCombobox
                  label="Trình độ"
                  required
                  value={grade}
                  onChange={(val) => setGrade(val)}
                  placeholder="Chọn trình độ"
                  options={GRADE_OPTIONS}
                  errorMessage={
                    showErrors && !grade.trim()
                      ? "Trường này là bắt buộc."
                      : undefined
                  }
                />

                <TagCombobox
                  label="Trường học"
                  required
                  value={school}
                  onChange={(val) => setSchool(val)}
                  placeholder="Chọn trường học"
                  options={SCHOOL_OPTIONS}
                />
              </div>

              {/* Row 2: Môn học & Chủ đề (z-index 10) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 relative z-10">
                <TagCombobox
                  label="Môn học"
                  value={subject}
                  onChange={(val) => setSubject(val)}
                  placeholder="Chọn Môn học"
                  options={SUBJECT_OPTIONS}
                />

                <TagCombobox
                  label="Chủ đề"
                  value={topic}
                  onChange={(val) => setTopic(val)}
                  placeholder="Chọn Chủ đề"
                  options={TOPIC_OPTIONS}
                />
              </div>
            </div>
          )}

          {/* Guide Button */}
          <div className="flex items-center justify-start pt-1">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-1.5 rounded-[6px] bg-[#FF8A9B] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#FF758C]"
            >
              <HelpCircle className="size-3.5" />
              Xem hướng dẫn
            </button>
          </div>

          {/* Field 4: Soạn câu hỏi */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1E293B]">
                Soạn câu hỏi
              </label>
              {questions.length > 0 && (
                <span className="text-[11px] font-semibold text-emerald-600">
                  ✓ Đã trích xuất {questions.length} câu hỏi
                </span>
              )}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Vui lòng soạn câu hỏi theo đúng cấu trúc"
              rows={14}
              className="w-full rounded-[6px] border border-rose-300 bg-white p-3.5 text-xs font-mono text-[#1E293B] outline-none transition-colors focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/40 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/60"
            />
          </div>
        </div>

        {/* Right Column: Live Preview Panel (Fit-content Height) */}
        <div className="flex h-fit flex-col rounded-[8px] border border-[#CBD5E1] bg-white p-5 shadow-xs lg:col-span-5">
          <h2 className="text-xs font-bold text-[#1E293B]">Xem trước</h2>

          {questions.length === 0 ? (
            <div className="my-8 text-center text-xs font-medium text-[#475569]">
              Vui lòng soạn câu hỏi theo hướng dẫn!
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {/* Question Navigation Numbers */}
              <div>
                <p className="text-xs font-semibold text-[#1E293B]">
                  Danh sách câu hỏi
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {questions.map((q, idx) => {
                    const isSelected =
                      (selectedQuestionIndex >= questions.length
                        ? 0
                        : selectedQuestionIndex) === idx;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSelectedQuestionIndex(idx)}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-[4px] text-xs font-bold transition-all",
                          isSelected
                            ? "bg-[#3B82F6] text-white shadow-xs"
                            : "border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC]",
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Detail Render Box */}
              {activeQuestion && (
                <div className="rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                    <span className="text-xs font-bold text-[#1E293B]">
                      Câu {activeQuestion.id} ({activeQuestion.typeText})
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap text-xs font-bold leading-relaxed text-[#1E293B]">
                    {activeQuestion.prompt}
                  </p>

                  {activeQuestion.typeText === "Điền từ" && (
                    <div className="rounded-[6px] border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-[11px] text-emerald-800">
                      <span className="font-bold">Đáp án chấp nhận: </span>
                      {activeQuestion.acceptedAnswers.length > 0
                        ? activeQuestion.acceptedAnswers.join(" hoặc ")
                        : "Chưa khai báo đáp án"}
                    </div>
                  )}

                  {activeQuestion.options.length > 0 && (
                    <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
                      {activeQuestion.options.map((option) => (
                        <div
                          key={option.key}
                          className={cn(
                            "flex items-center gap-2.5 rounded-[6px] border p-2.5 text-xs transition-colors",
                            option.isCorrect
                              ? "border-emerald-200 bg-emerald-50/50 font-semibold text-[#1E293B]"
                              : "border-[#CBD5E1] bg-white text-[#475569]",
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[#FFFFFF]",
                              option.isCorrect
                                ? "bg-[#10B981]"
                                : "bg-[#EF4444]",
                            )}
                          >
                            {option.isCorrect ? (
                              <Check className="size-3 stroke-[3]" />
                            ) : (
                              <X className="size-3 stroke-[3]" />
                            )}
                          </div>
                          <span className="min-w-0 flex-1 truncate">
                            {option.key}. {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Syntax Guide Popup Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[80vh] w-full max-w-[550px] flex-col overflow-hidden rounded-[10px] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="relative px-5 pt-4 pb-1 text-center">
              <h3 className="text-sm font-bold text-[#1E293B]">
                Cấu trúc soạn thảo câu hỏi bằng văn bản
              </h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="absolute right-3.5 top-2.5 rounded-full p-1 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#1E293B]"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body Scrollable (Subtle thin scrollbar) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-[#1E293B] [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/40 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/60">
              {/* General Rules */}
              <div className="space-y-1 text-[11px] leading-relaxed text-[#334155]">
                <h4 className="mb-1 text-xs font-bold text-[#1E293B]">
                  Quy tắc chung
                </h4>

                <p>
                  - Mỗi câu hỏi phải được ngăn cách bằng ít nhất{" "}
                  <strong className="text-[#1E293B]">1 dòng trống</strong>.
                </p>

                <p>
                  - Muốn xuống dòng bên trong câu hỏi hoặc đáp án, dùng{" "}
                  <code className="rounded bg-[#EEF2FF] px-1 py-0.5 font-mono text-[#4F46E5]">
                    &lt;br /&gt;
                  </code>
                  .
                </p>

                <p>
                  - Có thể tạo tiêu đề phần bằng cách bắt đầu một dòng với dấu{" "}
                  <code className="rounded bg-[#EEF2FF] px-1 py-0.5 font-mono text-[#4F46E5]">
                    &apos;
                  </code>
                  , ví dụ:{" "}
                  <code className="rounded bg-[#EEF2FF] px-1 py-0.5 font-mono text-[#4F46E5]">
                    &apos;Phần 1
                  </code>
                  .
                </p>

                <p>
                  - Câu hỏi không đúng một trong các cấu trúc bên dưới sẽ không
                  được trích xuất.
                </p>

                <p>
                  - Chọn từng loại câu hỏi bên dưới để xem cú pháp riêng và ví
                  dụ.
                </p>
              </div>

              {/* Detail Examples Tabs Header */}
              <div className="space-y-1.5 pt-0.5">
                <h4 className="font-bold text-[#1E293B] text-xs">
                  Ví dụ và hướng dẫn chi tiết từng loại câu hỏi:
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab1")}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                      activeTab === "tab1"
                        ? "bg-[#3B82F6] text-white shadow-xs"
                        : "border border-[#3B82F6] bg-white text-[#3B82F6] hover:bg-[#EEF2FF]",
                    )}
                  >
                    Dạng 1 đáp án
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab2")}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                      activeTab === "tab2"
                        ? "bg-[#3B82F6] text-white shadow-xs"
                        : "border border-[#3B82F6] bg-white text-[#3B82F6] hover:bg-[#EEF2FF]",
                    )}
                  >
                    Dạng nhiều đáp án
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab3")}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                      activeTab === "tab3"
                        ? "bg-[#3B82F6] text-white shadow-xs"
                        : "border border-[#3B82F6] bg-white text-[#3B82F6] hover:bg-[#EEF2FF]",
                    )}
                  >
                    Dạng điền từ
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tab4")}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                      activeTab === "tab4"
                        ? "bg-[#3B82F6] text-white shadow-xs"
                        : "border border-[#3B82F6] bg-white text-[#3B82F6] hover:bg-[#EEF2FF]",
                    )}
                  >
                    Dạng đọc hiểu
                  </button>
                </div>
              </div>

              {/* Rules for the selected question type */}
              <div className="space-y-1 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[11px] leading-relaxed text-[#334155]">
                {activeTab === "tab1" && (
                  <>
                    <p className="font-bold text-[#1E293B]">
                      Quy tắc dạng 1 đáp án
                    </p>
                    <p>- Viết nội dung câu hỏi ở dòng đầu tiên.</p>
                    <p>
                      - Mỗi phương án nằm trên một dòng riêng và bắt đầu bằng{" "}
                      <strong className="text-[#1E293B]">A., B., C., D.</strong>
                    </p>
                    <p>
                      - Chỉ đặt dấu{" "}
                      <strong className="text-[#1E293B]">*</strong> trước đúng{" "}
                      <strong className="text-[#1E293B]">1 phương án</strong>.
                    </p>
                    <p>
                      - Ví dụ đáp án đúng:{" "}
                      <code className="rounded bg-[#EEF2FF] px-1 py-0.5 font-mono text-[#4F46E5]">
                        *B. had sold
                      </code>
                    </p>
                    <p>
                      - Để bắt đầu câu tiếp theo, chừa ít nhất{" "}
                      <strong className="text-[#1E293B]">1 dòng trống</strong>.
                    </p>
                  </>
                )}

                {activeTab === "tab2" && (
                  <>
                    <p className="font-bold text-[#1E293B]">
                      Quy tắc dạng nhiều đáp án
                    </p>
                    <p>- Viết nội dung câu hỏi ở dòng đầu tiên.</p>
                    <p>
                      - Mỗi phương án nằm trên một dòng riêng và bắt đầu bằng{" "}
                      <strong className="text-[#1E293B]">A., B., C., D.</strong>
                    </p>
                    <p>
                      - Đặt dấu <strong className="text-[#1E293B]">*</strong>{" "}
                      trước{" "}
                      <strong className="text-[#1E293B]">
                        tất cả phương án đúng
                      </strong>
                      .
                    </p>
                    <p>
                      - Câu hỏi phải có ít nhất{" "}
                      <strong className="text-[#1E293B]">
                        2 phương án đúng
                      </strong>{" "}
                      để được nhận diện là dạng nhiều đáp án.
                    </p>
                    <p>
                      - Ví dụ:{" "}
                      <code className="rounded bg-[#EEF2FF] px-1 py-0.5 font-mono text-[#4F46E5]">
                        *B. fluently
                      </code>{" "}
                      và{" "}
                      <code className="rounded bg-[#EEF2FF] px-1 py-0.5 font-mono text-[#4F46E5]">
                        *D. well
                      </code>
                    </p>
                  </>
                )}

                {activeTab === "tab3" && (
                  <>
                    <p className="font-bold text-[#1E293B]">
                      Quy tắc dạng điền từ
                    </p>
                    <p>
                      - Đặt <strong className="text-[#1E293B]">[FILL]</strong> ở
                      đầu câu để hệ thống nhận diện câu điền từ.
                    </p>
                    <p>
                      - Đặt đáp án tại đúng vị trí cần để trống bằng cú pháp{" "}
                      <strong className="text-[#1E293B]">[đáp án]</strong>.
                    </p>
                    <p>
                      - Nếu chấp nhận nhiều cách trả lời, ngăn cách bằng dấu{" "}
                      <strong className="text-[#1E293B]">|</strong>, ví dụ{" "}
                      <strong className="text-[#1E293B]">
                        [Hà Nội | Ha Noi]
                      </strong>
                      .
                    </p>
                    <p>
                      - Không dùng dấu{" "}
                      <strong className="text-[#1E293B]">*</strong> cho dạng
                      điền từ.
                    </p>
                    <p>
                      - Khi xem trước và làm bài,{" "}
                      <strong className="text-[#1E293B]">[FILL]</strong> sẽ bị
                      ẩn và nội dung trong dấu{" "}
                      <strong className="text-[#1E293B]">[ ]</strong> sẽ được
                      thay bằng ô trống.
                    </p>
                    <p>
                      - Không dùng dấu{" "}
                      <strong className="text-[#1E293B]">[ ]</strong> cho nội
                      dung thông thường; hãy dùng dấu ngoặc tròn.
                    </p>
                  </>
                )}

                {activeTab === "tab4" && (
                  <>
                    <p className="font-bold text-[#1E293B]">
                      Quy tắc dạng đọc hiểu
                    </p>
                    <p>
                      - Đặt <strong className="text-[#1E293B]">[READ-n]</strong>{" "}
                      ở đầu đoạn đọc;{" "}
                      <strong className="text-[#1E293B]">n</strong> là số câu
                      hỏi con, từ 1 đến 9.
                    </p>
                    <p>
                      - Nội dung đoạn đọc được viết ngay sau{" "}
                      <strong className="text-[#1E293B]">[READ-n]</strong>.
                    </p>
                    <p>
                      - Muốn xuống dòng trong đoạn đọc, dùng{" "}
                      <code className="rounded bg-[#EEF2FF] px-1 py-0.5 font-mono text-[#4F46E5]">
                        &lt;br /&gt;
                      </code>
                      .
                    </p>
                    <p>
                      - Sau đoạn đọc, nhập từng câu hỏi con theo cú pháp của{" "}
                      <strong className="text-[#1E293B]">Dạng 1 đáp án</strong>.
                    </p>
                    <p>
                      - Mỗi câu hỏi con phải có đúng 1 phương án được đánh dấu{" "}
                      <strong className="text-[#1E293B]">*</strong>.
                    </p>
                    <p>
                      - Chừa ít nhất{" "}
                      <strong className="text-[#1E293B]">1 dòng trống</strong>{" "}
                      giữa đoạn đọc và từng câu hỏi con.
                    </p>
                  </>
                )}
              </div>

              {/* Code Box with subtle thin scrollbar */}
              <div className="relative max-h-[160px] overflow-y-auto rounded-[6px] border border-[#CBD5E1] bg-white p-3 font-mono text-[11px] text-[#1E293B] leading-relaxed [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/40 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/60">
                <pre className="whitespace-pre-wrap break-words">
                  {getActiveTabSampleText()}
                </pre>
              </div>

              {/* Copy Button & Inline Success Message */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleCopyTabSample()}
                  className="flex items-center gap-1.5 rounded-[6px] bg-[#3B82F6] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#2563EB]"
                >
                  <Copy className="size-3.5" />
                  Copy
                </button>

                {isCopiedSuccess && (
                  <span className="text-[11px] font-semibold text-emerald-600">
                    ✓ Đã copy thành công!
                  </span>
                )}
              </div>

              {/* Footer instruction text */}
              <div className="space-y-0.5 pt-0.5 text-[11px] text-[#475569]">
                <p>
                  Hãy sao chép cấu trúc văn bản trên và dán vào phần soạn thảo
                  để xem trước câu hỏi nhé!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
