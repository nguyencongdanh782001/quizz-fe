"use client";

import { ExamNavigation } from "@/components/features/exam/exam-navigation";
import { ExamTimer } from "@/components/features/exam/exam-timer";
import { ProgressOrbs } from "@/components/features/exam/progress-orbs";
import { QuestionCard } from "@/components/features/exam/question-card";
import { ExamUnavailable } from "@/components/features/exam/exam-unavailable";
import { useExamTimer } from "@/hooks/use-exam-timer";
import { useNow } from "@/hooks/use-now";
import { getExamAvailabilityStatus } from "@/lib/exam-availability";
import {
  getStudentExamDetail,
  writeCachedStudentAttemptResult,
  saveStudentAttemptAnswerBatch,
  saveStudentAttemptAnswers,
  submitStudentAttempt,
  StudentExamDetailData,
} from "@/lib/student-system-exams";
import { useBreadcrumbLabel } from "@/components/shared/breadcrumb-labels";
import {
  findFirstUnansweredTextQuestionIndex,
  getAnsweredQuestionIds,
  getTextAnswerValidationErrors,
  hasStudentAnswer,
  TEXT_ANSWER_REQUIRED_MESSAGE,
} from "@/lib/student-exam-answers";
import { cn } from "@/lib/utils";
import { useExamSessionStore } from "@/stores/exam-session-store";
import type { Question } from "@/types/exam.types";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";

function ExamTakeContent({
  id,
  examDetail,
}: {
  id: string;
  examDetail: StudentExamDetailData;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    phase,
    currentIndex,
    answers,
    startExam,
    setAnswer,
    setTextAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    resetSession,
  } = useExamSessionStore();

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [saveAnswerError, setSaveAnswerError] = useState<string | null>(null);
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const exam = examDetail.exam;
  const questions = examDetail.questions;
  const activeAttemptId =
    searchParams.get("attemptId") ?? examDetail.inProgressAttemptId;

  useEffect(() => {
    const state = useExamSessionStore.getState();

    if (state.exam?.id && state.exam.id !== exam.id) {
      resetSession();
      startExam(exam, questions);
      return;
    }

    if (state.startedAt) {
      // Both sides use the bare-ISO = wall-clock convention, so the delta
      // is correct under any browser TZ — never shift by 7h.
      const elapsed = (Date.now() - new Date(state.startedAt).getTime()) / 1000;
      const maxAge = (exam.duration + 5) * 60;

      if (elapsed > maxAge) {
        resetSession();
        startExam(exam, questions);
        return;
      }
    }

    if (state.phase === "not-started") {
      startExam(exam, questions);
    }
  }, [exam, questions, resetSession, startExam]);

  const currentQuestion = questions[currentIndex];
  const answeredIds = useMemo(
    () => getAnsweredQuestionIds(questions, answers),
    [answers, questions],
  );
  const questionIds = useMemo(
    () => questions.map((question) => question.id),
    [questions],
  );
  const answeredCount = answeredIds.size;

  const validateRequiredTextAnswers = useCallback(() => {
    const textAnswerErrors = getTextAnswerValidationErrors(questions, answers);
    const firstUnansweredTextIndex = findFirstUnansweredTextQuestionIndex(
      questions,
      answers,
    );

    setAnswerErrors(textAnswerErrors);

    if (firstUnansweredTextIndex === -1) {
      return true;
    }

    goToQuestion(firstUnansweredTextIndex);
    setShowSubmitConfirm(false);
    setSaveAnswerError(TEXT_ANSWER_REQUIRED_MESSAGE);
    return false;
  }, [answers, goToQuestion, questions]);

  const handleSelectAnswer = useCallback(
    (question: Question, optionIds: string[]) => {
      setAnswer(question, optionIds);
    },
    [setAnswer],
  );

  const handleChangeTextAnswer = useCallback(
    (questionId: string, value: string) => {
      setTextAnswer(questionId, value);

      if (value.trim()) {
        setAnswerErrors((currentErrors) => {
          if (!currentErrors[questionId]) {
            return currentErrors;
          }

          const nextErrors = { ...currentErrors };
          delete nextErrors[questionId];
          return nextErrors;
        });

        setSaveAnswerError((currentError) =>
          currentError === TEXT_ANSWER_REQUIRED_MESSAGE ? null : currentError,
        );
      }
    },
    [setTextAnswer],
  );

  const persistQuestionAnswer = useCallback(async () => {
    if (!currentQuestion) {
      return true;
    }

    setSaveAnswerError(null);

    const currentAnswer = answers[currentQuestion.id];

    if (!hasStudentAnswer(currentQuestion, currentAnswer)) {
      return true;
    }

    if (!activeAttemptId) {
      setSaveAnswerError(
        "Không tìm thấy lượt làm bài hiện tại. Hãy quay lại trang chi tiết đề thi và bắt đầu lại.",
      );
      return false;
    }

    setIsSavingAnswer(true);

    try {
      await saveStudentAttemptAnswers(
        activeAttemptId,
        currentQuestion,
        currentAnswer,
      );
      return true;
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Không thể lưu câu trả lời. Vui lòng thử lại.";

      setSaveAnswerError(message);
      return false;
    } finally {
      setIsSavingAnswer(false);
    }
  }, [activeAttemptId, answers, currentQuestion]);

  const persistAllAnsweredAnswers = useCallback(async () => {
    const hasAnyAnswer = questions.some((question) =>
      hasStudentAnswer(question, answers[question.id]),
    );

    if (!hasAnyAnswer) {
      return true;
    }

    if (!activeAttemptId) {
      setSaveAnswerError(
        "Không tìm thấy lượt làm bài hiện tại. Hãy quay lại trang chi tiết đề thi và bắt đầu lại.",
      );
      return false;
    }

    setIsSavingAnswer(true);
    setSaveAnswerError(null);

    try {
      await saveStudentAttemptAnswerBatch(activeAttemptId, questions, answers);
      return true;
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Không thể lưu câu trả lời. Vui lòng thử lại.";

      setSaveAnswerError(message);
      return false;
    } finally {
      setIsSavingAnswer(false);
    }
  }, [activeAttemptId, answers, questions]);

  const handleNextQuestion = useCallback(async () => {
    const isSaved = await persistQuestionAnswer();

    if (isSaved) {
      nextQuestion();
    }
  }, [nextQuestion, persistQuestionAnswer]);

  const handlePrevQuestion = useCallback(async () => {
    const isSaved = await persistQuestionAnswer();

    if (isSaved) {
      prevQuestion();
    }
  }, [persistQuestionAnswer, prevQuestion]);

  const handleJumpToQuestion = useCallback(
    async (index: number) => {
      if (index === currentIndex) {
        return;
      }

      const isSaved = await persistQuestionAnswer();

      if (isSaved) {
        goToQuestion(index);
      }
    },
    [currentIndex, goToQuestion, persistQuestionAnswer],
  );

  const handleProgressJump = useCallback(
    (index: number) => {
      void handleJumpToQuestion(index);
    },
    [handleJumpToQuestion],
  );

  const handleOpenSubmitConfirm = useCallback(() => {
    setSaveAnswerError(null);

    if (validateRequiredTextAnswers()) {
      setShowSubmitConfirm(true);
    }
  }, [validateRequiredTextAnswers]);

  const handleSubmit = useCallback(async () => {
    if (!validateRequiredTextAnswers()) {
      return;
    }

    if (!activeAttemptId) {
      setSaveAnswerError(
        "Không tìm thấy lượt làm bài hiện tại. Hãy quay lại trang chi tiết đề thi và bắt đầu lại.",
      );
      return;
    }

    setIsSubmitting(true);
    setSaveAnswerError(null);

    try {
      const isSaved = await persistAllAnsweredAnswers();

      if (!isSaved) {
        setIsSubmitting(false);
        return;
      }

      const result = await submitStudentAttempt(activeAttemptId);

      writeCachedStudentAttemptResult(result);

      resetSession();
      router.push(`/student/exam/${id}/result?attemptId=${result.attemptId}`);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Không thể nộp bài. Vui lòng thử lại.";

      setSaveAnswerError(message);
      setIsSubmitting(false);
    }
  }, [
    activeAttemptId,
    id,
    persistAllAnsweredAnswers,
    resetSession,
    router,
    validateRequiredTextAnswers,
  ]);

  const { timeLeft } = useExamTimer(
    exam?.duration ? exam.duration * 60 : 0,
    useCallback(() => {
      if (phase === "in-progress") {
        void handleSubmit();
      }
    }, [handleSubmit, phase]),
  );

  // Watchdog: auto-submit when exam end_time passes mid-attempt.
  // Uses a ref so re-renders don't restart the timer. Cleanup on unmount or phase change.
  // NOTE: `exam.endTime` is a bare ISO wall-clock string; `new Date(...)` treats
  // it as local time, so `Date.now()` and the parsed boundary use the same
  // convention — the delta is correct regardless of browser TZ.
  const submitTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (phase !== "in-progress") return;
    const endTime = exam.endTime ? new Date(exam.endTime) : null;
    if (!endTime || Number.isNaN(endTime.getTime())) return;

    const msUntilEnd = endTime.getTime() - Date.now();
    if (msUntilEnd <= 0) {
      void handleSubmit();
      return;
    }

    submitTimerRef.current = setTimeout(() => {
      void handleSubmit();
    }, msUntilEnd);

    return () => {
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current);
        submitTimerRef.current = null;
      }
    };
  }, [phase, exam.endTime, handleSubmit]);

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
        {examDetail?.inProgressAttemptId && (
          <div className="mb-6 rounded-2xl border border-outline/10 bg-surface-container-lowest px-4 py-3 text-sm text-muted-foreground">
            Bạn đang tiếp tục một lượt làm bài đang diễn ra.
          </div>
        )}

        {saveAnswerError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveAnswerError}
          </div>
        )}

        {/* Progress orbs */}
        <div className="mb-6">
          <ProgressOrbs
            total={questions.length}
            currentIndex={currentIndex}
            answeredIds={answeredIds}
            questionIds={questionIds}
            onJumpTo={handleProgressJump}
          />
        </div>

        {/* Question card */}
        {currentQuestion && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 mb-6 shadow-[0_4px_24px_rgba(7,30,39,0.06)]">
            <QuestionCard
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              answer={answers[currentQuestion.id]}
              answerError={answerErrors[currentQuestion.id]}
              onSelect={handleSelectAnswer}
              onTextAnswerChange={handleChangeTextAnswer}
            />
          </div>
        )}

        {/* Navigation */}
        <ExamNavigation
          currentIndex={currentIndex}
          total={questions.length}
          onPrev={() => void handlePrevQuestion()}
          onNext={() => void handleNextQuestion()}
          onSubmit={handleOpenSubmitConfirm}
          isNextDisabled={isSavingAnswer}
          nextLabel={isSavingAnswer ? "Đang lưu..." : "Câu tiếp"}
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
                disabled={isSubmitting || isSavingAnswer}
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

export default function ExamTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [examDetail, setExamDetail] = useState<StudentExamDetailData | null>(
    null,
  );
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const examBreadcrumbHref = `/student/exam/${id}`;
  const examBreadcrumbLabel = examDetail?.exam.title?.trim() || (
    isLoadingExam ? null : "Chi tiết đề thi"
  );

  useBreadcrumbLabel(examBreadcrumbHref, examBreadcrumbLabel);

  useEffect(() => {
    let isMounted = true;

    async function loadExamDetail() {
      setIsLoadingExam(true);
      setLoadError(null);
      setExamDetail(null);

      try {
        const detail = await getStudentExamDetail(id);

        if (!isMounted) {
          return;
        }

        if (!detail || detail.questions.length === 0) {
          setLoadError("Không thể tải đề thi hoặc đề thi chưa có câu hỏi.");
          return;
        }

        setExamDetail(detail);
      } finally {
        if (isMounted) {
          setIsLoadingExam(false);
        }
      }
    }

    void loadExamDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const now = useNow();
  const availability = examDetail
    ? getExamAvailabilityStatus(examDetail.exam, now)
    : null;

  if (isLoadingExam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Đang tải đề thi...</p>
          <p className="text-sm mt-1">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (!examDetail || examDetail.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-outline/10 bg-surface-container-lowest p-6 text-center">
          <p className="font-medium text-on-surface">
            {loadError ?? "Không tìm thấy đề thi."}
          </p>
          <Link
            href="/student/exams"
            className="mt-4 inline-flex text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Quay lại danh sách đề thi
          </Link>
        </div>
      </div>
    );
  }

  if (availability && availability.isUnavailable) {
    return (
      <ExamUnavailable
        examId={id}
        status={availability.status}
        startTime={availability.startTimeRaw}
        endTime={availability.endTimeRaw}
      />
    );
  }

  return <ExamTakeContent id={id} examDetail={examDetail} />;
}
