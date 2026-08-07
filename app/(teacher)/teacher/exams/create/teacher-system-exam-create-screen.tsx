"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
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
import { pickDefaultExamImage } from "@/lib/exam-default-images";
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
import { createSystemExam } from "@/services/exam.service";

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

type ExamPayloadWithImage = {
  image_url?: string | null;
};

function ensureExamImage<T extends ExamPayloadWithImage>(payload: T): T {
  const selectedImageUrl = payload.image_url?.trim();

  return {
    ...payload,
    image_url: selectedImageUrl || pickDefaultExamImage(),
  };
}

function getNestedRecord(
  value: unknown,
  key: string,
): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const nestedValue = (value as Record<string, unknown>)[key];

  return nestedValue && typeof nestedValue === "object"
    ? (nestedValue as Record<string, unknown>)
    : null;
}

function getCreatedExamId(result: unknown): string | null {
  if (!result || typeof result !== "object") {
    return null;
  }

  const root = result as Record<string, unknown>;
  const data = getNestedRecord(root, "data");
  const exam = getNestedRecord(root, "exam");
  const dataExam = data ? getNestedRecord(data, "exam") : null;
  const candidates = [root.id, exam?.id, data?.id, dataExam?.id];

  for (const candidate of candidates) {
    if (
      (typeof candidate === "string" && candidate.trim()) ||
      typeof candidate === "number"
    ) {
      return String(candidate);
    }
  }

  return null;
}

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const root = error as Record<string, unknown>;
  const response = getNestedRecord(root, "response");
  const responseData = response ? getNestedRecord(response, "data") : null;
  const detail = responseData?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (typeof root.message === "string" && root.message.trim()) {
    return root.message;
  }

  return fallback;
}

function createDraftValues(
  values: TeacherExamFormValues,
): TeacherExamFormValues {
  return {
    ...values,
    is_published: false,
    is_active: false,
  };
}

function ExamEditorLoadingState() {
  return (
    <div className="space-y-8">
      <p className="text-sm font-medium text-muted-foreground">
        {EXAM_FLOW_MESSAGES.loading.detail}
      </p>
      <Skeleton className="h-5 w-48 rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-72 rounded-[8px]" />
        <Skeleton className="h-5 w-full max-w-3xl rounded-[8px]" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-[8px]" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-80 rounded-[10px]" />
        <Skeleton className="h-136 rounded-[10px]" />
      </div>
    </div>
  );
}

function ExamEditorErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[10px] border border-destructive/15 bg-destructive/6 px-6 py-10 text-center shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
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
        <Button
          asChild
          type="button"
          size="lg"
          className="bg-gradient-to-r from-[#4867F8] to-[#C62CF2] text-white shadow-sm hover:opacity-95"
        >
          <Link href="/teacher/exams">{EXAM_FLOW_MESSAGES.buttons.back}</Link>
        </Button>
      </div>
    </div>
  );
}

export function TeacherSystemExamCreateScreen({
  editId,
  initialImportOpen = false,
}: {
  editId?: string | null;
  initialImportOpen?: boolean;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftExamId, setDraftExamId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] =
    useState(initialImportOpen);
  const [toast, setToast] = useState<ScreenToastState | null>(null);
  const [cancelRequestKey, setCancelRequestKey] = useState(0);
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
    ? updateMutation.isPending || isSavingDraft
    : isCreating || isImporting || isSavingDraft;

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

  function handleBackClick() {
    const formIsMounted = !isEditMode || Boolean(detailQuery.data);

    if (formIsMounted) {
      setCancelRequestKey((current) => current + 1);
      return;
    }

    router.push("/teacher/exams");
  }

  async function handleSubmit(values: TeacherExamFormValues) {
    setSubmitError(null);
    setToast(null);

    const targetExamId = normalizedEditId ?? draftExamId;
    const finalValues = {
      ...values,
      is_published: values.scope === "public" || values.scope === "unlisted",
      is_active: values.scope === "public" || values.scope === "private",
    };

    try {
      if (targetExamId) {
        const payload = ensureExamImage(
          mapTeacherExamFormToUpdatePayload(finalValues),
        );

        await updateMutation.mutateAsync({
          examId: targetExamId,
          payload,
        });
      } else {
        setIsCreating(true);

        const payload = ensureExamImage(mapTeacherExamFormToPayload(finalValues));

        await createSystemExam(payload);
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
        targetExamId
          ? "Failed to update system exam"
          : "Failed to create system exam",
        error,
      );

      const fallbackMessage = targetExamId
        ? APP_MESSAGES.UPDATE_EXAM_FAILED
        : APP_MESSAGES.CREATE_EXAM_FAILED;
      const message = getRequestErrorMessage(error, fallbackMessage);

      setSubmitError(message);
      openToast({
        title: fallbackMessage,
        description: message,
        variant: "error",
      });
      scrollTeacherContentToTop();
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveDraft(values: TeacherExamFormValues): Promise<void> {
    if (isSavingDraft) {
      return;
    }

    const trimmedTitle = values.title.trim();
    const trimmedGrade = values.grade.trim();

    if (!trimmedTitle) {
      throw new Error("Vui lòng nhập tên đề thi trước khi lưu nháp.");
    }

    if (!trimmedGrade) {
      throw new Error("Vui lòng chọn trình độ trước khi lưu nháp.");
    }

    setSubmitError(null);
    setToast(null);
    setIsSavingDraft(true);

    const draftValues = createDraftValues(values);
    const targetExamId = normalizedEditId ?? draftExamId;

    try {
      if (targetExamId) {
        const payload = ensureExamImage(
          mapTeacherExamFormToUpdatePayload(draftValues),
        );

        await updateMutation.mutateAsync({
          examId: targetExamId,
          payload,
        });
      } else {
        const payload = ensureExamImage(
          mapTeacherExamFormToPayload(draftValues),
        );
        const result = await createSystemExam(payload);
        const createdExamId = getCreatedExamId(result);

        if (createdExamId) {
          setDraftExamId(createdExamId);
        } else {
          console.warn(
            "Bản nháp đã được tạo nhưng API không trả về exam id. " +
              "Lần lưu tiếp theo có thể tạo thêm một bản nháp mới.",
          );
        }
      }

      openToast({
        title: "Đã lưu bản nháp",
        description:
          "Đề thi đã được lưu và sẽ xuất hiện trong mục Quản lý đề thi.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save system exam draft", error);

      const message = getRequestErrorMessage(
        error,
        "Không thể lưu bản nháp. Vui lòng thử lại.",
      );

      setSubmitError(message);
      openToast({
        title: "Không thể lưu bản nháp",
        description: message,
        variant: "error",
      });

      throw new Error(message);
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleImportSubmit(values: TeacherExamFormValues) {
    setSubmitError(null);
    setToast(null);
    setIsImporting(true);

    try {
      const payload = ensureExamImage(mapTeacherExamFormToPayload(values));

      await createSystemExam(payload);

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
      <div className="space-y-6 pb-12">
        {/* Page Header - title + Trở về button on the same row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-bold text-[#1E293B]">
              {isEditMode
                ? EXAM_FLOW_MESSAGES.titles.edit
                : EXAM_FLOW_MESSAGES.titles.create}
            </h1>
            <p className="max-w-4xl text-xs leading-5 text-[#64748B]">
              {isEditMode
                ? "Cập nhật đề thi theo từng bước rõ ràng: rà soát thông tin chung, chỉnh sửa câu hỏi và lưu lại phiên bản mới."
                : "Hoàn thiện đề thi theo từng bước rõ ràng: nhập thông tin chung, xây dựng câu hỏi, sau đó xem lại toàn bộ nội dung trước khi lưu."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBackClick}
            className="flex shrink-0 items-center gap-1.5 rounded-[6px] bg-[#EF4444] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#DC2626]"
          >
            <ArrowLeft className="size-3.5" />
            Trở về
          </button>
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
            onSaveDraft={handleSaveDraft}
            cancelHref="/teacher/exams"
            isSubmitting={isSubmitting}
            isSavingDraft={isSavingDraft}
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
            cancelRequestKey={cancelRequestKey}
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
