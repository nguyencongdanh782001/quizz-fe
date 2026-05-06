"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ExamForm } from "@/components/features/teacher-exam-form/exam-form";
import type { TeacherExamFormValues } from "@/components/features/teacher-exam-form/types";
import {
  createInitialTeacherExamFormValues,
  mapTeacherExamFormToPayload,
} from "@/components/features/teacher-exam-form/utils";
import { createTeacherClassExam } from "@/lib/teacher-classes";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Không thể tạo bài thi. Vui lòng thử lại.";
}

function scrollTeacherContentToTop() {
  const mainElement = document.querySelector("main");

  if (mainElement instanceof HTMLElement) {
    mainElement.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function TeacherClassExamCreateScreen({ classId }: { classId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function handleSubmit(values: TeacherExamFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const payload = mapTeacherExamFormToPayload(values);
      const message = await createTeacherClassExam(classId, payload);
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
      setSuccessMessage(
        message || "Tạo bài thi thành công. Đang quay lại lớp học...",
      );
      scrollTeacherContentToTop();
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push(`/teacher/classes/${classId}`);
      }, 1200);
    } catch (error) {
      console.error(`Failed to create exam for class ${classId}`, error);
      setSubmitError(getErrorMessage(error));
      scrollTeacherContentToTop();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <Link
        href={`/teacher/classes/${classId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại lớp học
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold text-on-surface">
          Tạo bài thi trong lớp
        </h1>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
          Hoàn thiện bài thi theo từng bước rõ ràng: nhập thông tin chung, xây
          dựng câu hỏi, sau đó xem lại toàn bộ nội dung trước khi gửi cho lớp.
        </p>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-green-200/70 bg-green-50/80 p-4 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-950/20 dark:text-green-300">
          {successMessage}
        </div>
      ) : null}

      <ExamForm
        initialValues={createInitialTeacherExamFormValues()}
        onSubmit={handleSubmit}
        cancelHref={`/teacher/classes/${classId}`}
        isSubmitting={isSubmitting}
        submitLabel="Tạo bài thi"
        submitError={submitError}
      />
    </div>
  );
}
