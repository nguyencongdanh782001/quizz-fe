"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileSpreadsheet,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { EXAM_FLOW_MESSAGES } from "@/components/exams/exam-flow-messages";
import { ExamImportDialog } from "@/components/features/teacher-exam-form/exam-import-dialog";
import { ExamForm } from "@/components/features/teacher-exam-form/exam-form";
import type { TeacherExamFormValues } from "@/components/features/teacher-exam-form/types";
import {
  createInitialTeacherExamFormValues,
  mapTeacherExamDetailToFormValues,
  mapTeacherExamFormToPayload,
  mapTeacherExamFormToUpdatePayload,
} from "@/components/features/teacher-exam-form/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useTeacherSystemExamDetail } from "@/hooks/queries/useTeacherSystemExamDetail";
import { useUpdateTeacherExam } from "@/hooks/queries/useUpdateTeacherExam";
import { APP_MESSAGES } from "@/lib/app-messages";
import { createTeacherSystemExam } from "@/services/exam.service";

type ToastVariant = "success" | "error";

interface ScreenToastState {
  description?: string;
  open: boolean;
  title: string;
  variant: ToastVariant;
}

function scrollTeacherContentToTop() {
  const mainElement = document.querySelector("main");

  if (mainElement instanceof HTMLElement) {
    mainElement.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function ExamEditorLoadingState() {
  return (
    <div className="space-y-8">
      <p className="text-sm font-medium text-muted-foreground">
        {EXAM_FLOW_MESSAGES.loading.detail}
      </p>
      <Skeleton className="h-5 w-48 rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-72 rounded-2xl" />
        <Skeleton className="h-5 w-full max-w-3xl rounded-2xl" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-2xl" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-80 rounded-[32px]" />
        <Skeleton className="h-136 rounded-[32px]" />
      </div>
    </div>
  );
}

function ExamEditorErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[30px] border border-destructive/15 bg-destructive/6 px-6 py-10 text-center shadow-[0_20px_60px_-48px_rgba(186,26,26,0.45)]">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/12 text-destructive">
        <TriangleAlert className="size-7" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold text-on-surface">
        {EXAM_FLOW_MESSAGES.errors.loadDetail}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {EXAM_FLOW_MESSAGES.errors.generic}
      </p>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button type="button" variant="outline" size="lg" onClick={onRetry}>
          <RefreshCw className="mr-2 size-4" />
          Tải lại dữ liệu
        </Button>
        <Button asChild type="button" size="lg">
          <Link href="/teacher/exams">{EXAM_FLOW_MESSAGES.buttons.back}</Link>
        </Button>
      </div>
    </div>
  );
}

export function TeacherSystemExamCreateScreen({
  editId,
}: {
  editId?: string | null;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [toast, setToast] = useState<ScreenToastState | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);
  const normalizedEditId = editId?.trim() ? editId.trim() : null;
  const isEditMode = normalizedEditId !== null;
  const detailQuery = useTeacherSystemExamDetail(normalizedEditId, {
    enabled: isEditMode,
  });
  const updateMutation = useUpdateTeacherExam();
  const initialValues =
    isEditMode && detailQuery.data
      ? mapTeacherExamDetailToFormValues(detailQuery.data)
      : createInitialTeacherExamFormValues();
  const isSubmitting = isEditMode
    ? updateMutation.isPending
    : isCreating || isImporting;

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function openToast(nextToast: Omit<ScreenToastState, "open">) {
    setToast({
      ...nextToast,
      open: true,
    });
  }

  async function handleSubmit(values: TeacherExamFormValues) {
    setSubmitError(null);
    setToast(null);

    try {
      if (isEditMode && normalizedEditId) {
        await updateMutation.mutateAsync({
          examId: normalizedEditId,
          payload: mapTeacherExamFormToUpdatePayload(values),
        });
      } else {
        setIsCreating(true);
        await createTeacherSystemExam(mapTeacherExamFormToPayload(values));
      }

      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }

      openToast({
        title: isEditMode
          ? EXAM_FLOW_MESSAGES.success.update
          : EXAM_FLOW_MESSAGES.success.create,
        variant: "success",
      });
      scrollTeacherContentToTop();
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push("/teacher/exams");
      }, 1200);
    } catch (error) {
      console.error(
        isEditMode
          ? "Failed to update system exam"
          : "Failed to create system exam",
        error,
      );

      const message = isEditMode
        ? APP_MESSAGES.UPDATE_EXAM_FAILED
        : APP_MESSAGES.CREATE_EXAM_FAILED;

      setSubmitError(message);
      openToast({
        title: message,
        description: APP_MESSAGES.NETWORK_ERROR,
        variant: "error",
      });
      scrollTeacherContentToTop();
    } finally {
      setIsCreating(false);
    }
  }

  async function handleImportSubmit(values: TeacherExamFormValues) {
    setSubmitError(null);
    setToast(null);
    setIsImporting(true);

    try {
      await createTeacherSystemExam(mapTeacherExamFormToPayload(values));

      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }

      openToast({
        title: APP_MESSAGES.CREATE_EXAM_SUCCESS,
        variant: "success",
      });
      setIsImportDialogOpen(false);
      scrollTeacherContentToTop();
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push("/teacher/exams");
      }, 1200);
    } catch (error) {
      console.error("Failed to import system exam", error);

      const message = APP_MESSAGES.CREATE_EXAM_FAILED;

      openToast({
        title: message,
        description: APP_MESSAGES.NETWORK_ERROR,
        variant: "error",
      });
      scrollTeacherContentToTop();
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <ToastProvider>
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <Link
          href="/teacher/exams"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách đề thi
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-on-surface">
              {isEditMode
                ? EXAM_FLOW_MESSAGES.titles.edit
                : EXAM_FLOW_MESSAGES.titles.create}
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
              {isEditMode
                ? "Cập nhật đề thi theo từng bước rõ ràng: rà soát thông tin chung, chỉnh sửa câu hỏi và lưu lại phiên bản mới."
                : "Hoàn thiện đề thi theo từng bước rõ ràng: nhập thông tin chung, xây dựng câu hỏi, sau đó xem lại toàn bộ nội dung trước khi lưu."}
            </p>
          </div>

          {!isEditMode ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsImportDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="size-4" />
              Tạo đề thi từ Excel
            </Button>
          ) : null}
        </div>

        {isEditMode && detailQuery.isLoading ? (
          <ExamEditorLoadingState />
        ) : null}

        {isEditMode && detailQuery.isError ? (
          <ExamEditorErrorState
            onRetry={() => {
              void detailQuery.refetch();
            }}
          />
        ) : null}

        {!isEditMode || detailQuery.data ? (
          <ExamForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            cancelHref="/teacher/exams"
            isSubmitting={isSubmitting}
            submitLabel={
              isEditMode
                ? EXAM_FLOW_MESSAGES.buttons.update
                : EXAM_FLOW_MESSAGES.buttons.save
            }
            submitError={submitError}
            submitContextLabel="hệ thống"
            submittingLabel={
              isEditMode
                ? EXAM_FLOW_MESSAGES.loading.update
                : EXAM_FLOW_MESSAGES.loading.save
            }
          />
        ) : null}
      </div>

      {!isEditMode ? (
        <ExamImportDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          baseValues={{
            classroom_id: null,
            scope: "system",
          }}
          isImporting={isImporting}
          onImport={handleImportSubmit}
        />
      ) : null}

      {toast ? (
        <Toast
          open={toast.open}
          variant={toast.variant}
          onOpenChange={(open) => {
            setToast((current) => (current ? { ...current, open } : current));
          }}
        >
          <div className="pr-8">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description ? (
              <ToastDescription className="mt-1">
                {toast.description}
              </ToastDescription>
            ) : null}
          </div>
          <ToastClose />
        </Toast>
      ) : null}
      <ToastViewport />
    </ToastProvider>
  );
}
