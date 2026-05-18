"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { setTeacherClassesFlashToast } from "../flash-toast";

export interface DeleteClassroomDialogSubmitResult {
  status: "success" | "error";
  message: string;
  redirectToList?: boolean;
}

interface DeleteClassroomDialogProps {
  classroomName: string;
  isDeleting: boolean;
  onConfirm: () => Promise<DeleteClassroomDialogSubmitResult>;
  redirectOnSuccess?: boolean;
  trigger?: ReactNode;
}

type DeleteClassroomToastState = {
  message: string;
  open: boolean;
  variant: "error" | "success";
};

export function DeleteClassroomDialog({
  classroomName,
  isDeleting,
  onConfirm,
  redirectOnSuccess = true,
  trigger,
}: DeleteClassroomDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<DeleteClassroomToastState | null>(null);

  async function handleConfirmClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const result = await onConfirm();

    if (result.status === "success") {
      setOpen(false);

      if (redirectOnSuccess) {
        setTeacherClassesFlashToast({
          message: result.message,
          variant: "success",
        });
        router.push("/teacher/classes");
      }

      return;
    }

    if (result.redirectToList) {
      setTeacherClassesFlashToast({
        message: result.message,
        variant: "error",
      });
      setOpen(false);
      router.push("/teacher/classes");
      return;
    }

    setToast({
      message: result.message,
      open: true,
      variant: "error",
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isDeleting) {
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
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          {trigger ?? (
            <Button type="button" variant="destructive" size="lg">
              <Trash2 className="mr-2 size-4" />
              Xóa lớp học
            </Button>
          )}
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa lớp học</AlertDialogTitle>
            <AlertDialogDescription>
              {`Bạn có chắc chắn muốn xóa lớp học "${classroomName}" không?`}
              <br />
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleConfirmClick}
            >
              {isDeleting ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Xác nhận xóa
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
