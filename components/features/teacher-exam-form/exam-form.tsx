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
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
      correctOptionCount === 1
    );
  }).length;
}

function getTotalPoints(values: TeacherExamFormValues): number {
  return values.questions.reduce(
    (sum, question) => sum + (Number(question.points) || 0),
    0,
  );
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
    image_url: true,
    duration_minutes: true,
    is_published: true,
    is_active: true,
    questions: stepId === "info" ? [] : buildQuestionTouchedState(values),
  };
}

function hasInfoStepErrors(
  errors: FormikErrors<TeacherExamFormValues>,
): boolean {
  return Boolean(errors.title || errors.image_url || errors.duration_minutes);
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
    mainElement.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function ExamFormBody({
  cancelHref,
  isSubmitting,
  submitLabel,
  submittingLabel,
  submitError,
  submitContextLabel,
  confirmCancelOnFirstStep,
}: {
  cancelHref: string;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  submitError?: string | null;
  submitContextLabel: string;
  confirmCancelOnFirstStep: boolean;
}) {
  const router = useRouter();
  const {
    values,
    errors,
    dirty,
    isValid,
    resetForm,
    setTouched,
    validateForm,
  } = useFormikContext<TeacherExamFormValues>();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [maxVisitedStepIndex, setMaxVisitedStepIndex] = useState(0);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const currentStep = EXAM_STEPS[currentStepIndex];
  const questionCount = values.questions.length;
  const completedQuestionCount = getCompletedQuestionCount(values);
  const totalPoints = getTotalPoints(values);
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
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {values.is_published
                      ? EXAM_FLOW_MESSAGES.states.public
                      : EXAM_FLOW_MESSAGES.states.private}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-secondary/12 px-2.5 py-1 text-xs font-semibold text-secondary">
                    {values.is_active
                      ? EXAM_FLOW_MESSAGES.states.active
                      : EXAM_FLOW_MESSAGES.states.hidden}
                  </span>
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
    questionCount,
    singleChoiceCount,
    submitContextLabel,
    submitError,
    textQuestionCount,
    totalPoints,
    values.duration_minutes,
    values.is_active,
    values.is_published,
    values.title,
  ]);

  async function handleNextStep() {
    const validationErrors = await validateForm();

    if (hasBlockingErrorsForStep(currentStep.id, validationErrors)) {
      void setTouched(createTouchedStateForStep(values, currentStep.id), false);
      scrollCreateExamContentToTop();
      return;
    }

    setCurrentStepIndex((previousIndex) =>
      Math.min(previousIndex + 1, EXAM_STEPS.length - 1),
    );
    setMaxVisitedStepIndex((previousIndex) =>
      Math.max(previousIndex, currentStepIndex + 1),
    );
  }

  function handlePreviousStep() {
    setCurrentStepIndex((previousIndex) => Math.max(previousIndex - 1, 0));
  }

  function handleStepSelect(stepIndex: number) {
    if (stepIndex <= maxVisitedStepIndex) {
      setCurrentStepIndex(stepIndex);
    }
  }

  function handleCancelClick() {
    if (confirmCancelOnFirstStep || (currentStepIndex === 0 && dirty)) {
      setOpenCancelModal(true);
      return;
    }

    router.push(cancelHref);
  }

  function handleConfirmCancel() {
    resetForm();
    setOpenCancelModal(false);
    router.push(cancelHref);
  }

  function renderCurrentStep() {
    if (currentStep.id === "info") {
      return <ExamInfoStep />;
    }

    if (currentStep.id === "questions") {
      return <QuestionBuilderStep />;
    }

    return <ReviewStep />;
  }

  const nextButtonLabel =
    currentStep.id === "info"
      ? "Tiếp tục đến bước câu hỏi"
      : "Tiếp tục đến bước xem lại";

  return (
    <>
      <Form className="pb-10">
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
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !isValid}
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
                  <Button type="button" size="lg" onClick={handleNextStep}>
                    {nextButtonLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div
            key={currentStep.id}
            className="animate-in fade-in-0 slide-in-from-right-2 duration-300"
          >
            {renderCurrentStep()}
          </div>
        </ExamStepLayout>
      </Form>

      <AlertDialog open={openCancelModal} onOpenChange={setOpenCancelModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy tạo đề thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có thay đổi chưa được lưu.
              <br />
              Bạn có chắc chắn muốn hủy tạo đề thi không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Xác nhận hủy
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
  cancelHref,
  isSubmitting,
  submitLabel = EXAM_FLOW_MESSAGES.buttons.save,
  submittingLabel = EXAM_FLOW_MESSAGES.loading.save,
  submitError,
  submitContextLabel = "lớp học",
  confirmCancelOnFirstStep = false,
}: {
  initialValues: TeacherExamFormValues;
  onSubmit: (values: TeacherExamFormValues) => Promise<void>;
  cancelHref: string;
  isSubmitting: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  submitError?: string | null;
  submitContextLabel?: string;
  confirmCancelOnFirstStep?: boolean;
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
        <UnsavedChangesGuard
          message={EXAM_FLOW_MESSAGES.confirmations.leavePage}
        />
        <ExamFormBody
          cancelHref={cancelHref}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          submittingLabel={submittingLabel}
          submitError={submitError}
          submitContextLabel={submitContextLabel}
          confirmCancelOnFirstStep={confirmCancelOnFirstStep}
        />
      </>
    </Formik>
  );
}
