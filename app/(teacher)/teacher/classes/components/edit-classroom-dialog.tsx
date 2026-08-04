"use client";

import { useState, type ReactNode } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { AlertCircle, LoaderCircle, Pencil } from "lucide-react";
import { InputField } from "@/components/forms/field-components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { cn } from "@/lib/utils";

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

function formatDate(dateString?: string | null) {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

const editClassroomSchema = Yup.object({
  name: Yup.string()
    .transform((value) => value?.trim() ?? "")
    .required("Tên lớp học là bắt buộc"),
  join_code: Yup.string()
    .transform((value) => value?.trim() ?? "")
    .matches(/^[A-Z0-9-]+$/, {
      message: "Mã tham gia lớp chỉ được chứa chữ cái, số và dấu gạch ngang",
      excludeEmptyString: true,
    })
    .required("Mã lớp học là bắt buộc"),
});

export function EditClassroomDialog({
  classroom,
  isSubmitting,
  onSubmit,
  trigger,
}: EditClassroomDialogProps) {
  const [open, setOpen] = useState(false);
  const [isActiveStatus, setIsActiveStatus] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [toast, setToast] = useState<EditClassroomToastState | null>(null);

  const initialValues: TeacherUpdateClassRequest = {
    name: classroom.name,
    description: classroom.description || "",
    join_code: classroom.joinCode ?? classroom.inviteCode,
  };

  async function handleSubmit(
    values: TeacherUpdateClassRequest,
    helpers: FormikHelpers<TeacherUpdateClassRequest>,
  ) {
    helpers.setStatus(undefined);

    const result = await onSubmit({
      ...values,
      description: values.description || "",
    });

    setToast({
      message: result.message,
      open: true,
      variant: result.status,
    });

    if (result.status === "success") {
      helpers.resetForm({
        values: {
          name: values.name.trim(),
          description: values.description,
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
              Chỉnh sửa
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="w-[min(100%-1.5rem,32rem)] rounded-[12px] p-6 shadow-xl">
          <DialogHeader className="pb-2 border-b border-[#E3E7EE]">
            <DialogTitle className="text-lg font-bold text-[#1E293B]">
              Chỉnh sửa
            </DialogTitle>
            <div className="flex items-center gap-3 text-[11.5px] text-[#64748B] pt-0.5">
              <span>Ngày tạo: {formatDate(classroom.createdAt)}</span>
              <span>•</span>
              <span>Ngày cập nhật: {formatDate(classroom.updatedAt)}</span>
            </div>
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
              setStatus,
              touched,
              values,
            }) => {
              const formStatus = status as EditClassroomFormStatus | undefined;
              const isPending = isSubmitting || isFormikSubmitting;

              return (
                <Form className="mt-2 space-y-4">
                  {/* Row 1: Tên lớp học * & Mã lớp học */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                    <InputField
                      id="edit-classroom-join-code"
                      label="Mã lớp học"
                      name="join_code"
                      placeholder="Nhập mã lớp học"
                      value={values.join_code}
                      error={touched.join_code ? errors.join_code : undefined}
                      onChange={(event) => {
                        setStatus(undefined);
                        handleChange(event);
                      }}
                    />
                  </div>

                  {/* Row 2: Nhóm lớp học Select */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="edit-classroom-group"
                      className="block text-xs font-semibold text-[#1E293B]"
                    >
                      Nhóm lớp học
                    </label>
                    <select
                      id="edit-classroom-group"
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="h-10 w-full rounded-[8px] border border-[#DDE2EB] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3]"
                    >
                      <option value="">Chọn nhóm lớp học</option>
                      <option value="grade-10">Khối 10</option>
                      <option value="grade-11">Khối 11</option>
                      <option value="grade-12">Khối 12</option>
                      <option value="university">Đại học</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  {/* Row 3: Trạng thái hoạt động Toggle Switch */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-semibold text-[#1E293B]">
                      Trạng thái hoạt động
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActiveStatus}
                        onClick={() => setIsActiveStatus(!isActiveStatus)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 select-none",
                          isActiveStatus ? "bg-[#3F63F3]" : "bg-[#CBD5E1]"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                            isActiveStatus ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                      <span className="text-xs font-medium text-[#1E293B]">
                        {isActiveStatus ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                  </div>

                  {formStatus?.submitError ? (
                    <div className="rounded-[8px] border border-red-200/60 bg-red-50/80 p-3 text-xs text-red-700">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <div>
                          <p className="font-medium">Không thể cập nhật lớp học</p>
                          <p className="mt-0.5">{formStatus.submitError}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Modal Footer Buttons matching Image 2 */}
                  <div className="flex items-center justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => setOpen(false)}
                      className="h-9 rounded-[6px] border border-[#DDE2EB] bg-white px-5 text-xs font-semibold text-[#3F63F3] hover:bg-[#F8FAFC]"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="h-9 rounded-[6px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-5 text-xs font-semibold text-white shadow-sm hover:opacity-95"
                    >
                      {isPending ? (
                        <>
                          <LoaderCircle className="mr-2 size-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        "Cập nhật"
                      )}
                    </Button>
                  </div>
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
