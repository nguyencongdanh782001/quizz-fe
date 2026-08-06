"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { APP_MESSAGES } from "@/lib/app-messages";
import type { Exam } from "@/types/exam.types";
import { ExamTable } from "./exam-table";

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
  title = "Danh sách bài thi",
  buttonText = "Tạo bài thi",
}: {
  classId: string;
  exams: Exam[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void | Promise<void>;
  title?: string;
  buttonText?: string;
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
            <h2 className="font-display text-lg font-semibold text-[#1E293B]">
              {title}
            </h2>
          </div>
          <Button asChild>
            <Link href="/teacher/exams">
              <Plus className="h-4 w-4" />
              {buttonText}
            </Link>
          </Button>
        </div>

        <ExamTable
          classId={classId}
          exams={exams}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          onToggleVisibility={(response) =>
            setToast({
              title: response.exam.is_published
                ? APP_MESSAGES.PUBLISH_EXAM_SUCCESS
                : APP_MESSAGES.PRIVATE_EXAM_SUCCESS,
              open: true,
              variant: "success",
            })
          }
          onToggleError={() =>
            setToast({
              title: APP_MESSAGES.UPDATE_EXAM_VISIBILITY_FAILED,
              description: APP_MESSAGES.NETWORK_ERROR,
              open: true,
              variant: "error",
            })
          }
        />
      </div>

      {toast ? (
        <Toast
          open={toast.open}
          variant={toast.variant}
          onOpenChange={handleToastOpenChange}
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
  );
}
