"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookMarked,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  FileCheck,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { APP_MESSAGES } from "@/lib/app-messages";
import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import {
  deleteTeacherClassroom,
  getTeacherClasses,
  updateTeacherClassroom,
} from "@/lib/teacher-classes";
import type { ClassInfo } from "@/types/class.types";
import { cn } from "@/lib/utils";
import {
  CreateClassroomDialog,
} from "./components/create-classroom-dialog";

function formatDateTime(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";

  const timeStr = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  const dateStr = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  return (
    <div className="text-xs text-[#111827] leading-snug">
      <div>{timeStr}</div>
      <div>{dateStr}</div>
    </div>
  );
}
import {
  DeleteClassroomDialog,
  type DeleteClassroomDialogSubmitResult,
} from "./components/delete-classroom-dialog";
import {
  EditClassroomDialog,
  type EditClassroomDialogSubmitResult,
} from "./components/edit-classroom-dialog";
import {
  readTeacherClassesFlashToast,
  type TeacherClassesFlashToast,
} from "./flash-toast";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function TeacherClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedClassId, setCopiedClassId] = useState<string | null>(null);
  const [toast, setToast] = useState<TeacherClassesFlashToast | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [updatingClassId, setUpdatingClassId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let isMounted = true;

    async function loadTeacherClasses() {
      try {
        const items = await getTeacherClasses();

        if (!isMounted) {
          return;
        }

        setClasses(items);
        setLoadError(null);
      } catch (error) {
        console.error("Failed to fetch teacher classes", error);

        if (!isMounted) {
          return;
        }

        setClasses([]);
        setLoadError(APP_MESSAGES.LOAD_CLASSES_FAILED);
      } finally {
        if (isMounted) {
          setIsLoadingClasses(false);
        }
      }
    }

    void loadTeacherClasses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const flashToast = readTeacherClassesFlashToast();

    if (!flashToast) {
      return;
    }

    setToast(flashToast);
  }, []);

  useEffect(() => {
    if (!copiedClassId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopiedClassId(null);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copiedClassId]);

  async function copyJoinCode(classId: string, joinCode: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(joinCode);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = joinCode;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopiedClassId(classId);
    } catch (error) {
      console.error(`Failed to copy join code for class ${classId}`, error);
    }
  }

  async function handleUpdateClassroom(
    classId: string,
    payload: {
      name: string;
      description: string;
      join_code: string;
    },
  ): Promise<EditClassroomDialogSubmitResult> {
    setUpdatingClassId(classId);

    try {
      const result = await updateTeacherClassroom(classId, payload);

      setClasses((current) =>
        current.map((cls) => (cls.id === classId ? result.classroom : cls)),
      );

      return {
        status: "success",
        message: result.message || APP_MESSAGES.UPDATE_CLASS_SUCCESS,
      };
    } catch (error) {
      console.error(`Failed to update class ${classId}`, error);

      return {
        status: "error",
        message: getApiErrorMessage(error, APP_MESSAGES.UPDATE_CLASS_FAILED),
      };
    } finally {
      setUpdatingClassId(null);
    }
  }

  async function handleDeleteClassroom(
    classroom: ClassInfo,
  ): Promise<DeleteClassroomDialogSubmitResult> {
    setDeletingClassId(classroom.id);

    try {
      await deleteTeacherClassroom(classroom.id);
      const message = APP_MESSAGES.DELETE_CLASS_SUCCESS;

      setClasses((current) =>
        current.filter((item) => item.id !== classroom.id),
      );
      setToast({
        message,
        variant: "success",
      });

      return {
        status: "success",
        message,
      };
    } catch (error) {
      console.error(`Failed to delete class ${classroom.id}`, error);

      return {
        status: "error",
        message: getApiErrorMessage(error, APP_MESSAGES.DELETE_CLASS_FAILED),
      };
    } finally {
      setDeletingClassId(null);
    }
  }

  function handleToastOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setToast(null);
      return;
    }

    setToast((current) => (current ? { ...current } : current));
  }

  function handleCreateClassroom(classroom: ClassInfo) {
    setClasses((current) => [classroom, ...current]);
    setToast({
      message: APP_MESSAGES.CREATE_CLASS_SUCCESS,
      variant: "success",
    });
  }

  async function refreshClasses() {
    setIsLoadingClasses(true);
    try {
      const items = await getTeacherClasses();
      setClasses(items);
      setLoadError(null);
    } catch (error) {
      console.error("Failed to refresh teacher classes", error);
      setLoadError(APP_MESSAGES.LOAD_CLASSES_FAILED);
    } finally {
      setIsLoadingClasses(false);
    }
  }

  function openClassDetail(classId: string) {
    router.push(`/teacher/classes/${classId}`);
  }

  function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof HTMLElement
      ? Boolean(target.closest("a, button, input, textarea, select, [role='button']"))
      : false;
  }

  function handleClassRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    classId: string,
  ) {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openClassDetail(classId);
    }
  }

  const normalizedSearch = search.trim().toLocaleLowerCase("vi");
  const filteredClasses = classes.filter((classroom) =>
    [
      classroom.name,
      classroom.description,
      classroom.joinCode,
      classroom.inviteCode,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("vi")
      .includes(normalizedSearch),
  );
  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleClasses = filteredClasses.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const canGoBack = safePage > 1;
  const canGoForward = safePage < totalPages;

  return (
    <ToastProvider duration={3500}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#1E293B]">
              Quản lý lớp học
            </h1>
            <p className="mt-0.5 text-xs text-[#64748B]">
              {isLoadingClasses
                ? "Đang tải danh sách lớp..."
                : `${classes.length} lớp đang quản lý`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CreateClassroomDialog
              onCreated={handleCreateClassroom}
              trigger={
                <Button type="button" className="h-9 rounded-[4px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-3.5 text-xs font-semibold text-white shadow-sm hover:opacity-95">
                  <Plus className="size-4" />
                  Tạo lớp mới
                </Button>
              }
            />
            <Button
              type="button"
              className="h-9 rounded-[4px] bg-[#3F63F3] px-3.5 text-xs font-semibold text-white hover:bg-[#3554D8]"
              onClick={() => void refreshClasses()}
              disabled={isLoadingClasses}
            >
              <RefreshCw className={`size-4 ${isLoadingClasses ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.08)]">
          <div className="border-b border-[#E3E7EE] p-3">
            <label className="relative block w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Nhập từ khóa tìm kiếm..."
                className="h-10 w-full rounded-[7px] border border-[#DDE2EB] bg-white pl-10 pr-3 text-xs text-[#1E293B] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4F62F2]"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
                <tr className="border-b border-[#DDE2EB]">
                  {[
                    "Mã lớp",
                    "Lớp học",
                    "Học sinh",
                    "Bài thi",
                    "Tài liệu",
                    "Ngày tạo",
                    "Ngày cập nhật",
                    "Hành động",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3.5 py-3.5 text-left"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
                {isLoadingClasses ? (
                  <tr>
                    <td colSpan={8} className="h-28 text-center text-[#64748B]">
                      <LoaderCircle className="mr-2 inline size-4 animate-spin" />
                      Đang tải danh sách lớp học...
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={8} className="h-28 text-center text-red-600">
                      <AlertCircle className="mr-2 inline size-4" />
                      {loadError}
                    </td>
                  </tr>
                ) : visibleClasses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="h-28 text-center text-[#64748B]">
                      Không tìm thấy dữ liệu nào!
                    </td>
                  </tr>
                ) : visibleClasses.map((cls) => (
                  <tr
                    key={cls.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`Xem chi tiết lớp ${cls.name}`}
                    onClick={(event) => {
                      if (!isInteractiveTarget(event.target)) {
                        openClassDetail(cls.id);
                      }
                    }}
                    onKeyDown={(event) => {
                      handleClassRowKeyDown(event, cls.id);
                    }}
                    className={cn(
                      "group cursor-pointer transition-colors hover:bg-[#F8FAFC] focus-visible:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                    )}
                  >
                    <td className="px-3.5 py-2.5">
                      <span className="font-mono text-xs font-semibold text-[#111827]">
                        {cls.joinCode ?? cls.inviteCode}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div>
                        <span className="font-medium text-[#111827] transition-colors group-hover:text-primary">
                          {cls.name}
                        </span>
                        {cls.description ? (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {cls.description}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {cls.studentCount ?? 0}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        {cls.examCount}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <BookMarked className="w-3.5 h-3.5 text-muted-foreground" />
                        {cls.documentCount}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      {formatDateTime(cls.createdAt)}
                    </td>
                    <td className="px-3.5 py-2.5">
                      {formatDateTime(cls.updatedAt || cls.createdAt)}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div
                        className="flex items-center gap-1"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                        onKeyDown={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <EditClassroomDialog
                          classroom={cls}
                          isSubmitting={updatingClassId === cls.id}
                          onSubmit={(payload) =>
                            handleUpdateClassroom(cls.id, payload)
                          }
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Chỉnh sửa lớp ${cls.name}`}
                              className="text-muted-foreground hover:text-on-surface"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <DeleteClassroomDialog
                          classroomName={cls.name}
                          isDeleting={deletingClassId === cls.id}
                          onConfirm={() => handleDeleteClassroom(cls)}
                          redirectOnSuccess={false}
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Xóa lớp ${cls.name}`}
                              className="text-muted-foreground hover:text-destructive"
                              disabled={deletingClassId !== null}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid items-center gap-3 border-t border-[#E3E7EE] px-4 py-3.5 text-xs text-[#1E293B] lg:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span>Số hàng hiển thị trên trang:</span>
              <label className="relative">
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                  className="h-9 appearance-none border-0 bg-transparent py-0 pl-2 pr-7 font-semibold text-[#3F63F3] outline-none"
                  aria-label="Số hàng hiển thị trên trang"
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#3F63F3]" />
              </label>
              <span>của tổng số {filteredClasses.length}</span>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <Button type="button" variant="ghost" size="icon" className="size-8" disabled={!canGoBack} onClick={() => setPage(1)} aria-label="Trang đầu">
                <ChevronsLeft className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-8" disabled={!canGoBack} onClick={() => setPage(safePage - 1)} aria-label="Trang trước">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="flex size-9 items-center justify-center rounded-full bg-[#3F63F3] font-bold text-white">{safePage}</span>
              <Button type="button" variant="ghost" size="icon" className="size-8" disabled={!canGoForward} onClick={() => setPage(safePage + 1)} aria-label="Trang sau">
                <ChevronRight className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-8" disabled={!canGoForward} onClick={() => setPage(totalPages)} aria-label="Trang cuối">
                <ChevronsRight className="size-4" />
              </Button>
            </div>

            <label className="flex items-center justify-center gap-3 lg:justify-end">
              <span>Chuyển đến trang:</span>
              <input
                key={safePage}
                type="number"
                min={1}
                max={totalPages}
                defaultValue={safePage}
                onBlur={(event) => {
                  const nextPage = Number(event.currentTarget.value);
                  if (Number.isFinite(nextPage)) {
                    setPage(Math.min(Math.max(nextPage, 1), totalPages));
                  }
                }}
                className="h-10 w-24 rounded-[7px] border border-[#DDE2EB] px-3 outline-none focus:border-[#4F62F2]"
                aria-label="Chuyển đến trang"
              />
            </label>
          </div>
        </div>
      </div>

      {toast ? (
        <Toast
          open
          variant={toast.variant}
          onOpenChange={handleToastOpenChange}
        >
          <div className="pr-6">
            <ToastTitle>{toast.message}</ToastTitle>
          </div>
          <ToastClose />
        </Toast>
      ) : null}

      <ToastViewport />
    </ToastProvider>
  );
}
