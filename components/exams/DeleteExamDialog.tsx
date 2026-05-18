"use client";

import type { MouseEvent } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteExamDialogProps {
  examTitle: string | null;
  isDeleting: boolean;
  open: boolean;
  onConfirm: () => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
}

export function DeleteExamDialog({
  examTitle,
  isDeleting,
  open,
  onConfirm,
  onOpenChange,
}: DeleteExamDialogProps) {
  function handleConfirmClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    void onConfirm();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa đề thi</AlertDialogTitle>
          <AlertDialogDescription>
            {examTitle
              ? `Đề thi "${examTitle}" sẽ bị xóa khỏi danh sách. Hành động này không thể hoàn tác.`
              : "Hành động này không thể hoàn tác."}
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
                Xóa đề thi
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
