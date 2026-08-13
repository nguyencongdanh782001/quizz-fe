"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDebounce } from "use-debounce";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  FileX2,
  Globe,
  LoaderCircle,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ClipboardList,
  ClipboardCheck,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AssignExamDialog,
  type AssignmentType,
} from "@/components/exams/AssignExamDialog";
import { useDeleteExam } from "@/hooks/queries/useDeleteExam";
import { useTeacherExams } from "@/hooks/queries/useTeacherExams";
import { APP_MESSAGES } from "@/lib/app-messages";
import type {
  TeacherExam,
  TeacherExamFilterFormValues,
  TeacherExamPagination,
  TeacherExamQuery,
} from "@/types/exam";
import { ExamDetailModal } from "./ExamDetailModal";
import { mergeTeacherExamPublishUpdate } from "./exam-publish-utils";
import type { ToggleVisibilityResponse } from "@/hooks/queries/useToggleExamVisibility";
import {
  clampPage,
  DEFAULT_EXAM_FILTER_VALUES,
  formatExamDateTime,
  formatExamNumber,
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

const KNOWN_SUBJECTS = new Set(
  [
    "Toán học",
    "Toán",
    "Tiếng Anh",
    "Vật lý",
    "Hóa học",
    "Tin học",
    "Ngữ văn",
    "Sinh học",
    "Lịch sử",
    "Địa lý",
    "Địa lí",
    "Công nghệ",
    "Giáo dục công dân",
    "GDCD",
    "Khác",
  ].map((subject) => subject.toLocaleLowerCase("vi")),
);

function parseGradeParts(grade: string | null | undefined): {
  level: string;
  school: string;
  subject: string;
} {
  const rawGrade = grade?.trim() ?? "";

  if (!rawGrade) {
    return {
      level: "Chưa phân loại",
      school: "--",
      subject: "--",
    };
  }

  /*
   * Dữ liệu mới có thể được lưu theo đúng bốn vị trí:
   * "Lớp 12 -  - Toán học - "
   *
   * Không được filter(Boolean), vì làm mất vị trí Trường học đang trống
   * và khiến Môn học bị đọc nhầm.
   */
  const positionalParts = rawGrade.split(" - ").map((part) => part.trim());

  if (positionalParts.some((part) => part === "")) {
    return {
      level: positionalParts[0] || "Chưa phân loại",
      school: positionalParts[1] || "--",
      subject: positionalParts[2] || "--",
    };
  }

  /*
   * Hỗ trợ dữ liệu cũ dạng:
   * "Lớp 12 - Toán học"
   *
   * Phần thứ hai là Môn học, không phải Trường học.
   */
  if (
    positionalParts.length === 2 &&
    KNOWN_SUBJECTS.has(positionalParts[1].toLocaleLowerCase("vi"))
  ) {
    return {
      level: positionalParts[0] || "Chưa phân loại",
      school: "--",
      subject: positionalParts[1] || "--",
    };
  }

  /*
   * Dữ liệu đầy đủ dạng:
   * "Khác - Đại học Y Dược - Sinh học - Khác"
   */
  return {
    level: positionalParts[0] || "Chưa phân loại",
    school: positionalParts[1] || "--",
    subject: positionalParts[2] || "--",
  };
}

function formatDateOnly(dateString: string | null | undefined): string {
  if (!dateString) return "--";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function isDraftExam(isPublished: boolean, isActive: boolean): boolean {
  return !isPublished && !isActive;
}

function renderVisibilityBadge(
  is_published: boolean,
  is_active: boolean,
  scope?: string | null,
) {
  if (isDraftExam(is_published, is_active)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-[4px] border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
        <FileX2 className="size-3" />
        Bản nháp
      </span>
    );
  }

  if (!is_published) {
    return (
      <span className="inline-flex items-center gap-1 rounded-[4px] border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
        <Lock className="size-3" />
        Riêng tư
      </span>
    );
  }

  if (scope === "class" || scope === "unlisted" || !is_active) {
    return (
      <span className="inline-flex items-center gap-1 rounded-[4px] border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
        <EyeOff className="size-3" />
        Không công khai
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
      <Globe className="size-3" />
      Công khai
    </span>
  );
}

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

export function ExamList() {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("all");

  const [selectedExam, setSelectedExam] = useState<TeacherExam | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<TeacherExam | null>(
    null,
  );
  const [assignExam, setAssignExam] = useState<TeacherExam | null>(null);
  const [assignType, setAssignType] = useState<AssignmentType>("test");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const formik = useFormik<TeacherExamFilterFormValues>({
    initialValues: DEFAULT_EXAM_FILTER_VALUES,
    validationSchema: filterSchema,
    onSubmit: () => undefined,
  });

  const [debouncedSearch] = useDebounce(formik.values.search.trim(), 350);
  const isSearchDebouncing = debouncedSearch !== formik.values.search.trim();

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

  const gradeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of allItems) {
      if (item.grade?.trim()) {
        const firstPart = item.grade.split(" - ")[0]?.trim();
        if (firstPart) set.add(firstPart);
      }
    }
    return Array.from(set);
  }, [allItems]);

  const filteredItems = useMemo(() => {
    let items = sortExams(
      allItems.filter((exam) =>
        matchesClientFilters(exam, formik.values, debouncedSearch),
      ),
      formik.values.sort_by,
      formik.values.sort_order,
    );

    if (selectedGradeFilter !== "all") {
      items = items.filter((exam) => {
        if (!exam.grade) return false;
        const level = exam.grade.split(" - ")[0]?.trim();
        return level === selectedGradeFilter;
      });
    }

    return items;
  }, [allItems, formik.values, debouncedSearch, selectedGradeFilter]);

  const pagination = buildPagination(
    filteredItems.length,
    currentPage,
    pageSize,
  );
  const safePage = clampPage(currentPage, pagination.total_pages);
  const visibleItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function handleDeleteRequest(exam: TeacherExam) {
    if (isDeletingExam) return;
    setDeleteCandidate(exam);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    if (isDeletingExam) return;
    if (!open) setDeleteCandidate(null);
  }

  function handleToastOpenChange(toastId: number, open: boolean) {
    if (open) return;
    setToasts((current) => current.filter((item) => item.id !== toastId));
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
    if (!deleteCandidate) return;
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
        setCurrentPage(Math.max(safePage - 1, 1));
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

  const isRefreshing = isFetching && !isLoading;

  return (
    <ToastProvider duration={3500}>
      <TooltipProvider>
        <div className="space-y-4">
          {/* Page Header */}
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1E293B]">
                Danh sách đề thi
              </h1>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Tìm kiếm, quản lý và mở nhanh các đề thi đã tạo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                className="h-9 rounded-[4px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-3.5 text-xs font-semibold text-white shadow-xs hover:opacity-95"
              >
                <Link href="/teacher/exams/create">
                  <Plus className="mr-2 size-4" />
                  Tạo đề thi
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-[4px] border-[#3F63F3] bg-[#3F63F3] px-3.5 text-xs font-semibold text-white hover:bg-[#3554D8] hover:text-white"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            </div>
          </section>

          {/* Main Card Container */}
          <section className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.08)]">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#E3E7EE] p-3">
              <label className="relative block w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="search"
                  id="teacher-exam-search"
                  name="search"
                  value={formik.values.search}
                  onChange={formik.handleChange}
                  placeholder="Nhập từ khóa tìm kiếm..."
                  className="h-10 w-full rounded-[7px] border border-[#DDE2EB] bg-white pl-10 pr-3 text-xs text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4F62F2]"
                />
                {isSearchDebouncing ? (
                  <LoaderCircle className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-[#4F62F2]" />
                ) : null}
              </label>

              <label className="relative block w-full sm:w-64">
                <select
                  value={selectedGradeFilter}
                  onChange={(e) => setSelectedGradeFilter(e.target.value)}
                  className="h-10 w-full appearance-none rounded-[7px] border border-[#DDE2EB] bg-white px-3 pr-9 text-xs text-[#475569] outline-none focus:border-[#4F62F2]"
                  aria-label="Lọc theo khối lớp"
                >
                  <option value="all">Tất cả khối lớp</option>
                  {gradeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
              </label>

              {isRefreshing && (
                <span className="ml-auto text-xs font-medium text-[#4F62F2] flex items-center gap-1">
                  <LoaderCircle className="size-3 animate-spin" /> Đang đồng
                  bộ...
                </span>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#DDE2EB] bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
                    <th className="w-24 px-4 py-3.5">Ảnh đại diện</th>
                    <th className="min-w-52 px-3.5 py-3.5">Tên đề thi</th>
                    <th className="min-w-32 px-3.5 py-3.5">Trình độ</th>
                    <th className="min-w-32 px-3.5 py-3.5">Môn học</th>
                    <th className="w-24 px-3.5 py-3.5 text-center">
                      Số câu hỏi
                    </th>
                    <th className="w-24 px-3.5 py-3.5 text-center">Lượt làm</th>
                    <th className="min-w-28 px-3.5 py-3.5">Ngày tạo</th>
                    <th className="min-w-32 px-3.5 py-3.5">Trạng thái</th>
                    <th className="min-w-44 px-3.5 py-3.5">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="h-28 text-center text-[#64748B]"
                      >
                        <LoaderCircle className="mr-2 inline size-4 animate-spin" />
                        Đang tải danh sách đề thi...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="h-28 text-center text-red-600 font-medium"
                      >
                        Không thể tải danh sách đề thi. Vui lòng thử lại.
                      </td>
                    </tr>
                  ) : visibleItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="h-28 text-center text-[#64748B]"
                      >
                        Không tìm thấy dữ liệu nào!
                      </td>
                    </tr>
                  ) : (
                    visibleItems.map((exam) => {
                      const { level, subject } = parseGradeParts(exam.grade);
                      const isDraft = isDraftExam(
                        exam.is_published,
                        exam.is_active,
                      );

                      return (
                        <tr
                          key={exam.id}
                          className="transition-colors hover:bg-[#F8FAFC]"
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-[6px] bg-[#EEF2FF]">
                              {exam.image_url ? (
                                <img
                                  src={exam.image_url}
                                  alt={exam.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FileX2 className="size-5 text-[#6366F1]" />
                              )}
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div className="flex max-w-xs flex-wrap items-center gap-1.5">
                              <span className="line-clamp-2 break-words font-bold text-[#1E293B]">
                                {exam.title}
                              </span>

                              {isDraft ? (
                                <span className="inline-flex shrink-0 items-center rounded-[4px] border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                                  Nháp
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5 text-[#526079]">
                            <div className="line-clamp-2">{level}</div>
                          </td>
                          <td className="px-3.5 py-2.5 text-[#526079]">
                            <div className="line-clamp-2">{subject}</div>
                          </td>
                          <td className="px-3.5 py-2.5 text-center text-[#526079]">
                            {formatExamNumber(exam.question_count)}
                          </td>
                          <td className="px-3.5 py-2.5 text-center text-[#526079]">
                            {formatExamNumber(exam.attempt_count)}
                          </td>
                          <td className="px-3.5 py-2.5 text-[#526079]">
                            {formatDateOnly(exam.created_at)}
                          </td>
                          <td className="px-3.5 py-2.5">
                            {renderVisibilityBadge(
                              exam.is_published,
                              exam.is_active,
                              exam.scope,
                            )}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-8 rounded-[4px] bg-[#3F63F3] px-3 text-[11px] font-semibold text-white shadow-xs hover:bg-[#3554D8] flex items-center gap-1 cursor-pointer"
                                  >
                                    <ClipboardList className="size-3.5" />
                                    <span>Giao bài tập</span>
                                    <ChevronDown className="size-3 ml-0.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48 rounded-[8px] border-[#DDE2EB] p-1 shadow-lg"
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setAssignExam(exam);
                                      setAssignType("test");
                                      setIsAssignDialogOpen(true);
                                    }}
                                    className="px-3 py-2 text-xs font-medium text-[#1E293B] cursor-pointer hover:bg-[#F8FAFC]"
                                  >
                                    <span>Giao bài tập kiểm tra</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setAssignExam(exam);
                                      setAssignType("practice");
                                      setIsAssignDialogOpen(true);
                                    }}
                                    className="px-3 py-2 text-xs font-medium text-[#1E293B] cursor-pointer hover:bg-[#F8FAFC]"
                                  >
                                    <span>Giao đề thi</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <ExamContextMenu
                                exam={exam}
                                isDeleting={deletingExamId === exam.id}
                                onViewDetail={setSelectedExam}
                                onDeleteRequest={handleDeleteRequest}
                                onToggleVisibility={handleToggleVisibility}
                                onToggleError={handleToggleError}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Synchronized Pagination Controls */}
            <div className="flex flex-col gap-3 p-3.5 text-xs text-[#64748B] lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span>Số hàng hiển thị trên trang:</span>
                <label className="relative">
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-9 appearance-none border-0 bg-transparent py-0 pl-2 pr-7 font-semibold text-[#3F63F3] outline-none"
                    aria-label="Số hàng hiển thị trên trang"
                  >
                    {[10, 20, 50].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#3F63F3]" />
                </label>
                <span>của tổng số {filteredItems.length}</span>
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-[#64748B] hover:text-[#1E293B]"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  aria-label="Trang đầu"
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-[#64748B] hover:text-[#1E293B]"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <span className="flex size-9 items-center justify-center rounded-full bg-[#3F63F3] font-bold text-white">
                  {safePage}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-[#64748B] hover:text-[#1E293B]"
                  disabled={
                    currentPage === pagination.total_pages ||
                    pagination.total_pages === 0
                  }
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pagination.total_pages, currentPage + 1),
                    )
                  }
                  aria-label="Trang sau"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-[#64748B] hover:text-[#1E293B]"
                  disabled={
                    currentPage === pagination.total_pages ||
                    pagination.total_pages === 0
                  }
                  onClick={() => setCurrentPage(pagination.total_pages)}
                  aria-label="Trang cuối"
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>

              <label className="flex items-center justify-center gap-3 lg:justify-end">
                <span>Chuyển đến trang:</span>
                <input
                  key={safePage}
                  type="number"
                  min={1}
                  max={pagination.total_pages || 1}
                  defaultValue={safePage}
                  onBlur={(event) => {
                    const nextPage = Number(event.currentTarget.value);
                    if (Number.isFinite(nextPage)) {
                      setCurrentPage(
                        Math.min(Math.max(nextPage, 1), pagination.total_pages),
                      );
                    }
                  }}
                  className="h-10 w-24 rounded-[7px] border border-[#DDE2EB] px-3 outline-none focus:border-[#4F62F2]"
                  aria-label="Chuyển đến trang"
                />
              </label>
            </div>
          </section>
        </div>

        {/* Exam Detail Modal */}
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

        {/* Delete Dialog */}
        <DeleteExamDialog
          examTitle={deleteCandidate?.title ?? null}
          isDeleting={isDeletingExam}
          open={Boolean(deleteCandidate)}
          onConfirm={handleDeleteExamConfirmation}
          onOpenChange={handleDeleteDialogOpenChange}
        />

        {/* Toast Viewport */}
        <ToastViewport />
        <AssignExamDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          exam={assignExam}
          type={assignType}
          onSuccess={(msg) =>
            addToast({
              title: msg,
              variant: "default",
            })
          }
        />

        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            open={toast.open}
            variant={toast.variant}
            onOpenChange={(open) => handleToastOpenChange(toast.id, open)}
          >
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description ? (
                <ToastDescription>{toast.description}</ToastDescription>
              ) : null}
            </div>
            <ToastClose />
          </Toast>
        ))}
      </TooltipProvider>
    </ToastProvider>
  );
}
