"use client";

import { ExamNavigation } from "@/components/features/exam/exam-navigation";
import { ExamTimer } from "@/components/features/exam/exam-timer";
import { ProgressOrbs } from "@/components/features/exam/progress-orbs";
import { QuestionCard } from "@/components/features/exam/question-card";
import { mockExams } from "@/data/mock/mock-exams";
import { getQuestionsByExamId } from "@/data/mock/mock-questions";
import { useExamTimer } from "@/hooks/use-exam-timer";
import { cn } from "@/lib/utils";
import { useExamSessionStore } from "@/stores/exam-session-store";
import { AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

export default function ExamTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const exam = mockExams.find((e) => e.id === id);
  const questions = getQuestionsByExamId(id);

  const {
    phase,
    currentIndex,
    answers,
    startExam,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitExam,
    resetSession,
  } = useExamSessionStore();

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Start exam when entering; block if session is too old
  useEffect(() => {
    if (!exam || questions.length === 0) return;

    const { startedAt } = useExamSessionStore.getState();
    if (startedAt) {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      const maxAge = (exam.duration + 5) * 60; // duration + 5 min grace
      if (elapsed > maxAge) {
        resetSession();
        router.replace(`/exam/${id}/result?attemptId=expired`);
        return;
      }
    }

    if (phase === "not-started") {
      startExam(exam, questions);
    }
  }, [exam, questions, phase, startExam, resetSession, router, id]);

  // Redirect if no exam
  useEffect(() => {
    if (!exam || questions.length === 0) {
      router.replace("/exams");
    }
  }, [exam, questions, router]);

  // Drift-free timer

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const attempt = submitExam();
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `attempt-${attempt.id}`,
          JSON.stringify(attempt),
        );
      }
      router.push(`/exam/${id}/result?attemptId=${attempt.id}`);
    } catch {
      setIsSubmitting(false);
    }
  }, [submitExam, router, id]);

  const { timeLeft, isExpired } = useExamTimer(
    exam?.duration ? exam.duration * 60 : 0,
    useCallback(() => {
      if (phase === "in-progress") {
        handleSubmit();
      }
    }, [handleSubmit, phase]),
  );

  // Time expired auto-submit
  useEffect(() => {
    const submit = async () => {
      if (isExpired && phase === "in-progress") {
        await handleSubmit();
      }
    };
    submit();
  }, [isExpired, phase, handleSubmit]);

  if (!exam || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const answeredIds = new Set(
    Object.keys(answers).filter((k) => answers[k].length > 0),
  );
  const answeredCount = answeredIds.size;
  // const hasCurrentAnswer = (answers[currentQuestion?.id] ?? []).length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass border-b border-outline/15">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-semibold text-sm text-on-surface truncate">
              {exam.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              {answeredCount}/{questions.length} câu đã trả lời
            </p>
          </div>
          <ExamTimer timeLeft={timeLeft} total={exam.duration * 60} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Progress orbs */}
        <div className="mb-6">
          <ProgressOrbs
            total={questions.length}
            currentIndex={currentIndex}
            answeredIds={answeredIds}
            questionIds={questions.map((q) => q.id)}
            onJumpTo={goToQuestion}
          />
        </div>

        {/* Question card */}
        {currentQuestion && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 mb-6 shadow-[0_4px_24px_rgba(7,30,39,0.06)]">
            <QuestionCard
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              selectedIds={answers[currentQuestion.id] ?? []}
              onSelect={(qId, optionIds) => setAnswer(qId, optionIds)}
            />
          </div>
        )}

        {/* Navigation */}
        <ExamNavigation
          currentIndex={currentIndex}
          total={questions.length}
          onPrev={prevQuestion}
          onNext={nextQuestion}
          onSubmit={() => setShowSubmitConfirm(true)}
        />

        {/* Unanswered warning */}
        {answeredCount < questions.length && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Còn {questions.length - answeredCount} câu chưa trả lời
          </p>
        )}
      </main>

      {/* Submit confirmation modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSubmitConfirm(false)}
          />
          <div className="relative bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <button
              onClick={() => setShowSubmitConfirm(false)}
              className="cursor-pointer absolute top-4 right-4 text-muted-foreground hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="font-display font-semibold text-lg text-on-surface">
                Xác nhận nộp bài?
              </h2>
            </div>

            {answeredCount < questions.length && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Bạn đã trả lời {answeredCount}/{questions.length} câu.
                  {questions.length - answeredCount} câu chưa trả lời sẽ bị tính
                  là sai.
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-5">
              Sau khi nộp, bạn sẽ không thể thay đổi câu trả lời.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className={cn(
                  "cursor-pointer flex-1 py-2.5 rounded-xl text-sm font-medium border",
                  "border-outline/20 text-on-surface hover:bg-surface-container-low",
                  "transition-colors",
                )}
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "cursor-pointer flex-1 py-2.5 rounded-xl text-sm font-semibold",
                  "bg-secondary text-white hover:bg-secondary/90",
                  "transition-colors disabled:opacity-50",
                )}
              >
                {isSubmitting ? "Đang nộp..." : "Nộp bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
