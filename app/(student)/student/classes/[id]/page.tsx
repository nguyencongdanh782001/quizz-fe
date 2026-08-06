"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClassDetailHeader } from "@/components/features/class-detail/class-detail-header";
import { ClassDetailTabs } from "@/components/features/class-detail/class-detail-tabs";
import {
  ClassExamList,
  type ClassExamAvailability,
  type ClassExamTableItem,
} from "@/components/features/class-detail/class-exam-list";
import {
  ClassDocumentList,
  type ClassDocumentListItem,
} from "@/components/features/class-detail/class-document-list";
import { ClassEmptyState } from "@/components/features/class-detail/class-empty-state";
import { ClassLoadingState } from "@/components/features/class-detail/class-loading-state";

import { getStudentClassById } from "@/lib/student-classes";
import { getStudentClassDocuments } from "@/lib/student-system-documents";
import { useStudentClassExams } from "@/hooks/queries/use-student-class-exams";
import { useBreadcrumbLabel } from "@/components/shared/breadcrumb-labels";
import { useNow } from "@/hooks/use-now";

import type { ClassInfo } from "@/types/class.types";
import type { Document } from "@/types/document.types";

type ClassTab = "tests" | "exams" | "documents";

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

function parseExamTime(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();

  return Number.isFinite(parsed) ? parsed : null;
}

function getExamStatus(
  exam: {
    isActive?: boolean;
    startTime?: string | null;
    endTime?: string | null;
  },
  now: Date,
): {
  availability: ClassExamAvailability;
  label: string;
  tone: "success" | "warning" | "danger";
} {
  if (exam.isActive === false) {
    return {
      availability: "closed",
      label: "Đã hết hạn",
      tone: "danger",
    };
  }

  const nowTime = now.getTime();
  const startTime = parseExamTime(exam.startTime);
  const endTime = parseExamTime(exam.endTime);

  if (startTime !== null && nowTime < startTime) {
    return {
      availability: "upcoming",
      label: "Sắp mở",
      tone: "warning",
    };
  }

  if (endTime !== null && nowTime >= endTime) {
    return {
      availability: "closed",
      label: "Đã hết hạn",
      tone: "danger",
    };
  }

  return {
    availability: "active",
    label: "Đang diễn ra",
    tone: "success",
  };
}

export default function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const now = useNow();

  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [activeTab, setActiveTab] = useState<ClassTab>("tests");
  const [documents, setDocuments] = useState<Document[]>([]);

  const [isLoadingClass, setIsLoadingClass] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  const [documentsError, setDocumentsError] = useState<string | null>(null);

  const [documentRequestKey, setDocumentRequestKey] = useState(0);

  const testsQuery = useStudentClassExams(
    id,
    { assignmentType: "test" },
    {
      enabled: true,
      throwOnError: false,
    },
  );

  const examsQuery = useStudentClassExams(
    id,
    { assignmentType: "exam" },
    {
      enabled: true,
      throwOnError: false,
    },
  );

  const tests = testsQuery.data?.items ?? [];
  const exams = examsQuery.data?.items ?? [];

  const testsTotal = testsQuery.data?.total ?? 0;
  const examsTotal = examsQuery.data?.total ?? 0;

  const classBreadcrumbHref = `/student/classes/${id}`;
  const classBreadcrumbLabel =
    cls?.name?.trim() || (isLoadingClass ? null : "Chi tiết lớp học");

  useBreadcrumbLabel(classBreadcrumbHref, classBreadcrumbLabel);

  useEffect(() => {
    let isMounted = true;

    async function loadClassDetail() {
      try {
        const foundClass = await getStudentClassById(id);

        if (isMounted) {
          setCls(foundClass);
        }
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
  }, [id]);

  useEffect(() => {
    if (activeTab !== "documents") {
      return;
    }

    let isMounted = true;

    async function loadDocuments() {
      setIsLoadingDocuments(true);
      setDocumentsError(null);

      try {
        const nextDocuments = await getStudentClassDocuments(id, {
          throwOnError: true,
        });

        if (isMounted) {
          setDocuments(nextDocuments);
        }
      } catch (error) {
        console.error(`Failed to fetch documents for class ${id}`, error);

        if (isMounted) {
          setDocuments([]);
          setDocumentsError(
            getErrorMessage(
              error,
              "Không thể tải tài liệu của lớp. Vui lòng thử lại.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingDocuments(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      isMounted = false;
    };
  }, [activeTab, documentRequestKey, id]);

  const tabs = [
    {
      id: "tests" as const,
      label: "Bài kiểm tra",
      count: testsTotal,
    },
    {
      id: "exams" as const,
      label: "Bài thi",
      count: examsTotal,
    },
    {
      id: "documents" as const,
      label: "Tài liệu",
      count: isLoadingDocuments ? (cls?.documentCount ?? 0) : documents.length,
    },
  ];

  function mapExamItems(source: typeof tests): ClassExamTableItem[] {
    return source.map((exam) => {
      const extendedExam = exam as typeof exam & {
        durationMinutes?: number;
        passingScore?: number;
      };

      const status = getExamStatus(exam, now);

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.duration ?? extendedExam.durationMinutes ?? 0,
        maximumScore: String(
          exam.totalPoints ?? extendedExam.passingScore ?? 0,
        ),
        statusLabel: status.label,
        statusTone: status.tone,
        availability: status.availability,
      };
    });
  }

  const testItems = useMemo(() => mapExamItems(tests), [tests, now]);

  const examItems = useMemo(() => mapExamItems(exams), [exams, now]);

  const documentItems = useMemo<ClassDocumentListItem[]>(
    () =>
      documents.map((document) => {
        const extendedDocument = document as Document & {
          createdAt?: string;
          scope?: string;
          classroomName?: string | null;
        };

        return {
          id: document.id,
          title: document.title,
          description: document.description,
          createdAt: extendedDocument.createdAt,
          scopeLabel:
            extendedDocument.scope === "system" ? "Hệ thống" : "Lớp học",
          statusLabel: "Đã chia sẻ",
          classroomName: extendedDocument.classroomName ?? cls?.name ?? null,
          href: `/student/materials/${document.id}` + `?classId=${id}`,
        };
      }),
    [cls?.name, documents, id],
  );

  if (isLoadingClass) {
    return <ClassLoadingState label="dữ liệu lớp học" />;
  }

  if (!cls) {
    return (
      <ClassEmptyState
        title="Không tìm thấy lớp học"
        description="Lớp này có thể đã bị xóa hoặc bạn không còn quyền truy cập."
        action={
          <Button asChild>
            <Link href="/student/classes">Về trang lớp học</Link>
          </Button>
        }
      />
    );
  }

  const activeExamQuery = activeTab === "tests" ? testsQuery : examsQuery;

  const activeItems = activeTab === "tests" ? testItems : examItems;

  const activeTitle =
    activeTab === "tests" ? "Danh sách bài kiểm tra" : "Danh sách bài thi";

  const activeItemLabel = activeTab === "tests" ? "Bài kiểm tra" : "Bài thi";

  return (
    <div className="space-y-4">
      <ClassDetailHeader
        title={cls.name}
        imageUrl={cls.imageUrl}
        classCode={cls.joinCode || cls.inviteCode}
        metrics={[
          {
            label: "Bài kiểm tra",
            value: testsTotal,
            tone: "green",
          },
          {
            label: "Đề thi ôn tập",
            value: examsTotal,
            tone: "purple",
          },
          {
            label: "Tài liệu",
            value: isLoadingDocuments
              ? (cls.documentCount ?? 0)
              : documents.length,
            tone: "blue",
          },
        ]}
      />

      <section className="space-y-4">
        <ClassDetailTabs
          activeTab={activeTab}
          tabs={tabs}
          onChange={setActiveTab}
        />

        {activeTab === "tests" || activeTab === "exams" ? (
          <ClassExamList
            title={activeTitle}
            itemLabel={activeItemLabel}
            searchPlaceholder={
              activeTab === "tests" ? "Tìm bài kiểm tra..." : "Tìm bài thi..."
            }
            items={activeItems}
            isLoading={activeExamQuery.isLoading}
            error={
              activeExamQuery.isError
                ? getErrorMessage(
                    activeExamQuery.error,
                    `Không thể tải ${activeItemLabel.toLocaleLowerCase("vi")}.`,
                  )
                : null
            }
            onRetry={() => {
              void activeExamQuery.refetch();
            }}
            renderAction={(item) => {
              if (item.availability === "active") {
                return (
                  <Button
                    asChild
                    size="sm"
                    className="h-8 w-[96px] rounded-[4px] bg-[#4169F7] px-3 text-xs font-semibold text-white hover:bg-[#3451D1]"
                  >
                    <Link href={`/student/exam/${item.id}`}>Làm bài</Link>
                  </Button>
                );
              }

              if (item.availability === "upcoming") {
                return (
                  <Button
                    type="button"
                    size="sm"
                    disabled
                    className="h-8 w-[96px] rounded-[4px] border border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-700 opacity-100"
                  >
                    Chưa mở
                  </Button>
                );
              }

              return (
                <Button
                  type="button"
                  size="sm"
                  disabled
                  className="h-8 w-[96px] rounded-[4px] border border-rose-200 bg-rose-50 px-2 text-xs font-semibold text-rose-700 opacity-100"
                >
                  Hết hạn
                </Button>
              );
            }}
          />
        ) : null}

        {activeTab === "documents" ? (
          <ClassDocumentList
            items={documentItems}
            isLoading={isLoadingDocuments}
            error={documentsError}
            onRetry={() => setDocumentRequestKey((current) => current + 1)}
            renderAction={(item) => (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-[4px]"
              >
                <Link
                  href={
                    item.href ??
                    `/student/materials/${item.id}` + `?classId=${id}`
                  }
                  aria-label={`Mở tài liệu ${item.title}`}
                >
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            )}
          />
        ) : null}
      </section>
    </div>
  );
}
