"use client";

import { useRouter } from "next/navigation";
import { useExamWizardStore } from "@/stores/exam-wizard-store";
import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrueFalseFields } from "@/components/features/question/true-false-fields";
import { Textarea } from "@/components/ui/textarea";
import { OTPInput } from "@/components/features/question/otp-input";
import { cn } from "@/lib/utils";
import { QuestionType } from "@/types/exam.types";

function createTrueFalseOptions(correct: "true" | "false" = "true") {
  return [
    { id: "true", text: "Đúng", isCorrect: correct === "true" },
    { id: "false", text: "Sai", isCorrect: correct === "false" },
  ];
}

export default function QuestionsPage() {
  const router = useRouter();
  const { questions, addQuestion, removeQuestion, updateQuestion } =
    useExamWizardStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddQuestion = () => {
    addQuestion({
      id: Date.now().toString(),
      text: "",
      type: "single",
      options: [{ id: Date.now().toString(), text: "", isCorrect: true }],
      explanation: "",
      points: 1,
    });
  };

  const handleTypeChange = (qId: string, type: QuestionType) => {
    const q = questions.find((question) => question.id === qId);
    if (!q) return;

    if (type === "true_false") {
      const currentCorrect =
        q.options.find((option) => option.isCorrect)?.id === "false"
          ? "false"
          : "true";
      updateQuestion(qId, {
        type,
        options: createTrueFalseOptions(currentCorrect),
      });
      return;
    }

    if (q.type === "true_false") {
      updateQuestion(qId, {
        type,
        options: [{ id: `${Date.now()}`, text: "", isCorrect: true }],
      });
      return;
    }

    let options = q.options;
    if (type === "single" || type === "multiple_choice") {
      const firstCorrectIndex = q.options.findIndex(
        (option) => option.isCorrect,
      );
      options = q.options.map((option, index) => ({
        ...option,
        isCorrect:
          firstCorrectIndex === -1 ? index === 0 : index === firstCorrectIndex,
      }));
    }

    updateQuestion(qId, { type, options });
  };

  const handleOptionChange = (qId: string, oIdx: number, text: string) => {
    const q = questions.find((q) => q.id === qId);
    if (!q || q.type === "true_false") return;
    const updated = {
      ...q,
      options: q.options.map((o, i) => (i === oIdx ? { ...o, text } : o)),
    };
    updateQuestion(qId, updated);
  };

  const handleAddOption = (qId: string) => {
    const q = questions.find((q) => q.id === qId);
    if (!q || q.type === "true_false") return;
    updateQuestion(qId, {
      ...q,
      options: [
        ...q.options,
        { id: Date.now().toString(), text: "", isCorrect: false },
      ],
    });
  };

  const handleRemoveOption = (qId: string, oIdx: number) => {
    const q = questions.find((q) => q.id === qId);
    if (!q || q.type === "true_false") return;
    updateQuestion(qId, {
      ...q,
      options: q.options.filter((_, i) => i !== oIdx),
    });
  };

  const handleCorrectChange = (qId: string, oIdx: number) => {
    const q = questions.find((q) => q.id === qId);
    if (!q) return;
    let options;
    if (
      q.type === "single" ||
      q.type === "multiple_choice" ||
      q.type === "true_false"
    ) {
      options = q.options.map((o, i) => ({ ...o, isCorrect: i === oIdx }));
    } else {
      options = q.options.map((o, i) =>
        i === oIdx ? { ...o, isCorrect: !o.isCorrect } : o,
      );
    }
    updateQuestion(qId, { ...q, options });
  };

  const handleNext = () => {
    const missing = questions.filter((q) => !q.text.trim());
    if (missing.length > 0) {
      setErrors({ questions: "Tất cả câu hỏi phải có nội dung" });
      return;
    }
    router.push("/teacher/exams/create/settings");
  };

  return (
    <div className="space-y-5 w-full">
      <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-on-surface">
            Danh sách câu hỏi
          </h2>
          <button
            onClick={handleAddQuestion}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>
              Chưa có câu hỏi nào. Nhấn &quot;Thêm câu hỏi&quot; để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div
                key={q.id}
                className="border border-outline/20 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`question-${q.id}`}
                        className="text-sm font-medium text-on-surface"
                      >
                        Câu hỏi {qi + 1}
                      </Label>
                      <Textarea
                        id={`question-${q.id}`}
                        value={q.text}
                        onChange={(e) => {
                          updateQuestion(q.id, { text: e.target.value });
                          setErrors({});
                        }}
                        placeholder="Nhập nội dung câu hỏi..."
                        rows={3}
                        className="min-h-24 resize-none"
                      />
                      {errors.questions && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.questions}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`question-type-${q.id}`}
                        className="text-sm font-medium text-on-surface"
                      >
                        Loại câu hỏi
                      </Label>
                      <Select
                        value={q.type}
                        onValueChange={(value) =>
                          handleTypeChange(q.id, value as QuestionType)
                        }
                      >
                        <SelectTrigger
                          id={`question-type-${q.id}`}
                          className="w-full"
                        >
                          <SelectValue placeholder="Chọn loại câu hỏi" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="single">Một đáp án</SelectItem>
                          <SelectItem value="multiple">Nhiều đáp án</SelectItem>
                          <SelectItem value="true_false">Đúng / Sai</SelectItem>
                          <SelectItem value="text">Tự luận ngắn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {q.type === "text" ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-on-surface">
                          Đáp án đúng
                        </Label>
                        <OTPInput
                          value={q.answer ?? ""}
                          onChange={(value) =>
                            updateQuestion(q.id, { answer: value })
                          }
                        />
                      </div>
                    ) : q.type === "true_false" ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-on-surface">
                          Đáp án đúng
                        </Label>
                        <TrueFalseFields
                          value={
                            q.options.find((option) => option.isCorrect)?.id ??
                            ""
                          }
                          onChange={(value) => {
                            updateQuestion(q.id, {
                              options: createTrueFalseOptions(
                                value === "false" ? "false" : "true",
                              ),
                            });
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          Học sinh sẽ chỉ thấy 2 lựa chọn cố định: Đúng và Sai.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-on-surface">
                          Đáp án
                        </Label>
                        {q.type === "single" || q.type === "multiple_choice" ? (
                          <RadioGroup
                            value={
                              q.options.find((option) => option.isCorrect)?.id
                            }
                            onValueChange={(value) => {
                              const optionIndex = q.options.findIndex(
                                (option) => option.id === value,
                              );
                              if (optionIndex !== -1) {
                                handleCorrectChange(q.id, optionIndex);
                              }
                            }}
                            className="gap-2"
                          >
                            {q.options.map((opt, oi) => (
                              <div
                                key={opt.id}
                                className={cn(
                                  "flex items-center gap-3 rounded-2xl border px-3 py-3 transition-[border-color,background-color,box-shadow]",
                                  opt.isCorrect
                                    ? "border-primary/30 bg-primary/5 shadow-[0_16px_40px_-30px_rgba(0,70,74,0.3)]"
                                    : "border-outline/15 bg-surface-container-low hover:border-primary/20 hover:bg-surface-container-lowest",
                                )}
                              >
                                <RadioGroupItem
                                  value={opt.id}
                                  id={`${q.id}-option-${opt.id}`}
                                  aria-label={`Đáp án ${oi + 1}`}
                                />
                                <Input
                                  value={opt.text}
                                  onChange={(e) =>
                                    handleOptionChange(q.id, oi, e.target.value)
                                  }
                                  placeholder={`Đáp án ${oi + 1}`}
                                  className="flex-1 bg-surface-container-lowest shadow-none"
                                />
                                {q.options.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveOption(q.id, oi)}
                                    className="cursor-pointer p-1.5 rounded-xl hover:bg-surface-container-lowest text-muted-foreground"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </RadioGroup>
                        ) : (
                          <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                              <div
                                key={opt.id}
                                className={cn(
                                  "flex items-center gap-3 rounded-2xl border px-3 py-3 transition-[border-color,background-color,box-shadow]",
                                  opt.isCorrect
                                    ? "border-primary/30 bg-primary/5 shadow-[0_16px_40px_-30px_rgba(0,70,74,0.3)]"
                                    : "border-outline/15 bg-surface-container-low hover:border-primary/20 hover:bg-surface-container-lowest",
                                )}
                              >
                                <Checkbox
                                  checked={opt.isCorrect}
                                  onCheckedChange={() =>
                                    handleCorrectChange(q.id, oi)
                                  }
                                  aria-label={`Đáp án ${oi + 1}`}
                                />
                                <Input
                                  value={opt.text}
                                  onChange={(e) =>
                                    handleOptionChange(q.id, oi, e.target.value)
                                  }
                                  placeholder={`Đáp án ${oi + 1}`}
                                  className="flex-1 bg-surface-container-lowest shadow-none"
                                />
                                {q.options.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveOption(q.id, oi)}
                                    className="cursor-pointer p-1.5 rounded-xl hover:bg-surface-container-lowest text-muted-foreground"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {(q.type === "multiple" ||
                          q.type === "multiple_choice" ||
                          q.type === "single") && (
                          <button
                            onClick={() => handleAddOption(q.id)}
                            className="cursor-pointer flex items-center gap-1.5 text-sm text-primary hover:text-primary/80"
                          >
                            <Plus className="w-4 h-4" />
                            Thêm đáp án
                          </button>
                        )}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`question-explanation-${q.id}`}
                        className="text-sm font-medium text-on-surface"
                      >
                        Giải thích đáp án
                      </Label>
                      <Textarea
                        id={`question-explanation-${q.id}`}
                        value={q.explanation}
                        onChange={(e) =>
                          updateQuestion(q.id, { explanation: e.target.value })
                        }
                        placeholder="Nhập lời giải hoặc giải thích ngắn cho câu hỏi này..."
                        rows={3}
                        className="min-h-24 resize-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="cursor-pointer p-1.5 rounded-lg hover:bg-surface-container-low text-red-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push("/teacher/exams/create")}
          className="cursor-pointer px-5 py-2.5 rounded-xl border border-outline text-sm font-semibold hover:bg-surface-container-low transition-colors"
        >
          ← Quay lại
        </button>
        <button
          onClick={handleNext}
          className="cursor-pointer px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Tiếp theo: Cài đặt →
        </button>
      </div>
    </div>
  );
}
