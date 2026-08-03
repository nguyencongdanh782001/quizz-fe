"use client";

import Link from "next/link";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import {
  FileSearch,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCcw,
} from "lucide-react";
import { DocumentFilterBar } from "@/components/features/document/document-filter-bar";
import { TeacherDocumentList } from "@/components/features/document/teacher-document-list";
import { AppEmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { DeleteConfirmDialog } from "@/components/features/document/document-context-menu";
import { useDeleteTeacherDocument } from "@/hooks/queries/useDeleteTeacherDocument";
import { useTeacherClassrooms } from "@/hooks/queries/useTeacherClassrooms";
import { useTeacherDocuments } from "@/hooks/queries/useTeacherDocuments";
import { APP_MESSAGES } from "@/lib/app-messages";
import { getApiErrorMessage } from "@/lib/api/error-message";
import {
  DEFAULT_TEACHER_DOCUMENT_FILTERS,
  buildTeacherDocumentSearchParams,
  hasActiveTeacherDocumentFilters,
  toTeacherDocumentQuery,
} from "@/lib/teacher-document-filters";
import type {
  Document,
  TeacherDocumentFilterState,
} from "@/types/document.types";

type ToastVariant = "success" | "error";

interface ScreenToastState {
  description?: string;
  open: boolean;
  title: string;
  variant: ToastVariant;
}

const DOCUMENTS_ERROR_MESSAGE =
  "Không thể tải danh sách tài liệu. Vui lòng thử lại.";

function LoadingCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <SurfacePanel
          key={index}
          className="space-y-4 bg-white/80 p-5 animate-pulse"
        >
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-surface-container-low" />
            <div className="h-6 w-28 rounded-full bg-surface-container-low" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-3/4 rounded-[6px] bg-surface-container-low" />
            <div className="h-4 w-full rounded-[6px] bg-surface-container-low" />
            <div className="h-4 w-5/6 rounded-[6px] bg-surface-container-low" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-16 rounded-[6px] bg-surface-container-low" />
            <div className="h-16 rounded-[6px] bg-surface-container-low" />
          </div>
        </SurfacePanel>
      ))}
    </div>
  );
}

interface TeacherDocumentsScreenProps {
  initialFilters: TeacherDocumentFilterState;
  embeddedInLibrary?: boolean;
}

export function TeacherDocumentsScreen({
  initialFilters,
  embeddedInLibrary = false,
}: TeacherDocumentsScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const deleteDocumentMutation = useDeleteTeacherDocument();
  const [filters, setFilters] =
    useState<TeacherDocumentFilterState>(initialFilters);
  const [deleteCandidate, setDeleteCandidate] = useState<Document | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null,
  );
  const [toast, setToast] = useState<ScreenToastState | null>(null);
  const [debouncedSearch] = useDebounce(filters.search, 400);
  const lastSyncedSearchRef = useRef((() => {
    const params = buildTeacherDocumentSearchParams(initialFilters);

    if (embeddedInLibrary) {
      params.set("tab", "documents");
    }

    return params.toString();
  })());
  const appliedClassroomId =
    filters.scope === "classroom" ? filters.classroom_id : "";

  const appliedFilters: TeacherDocumentFilterState = {
    ...filters,
    search: debouncedSearch,
    classroom_id: appliedClassroomId,
    ...(embeddedInLibrary ? { is_published: "true" as const } : {}),
  };

  const documentsQuery = useTeacherDocuments(
    toTeacherDocumentQuery(appliedFilters),
  );
  const classroomsQuery = useTeacherClassrooms();
  const rawDocuments = documentsQuery.data ?? [];
  const documents = embeddedInLibrary
    ? rawDocuments.filter((doc) => doc.isPublished)
    : rawDocuments;
  const hasActiveFilters = hasActiveTeacherDocumentFilters(filters);
  const isInitialLoading = documentsQuery.isPending && !documentsQuery.data;
  const isSearchDebouncing = debouncedSearch.trim() !== filters.search.trim();

  const syncUrl = useEffectEvent((nextFilters: TeacherDocumentFilterState) => {
    const nextParams = buildTeacherDocumentSearchParams(nextFilters);

    if (embeddedInLibrary) {
      nextParams.set("tab", "documents");
    }

    const nextSearch = nextParams.toString();

    if (nextSearch === lastSyncedSearchRef.current) {
      return;
    }

    lastSyncedSearchRef.current = nextSearch;

    startTransition(() => {
      router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, {
        scroll: false,
      });
    });
  });

  useEffect(() => {
    syncUrl({
      search: debouncedSearch,
      scope: filters.scope,
      is_published: filters.is_published,
      classroom_id: appliedClassroomId,
    });
  }, [
    appliedClassroomId,
    debouncedSearch,
    filters.is_published,
    filters.scope,
  ]);

  const classroomMap = new Map<string, string>();

  for (const classroom of classroomsQuery.data ?? []) {
    classroomMap.set(classroom.id, classroom.name);
  }

  for (const document of documents) {
    if (document.classroomId && document.classroomName) {
      classroomMap.set(document.classroomId, document.classroomName);
    }
  }

  if (filters.classroom_id && !classroomMap.has(filters.classroom_id)) {
    classroomMap.set(filters.classroom_id, `Lớp học #${filters.classroom_id}`);
  }

  const classroomOptions = Array.from(classroomMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((left, right) => left.name.localeCompare(right.name, "vi"));

  // const systemDocumentCount = documents.filter(
  //   (document) => document.scope !== "classroom",
  // ).length;
  // const classroomDocumentCount = documents.filter(
  //   (document) => document.scope === "classroom",
  // ).length;

  function openToast(nextToast: Omit<ScreenToastState, "open">) {
    setToast({
      ...nextToast,
      open: true,
    });
  }

  function handleDeleteRequest(document: Document) {
    if (deletingDocumentId !== null) {
      return;
    }

    setDeleteCandidate(document);
  }

  async function handleDeleteConfirm() {
    if (!deleteCandidate) {
      return false;
    }

    const documentToDelete = deleteCandidate;
    const documentId = Number(documentToDelete.id);

    if (!Number.isFinite(documentId)) {
      openToast({
        title: APP_MESSAGES.DELETE_DOCUMENT_FAILED,
        description: APP_MESSAGES.NETWORK_ERROR,
        variant: "error",
      });
      return false;
    }

    setDeletingDocumentId(documentToDelete.id);

    try {
      await deleteDocumentMutation.mutateAsync(documentId);
      openToast({
        title: APP_MESSAGES.DELETE_DOCUMENT_SUCCESS,
        variant: "success",
      });
      setDeleteCandidate(null);
      return true;
    } catch (error) {
      console.error(`Failed to delete document ${documentToDelete.id}`, error);
      openToast({
        title: APP_MESSAGES.DELETE_DOCUMENT_FAILED,
        description: APP_MESSAGES.NETWORK_ERROR,
        variant: "error",
      });
      return false;
    } finally {
      setDeletingDocumentId((current) =>
        current === documentToDelete.id ? null : current,
      );
    }
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    if (deletingDocumentId !== null) {
      return;
    }

    if (!open) {
      setDeleteCandidate(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Kho tài liệu giáo viên"
        title="Quản lý tài liệu"
        description="Lọc nhanh tài liệu theo tiêu đề, phạm vi, trạng thái xuất bản và lớp học để bạn tìm đúng học liệu đang cần mà không phải đi qua những bộ lọc thừa."
        icon={FileText}
        actions={
          <Button asChild size="lg" className="bg-gradient-to-r from-[#4867F8] to-[#C62CF2] text-white shadow-sm hover:opacity-95">
            <Link href="/teacher/documents/create">
              <Plus className="mr-2 h-4 w-4" />
              Tải lên tài liệu
            </Link>
          </Button>
        }
        // metrics={[
        //   {
        //     label: "Tài liệu hiện có",
        //     value: isInitialLoading ? "--" : documents.length,
        //     description: "Tổng số tài liệu trả về theo bộ lọc hiện tại.",
        //     icon: Layers3,
        //     tone: "primary",
        //   },
        //   {
        //     label: "Tài liệu hệ thống",
        //     value: isInitialLoading ? "--" : systemDocumentCount,
        //     description: "Các tài liệu áp dụng ở phạm vi toàn hệ thống.",
        //     icon: FileText,
        //     tone: "secondary",
        //   },
        //   {
        //     label: "Tài liệu lớp học",
        //     value: isInitialLoading ? "--" : classroomDocumentCount,
        //     description: "Các tài liệu gắn với lớp học cụ thể.",
        //     icon: School,
        //     tone: "tertiary",
        //   },
        // ]}
      />

      <DocumentFilterBar
        classroomOptions={classroomOptions}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        isClassroomOptionsLoading={classroomsQuery.isPending}
        isRefreshing={documentsQuery.isFetching}
        isSearchDebouncing={isSearchDebouncing}
        onFiltersChange={(nextFilters) => setFilters(nextFilters)}
        onReset={() => setFilters(DEFAULT_TEACHER_DOCUMENT_FILTERS)}
        resultCount={documents.length}
      />

      {isInitialLoading ? (
        <LoadingCards />
      ) : documentsQuery.isError ? (
        <SurfacePanel tone="muted" className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[8px] bg-destructive/10 text-destructive">
            <FileSearch className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-on-surface">
              Không thể tải tài liệu
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {getApiErrorMessage(
                documentsQuery.error,
                DOCUMENTS_ERROR_MESSAGE,
              )}
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                void documentsQuery.refetch();
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Tải lại danh sách
            </Button>
          </div>
        </SurfacePanel>
      ) : documents.length === 0 ? (
        <AppEmptyState
          icon={FileSearch}
          title={hasActiveFilters ? "Không tìm thấy tài liệu phù hợp" : "Chưa có tài liệu nào"}
          description={
            hasActiveFilters
              ? "Thử đổi phạm vi, trạng thái hoặc xóa bộ lọc hiện tại để xem thêm tài liệu."
              : "Tạo tài liệu đầu tiên để bắt đầu quản lý học liệu."
          }
          action={
            hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setFilters(DEFAULT_TEACHER_DOCUMENT_FILTERS)}
              >
                Đặt lại bộ lọc
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/teacher/documents/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo tài liệu đầu tiên
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Hiển thị {documents.length} tài liệu theo bộ lọc hiện tại.
            </p>
            {documentsQuery.isFetching ? (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Đang làm mới danh sách
              </span>
            ) : null}
          </div>

          <TeacherDocumentList
            documents={documents}
            deletingDocumentId={deletingDocumentId}
            onDeleteRequest={handleDeleteRequest}
          />
        </section>
      )}

      {deleteCandidate ? (
        <DeleteConfirmDialog
          documentTitle={deleteCandidate.title}
          isDeleting={deletingDocumentId === deleteCandidate.id}
          open={true}
          onConfirm={handleDeleteConfirm}
          onOpenChange={handleDeleteDialogOpenChange}
        />
      ) : null}

      <ToastProvider duration={3500}>
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
    </div>
  );
}
