"use client";

import {
  Form,
  Formik,
  type FormikErrors,
  type FormikTouched,
  useFormikContext,
} from "formik";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Clock3,
  FileCheck2,
  ListChecks,
  LoaderCircle,
  Save,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EXAM_FLOW_MESSAGES } from "@/components/exams/exam-flow-messages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExamInfoStep } from "./exam-info-step";
import { ExamStepLayout, type ExamStepDefinition } from "./exam-step-layout";
import { QuestionBuilderStep } from "./question-builder-step";
import { ReviewStep } from "./review-step";
import type { TeacherExamFormValues } from "./types";
import { UnsavedChangesGuard } from "./unsaved-changes-guard";
import {
  getTeacherExamTotalPoints,
  normalizeAcceptedAnswers,
  normalizeTeacherExamQuestionType,
  teacherExamFormSchema,
} from "./utils";

const EXAM_STEPS: ExamStepDefinition[] = [
  {
    id: "info",
    title: "Thông tin đề thi",
    description: "Thiết lập tên đề thi, mô tả và thông tin cơ bản.",
  },
  {
    id: "questions",
    title: "Xây dựng câu hỏi",
    description: "Thêm câu hỏi, đáp án và sắp xếp nội dung đề thi.",
  },
  {
    id: "review",
    title: "Xem lại & lưu",
    description: "Kiểm tra toàn bộ nội dung trước khi lưu đề thi.",
  },
];

function countErrorMessages(value: unknown): number {
  if (typeof value === "string") {
    return 1;
  }

  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countErrorMessages(item), 0);
  }

  if (value && typeof value === "object") {
    return Object.values(value).reduce(
      (total, item) => total + countErrorMessages(item),
      0,
    );
  }

  return 0;
}

function getFirstErrorMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = getFirstErrorMessage(item);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const message = getFirstErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  return null;
}

function getFirstQuestionErrorIndex(
  errors: FormikErrors<TeacherExamFormValues>,
): number | null {
  const questionErrors = errors.questions;

  if (!questionErrors) {
    return null;
  }

  if (Array.isArray(questionErrors)) {
    const errorIndex = questionErrors.findIndex(
      (questionError) => countErrorMessages(questionError) > 0,
    );

    return errorIndex >= 0 ? errorIndex : 0;
  }

  return 0;
}

function getQuestionValidationMessage(
  errors: FormikErrors<TeacherExamFormValues>,
  questionIndex: number,
): string {
  const questionErrors = Array.isArray(errors.questions)
    ? errors.questions[questionIndex]
    : errors.questions;
  const detail = getFirstErrorMessage(questionErrors);

  return detail
    ? `Câu ${questionIndex + 1}: ${detail}`
    : `Câu ${questionIndex + 1} chưa hoàn thiện. Vui lòng bổ sung nội dung câu hỏi và đáp án.`;
}

function getCompletedQuestionCount(values: TeacherExamFormValues): number {
  return values.questions.filter((question) => {
    const questionType = normalizeTeacherExamQuestionType(
      question.question_type,
    );
    const hasPrompt = question.prompt.trim().length > 0;

    if (!hasPrompt) {
      return false;
    }

    if (questionType === "text") {
      return true;
    }

    if (questionType === "fill_in_blank" || questionType === "short_answer") {
      return normalizeAcceptedAnswers(question.accepted_answers).length > 0;
    }

    const hasEnoughOptions = question.options.length >= 2;
    const hasOptionText = question.options.every(
      (option) => option.option_text.trim().length > 0,
    );
    const correctOptionCount = question.options.filter(
      (option) => option.is_correct,
    ).length;

    return (
      hasEnoughOptions &&
      hasOptionText &&
      (questionType === "single_choice"
        ? correctOptionCount === 1
        : correctOptionCount >= 1)
    );
  }).length;
}

function buildQuestionTouchedState(
  values: TeacherExamFormValues,
): NonNullable<FormikTouched<TeacherExamFormValues>["questions"]> {
  return values.questions.map((question) => ({
    question_type: true,
    prompt: true,
    explanation: true,
    image_url: true,
    order_index: true,
    points: true,
    accepted_answers: question.accepted_answers.length > 0,
    options: question.options.map(() => ({
      option_text: true,
      image_url: true,
      is_correct: true,
    })),
  }));
}

function createTouchedStateForStep(
  values: TeacherExamFormValues,
  stepId: ExamStepDefinition["id"],
): FormikTouched<TeacherExamFormValues> {
  return {
    title: true,
    description: true,
    grade: true,
    image_url: true,
    duration_minutes: true,
    start_time: true,
    end_time: true,
    is_published: true,
    is_active: true,
    questions: stepId === "info" ? [] : buildQuestionTouchedState(values),
  };
}

function hasInfoStepErrors(
  errors: FormikErrors<TeacherExamFormValues>,
): boolean {
  return Boolean(
    errors.title ||
    errors.grade ||
    errors.scope ||
    errors.classroom_id ||
    errors.image_url ||
    errors.duration_minutes ||
    errors.start_time ||
    errors.end_time,
  );
}

function hasBlockingErrorsForStep(
  stepId: ExamStepDefinition["id"],
  errors: FormikErrors<TeacherExamFormValues>,
): boolean {
  if (stepId === "info") {
    return hasInfoStepErrors(errors);
  }

  if (stepId === "questions") {
    return hasInfoStepErrors(errors) || Boolean(errors.questions);
  }

  return countErrorMessages(errors) > 0;
}

function scrollCreateExamContentToTop() {
  const mainElement = document.querySelector("main");

  if (mainElement instanceof HTMLElement) {
    mainElement.scrollTo({ top: 0, behavior: "instant" });
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

function ExamFormBody({
  cancelHref,
  isSubmitting,
  isSavingDraft,
  onSaveDraft,
  submitLabel,
  submittingLabel,
  submitError,
  submitContextLabel,
  confirmCancelOnFirstStep,
  cancelRequestKey,
}: {
  cancelHref: string;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  onSaveDraft?: (values: TeacherExamFormValues) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
  submitError?: string | null;
  submitContextLabel: string;
  confirmCancelOnFirstStep: boolean;
  cancelRequestKey?: number;
}) {
  const router = useRouter();
  const {
    values,
    errors,
    dirty,
    isValid,
    resetForm,
    setTouched,
    submitForm,
    validateForm,
  } = useFormikContext<TeacherExamFormValues>();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [maxVisitedStepIndex, setMaxVisitedStepIndex] = useState(2);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [pendingNavigationHref, setPendingNavigationHref] = useState<
    string | null
  >(null);
  const [navigationAllowed, setNavigationAllowed] = useState(false);
  const [validationNotice, setValidationNotice] = useState<string | null>(null);
  const [requestedQuestionIndex, setRequestedQuestionIndex] = useState<
    number | null
  >(null);
  const [requestedQuestionRequestKey, setRequestedQuestionRequestKey] =
    useState(0);
  const handledCancelRequestKeyRef = useRef(cancelRequestKey);
  const currentStep = EXAM_STEPS[currentStepIndex];
  const questionCount = values.questions.length;
  const completedQuestionCount = getCompletedQuestionCount(values);
  const totalPoints = getTeacherExamTotalPoints(questionCount);
  const formErrorCount = countErrorMessages(errors);
  const completionPercentage =
    questionCount > 0
      ? Math.round((completedQuestionCount / questionCount) * 100)
      : 0;
  const singleChoiceCount = values.questions.filter(
    (question) =>
      normalizeTeacherExamQuestionType(question.question_type) ===
      "single_choice",
  ).length;
  const multipleChoiceCount = values.questions.filter(
    (question) =>
      normalizeTeacherExamQuestionType(question.question_type) ===
      "multiple_choice",
  ).length;
  const textQuestionCount = values.questions.filter(
    (question) =>
      normalizeTeacherExamQuestionType(question.question_type) === "text",
  ).length;

  useEffect(() => {
    scrollCreateExamContentToTop();
  }, [currentStepIndex]);

  const stepAside = useMemo(() => {
    if (currentStep.id === "info") {
      return (
        <Card className="rounded-[32px] border-0 bg-surface-container-lowest shadow-[0_22px_60px_-44px_rgba(7,30,39,0.24)]">
          <CardHeader>
            <CardTitle className="font-display text-xl text-on-surface">
              Tóm tắt bước 1
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Hoàn thiện các trường chính để đề thi có thông tin rõ ràng trước
              khi bạn thêm câu hỏi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-outline/10 bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {EXAM_FLOW_MESSAGES.labels.title}
              </p>
              <p className="mt-2 text-base font-semibold text-on-surface">
                {values.title.trim() || "Chưa nhập tên đề thi"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[24px] border border-outline/10 bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {EXAM_FLOW_MESSAGES.labels.grade}
                </p>
                <p className="mt-2 text-lg font-semibold text-on-surface">
                  {values.grade.trim() || "Chưa nhập khối lớp"}
                </p>
              </div>

              <div className="rounded-[24px] border border-outline/10 bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Thời lượng
                </p>
                <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-on-surface">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {values.duration_minutes} phút
                </p>
              </div>

              <div className="rounded-[24px] border border-outline/10 bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Trạng thái
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {!values.is_published && !values.is_active ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                      Bản nháp
                    </span>
                  ) : values.scope === "public" ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      Công khai
                    </span>
                  ) : values.scope === "private" ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                      Riêng tư
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#3F63F3] border border-blue-200">
                      Không công khai
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentStep.id === "questions") {
      return (
        <Card className="rounded-[32px] border-0 bg-surface-container-lowest shadow-[0_22px_60px_-44px_rgba(7,30,39,0.24)]">
          <CardHeader>
            <CardTitle className="font-display text-xl text-on-surface">
              Tóm tắt bước 2
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Theo dõi nhanh tiến độ xây dựng đề để biết còn bao nhiêu phần cần
              hoàn thiện.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border border-outline/10 bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Câu hỏi
                </p>
                <p className="mt-2 text-2xl font-semibold text-on-surface">
                  {questionCount}
                </p>
              </div>
              <div className="rounded-[24px] border border-outline/10 bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Tổng điểm
                </p>
                <p className="mt-2 text-2xl font-semibold text-on-surface">
                  {totalPoints}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-outline/10 bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Cơ cấu câu hỏi
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {singleChoiceCount} một đáp án
                </span>
                <span className="inline-flex items-center rounded-full bg-tertiary/12 px-2.5 py-1 text-xs font-semibold text-tertiary">
                  {multipleChoiceCount} nhiều đáp án
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary/12 px-2.5 py-1 text-xs font-semibold text-secondary">
                  {textQuestionCount} tự luận
                </span>
              </div>
            </div>

            <div className="rounded-[24px] border border-outline/10 bg-surface p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">
                  Tiến độ hoàn thiện
                </span>
                <span className="font-semibold text-on-surface">
                  {completionPercentage}%
                </span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#00464a_0%,#29695b_100%)] transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {completedQuestionCount}/{questionCount} câu hỏi đã có đủ thông
                tin và đáp án.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="overflow-hidden rounded-[32px] border-0 bg-[linear-gradient(180deg,#08333b_0%,#0d4650_100%)] text-white shadow-[0_30px_80px_-46px_rgba(0,46,49,0.72)]">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-2xl text-white">
                Sẵn sàng lưu đề thi
              </CardTitle>
              <CardDescription className="mt-2 text-sm leading-relaxed text-white/70">
                Kiểm tra lại các chỉ số cuối cùng rồi lưu đề thi cho{" "}
                {submitContextLabel}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">
                Câu hỏi
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {questionCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">
                Tổng điểm
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {totalPoints}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/8 p-4">
            <div className="flex items-start gap-3">
              {isValid ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary-container" />
              ) : (
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-tertiary-fixed" />
              )}
              <div>
                <p className="text-sm font-semibold text-white">
                  {isValid
                    ? "Biểu mẫu đã sẵn sàng để gửi"
                    : `Còn ${formErrorCount} mục cần hoàn thiện`}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/65">
                  {isValid
                    ? "Bạn có thể lưu đề thi ngay ở bước này."
                    : "Nếu nút lưu còn bị khóa, hãy quay lại các bước trước để hoàn thiện trường còn thiếu."}
                </p>
              </div>
            </div>
          </div>

          {submitError ? (
            <div className="rounded-3xl border border-red-200/20 bg-red-500/12 p-4 text-sm text-red-100">
              {submitError}
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }, [
    completedQuestionCount,
    completionPercentage,
    currentStep.id,
    formErrorCount,
    isValid,
    multipleChoiceCount,
    questionCount,
    singleChoiceCount,
    submitContextLabel,
    submitError,
    textQuestionCount,
    totalPoints,
    values.duration_minutes,
    values.grade,
    values.is_active,
    values.is_published,
    values.title,
  ]);

  async function handleNextStep() {
    const validationErrors = await validateForm();

    if (hasBlockingErrorsForStep(currentStep.id, validationErrors)) {
      await setTouched(
        createTouchedStateForStep(values, currentStep.id),
        false,
      );

      if (hasInfoStepErrors(validationErrors)) {
        setValidationNotice(
          getFirstErrorMessage({
            title: validationErrors.title,
            grade: validationErrors.grade,
            scope: validationErrors.scope,
            classroom_id: validationErrors.classroom_id,
            image_url: validationErrors.image_url,
            duration_minutes: validationErrors.duration_minutes,
            start_time: validationErrors.start_time,
            end_time: validationErrors.end_time,
          }) ?? "Vui lòng hoàn thiện thông tin cơ bản của đề thi.",
        );
        setCurrentStepIndex(0);
      } else {
        const questionIndex = getFirstQuestionErrorIndex(validationErrors) ?? 0;

        setRequestedQuestionIndex(questionIndex);
        setRequestedQuestionRequestKey((current) => current + 1);
        setValidationNotice(
          getQuestionValidationMessage(validationErrors, questionIndex),
        );
        setCurrentStepIndex(1);
      }

      window.setTimeout(scrollCreateExamContentToTop, 0);
      return;
    }

    setValidationNotice(null);
    setCurrentStepIndex((previousIndex) =>
      Math.min(previousIndex + 1, EXAM_STEPS.length - 1),
    );
    setMaxVisitedStepIndex((previousIndex) =>
      Math.max(previousIndex, currentStepIndex + 1),
    );
  }

  async function handleFinalSubmit() {
    if (isSubmitting) {
      return;
    }

    const validationErrors = await validateForm();

    if (countErrorMessages(validationErrors) === 0) {
      setValidationNotice(null);
      await submitForm();
      return;
    }

    await setTouched(createTouchedStateForStep(values, "review"), false);

    if (hasInfoStepErrors(validationErrors)) {
      setValidationNotice(
        getFirstErrorMessage({
          title: validationErrors.title,
          grade: validationErrors.grade,
          scope: validationErrors.scope,
          classroom_id: validationErrors.classroom_id,
          image_url: validationErrors.image_url,
          duration_minutes: validationErrors.duration_minutes,
          start_time: validationErrors.start_time,
          end_time: validationErrors.end_time,
        }) ?? "Vui lòng hoàn thiện thông tin cơ bản trước khi lưu đề thi.",
      );
      setCurrentStepIndex(0);
      setMaxVisitedStepIndex((current) => Math.max(current, 2));
      window.setTimeout(scrollCreateExamContentToTop, 0);
      return;
    }

    const questionIndex = getFirstQuestionErrorIndex(validationErrors);

    if (questionIndex !== null) {
      setRequestedQuestionIndex(questionIndex);
      setRequestedQuestionRequestKey((current) => current + 1);
      setValidationNotice(
        getQuestionValidationMessage(validationErrors, questionIndex),
      );
      setCurrentStepIndex(1);
      setMaxVisitedStepIndex((current) => Math.max(current, 2));
      window.setTimeout(scrollCreateExamContentToTop, 0);
      return;
    }

    setValidationNotice(
      getFirstErrorMessage(validationErrors) ??
        "Đề thi chưa hoàn thiện. Vui lòng kiểm tra lại các thông tin bắt buộc.",
    );
    setCurrentStepIndex(0);
    window.setTimeout(scrollCreateExamContentToTop, 0);
  }

  function handlePreviousStep() {
    setValidationNotice(null);
    setCurrentStepIndex((previousIndex) => Math.max(previousIndex - 1, 0));
  }

  function handleStepSelect(stepIndex: number) {
    if (stepIndex <= maxVisitedStepIndex) {
      setValidationNotice(null);
      setCurrentStepIndex(stepIndex);
    }
  }

  const requestNavigation = useCallback(
    (href: string) => {
      if (!dirty && !confirmCancelOnFirstStep) {
        setNavigationAllowed(true);

        window.setTimeout(() => {
          router.push(href);
        }, 0);

        return;
      }

      setPendingNavigationHref(href);
      setOpenCancelModal(true);
    },
    [confirmCancelOnFirstStep, dirty, router],
  );

  function handleCancelClick() {
    requestNavigation(cancelHref);
  }

  function handleCancelModalChange(open: boolean) {
    setOpenCancelModal(open);

    if (!open) {
      setPendingNavigationHref(null);
    }
  }

  function handleConfirmCancel() {
    const destination = pendingNavigationHref ?? cancelHref;

    /*
     * Gỡ guard trước khi điều hướng để không hiện thêm hộp thoại mặc định.
     * resetForm() chỉ làm sạch trạng thái Formik sau khi người dùng xác nhận.
     */
    setNavigationAllowed(true);
    resetForm();
    setOpenCancelModal(false);
    setPendingNavigationHref(null);

    window.setTimeout(() => {
      router.push(destination);
    }, 0);
  }

  useEffect(() => {
    if (
      cancelRequestKey === undefined ||
      cancelRequestKey === handledCancelRequestKeyRef.current
    ) {
      return;
    }

    handledCancelRequestKeyRef.current = cancelRequestKey;
    handleCancelClick();
    // Chỉ xử lý khi màn hình cha phát một yêu cầu trở về mới.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelRequestKey]);

  function renderCurrentStep() {
    if (currentStep.id === "info") {
      return <ExamInfoStep />;
    }

    if (currentStep.id === "questions") {
      return (
        <QuestionBuilderStep
          hideFooter={openCancelModal}
          isSavingDraft={isSavingDraft}
          onSaveDraft={onSaveDraft}
          requestedQuestionIndex={requestedQuestionIndex}
          requestedQuestionRequestKey={requestedQuestionRequestKey}
          validationMessage={validationNotice}
        />
      );
    }

    return (
      <ReviewStep
        onRequestSubmit={handleFinalSubmit}
        submitLabel={submitLabel}
        submittingLabel={submittingLabel}
      />
    );
  }

  const nextButtonLabel =
    currentStep.id === "info"
      ? "Tiếp tục đến bước câu hỏi"
      : "Tiếp tục đến bước xem lại";

  return (
    <>
      <UnsavedChangesGuard
        enabled={!navigationAllowed && (dirty || confirmCancelOnFirstStep)}
        message={EXAM_FLOW_MESSAGES.confirmations.leavePage}
        onNavigationRequest={requestNavigation}
      />

      <Form className="space-y-4 pb-10">
        <ExamStepLayout
          steps={EXAM_STEPS}
          currentStepIndex={currentStepIndex}
          maxVisitedStepIndex={maxVisitedStepIndex}
          onStepSelect={handleStepSelect}
          aside={stepAside}
          actions={
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                {currentStep.id === "review" ? (
                  <span className="inline-flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-primary" />
                    Xác nhận lần cuối trước khi lưu đề thi.
                  </span>
                ) : currentStep.id === "questions" ? (
                  <span className="inline-flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-secondary" />
                    Thêm và sắp xếp câu hỏi trước khi sang bước xem lại.
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Hoàn thiện thông tin cơ bản rồi tiếp tục.
                  </span>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                {currentStepIndex > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handlePreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {EXAM_FLOW_MESSAGES.buttons.back}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleCancelClick}
                  >
                    {EXAM_FLOW_MESSAGES.buttons.cancel}
                  </Button>
                )}

                <Button
                  type="button"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={() => void handleFinalSubmit()}
                  className={`${currentStep.id !== "review" ? "hidden" : ""}`}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileCheck2 className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? submittingLabel : submitLabel}
                </Button>

                {currentStep.id !== "review" && (
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-[#4867F8] to-[#C62CF2] text-white shadow-sm hover:opacity-95"
                  >
                    {nextButtonLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="w-full space-y-3">
            {validationNotice ? (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2 rounded-[6px] border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold leading-5 text-rose-700"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                <span>{validationNotice}</span>
              </div>
            ) : null}

            {renderCurrentStep()}
          </div>
        </ExamStepLayout>
      </Form>

      <AlertDialog
        open={openCancelModal}
        onOpenChange={handleCancelModalChange}
      >
        <AlertDialogContent className="w-[calc(100%-32px)] max-w-[360px] rounded-[6px] border border-[#E2E8F0] p-5 shadow-2xl">
          <AlertDialogHeader className="space-y-0 text-left">
            <div className="mb-3 flex size-9 items-center justify-center rounded-[6px] bg-amber-50 text-amber-600">
              <TriangleAlert className="size-4" />
            </div>

            <AlertDialogTitle className="text-base font-bold leading-6 text-[#0F172A]">
              Rời khỏi trang tạo đề?
            </AlertDialogTitle>

            <AlertDialogDescription className="mt-2 text-xs leading-5 text-[#64748B]">
              Các thay đổi chưa lưu sẽ bị mất khi bạn chuyển sang trang khác.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 rounded-[6px] border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-xs font-semibold text-amber-800">
              Bước {currentStepIndex + 1}: {currentStep.title}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-amber-700">
              Tiếp tục chỉnh sửa để hoàn thiện đề, hoặc rời khỏi trang để bỏ
              thay đổi chưa lưu.
            </p>
          </div>

          <AlertDialogFooter className="mt-5 gap-2 sm:justify-end sm:space-x-0">
            <AlertDialogCancel className="mt-0 h-9 rounded-[6px] border-[#CBD5E1] px-3.5 text-xs font-bold text-[#334155]">
              Tiếp tục chỉnh sửa
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="h-9 rounded-[6px] bg-[#EF4444] px-3.5 text-xs font-bold text-white hover:bg-[#DC2626]"
            >
              Rời khỏi trang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ExamForm({
  initialValues,
  onSubmit,
  onSaveDraft,
  cancelHref,
  isSubmitting,
  isSavingDraft = false,
  submitLabel = EXAM_FLOW_MESSAGES.buttons.save,
  submittingLabel = EXAM_FLOW_MESSAGES.loading.save,
  submitError,
  submitContextLabel = "lớp học",
  confirmCancelOnFirstStep = false,
  cancelRequestKey,
}: {
  initialValues: TeacherExamFormValues;
  onSubmit: (values: TeacherExamFormValues) => Promise<void>;
  onSaveDraft?: (values: TeacherExamFormValues) => Promise<void>;
  cancelHref: string;
  isSubmitting: boolean;
  isSavingDraft?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  submitError?: string | null;
  submitContextLabel?: string;
  confirmCancelOnFirstStep?: boolean;
  cancelRequestKey?: number;
}) {
  return (
    <Formik<TeacherExamFormValues>
      initialValues={initialValues}
      validationSchema={teacherExamFormSchema}
      validateOnMount
      onSubmit={async (values) => {
        await onSubmit(values);
      }}
    >
      <>
        <ExamFormBody
          cancelHref={cancelHref}
          isSubmitting={isSubmitting}
          isSavingDraft={isSavingDraft}
          onSaveDraft={onSaveDraft}
          submitLabel={submitLabel}
          submittingLabel={submittingLabel}
          submitError={submitError}
          submitContextLabel={submitContextLabel}
          confirmCancelOnFirstStep={confirmCancelOnFirstStep}
          cancelRequestKey={cancelRequestKey}
        />
      </>
    </Formik>
  );
}
