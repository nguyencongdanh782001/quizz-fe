"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  FileSpreadsheet,
  PencilLine,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { EXAM_FLOW_MESSAGES } from "@/components/exams/exam-flow-messages";
import { ExamImportDialog } from "@/components/features/teacher-exam-form/exam-import-dialog";
import { ExamForm } from "@/components/features/teacher-exam-form/exam-form";
import { SystemExamSelectorDialog } from "@/components/features/teacher-exam-form/system-exam-selector-dialog";
import { useBreadcrumbLabel } from "@/components/shared/breadcrumb-labels";
import type { TeacherExamFormValues } from "@/components/features/teacher-exam-form/types";
import {
  createInitialTeacherExamFormValues,
  mapTeacherExamDetailToFormValues,
  mapTeacherExamFormToPayload,
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
import { getApiErrorMessage } from "@/lib/api/error-message";
import {
  createTeacherClassExam,
  getTeacherClassById,
  getTeacherClassroomExamDetail,
  updateTeacherClassroomExam,
} from "@/lib/teacher-classes";
import type { TeacherExam } from "@/types/exam";
import { teacherClassDetailQueryKeys } from "../../query-keys";

type ToastVariant = "success" | "error";

interface ScreenToastState {
  description?: string;
  open: boolean;
  title: string;
  variant: ToastVariant;
}

const CREATE_EXAM_SUCCESS_MESSAGE = "Tạo bài thi thành công";
const CREATE_EXAM_ERROR_MESSAGE = "Không thể tạo bài thi";
const CREATE_EXAM_LOADING_LABEL = "Đang tạo bài thi...";
const UPDATE_EXAM_SUCCESS_MESSAGE = "Cập nhật bài thi thành công";
const UPDATE_EXAM_ERROR_MESSAGE = "Không thể cập nhật bài thi";
const UPDATE_EXAM_LOADING_LABEL = "Đang cập nhật...";

function scrollTeacherContentToTop() {
  const mainElement = document.querySelector("main");

  if (mainElement instanceof HTMLElement) {
    mainElement.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function getApiErrorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return null;
}

function createClassroomExamInitialValues(
  classId: string,
): TeacherExamFormValues {
  const numericClassId = Number(classId);

  return {
    ...createInitialTeacherExamFormValues(),
    scope: "classroom",
    classroom_id: Number.isFinite(numericClassId) ? numericClassId : null,
  };
}

function getLoadDetailErrorState(error: unknown): {
  description: string;
  title: string;
} {
  const message = getApiErrorMessage(
    error,
    EXAM_FLOW_MESSAGES.errors.loadDetail,
  );
  const isNotFoundError =
    getApiErrorStatus(error) === 404 ||
    message === EXAM_FLOW_MESSAGES.errors.notFound;

  if (isNotFoundError) {
    return {
      title: EXAM_FLOW_MESSAGES.errors.notFound,
      description:
        "Bài thi này không tồn tại hoặc không còn thuộc lớp học hiện tại.",
    };
  }

  return {
    title: EXAM_FLOW_MESSAGES.errors.loadDetail,
    description: message,
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

function ExamEditorErrorState({
  description,
  onRetry,
  title,
  backHref,
}: {
  description: string;
  onRetry: () => void;
  title: string;
  backHref: string;
}) {
  return (
    <div className="rounded-[10px] border border-destructive/15 bg-destructive/6 px-6 py-10 text-center shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/12 text-destructive">
        <TriangleAlert className="size-7" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold text-on-surface">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button type="button" variant="outline" size="lg" onClick={onRetry}>
          <RefreshCw className="mr-2 size-4" />
          Tải lại dữ liệu
        </Button>
        <Button asChild type="button" size="lg">
          <Link href={backHref}>Quay lại lớp học</Link>
        </Button>
      </div>
    </div>
  );
}

export function TeacherClassExamCreateScreen({
  classId,
  editId,
}: {
  classId: string;
  editId?: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedSystemExamTitle, setCopiedSystemExamTitle] = useState<
    string | null
  >(null);
  const [createDraftValues, setCreateDraftValues] =
    useState<TeacherExamFormValues | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSystemExamSelectorOpen, setIsSystemExamSelectorOpen] =
    useState(false);
  const [toast, setToast] = useState<ScreenToastState | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);
  const normalizedEditId = editId?.trim() ? editId.trim() : null;
  const isEditMode = normalizedEditId !== null;
  const cancelHref = `/teacher/classes/${classId}`;
  const classQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.detail(classId),
    queryFn: async () => getTeacherClassById(classId),
  });
  const classBreadcrumbHref = `/teacher/classes/${classId}`;
  const classBreadcrumbLabel = classQuery.data?.name?.trim() || (
    classQuery.isPending ? null : "Chi tiết lớp học"
  );
  const createModeInitialValues = useMemo(
    () => createClassroomExamInitialValues(classId),
    [classId],
  );
  const detailQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.examDetail(
      classId,
      normalizedEditId ?? "missing",
    ),
    queryFn: async () => {
      if (normalizedEditId === null) {
        throw new Error("Thiếu mã bài thi.");
      }

      return getTeacherClassroomExamDetail(classId, normalizedEditId);
    },
    enabled: isEditMode,
  });
  const createMutation = useMutation({
    mutationFn: async (values: TeacherExamFormValues) =>
      createTeacherClassExam(classId, mapTeacherExamFormToPayload(values)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherClassDetailQueryKeys.detail(classId),
        }),
        queryClient.invalidateQueries({
          queryKey: teacherClassDetailQueryKeys.exams(classId),
        }),
        queryClient.invalidateQueries({
          queryKey: teacherClassDetailQueryKeys.examDetails(classId),
        }),
      ]);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (values: TeacherExamFormValues) => {
      if (normalizedEditId === null) {
        throw new Error("Thiếu mã bài thi.");
      }

      return updateTeacherClassroomExam(
        classId,
        normalizedEditId,
        mapTeacherExamFormToPayload(values),
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherClassDetailQueryKeys.detail(classId),
        }),
        queryClient.invalidateQueries({
          queryKey: teacherClassDetailQueryKeys.exams(classId),
        }),
        queryClient.invalidateQueries({
          queryKey: teacherClassDetailQueryKeys.examDetails(classId),
        }),
      ]);
    },
  });
  const initialValues =
    isEditMode && detailQuery.data
      ? mapTeacherExamDetailToFormValues(detailQuery.data)
      : (createDraftValues ?? createModeInitialValues);
  const formKey =
    isEditMode && normalizedEditId
      ? `classroom-exam-edit-${normalizedEditId}`
      : `classroom-exam-create-${classId}-${formVersion}`;
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || isImporting || isSavingDraft;
  const detailErrorState =
    isEditMode && detailQuery.isError && detailQuery.data === undefined
      ? getLoadDetailErrorState(detailQuery.error)
      : null;

  useBreadcrumbLabel(classBreadcrumbHref, classBreadcrumbLabel);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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

    const draftValues = {
      ...values,
      is_published: false,
      is_active: false,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync(draftValues);
      } else {
        await createMutation.mutateAsync(draftValues);
      }

      openToast({
        title: "Đã lưu bản nháp",
        description:
          "Đề thi đã được lưu và sẽ xuất hiện trong mục Quản lý đề thi.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save classroom exam draft", error);

      const message = "Không thể lưu bản nháp. Vui lòng thử lại.";

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
      const message = isEditMode
        ? await updateMutation.mutateAsync(values)
        : await createMutation.mutateAsync(values);

      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }

      openToast({
        title: isEditMode
          ? UPDATE_EXAM_SUCCESS_MESSAGE
          : CREATE_EXAM_SUCCESS_MESSAGE,
        description:
          message ||
          (isEditMode
            ? "Bài thi đã được cập nhật. Đang quay lại lớp học..."
            : "Bài thi đã được tạo. Đang quay lại lớp học..."),
        variant: "success",
      });
      scrollTeacherContentToTop();
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push(cancelHref);
      }, 1200);
    } catch (error) {
      console.error(
        isEditMode
          ? `Failed to update classroom exam ${normalizedEditId} for class ${classId}`
          : `Failed to create exam for class ${classId}`,
        error,
      );

      const fallbackMessage = isEditMode
        ? UPDATE_EXAM_ERROR_MESSAGE
        : CREATE_EXAM_ERROR_MESSAGE;
      const message = getApiErrorMessage(error, fallbackMessage);

      setSubmitError(message);
      openToast({
        title: fallbackMessage,
        description: message,
        variant: "error",
      });
      scrollTeacherContentToTop();
    }
  }

  async function handleImportSubmit(values: TeacherExamFormValues) {
    setSubmitError(null);
    setToast(null);
    setIsImporting(true);

    try {
      const message = await createMutation.mutateAsync(values);

      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }

      openToast({
        title: "Tạo đề thi thành công",
        description:
          message || "Đề thi đã được import. Đang quay lại lớp học...",
        variant: "success",
      });
      setIsImportDialogOpen(false);
      scrollTeacherContentToTop();
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push(cancelHref);
      }, 1200);
    } catch (error) {
      console.error(`Failed to import exam for class ${classId}`, error);

      const message = getApiErrorMessage(error, "Không thể tạo đề thi");

      openToast({
        title: "Không thể tạo đề thi",
        description: message,
        variant: "error",
      });
      scrollTeacherContentToTop();
    } finally {
      setIsImporting(false);
    }
  }

  function handleSelectSystemExam(exam: TeacherExam) {
    const numericClassId = Number(classId);
    const classroomId = Number.isFinite(numericClassId) ? numericClassId : null;
    const copiedValues: TeacherExamFormValues = {
      ...mapTeacherExamDetailToFormValues(exam),
      classroom_id: classroomId,
      is_published: false,
      scope: "classroom",
    };

    setCreateDraftValues(copiedValues);
    setCopiedSystemExamTitle(exam.title);
    setFormVersion((current) => current + 1);
    setSubmitError(null);
    setToast(null);
    scrollTeacherContentToTop();
  }

  return (
    <ToastProvider>
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <Link
          href={cancelHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại lớp học
        </Link>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#1E293B]">
              {isEditMode
                ? "Chỉnh sửa bài thi trong lớp"
                : "Tạo bài thi trong lớp"}
            </h1>
            <p className="mt-1 max-w-4xl text-xs leading-5 text-[#64748B]">
              {isEditMode
                ? "Cập nhật bài thi theo từng bước rõ ràng: chỉnh sửa thông tin, cập nhật câu hỏi và lưu lại nội dung mới cho lớp học."
                : "Hoàn thiện bài thi theo từng bước rõ ràng: nhập thông tin chung, xây dựng câu hỏi, sau đó xem lại toàn bộ nội dung trước khi gửi cho lớp."}
            </p>
          </div>

          {!isEditMode ? (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              <div className="h-9 flex items-center justify-center gap-2 rounded-[6px] border border-primary/15 bg-primary/8 px-3 text-sm font-medium text-primary">
                <PencilLine className="size-4" />
                Tạo thủ công
              </div>
              <Button asChild type="button" variant="outline" size="lg">
                <Link href={`/teacher/ai-exams?scope=class&classId=${classId}`}>
                  <Sparkles className="size-4" />
                  Tạo bằng AI
                </Link>
              </Button>
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
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setIsSystemExamSelectorOpen(true)}
                className="w-full sm:w-auto"
              >
                <BookOpen className="size-4" />
                Chọn từ đề thi hệ thống
              </Button>
            </div>
          ) : null}
        </div>

        {copiedSystemExamTitle && !isEditMode ? (
          <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            Đã sao chép đề thi từ hệ thống: {copiedSystemExamTitle}
          </div>
        ) : null}

        {isEditMode &&
        detailQuery.isPending &&
        detailQuery.data === undefined ? (
          <ExamEditorLoadingState />
        ) : null}

        {detailErrorState ? (
          <ExamEditorErrorState
            title={detailErrorState.title}
            description={detailErrorState.description}
            backHref={cancelHref}
            onRetry={() => {
              void detailQuery.refetch();
            }}
          />
        ) : null}

        {!isEditMode || detailQuery.data ? (
          <ExamForm
            key={formKey}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            cancelHref={cancelHref}
            isSubmitting={isSubmitting}
            isSavingDraft={isSavingDraft}
            submitLabel={
              isEditMode ? EXAM_FLOW_MESSAGES.buttons.update : "Tạo bài thi"
            }
            submitError={submitError}
            submitContextLabel="lớp học này"
            submittingLabel={
              isEditMode ? UPDATE_EXAM_LOADING_LABEL : CREATE_EXAM_LOADING_LABEL
            }
          />
        ) : null}
      </div>

      {!isEditMode ? (
        <>
          <ExamImportDialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
            baseValues={{
              classroom_id: createModeInitialValues.classroom_id,
              scope: "classroom",
            }}
            isImporting={isImporting}
            onImport={handleImportSubmit}
          />
          <SystemExamSelectorDialog
            open={isSystemExamSelectorOpen}
            onOpenChange={setIsSystemExamSelectorOpen}
            onSelectExam={handleSelectSystemExam}
          />
        </>
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
