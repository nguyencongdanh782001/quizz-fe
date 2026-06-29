"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDebounce } from "use-debounce";
import Link from "next/link";
import {
  AlertTriangle,
  FileX2,
  LoaderCircle,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DeleteExamDialog } from "@/components/exams/DeleteExamDialog";
import { ExamContextMenu } from "@/components/exams/ExamContextMenu";
import { useDeleteExam } from "@/hooks/queries/useDeleteExam";
import { useTeacherExams } from "@/hooks/queries/useTeacherExams";
import { APP_MESSAGES } from "@/lib/app-messages";
import type {
  TeacherExam,
  TeacherExamFilterFormValues,
  TeacherExamPagination,
  TeacherExamQuery,
} from "@/types/exam";
import { EXAM_FLOW_MESSAGES } from "./exam-flow-messages";
import { ExamCard, ExamStatusBadges, TruncatedTooltipText } from "./ExamCard";
import { ExamDetailModal } from "./ExamDetailModal";
import { ExamFilters } from "./ExamFilters";
import { mergeTeacherExamPublishUpdate } from "./exam-publish-utils";
import type { ToggleVisibilityResponse } from "@/hooks/queries/useToggleExamVisibility";
import {
  clampPage,
  DEFAULT_EXAM_FILTER_VALUES,
  EXAMS_PAGE_SIZE,
  buildStudentExamLink,
  formatExamDateTime,
  formatExamNumber,
  getExamScopeLabel,
  matchesClientFilters,
  sortExams,
} from "./exam-utils";

type ToastVariant = "default" | "success" | "error";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  open: boolean;
  variant: ToastVariant;
}

const filterSchema = Yup.object({
  search: Yup.string().max(120, "Từ khóa quá dài"),
  published: Yup.mixed<TeacherExamFilterFormValues["published"]>()
    .oneOf(["all", "published", "unpublished"])
    .required(),
  active: Yup.mixed<TeacherExamFilterFormValues["active"]>()
    .oneOf(["all", "active", "inactive"])
    .required(),
  sort_by: Yup.mixed<TeacherExamFilterFormValues["sort_by"]>()
    .oneOf(["created_at", "updated_at", "attempt_count", "question_count"])
    .required(),
  sort_order: Yup.mixed<TeacherExamFilterFormValues["sort_order"]>()
    .oneOf(["asc", "desc"])
    .required(),
});

function getBooleanFilter(
  value:
    | TeacherExamFilterFormValues["published"]
    | TeacherExamFilterFormValues["active"],
): boolean | undefined {
  if (value === "published" || value === "active") {
    return true;
  }

  if (value === "unpublished" || value === "inactive") {
    return false;
  }

  return undefined;
}

function buildPagination(
  totalItems: number,
  page: number,
  perPage: number,
): TeacherExamPagination {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = clampPage(page, totalPages);

  return {
    page: safePage,
    per_page: perPage,
    total: totalItems,
    total_pages: totalPages,
    has_next: safePage < totalPages,
    has_prev: safePage > 1,
  };
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="hidden xl:block">
        <Card className="rounded-[28px] border-0 bg-surface-container-lowest py-0 shadow-[0_24px_70px_-50px_rgba(7,30,39,0.24)]">
          <CardContent className="overflow-x-auto px-0">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-outline/10">
                  {[
                    "Đề thi",
                    "Số liệu",
                    "Trạng thái",
                    "Thời gian",
                    "Hành động",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-outline/10 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-24 rounded-2xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-52" />
                          <Skeleton className="h-4 w-72" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Skeleton className="h-12 w-24 rounded-2xl" />
                        <Skeleton className="h-12 w-24 rounded-2xl" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Skeleton className="h-7 w-28 rounded-full" />
                        <Skeleton className="h-7 w-28 rounded-full" />
                      </div>
                    </td>
                    <td className="px-5 py-4 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card
            key={index}
            className="overflow-hidden rounded-[28px] border-0 bg-surface-container-lowest py-0 shadow-[0_24px_70px_-50px_rgba(7,30,39,0.24)]"
          >
            <Skeleton className="h-48 w-full rounded-none" />
            <CardContent className="space-y-4 p-5">
              <div className="flex gap-2">
                <Skeleton className="h-7 w-28 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, metricIndex) => (
                  <Skeleton key={metricIndex} className="h-16 rounded-2xl" />
                ))}
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-11 w-11 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[30px] border border-destructive/15 bg-destructive/6 px-6 py-10 text-center shadow-[0_20px_60px_-48px_rgba(186,26,26,0.45)]">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/12 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold text-on-surface">
        Không thể tải danh sách đề thi
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Đã có lỗi khi tải danh sách đề thi. Hãy thử tải lại hoặc kiểm tra lại
        phản hồi từ API.
      </p>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onRetry}
        className="mt-5 h-11 rounded-2xl"
      >
        <RefreshCw className="mr-2 size-4" />
        Tải lại danh sách
      </Button>
    </div>
  );
}

function EmptyState({
  hasActiveFilters,
  onReset,
}: {
  hasActiveFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="rounded-[30px] border border-outline/10 bg-surface-container-lowest px-6 py-12 text-center shadow-[0_24px_70px_-50px_rgba(7,30,39,0.24)]">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileX2 className="size-8" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold text-on-surface">
        {hasActiveFilters
          ? "Không tìm thấy đề thi phù hợp"
          : "Chưa có đề thi nào"}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {hasActiveFilters
          ? "Hãy thử đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc để xem thêm đề thi."
          : ""}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onReset}
            className="h-11 rounded-2xl"
          >
            Đặt lại bộ lọc
          </Button>
        ) : null}
        <Button asChild type="button" size="lg" className="h-11 rounded-2xl">
          <Link href="/teacher/ai-exams?scope=system">
            <Sparkles className="mr-2 size-4" />
            Tạo đề thi AI
          </Link>
        </Button>
        <Button
          asChild
          type="button"
          variant="outline"
          size="lg"
          className="h-11 rounded-2xl"
        >
          <Link href="/teacher/exams/create">
            <Plus className="mr-2 size-4" />
            Tạo đề thi
          </Link>
        </Button>
      </div>
    </div>
  );
}

function PaginationControls({
  pagination,
  onPageChange,
}: {
  pagination: TeacherExamPagination;
  onPageChange: (page: number) => void;
}) {
  if (pagination.total_pages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-outline/10 bg-surface-container-lowest px-4 py-4 shadow-[0_18px_50px_-42px_rgba(7,30,39,0.22)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Trang {pagination.page} / {pagination.total_pages} •{" "}
        {formatExamNumber(pagination.total)} đề thi
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={!pagination.has_prev}
          onClick={() => onPageChange(pagination.page - 1)}
          className="h-10 rounded-2xl px-4"
        >
          Trước
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={!pagination.has_next}
          onClick={() => onPageChange(pagination.page + 1)}
          className="h-10 rounded-2xl px-4"
        >
          Sau
        </Button>
      </div>
    </div>
  );
}

export function ExamList() {
  const [paginationState, setPaginationState] = useState({
    page: 1,
    filterSignature: "",
  });
  const [selectedExam, setSelectedExam] = useState<TeacherExam | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<TeacherExam | null>(
    null,
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const formik = useFormik<TeacherExamFilterFormValues>({
    initialValues: DEFAULT_EXAM_FILTER_VALUES,
    validationSchema: filterSchema,
    onSubmit: () => undefined,
  });

  const [debouncedSearch] = useDebounce(formik.values.search.trim(), 350);
  const isSearchDebouncing = debouncedSearch !== formik.values.search.trim();
  const filterSignature = [
    debouncedSearch,
    formik.values.active,
    formik.values.published,
    formik.values.sort_by,
    formik.values.sort_order,
  ].join("|");
  const page =
    paginationState.filterSignature === filterSignature
      ? paginationState.page
      : 1;

  const query: TeacherExamQuery = {
    search: debouncedSearch || undefined,
    is_published: getBooleanFilter(formik.values.published),
    is_active: getBooleanFilter(formik.values.active),
    sort_by: formik.values.sort_by,
    sort_order: formik.values.sort_order,
  };

  const { data, error, isFetching, isPending, refetch } =
    useTeacherExams(query);
  const deleteExamMutation = useDeleteExam();
  const isLoading = isPending && !data;
  const isDeletingExam = deleteExamMutation.isPending;
  const deletingExamId = isDeletingExam ? (deleteCandidate?.id ?? null) : null;

  const addToast = ({
    title,
    description,
    variant = "default",
  }: Omit<ToastItem, "id" | "open">) => {
    setToasts((current) => [
      ...current,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        title,
        description,
        open: true,
        variant,
      },
    ]);
  };

  const allItems = data?.items ?? [];
  const filteredItems = sortExams(
    allItems.filter((exam) =>
      matchesClientFilters(exam, formik.values, debouncedSearch),
    ),
    formik.values.sort_by,
    formik.values.sort_order,
  );

  const pagination = buildPagination(
    filteredItems.length,
    page,
    EXAMS_PAGE_SIZE,
  );
  const safePage = clampPage(page, pagination.total_pages);
  const visibleItems = filteredItems.slice(
    (safePage - 1) * EXAMS_PAGE_SIZE,
    safePage * EXAMS_PAGE_SIZE,
  );

  const hasActiveFilters =
    Boolean(formik.values.search.trim()) ||
    formik.values.published !== DEFAULT_EXAM_FILTER_VALUES.published ||
    formik.values.active !== DEFAULT_EXAM_FILTER_VALUES.active ||
    formik.values.sort_by !== DEFAULT_EXAM_FILTER_VALUES.sort_by ||
    formik.values.sort_order !== DEFAULT_EXAM_FILTER_VALUES.sort_order;

  const totalCount = filteredItems.length;

  function handlePageChange(nextPage: number) {
    setPaginationState({
      page: nextPage,
      filterSignature,
    });
  }

  function handleDeleteRequest(exam: TeacherExam) {
    if (isDeletingExam) {
      return;
    }

    setDeleteCandidate(exam);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    if (isDeletingExam) {
      return;
    }

    if (!open) {
      setDeleteCandidate(null);
    }
  }

  function handleToastOpenChange(toastId: number, open: boolean) {
    if (open) {
      return;
    }

    setToasts((current) => current.filter((item) => item.id !== toastId));
  }

  async function handleCopyLink(exam: TeacherExam) {
    try {
      await navigator.clipboard.writeText(buildStudentExamLink(exam.id));
      addToast({
        title: "Đã sao chép liên kết",
        description: `Liên kết của "${exam.title}" đã được sao chép vào bộ nhớ tạm.`,
        variant: "success",
      });
    } catch {
      addToast({
        title: "Không thể sao chép liên kết",
        description:
          "Trình duyệt đã chặn quyền truy cập bộ nhớ tạm. Vui lòng thử lại.",
        variant: "error",
      });
    }
  }

  function handleToggleVisibility(response: ToggleVisibilityResponse) {
    setSelectedExam((current) =>
      current ? mergeTeacherExamPublishUpdate(current, response.exam) : current,
    );
    addToast({
      title: response.exam.is_published
        ? APP_MESSAGES.PUBLISH_EXAM_SUCCESS
        : APP_MESSAGES.PRIVATE_EXAM_SUCCESS,
      variant: "success",
    });
  }

  function handleToggleError(_message: string) {
    addToast({
      title: APP_MESSAGES.UPDATE_EXAM_VISIBILITY_FAILED,
      description: APP_MESSAGES.NETWORK_ERROR,
      variant: "error",
    });
  }

  async function handleDeleteExamConfirmation() {
    if (!deleteCandidate) {
      return;
    }

    const examToDelete = deleteCandidate;
    const shouldGoToPreviousPage = visibleItems.length === 1 && safePage > 1;

    try {
      await deleteExamMutation.mutateAsync(examToDelete.id);

      addToast({
        title: APP_MESSAGES.DELETE_EXAM_SUCCESS,
        variant: "success",
      });

      if (selectedExam?.id === examToDelete.id) {
        setSelectedExam(null);
      }

      if (shouldGoToPreviousPage) {
        handlePageChange(Math.max(safePage - 1, 1));
      }

      setDeleteCandidate(null);
    } catch (mutationError) {
      console.error(`Failed to delete exam ${examToDelete.id}`, mutationError);
      addToast({
        title: APP_MESSAGES.DELETE_EXAM_FAILED,
        description: APP_MESSAGES.DELETE_FAILED,
        variant: "error",
      });
    }
  }

  const isEmpty = !isLoading && !error && visibleItems.length === 0;
  const isRefreshing = isFetching && !isLoading;

  return (
    <ToastProvider duration={3500}>
      <TooltipProvider>
        <div className="space-y-6">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Khu vực giảng viên
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-on-surface">
                {EXAM_FLOW_MESSAGES.titles.management}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {isLoading
                    ? "Đang tải danh sách đề thi..."
                    : `${formatExamNumber(totalCount)} đề thi`}
                </span>
                {isRefreshing ? (
                  <span className="inline-flex items-center rounded-full bg-secondary/12 px-2.5 py-1 text-xs font-semibold text-secondary">
                    <LoaderCircle className="mr-1.5 size-3 animate-spin" />
                    Đồng bộ dữ liệu
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
              <Button asChild size="lg" className="h-11 rounded-2xl px-5">
                <Link href="/teacher/ai-exams?scope=system">
                  <Sparkles className="mr-2 size-4" />
                  Tạo đề thi AI
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 rounded-2xl px-5"
              >
                <Link href="/teacher/exams/create">
                  <Plus className="mr-2 size-4" />
                  {EXAM_FLOW_MESSAGES.titles.create}
                </Link>
              </Button>
            </div>
          </section>

          <ExamFilters
            formik={formik}
            hasActiveFilters={hasActiveFilters}
            isSearchDebouncing={isSearchDebouncing}
            resultCount={visibleItems.length}
            totalCount={totalCount}
            onReset={() => {
              void formik.resetForm({ values: DEFAULT_EXAM_FILTER_VALUES });
            }}
          />

          {error ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : isLoading ? (
            <LoadingState />
          ) : isEmpty ? (
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              onReset={() => {
                void formik.resetForm({ values: DEFAULT_EXAM_FILTER_VALUES });
              }}
            />
          ) : (
            <>
              <div className="hidden xl:block">
                <Card className="rounded-[28px] border-0 bg-surface-container-lowest py-0 shadow-[0_24px_70px_-50px_rgba(7,30,39,0.24)]">
                  <CardContent className="overflow-x-auto px-0">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-outline/10">
                          {[
                            "Đề thi",
                            "Số liệu",
                            "Trạng thái",
                            "Thời gian",
                            "Hành động",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground break-keep whitespace-nowrap"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleItems.map((exam) => (
                          <tr
                            key={exam.id}
                            className="border-b border-outline/10 align-top transition-colors hover:bg-surface-container-low last:border-b-0"
                          >
                            <td className="px-5 py-4">
                              <div className="flex min-w-[20rem] items-start gap-4">
                                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-primary/18 via-secondary/12 to-tertiary/14">
                                  {exam.image_url ? (
                                    <img
                                      src={exam.image_url}
                                      alt={exam.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <FileX2 className="size-5 text-primary/70" />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1 space-y-2">
                                  <TruncatedTooltipText
                                    text={exam.title}
                                    lines={2}
                                    className="font-display text-lg font-semibold leading-snug text-on-surface"
                                  />
                                  <TruncatedTooltipText
                                    text={
                                      exam.description ||
                                      "Đề thi chưa có mô tả."
                                    }
                                    lines={2}
                                    className="max-w-xl text-sm text-muted-foreground"
                                  />
                                  <div className="rounded-2xl bg-surface px-3 py-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                      Lớp học
                                    </p>
                                    <TruncatedTooltipText
                                      text={
                                        exam.classroom_name ||
                                        "Chưa gắn lớp học"
                                      }
                                      className="mt-1 text-sm font-medium text-on-surface"
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="grid min-w-60 gap-2 sm:grid-cols-2">
                                {[
                                  {
                                    label: "Thời lượng",
                                    value: `${formatExamNumber(exam.duration_minutes)} phút`,
                                  },
                                  {
                                    label: "Tổng điểm",
                                    value: formatExamNumber(exam.total_points),
                                  },
                                  {
                                    label: "Câu hỏi",
                                    value: formatExamNumber(
                                      exam.question_count,
                                    ),
                                  },
                                  {
                                    label: "Lượt làm",
                                    value: formatExamNumber(exam.attempt_count),
                                  },
                                ].map((stat) => (
                                  <div
                                    key={stat.label}
                                    className="rounded-2xl border border-outline/10 bg-surface px-3 py-2.5"
                                  >
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                      {stat.label}
                                    </p>
                                    <p className="mt-1.5 text-sm font-semibold text-on-surface">
                                      {stat.value}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="min-w-48 space-y-3">
                                <ExamStatusBadges exam={exam} />
                                <div className="rounded-2xl border border-outline/10 bg-surface px-3 py-2.5">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    {EXAM_FLOW_MESSAGES.labels.scope}
                                  </p>
                                  <p className="mt-1.5 line-clamp-1 text-sm font-semibold text-on-surface">
                                    {getExamScopeLabel(exam.scope)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="min-w-48 space-y-3 rounded-2xl border border-outline/10 bg-surface px-4 py-3">
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Tạo lúc
                                  </p>
                                  <p className="mt-1.5 text-sm font-semibold text-on-surface">
                                    {formatExamDateTime(exam.created_at)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Cập nhật
                                  </p>
                                  <p className="mt-1.5 text-sm font-semibold text-on-surface">
                                    {formatExamDateTime(exam.updated_at)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex min-w-16 justify-end">
                                <ExamContextMenu
                                  exam={exam}
                                  isDeleting={deletingExamId === exam.id}
                                  onViewDetail={setSelectedExam}
                                  onCopyLink={handleCopyLink}
                                  onDeleteRequest={handleDeleteRequest}
                                  onToggleVisibility={handleToggleVisibility}
                                  onToggleError={handleToggleError}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:hidden">
                {visibleItems.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    isDeleting={deletingExamId === exam.id}
                    onCopyLink={handleCopyLink}
                    onDeleteRequest={handleDeleteRequest}
                    onToggleVisibility={handleToggleVisibility}
                    onToggleError={handleToggleError}
                    onViewDetail={setSelectedExam}
                  />
                ))}
              </div>

              <PaginationControls
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>

        <ExamDetailModal
          exam={selectedExam}
          open={Boolean(selectedExam)}
          onToggleVisibility={handleToggleVisibility}
          onToggleError={handleToggleError}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedExam(null);
            }
          }}
        />

        <DeleteExamDialog
          examTitle={deleteCandidate?.title ?? null}
          isDeleting={isDeletingExam}
          open={Boolean(deleteCandidate)}
          onConfirm={handleDeleteExamConfirmation}
          onOpenChange={handleDeleteDialogOpenChange}
        />

        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            open={toast.open}
            variant={toast.variant}
            onOpenChange={(open) => {
              handleToastOpenChange(toast.id, open);
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
        ))}
        <ToastViewport />
      </TooltipProvider>
    </ToastProvider>
  );
}
