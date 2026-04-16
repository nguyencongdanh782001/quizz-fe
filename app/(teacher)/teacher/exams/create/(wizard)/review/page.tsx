"use client";

import { useRouter } from "next/navigation";
import { useExamWizardStore } from "@/stores/exam-wizard-store";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const questionTypeLabels = {
  single: "Một đáp án",
  multiple: "Nhiều đáp án",
  multiple_choice: "Trắc nghiệm",
  true_false: "Đúng / Sai",
  text: "Tự luận ngắn",
} as const;

export default function ReviewPage() {
  const router = useRouter();
  const state = useExamWizardStore();
  const {
    title,
    description,
    subject,
    grade,
    difficulty,
    questions,
    duration,
    passingScore,
    attemptLimit,
    shuffleQuestions,
    shuffleOptions,
  } = state;

  const handlePublish = async () => {
    // TODO: submit exam to backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/teacher/exams");
  };

  return (
    <div className="space-y-5 w-full">
      <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-lg text-on-surface">
          Xem lại bài thi
        </h2>

        {/* Basic info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">
            Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-surface rounded-xl p-3">
              <span className="text-muted-foreground">Tiêu đề</span>
              <p className="font-medium text-on-surface mt-0.5">
                {title || "—"}
              </p>
            </div>
            <div className="bg-surface rounded-xl p-3">
              <span className="text-muted-foreground">Môn học</span>
              <p className="font-medium text-on-surface mt-0.5">
                {subject || "—"}
              </p>
            </div>
            <div className="bg-surface rounded-xl p-3">
              <span className="text-muted-foreground">Khối lớp</span>
              <p className="font-medium text-on-surface mt-0.5">
                {grade ? `Lớp ${grade}` : "—"}
              </p>
            </div>
            <div className="bg-surface rounded-xl p-3">
              <span className="text-muted-foreground">Mức độ</span>
              <p className="font-medium text-on-surface mt-0.5 capitalize">
                {difficulty || "—"}
              </p>
            </div>
          </div>
          {description && (
            <div className="bg-surface rounded-xl p-3">
              <span className="text-muted-foreground text-sm">Mô tả</span>
              <p className="text-on-surface text-sm mt-0.5">{description}</p>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">
            Câu hỏi ({questions.length})
          </h3>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-surface rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold bg-primary-container text-on-primary-container rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-on-surface text-sm font-medium">
                      {q.text || "(Chưa nhập)"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {questionTypeLabels[q.type]}
                    </p>
                    {q.type !== "text" && (
                      <div className="mt-2 space-y-1">
                        {q.options.map((opt, oi) => (
                          <div
                            key={opt.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center",
                                opt.isCorrect
                                  ? "bg-primary border-primary"
                                  : "border-outline",
                              )}
                            >
                              {opt.isCorrect && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span
                              className={
                                opt.isCorrect
                                  ? "text-on-surface"
                                  : "text-muted-foreground"
                              }
                            >
                              {opt.text || `Đáp án ${oi + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === "text" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tự luận
                      </p>
                    )}
                    {q.explanation && (
                      <div className="mt-3 rounded-xl border border-outline/10 bg-surface-container-low px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Giải thích
                        </p>
                        <p className="mt-1 text-sm text-on-surface">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">
            Cài đặt
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-surface rounded-xl p-3">
              <span className="text-muted-foreground">Thời gian</span>
              <p className="font-medium text-on-surface mt-0.5">
                {duration} phút
              </p>
            </div>
            <div className="bg-surface rounded-xl p-3">
              <span className="text-muted-foreground">Điểm đạt</span>
              <p className="font-medium text-on-surface mt-0.5">
                {passingScore}%
              </p>
            </div>
            <div className="bg-surface rounded-xl p-3">
              <span className="text-muted-foreground">Số lần làm</span>
              <p className="font-medium text-on-surface mt-0.5">
                {attemptLimit}
              </p>
            </div>
            <div className="bg-surface rounded-xl p-3">
              <span className="text-muted-foreground">Xáo trộn câu hỏi</span>
              <p className="font-medium text-on-surface mt-0.5">
                {shuffleQuestions ? "Có" : "Không"}
              </p>
            </div>
            <div className="bg-surface rounded-xl p-3">
              <span className="text-muted-foreground">Xáo trộn đáp án</span>
              <p className="font-medium text-on-surface mt-0.5">
                {shuffleOptions ? "Có" : "Không"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push("/teacher/exams/create/settings")}
          className="cursor-pointer px-5 py-2.5 rounded-xl border border-outline text-sm font-semibold hover:bg-surface-container-low transition-colors"
        >
          ← Quay lại
        </button>
        <button
          onClick={handlePublish}
          className="cursor-pointer px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Xuất bản bài thi
        </button>
      </div>
    </div>
  );
}
