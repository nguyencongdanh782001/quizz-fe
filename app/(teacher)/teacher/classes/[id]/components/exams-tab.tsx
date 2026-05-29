"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import type { Exam } from "@/types/exam.types";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { ExamTable } from "./exam-table";
import { LoadingState } from "./loading-state";

type ExamToastState = {
  title: string;
  description?: string;
  open: boolean;
  variant: "error" | "success";
};

export function ExamsTab({
  classId,
  exams,
  isLoading,
  error,
  onRetry,
}: {
  classId: string;
  exams: Exam[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void | Promise<void>;
}) {
  const [toast, setToast] = useState<ExamToastState | null>(null);

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
            <Link href={`/teacher/classes/${classId}/exams/create`}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo bài thi
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <LoadingState label="danh sách bài thi" />
        ) : error ? (
          <ErrorState
            title="Không thể tải bài thi"
            message={error}
            onRetry={onRetry}
          />
        ) : exams.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Chưa có bài thi nào"
            description="Bạn có thể tạo bài thi mới và gán cho lớp này khi backend lớp học hỗ trợ danh sách bài thi riêng."
            action={
              <Button asChild>
                <Link href={`/teacher/classes/${classId}/exams/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo bài thi
                </Link>
              </Button>
            }
          />
        ) : (
          <ExamTable
            classId={classId}
            exams={exams}
            onToggleVisibility={(response) =>
              setToast({
                title: response.exam.is_published
                  ? "Đã công khai đề thi"
                  : "Đã chuyển đề thi sang riêng tư",
                description:
                  response.message || "Cập nhật trạng thái đề thi thành công",
                open: true,
                variant: "success",
              })
            }
            onToggleError={(message) =>
              setToast({
                title: "Không thể cập nhật trạng thái đề thi",
                description: message || "Có lỗi xảy ra, vui lòng thử lại",
                open: true,
                variant: "error",
              })
            }
          />
        )}
      </div>

      {toast ? (
        <Toast
          open={toast.open}
          variant={toast.variant}
          onOpenChange={handleToastOpenChange}
        >
          <div className="pr-6">
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
