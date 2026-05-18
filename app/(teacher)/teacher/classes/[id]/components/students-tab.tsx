"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import type { ClassStudent } from "@/types/class.types";
import type { RemoveStudentResult } from "../hooks/use-class-detail";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";
import { RemoveStudentDialog } from "./remove-student-dialog";
import { StudentTable } from "./student-table";

type StudentToastState = {
  message: string;
  open: boolean;
  variant: "error" | "success";
};

export function StudentsTab({
  students,
  isLoading,
  error,
  removingStudentId,
  onRetry,
  onRemoveStudent,
}: {
  students: ClassStudent[];
  isLoading: boolean;
  error: string | null;
  removingStudentId: string | null;
  onRetry: () => void | Promise<void>;
  onRemoveStudent: (student: ClassStudent) => Promise<RemoveStudentResult>;
}) {
  const [selectedStudent, setSelectedStudent] = useState<ClassStudent | null>(
    null,
  );
  const [toast, setToast] = useState<StudentToastState | null>(null);

  const isRemovingStudent = removingStudentId !== null;
  const isDialogOpen = selectedStudent !== null;

  async function handleConfirmRemoveStudent() {
    if (!selectedStudent) {
      return;
    }

    const result = await onRemoveStudent(selectedStudent);

    setToast({
      message: result.message,
      open: true,
      variant: result.status,
    });

    if (result.status === "success") {
      setSelectedStudent(null);
    }
  }

  function handleDialogOpenChange(open: boolean) {
    if (isRemovingStudent) {
      return;
    }

    if (!open) {
      setSelectedStudent(null);
    }
  }

  function handleToastOpenChange(open: boolean) {
    if (!open) {
      setToast(null);
      return;
    }

    setToast((current) => (current ? { ...current, open } : current));
  }

  return (
    <ToastProvider duration={3500}>
      <div className="space-y-4">
        {isLoading ? (
          <LoadingState label="danh sách học sinh" />
        ) : error ? (
          <ErrorState
            title="Không thể tải học sinh"
            message={error}
            onRetry={onRetry}
          />
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Chưa có học sinh nào trong lớp"
            description="Danh sách học sinh sẽ xuất hiện tại đây khi các em tham gia lớp bằng mã lớp."
          />
        ) : (
          <StudentTable
            students={students}
            isRemovingStudent={isRemovingStudent}
            onRemoveStudent={setSelectedStudent}
          />
        )}
      </div>

      <RemoveStudentDialog
        isLoading={isRemovingStudent}
        open={isDialogOpen}
        onConfirm={handleConfirmRemoveStudent}
        onOpenChange={handleDialogOpenChange}
      />

      {toast ? (
        <Toast
          open={toast.open}
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
