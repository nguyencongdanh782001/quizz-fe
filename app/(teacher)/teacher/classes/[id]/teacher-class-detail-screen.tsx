"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Hash,
  Mail,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getTeacherClassById,
  getTeacherClassStudents,
  removeTeacherClassStudent,
} from "@/lib/teacher-classes";
import type { ClassStudent, ClassInfo } from "@/types/class.types";
import type { Document } from "@/types/document.types";
import type { Exam } from "@/types/exam.types";
import { cn } from "@/lib/utils";

type TeacherClassTab = "students" | "exams" | "documents";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

async function getTeacherClassExams(classId: string): Promise<Exam[]> {
  void classId;
  return [];
}

async function getTeacherClassDocuments(classId: string): Promise<Document[]> {
  void classId;
  return [];
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-outline/20 bg-surface-container-lowest p-8 text-center">
      <Icon className="mx-auto h-10 w-10 text-muted-foreground/60" />
      <h3 className="mt-4 font-display text-lg font-semibold text-on-surface">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-5 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="mt-1">{message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4"
          >
            Thử lại
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionLoading({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 text-sm text-muted-foreground">
      Đang tải {label.toLowerCase()}...
    </div>
  );
}

export function TeacherClassDetailScreen({ classId }: { classId: string }) {
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [activeTab, setActiveTab] = useState<TeacherClassTab>("students");
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingClass, setIsLoadingClass] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [studentActionError, setStudentActionError] = useState<string | null>(
    null,
  );
  const [studentActionSuccess, setStudentActionSuccess] = useState<
    string | null
  >(null);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(
    null,
  );
  const [examsError, setExamsError] = useState<string | null>(null);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [classRequestKey, setClassRequestKey] = useState(0);
  const [tabRequestKey, setTabRequestKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadClassDetail() {
      setIsLoadingClass(true);
      setClassError(null);

      try {
        const classDetail = await getTeacherClassById(classId);

        if (!isMounted) {
          return;
        }

        setCls(classDetail);
      } catch (error) {
        console.error(`Failed to fetch teacher class ${classId}`, error);

        if (!isMounted) {
          return;
        }

        setCls(null);
        setClassError(
          getErrorMessage(
            error,
            "Không thể tải thông tin lớp học. Vui lòng thử lại.",
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoadingClass(false);
        }
      }
    }

    void loadClassDetail();

    return () => {
      isMounted = false;
    };
  }, [classId, classRequestKey]);

  useEffect(() => {
    let isMounted = true;

    async function loadActiveTab() {
      switch (activeTab) {
        case "students": {
          setIsLoadingStudents(true);
          setStudentsError(null);
          setStudents([]);

          try {
            const items = await getTeacherClassStudents(classId);

            if (!isMounted) {
              return;
            }

            setStudents(items);
          } catch (error) {
            console.error(
              `Failed to fetch students for class ${classId}`,
              error,
            );

            if (!isMounted) {
              return;
            }

            setStudents([]);
            setStudentsError(
              getErrorMessage(
                error,
                "Không thể tải danh sách học sinh. Vui lòng thử lại.",
              ),
            );
          } finally {
            if (isMounted) {
              setIsLoadingStudents(false);
            }
          }

          return;
        }

        case "exams": {
          setIsLoadingExams(true);
          setExamsError(null);
          setExams([]);

          try {
            const items = await getTeacherClassExams(classId);

            if (!isMounted) {
              return;
            }

            setExams(items);
          } catch (error) {
            console.error(`Failed to fetch exams for class ${classId}`, error);

            if (!isMounted) {
              return;
            }

            setExams([]);
            setExamsError(
              getErrorMessage(
                error,
                "Không thể tải danh sách bài thi. Vui lòng thử lại.",
              ),
            );
          } finally {
            if (isMounted) {
              setIsLoadingExams(false);
            }
          }

          return;
        }

        case "documents": {
          setIsLoadingDocuments(true);
          setDocumentsError(null);
          setDocuments([]);

          try {
            const items = await getTeacherClassDocuments(classId);

            if (!isMounted) {
              return;
            }

            setDocuments(items);
          } catch (error) {
            console.error(
              `Failed to fetch documents for class ${classId}`,
              error,
            );

            if (!isMounted) {
              return;
            }

            setDocuments([]);
            setDocumentsError(
              getErrorMessage(
                error,
                "Không thể tải tài liệu của lớp. Vui lòng thử lại.",
              ),
            );
          } finally {
            if (isMounted) {
              setIsLoadingDocuments(false);
            }
          }

          return;
        }
      }
    }

    void loadActiveTab();

    return () => {
      isMounted = false;
    };
  }, [activeTab, classId, tabRequestKey]);

  function retryClassDetail() {
    setClassRequestKey((current) => current + 1);
    setTabRequestKey((current) => current + 1);
  }

  function retryActiveTab() {
    setTabRequestKey((current) => current + 1);
  }

  async function handleRemoveStudent(student: ClassStudent) {
    const isConfirmed = window.confirm(
      "Are you sure you want to remove this student from the class?",
    );

    if (!isConfirmed) {
      return;
    }

    setStudentActionError(null);
    setStudentActionSuccess(null);
    setRemovingStudentId(student.id);

    try {
      const message = await removeTeacherClassStudent(classId, student.id);

      setStudentActionSuccess(message || "Student removed successfully");
      setTabRequestKey((current) => current + 1);
      setClassRequestKey((current) => current + 1);
    } catch (error) {
      console.error(
        `Failed to remove student ${student.id} from class ${classId}`,
        error,
      );
      setStudentActionError(
        getErrorMessage(
          error,
          "Không thể xóa học sinh khỏi lớp. Vui lòng thử lại.",
        ),
      );
    } finally {
      setRemovingStudentId(null);
    }
  }

  if (isLoadingClass) {
    return (
      <div className="rounded-2xl bg-surface-container-lowest p-8 text-sm text-muted-foreground">
        Đang tải thông tin lớp học...
      </div>
    );
  }

  if (classError) {
    return (
      <div className="space-y-4">
        <Link
          href="/teacher/classes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách lớp
        </Link>
        <ErrorState
          title="Không thể tải lớp học"
          message={classError}
          onRetry={retryClassDetail}
        />
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="space-y-4">
        <Link
          href="/teacher/classes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách lớp
        </Link>
        <EmptyState
          icon={Users}
          title="Không tìm thấy lớp học"
          description="Lớp này có thể đã bị xóa hoặc bạn không còn quyền truy cập."
          action={
            <Button asChild>
              <Link href="/teacher/classes">Về trang lớp học</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const studentCount = isLoadingStudents
    ? (cls.studentCount ?? 0)
    : students.length;
  const examCount = isLoadingExams ? cls.examCount : exams.length;
  const documentCount = isLoadingDocuments
    ? (cls.documentCount ?? 0)
    : documents.length;

  const tabs = [
    { id: "students" as const, label: "Học sinh", count: studentCount },
    { id: "exams" as const, label: "Bài thi", count: examCount },
    { id: "documents" as const, label: "Tài liệu", count: documentCount },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/teacher/classes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách lớp
      </Link>

      <section className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_18px_60px_rgba(7,30,39,0.08)]">
        <div className="bg-linear-to-r from-primary/10 via-surface-container-lowest to-secondary/10 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg"
                  style={{ backgroundColor: cls.coverColor }}
                >
                  {cls.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    Quản lý lớp học
                  </p>
                  <h1 className="mt-1 font-display text-2xl font-bold text-on-surface sm:text-3xl">
                    {cls.name}
                  </h1>
                  {cls.description ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                      {cls.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-surface-container p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Học sinh
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-on-surface">
                  {cls.studentCount ?? 0}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Bài thi
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-on-surface">
                  {cls.examCount}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Tài liệu
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-on-surface">
                  {cls.documentCount ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5">
              <Hash className="h-4 w-4" />
              Mã lớp:{" "}
              <code className="font-mono text-xs text-on-surface">
                {cls.joinCode ?? cls.inviteCode}
              </code>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5">
              <CalendarDays className="h-4 w-4" />
              Tạo ngày {formatDate(cls.createdAt)}
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2 rounded-2xl bg-surface-container-lowest p-2 shadow-[0_8px_24px_rgba(7,30,39,0.05)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-surface-container hover:text-on-surface",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-surface-container text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "students" && (
          <div className="space-y-4">
            {studentActionSuccess ? (
              <div className="rounded-2xl border border-green-200/70 bg-green-50/80 p-4 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-950/20 dark:text-green-300">
                {studentActionSuccess}
              </div>
            ) : null}

            {studentActionError ? (
              <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
                {studentActionError}
              </div>
            ) : null}

            {isLoadingStudents ? (
              <SectionLoading label="danh sách học sinh" />
            ) : studentsError ? (
              <ErrorState
                title="Không thể tải học sinh"
                message={studentsError}
                onRetry={retryActiveTab}
              />
            ) : students.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Chưa có học sinh nào trong lớp"
                description="Danh sách học sinh sẽ xuất hiện tại đây khi các em tham gia lớp bằng mã lớp."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(7,30,39,0.05)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline/10">
                      {["Học sinh", "Email", "Ngày tham gia", "Hành động"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-outline/10 last:border-0 hover:bg-surface-container-low transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-on-surface">
                                {student.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {student.email ? (
                            <span className="inline-flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5" />
                              {student.email}
                            </span>
                          ) : (
                            "Chưa có email"
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {formatDate(student.joinedAt)}
                        </td>
                        <td className="px-5 py-4">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            aria-label="Remove student"
                            disabled={removingStudentId === student.id}
                            onClick={() => void handleRemoveStudent(student)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {removingStudentId === student.id
                              ? "Đang đuổi..."
                              : "Đuổi"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "exams" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-on-surface">
                  Bài thi trong lớp
                </h2>
                <p className="text-sm text-muted-foreground">
                  Theo dõi và cập nhật các bài thi đã giao cho lớp này.
                </p>
              </div>
              <Button asChild>
                <Link href="/teacher/exams/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo bài thi
                </Link>
              </Button>
            </div>

            {isLoadingExams ? (
              <SectionLoading label="danh sách bài thi" />
            ) : examsError ? (
              <ErrorState
                title="Không thể tải bài thi"
                message={examsError}
                onRetry={retryActiveTab}
              />
            ) : exams.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Chưa có bài thi nào"
                description="Bạn có thể tạo bài thi mới và gán cho lớp này khi backend lớp học hỗ trợ danh sách bài thi riêng."
                action={
                  <Button asChild>
                    <Link href="/teacher/exams/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo bài thi
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(7,30,39,0.05)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline/10">
                      {[
                        "Bài thi",
                        "Thời lượng",
                        "Điểm tối đa",
                        "Trạng thái",
                        "Hành động",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam) => (
                      <tr
                        key={exam.id}
                        className="border-b border-outline/10 last:border-0 hover:bg-surface-container-low transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-on-surface">
                            {exam.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {exam.description}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {exam.duration} phút
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {exam.totalPoints ?? exam.passingScore}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                              (exam.isActive ?? exam.status === "published")
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                            )}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {(exam.isActive ?? exam.status === "published")
                              ? "Đang hoạt động"
                              : "Chưa hoạt động"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Button
                            asChild
                            type="button"
                            variant="ghost"
                            size="sm"
                          >
                            <Link
                              href={`/teacher/exams/create?edit=${exam.id}`}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-on-surface">
                  Tài liệu lớp học
                </h2>
                <p className="text-sm text-muted-foreground">
                  Quản lý tài liệu chia sẻ riêng cho lớp này.
                </p>
              </div>
              <Button asChild>
                <Link href="/teacher/documents">
                  <Plus className="mr-2 h-4 w-4" />
                  Tải lên tài liệu
                </Link>
              </Button>
            </div>

            {isLoadingDocuments ? (
              <SectionLoading label="danh sách tài liệu" />
            ) : documentsError ? (
              <ErrorState
                title="Không thể tải tài liệu"
                message={documentsError}
                onRetry={retryActiveTab}
              />
            ) : documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Chưa có tài liệu nào"
                description="Tài liệu được thêm cho lớp sẽ xuất hiện tại đây để bạn dễ theo dõi và cập nhật."
                action={
                  <Button asChild>
                    <Link href="/teacher/documents">
                      <Plus className="mr-2 h-4 w-4" />
                      Mở kho tài liệu
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(7,30,39,0.05)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline/10">
                      {["Tài liệu", "Ngày tạo", "Hành động"].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document) => (
                      <tr
                        key={document.id}
                        className="border-b border-outline/10 last:border-0 hover:bg-surface-container-low transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-on-surface">
                            {document.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {document.description}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {formatDate(document.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              type="button"
                              variant="ghost"
                              size="sm"
                            >
                              <Link href="/teacher/documents">
                                <Pencil className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
