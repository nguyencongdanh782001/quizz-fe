"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, LoaderCircle, Plus } from "lucide-react";
import { CheckboxField } from "@/components/common/form/checkbox-field";
import { InputField } from "@/components/common/form/input-field";
import { TextareaField } from "@/components/common/form/textarea-field";
import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/api/error-message";
import type { TeacherCreateDocumentRequest } from "@/lib/api/types";
import { createTeacherDocument } from "@/services/document.service";

interface TeacherDocumentCreateFormStatus {
  submitError?: string;
}

type ToastVariant = "success" | "error";

interface ScreenToastState {
  description?: string;
  open: boolean;
  title: string;
  variant: ToastVariant;
}

const CREATE_DOCUMENT_SUCCESS_MESSAGE = "Tải lên tài liệu thành công";
const CREATE_DOCUMENT_ERROR_MESSAGE = "Không thể tải lên tài liệu";
const REDIRECT_DELAY_MS = 1200;

const initialValues: TeacherCreateDocumentRequest = {
  title: "",
  summary: "",
  content: "",
  is_published: false,
};

const createDocumentSchema = Yup.object({
  title: Yup.string()
    .transform((value) => value?.trim() ?? "")
    .required("Tên tài liệu là bắt buộc"),
  summary: Yup.string()
    .transform((value) => value?.trim() ?? "")
    .required("Mô tả ngắn là bắt buộc"),
  content: Yup.string()
    .transform((value) => value?.trim() ?? "")
    .required("Nội dung tài liệu là bắt buộc"),
  is_published: Yup.boolean().required(),
});

export function TeacherDocumentsCreateScreen() {
  const router = useRouter();
  const [toast, setToast] = useState<ScreenToastState | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function openToast(nextToast: Omit<ScreenToastState, "open">) {
    setToast({
      ...nextToast,
      open: true,
    });
  }

  async function handleSubmit(
    values: TeacherCreateDocumentRequest,
    helpers: FormikHelpers<TeacherCreateDocumentRequest>,
  ) {
    helpers.setStatus(undefined);
    setToast(null);

    try {
      const message = await createTeacherDocument(values);

      openToast({
        title: CREATE_DOCUMENT_SUCCESS_MESSAGE,
        description:
          message ||
          "Tài liệu đã được lưu. Đang quay lại danh sách tài liệu...",
        variant: "success",
      });

      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }

      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push("/teacher/documents");
      }, REDIRECT_DELAY_MS);
    } catch (error) {
      const message = getApiErrorMessage(error, CREATE_DOCUMENT_ERROR_MESSAGE);

      helpers.setSubmitting(false);
      helpers.setStatus({
        submitError: message,
      } satisfies TeacherDocumentCreateFormStatus);

      openToast({
        title: CREATE_DOCUMENT_ERROR_MESSAGE,
        description: message,
        variant: "error",
      });
    }
  }

  return (
    <ToastProvider>
      <div className="mx-auto max-w-full space-y-6">
        <Link
          href="/teacher/documents"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại tài liệu
        </Link>

        <div className="rounded-3xl border border-outline/10 bg-surface-container-lowest p-6 shadow-[0_18px_44px_-32px_rgba(7,30,39,0.18)] sm:p-7">
          <div className="flex items-start gap-4 border-b border-outline/10 pb-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-on-surface">
                Tải lên tài liệu
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tạo tài liệu hệ thống mới và lưu trực tiếp qua API giáo viên.
              </p>
            </div>
          </div>

          <Formik<TeacherCreateDocumentRequest>
            initialValues={initialValues}
            validationSchema={createDocumentSchema}
            onSubmit={handleSubmit}
          >
            {({
              errors,
              handleChange,
              isSubmitting,
              setFieldValue,
              setStatus,
              status,
              touched,
              values,
            }) => {
              const formStatus = status as
                | TeacherDocumentCreateFormStatus
                | undefined;

              return (
                <Form className="space-y-5 pt-6">
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
                    <InputField
                      id="teacher-document-title"
                      label="Tên tài liệu"
                      name="title"
                      placeholder="Nhập tên tài liệu"
                      required
                      disabled={isSubmitting}
                      value={values.title}
                      error={touched.title ? errors.title : undefined}
                      onChange={(event) => {
                        setStatus(undefined);
                        handleChange(event);
                      }}
                    />

                    <InputField
                      id="teacher-document-scope"
                      label="Phạm vi"
                      value="Hệ thống"
                      disabled
                      readOnly
                    />
                  </div>

                  <TextareaField
                    id="teacher-document-summary"
                    label="Mô tả ngắn"
                    name="summary"
                    placeholder="Nhập mô tả ngắn để giới thiệu tài liệu"
                    rows={4}
                    required
                    disabled={isSubmitting}
                    value={values.summary}
                    error={touched.summary ? errors.summary : undefined}
                    helperText="Phần mô tả này sẽ giúp người xem hiểu nhanh nội dung tài liệu."
                    onChange={(event) => {
                      setStatus(undefined);
                      handleChange(event);
                    }}
                  />

                  <TextareaField
                    id="teacher-document-content"
                    label="Nội dung tài liệu"
                    name="content"
                    placeholder="Nhập nội dung tài liệu"
                    rows={14}
                    required
                    disabled={isSubmitting}
                    value={values.content}
                    error={touched.content ? errors.content : undefined}
                    helperText="Hiện tại trang này hỗ trợ tạo tài liệu dạng nội dung văn bản."
                    onChange={(event) => {
                      setStatus(undefined);
                      handleChange(event);
                    }}
                  />

                  <CheckboxField
                    id="teacher-document-published"
                    label="Xuất bản ngay"
                    description="Bật để tài liệu có thể được sử dụng ngay sau khi tạo."
                    checked={values.is_published}
                    disabled={isSubmitting}
                    onCheckedChange={(checked) => {
                      setStatus(undefined);
                      void setFieldValue("is_published", checked);
                    }}
                  />

                  {formStatus?.submitError ? (
                    <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-medium">
                            {CREATE_DOCUMENT_ERROR_MESSAGE}
                          </p>
                          <p className="mt-1">{formStatus.submitError}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Button asChild type="button" variant="outline" size="lg">
                      <Link href="/teacher/documents">Hủy</Link>
                    </Button>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="mr-2 size-4 animate-spin" />
                          Đang tải lên...
                        </>
                      ) : (
                        "Tải lên tài liệu"
                      )}
                    </Button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>

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
  );
}
