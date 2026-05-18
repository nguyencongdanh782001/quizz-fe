"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
import { EXAM_FLOW_MESSAGES } from "@/components/exams/exam-flow-messages";
import { ExamForm } from "@/components/features/teacher-exam-form/exam-form";
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
  getTeacherClassroomExamDetail,
  updateTeacherClassroomExam,
} from "@/lib/teacher-classes";
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
  const message = getApiErrorMessage(error, EXAM_FLOW_MESSAGES.errors.loadDetail);
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
        <Skeleton className="h-10 w-72 rounded-2xl" />
        <Skeleton className="h-5 w-full max-w-3xl rounded-2xl" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-2xl" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-80 rounded-[32px]" />
        <Skeleton className="h-[34rem] rounded-[32px]" />
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
    <div className="rounded-[30px] border border-destructive/15 bg-destructive/6 px-6 py-10 text-center shadow-[0_20px_60px_-48px_rgba(186,26,26,0.45)]">
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
  const [toast, setToast] = useState<ScreenToastState | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);
  const normalizedEditId = editId?.trim() ? editId.trim() : null;
  const isEditMode = normalizedEditId !== null;
  const cancelHref = `/teacher/classes/${classId}`;
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
      : createModeInitialValues;
  const formKey =
    isEditMode && normalizedEditId
      ? `classroom-exam-edit-${normalizedEditId}`
      : `classroom-exam-create-${classId}`;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const detailErrorState =
    isEditMode && detailQuery.isError && detailQuery.data === undefined
      ? getLoadDetailErrorState(detailQuery.error)
      : null;

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

        <div>
          <h1 className="font-display text-3xl font-bold text-on-surface">
            {isEditMode ? "Chỉnh sửa bài thi trong lớp" : "Tạo bài thi trong lớp"}
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
            {isEditMode
              ? "Cập nhật bài thi theo từng bước rõ ràng: chỉnh sửa thông tin, cập nhật câu hỏi và lưu lại nội dung mới cho lớp học."
              : "Hoàn thiện bài thi theo từng bước rõ ràng: nhập thông tin chung, xây dựng câu hỏi, sau đó xem lại toàn bộ nội dung trước khi gửi cho lớp."}
          </p>
        </div>

        {isEditMode && detailQuery.isPending && detailQuery.data === undefined ? (
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
            cancelHref={cancelHref}
            isSubmitting={isSubmitting}
            submitLabel={
              isEditMode ? EXAM_FLOW_MESSAGES.buttons.update : "Tạo bài thi"
            }
            submitError={submitError}
            submitContextLabel="lớp học này"
            submittingLabel={
              isEditMode
                ? UPDATE_EXAM_LOADING_LABEL
                : CREATE_EXAM_LOADING_LABEL
            }
          />
        ) : null}
      </div>

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
