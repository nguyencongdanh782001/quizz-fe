"use client";

import { useState, type ReactNode } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { AlertCircle, LoaderCircle, Pencil } from "lucide-react";
import { InputField, TextAreaField } from "@/components/forms/field-components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import type { TeacherUpdateClassRequest } from "@/lib/api/types";
import type { ClassInfo } from "@/types/class.types";
import { ClassJoinCodeInput } from "./class-join-code-input";

export interface EditClassroomDialogSubmitResult {
  status: "success" | "error";
  message: string;
}

interface EditClassroomDialogProps {
  classroom: ClassInfo;
  isSubmitting: boolean;
  onSubmit: (
    payload: TeacherUpdateClassRequest,
  ) => Promise<EditClassroomDialogSubmitResult>;
  trigger?: ReactNode;
}

interface EditClassroomFormStatus {
  submitError?: string;
}

type EditClassroomToastState = {
  message: string;
  open: boolean;
  variant: "error" | "success";
};

const editClassroomSchema = Yup.object({
  name: Yup.string()
    .transform((value) => value?.trim() ?? "")
    .required("Tên lớp học là bắt buộc"),
  description: Yup.string(),
  join_code: Yup.string()
    .transform((value) => value?.trim() ?? "")
    .matches(/^[A-Z0-9-]+$/, {
      message: "Mã tham gia lớp chỉ được chứa chữ cái, số và dấu gạch ngang",
      excludeEmptyString: true,
    })
    .required("Mã tham gia lớp là bắt buộc"),
});

export function EditClassroomDialog({
  classroom,
  isSubmitting,
  onSubmit,
  trigger,
}: EditClassroomDialogProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<EditClassroomToastState | null>(null);

  const initialValues: TeacherUpdateClassRequest = {
    name: classroom.name,
    description: classroom.description,
    join_code: classroom.joinCode ?? classroom.inviteCode,
  };

  async function handleSubmit(
    values: TeacherUpdateClassRequest,
    helpers: FormikHelpers<TeacherUpdateClassRequest>,
  ) {
    helpers.setStatus(undefined);

    const result = await onSubmit(values);

    setToast({
      message: result.message,
      open: true,
      variant: result.status,
    });

    if (result.status === "success") {
      helpers.resetForm({
        values: {
          name: values.name.trim(),
          description: values.description.trim(),
          join_code: values.join_code.trim().toUpperCase(),
        },
      });
      setOpen(false);
      return;
    }

    helpers.setSubmitting(false);
    helpers.setStatus({
      submitError: result.message,
    } satisfies EditClassroomFormStatus);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    setOpen(nextOpen);
  }

  function handleToastOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setToast(null);
      return;
    }

    setToast((current) => (current ? { ...current, open: nextOpen } : current));
  }

  return (
    <ToastProvider duration={3500}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button type="button" variant="outline" size="lg">
              <Pencil className="mr-2 size-4" />
              Chỉnh sửa lớp học
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="w-[min(100%-1.5rem,38rem)]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin lớp học và lưu thay đổi ngay trên trang này.
            </DialogDescription>
          </DialogHeader>

          <Formik<TeacherUpdateClassRequest>
            enableReinitialize
            initialValues={initialValues}
            validationSchema={editClassroomSchema}
            onSubmit={handleSubmit}
          >
            {({
              errors,
              handleChange,
              isSubmitting: isFormikSubmitting,
              setFieldTouched,
              setFieldValue,
              setStatus,
              status,
              touched,
              values,
            }) => {
              const formStatus = status as EditClassroomFormStatus | undefined;
              const isPending = isSubmitting || isFormikSubmitting;

              return (
                <Form className="space-y-5">
                  <InputField
                    id="edit-classroom-name"
                    label="Tên lớp học"
                    name="name"
                    placeholder="Nhập tên lớp học"
                    required
                    value={values.name}
                    error={touched.name ? errors.name : undefined}
                    onChange={(event) => {
                      setStatus(undefined);
                      handleChange(event);
                    }}
                  />

                  <TextAreaField
                    id="edit-classroom-description"
                    label="Mô tả"
                    name="description"
                    placeholder="Nhập mô tả lớp học"
                    rows={5}
                    value={values.description}
                    error={touched.description ? errors.description : undefined}
                    onChange={(event) => {
                      setStatus(undefined);
                      handleChange(event);
                    }}
                  />

                  <ClassJoinCodeInput
                    id="edit-classroom-join-code"
                    label="Mã tham gia lớp"
                    name="join_code"
                    placeholder="Nhập mã tham gia lớp"
                    required
                    disabled={isPending}
                    value={values.join_code}
                    error={touched.join_code ? errors.join_code : undefined}
                    onChange={(value, source) => {
                      setStatus(undefined);
                      void setFieldValue("join_code", value);

                      if (source === "random") {
                        void setFieldTouched("join_code", true);
                      }
                    }}
                  />

                  {formStatus?.submitError ? (
                    <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-medium">Không thể cập nhật lớp học</p>
                          <p className="mt-1">{formStatus.submitError}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      disabled={isPending}
                      onClick={() => setOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" size="lg" disabled={isPending}>
                      {isPending ? (
                        <>
                          <LoaderCircle className="mr-2 size-4 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        "Cập nhật"
                      )}
                    </Button>
                  </DialogFooter>
                </Form>
              );
            }}
          </Formik>
        </DialogContent>
      </Dialog>

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
