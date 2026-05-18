"use client";

import { EXAM_FLOW_MESSAGES } from "@/components/exams/exam-flow-messages";
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

export function QuestionDeleteDialog({
  open,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {EXAM_FLOW_MESSAGES.buttons.deleteQuestion}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {EXAM_FLOW_MESSAGES.confirmations.deleteQuestion}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{EXAM_FLOW_MESSAGES.buttons.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {EXAM_FLOW_MESSAGES.buttons.deleteQuestion}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
