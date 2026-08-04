"use client";

import type { MouseEvent } from "react";
import { LoaderCircle, UserMinus } from "lucide-react";
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

interface RemoveStudentDialogProps {
  isLoading: boolean;
  open: boolean;
  onConfirm: () => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
}

export function RemoveStudentDialog({
  isLoading,
  open,
  onConfirm,
  onOpenChange,
}: RemoveStudentDialogProps) {
  function handleConfirmClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    void onConfirm();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mời học sinh khỏi lớp</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn mời học sinh này ra khỏi lớp không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={handleConfirmClick}
          >
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <UserMinus className="mr-2 size-4" />
                Xác nhận
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
