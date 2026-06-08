"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassHeader } from "./components/class-header";
import { ClassTabs } from "./components/class-tabs";
import { DeleteClassroomDialog } from "./components/delete-classroom-dialog";
import { DocumentsTab } from "./components/documents-tab";
import { EmptyState } from "./components/empty-state";
import { EditClassroomDialog } from "./components/edit-classroom-dialog";
import { ErrorState } from "./components/error-state";
import { ExamsTab } from "./components/exams-tab";
import { LoadingState } from "./components/loading-state";
import { StudentsTab } from "./components/students-tab";
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
    isDeletingClassroom,
    isUpdatingClassroom,
    removingStudentId,
    retryClassDetail,
    retryActiveTab,
    handleDeleteClassroom,
    handleRemoveStudent,
    handleUpdateClassroom,
  } = useClassDetail(classId);

  if (isLoadingInitialData) {
    return <LoadingState label="dữ liệu lớp học" />;
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

  const tabs = [
    { id: "students" as const, label: "Học sinh", count: counts.students },
    { id: "exams" as const, label: "Bài thi", count: counts.exams },
    { id: "documents" as const, label: "Tài liệu", count: counts.documents },
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

      <ClassHeader
        cls={cls}
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild type="button" size="lg">
              <Link href={`/teacher/classes/${classId}/documents/create`}>
                <Plus className="mr-2 size-4" />
                Thêm tài liệu
              </Link>
            </Button>
            <EditClassroomDialog
              classroom={cls}
              isSubmitting={isUpdatingClassroom}
              onSubmit={handleUpdateClassroom}
            />
            <DeleteClassroomDialog
              classroomName={cls.name}
              isDeleting={isDeletingClassroom}
              onConfirm={handleDeleteClassroom}
            />
          </div>
        }
      />

      <section className="space-y-4">
        <ClassTabs
          activeTab={activeTab}
          tabs={tabs}
          onChange={setActiveTab}
        />

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
