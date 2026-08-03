"use client";

import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassHeader } from "./components/class-header";
import { ClassTabs } from "./components/class-tabs";
import { DocumentsTab } from "./components/documents-tab";
import { EmptyState } from "./components/empty-state";
import { ErrorState } from "./components/error-state";
import { ExamsTab } from "./components/exams-tab";
import { LoadingState } from "./components/loading-state";
import { StudentsTab } from "./components/students-tab";
import { useBreadcrumbLabel } from "@/components/shared/breadcrumb-labels";
import { useClassDetail } from "./hooks/use-class-detail";

export function TeacherClassDetailScreen({ classId }: { classId: string }) {
  const {
    cls,
    activeTab,
    setActiveTab,
    students,
    exams,
    documents,
    counts,
    isLoadingInitialData,
    isLoadingStudents,
    isLoadingExams,
    isLoadingDocuments,
    classError,
    studentsError,
    examsError,
    documentsError,
    removingStudentId,
    retryClassDetail,
    retryActiveTab,
    handleRemoveStudent,
  } = useClassDetail(classId);
  const classBreadcrumbHref = `/teacher/classes/${classId}`;
  const classBreadcrumbLabel = cls?.name?.trim() || (
    classError || (!isLoadingInitialData && !cls)
      ? "Chi tiết lớp học"
      : null
  );

  useBreadcrumbLabel(classBreadcrumbHref, classBreadcrumbLabel);

  if (isLoadingInitialData) {
    return <LoadingState label="dữ liệu lớp học" />;
  }

  if (classError) {
    return (
      <div className="space-y-4">
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

  const tabs = [
    { id: "students" as const, label: "Học sinh", count: counts.students },
    { id: "exams" as const, label: "Bài thi", count: counts.exams },
    { id: "documents" as const, label: "Tài liệu", count: counts.documents },
  ];

  return (
    <div className="space-y-4">
      {/* Class Header Card with Red "Trở về" button on top right */}
      <ClassHeader cls={cls} />

      {/* Main Tabs Section */}
      <section className="space-y-4">
        <ClassTabs activeTab={activeTab} tabs={tabs} onChange={setActiveTab} />

        {activeTab === "students" ? (
          <StudentsTab
            students={students}
            isLoading={isLoadingStudents}
            error={studentsError}
            removingStudentId={removingStudentId}
            onRetry={retryActiveTab}
            onRemoveStudent={handleRemoveStudent}
          />
        ) : null}

        {activeTab === "exams" ? (
          <ExamsTab
            classId={classId}
            exams={exams}
            isLoading={isLoadingExams}
            error={examsError}
            onRetry={retryActiveTab}
          />
        ) : null}

        {activeTab === "documents" ? (
          <DocumentsTab
            classId={classId}
            documents={documents}
            isLoading={isLoadingDocuments}
            error={documentsError}
            onRetry={retryActiveTab}
          />
        ) : null}
      </section>
    </div>
  );
}
