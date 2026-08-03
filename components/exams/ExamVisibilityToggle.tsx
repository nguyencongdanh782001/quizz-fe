"use client";

import { useState } from "react";
import { Globe, LoaderCircle, Lock } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { APP_MESSAGES } from "@/lib/app-messages";
import { cn } from "@/lib/utils";
import { useToggleExamVisibility } from "@/hooks/queries/useToggleExamVisibility";
import type { ToggleVisibilityResponse } from "@/hooks/queries/useToggleExamVisibility";

type ExamVisibilityToggleTrigger = "button" | "menu-item";

interface VisibilityStatusBadgeProps {
  isPublished: boolean;
  className?: string;
}

interface ExamVisibilityToggleProps {
  examId: number | string;
  examTitle: string;
  isPublished: boolean;
  trigger?: ExamVisibilityToggleTrigger;
  className?: string;
  disabled?: boolean;
  onSuccess?: (response: ToggleVisibilityResponse) => void;
  onError?: (message: string) => void;
}

function getVisibilityActionLabel(isPublished: boolean): string {
  return isPublished ? "Riêng tư" : "Công khai";
}

function getVisibilityLoadingLabel(isPublished: boolean): string {
  return isPublished ? "Đang chuyển sang riêng tư..." : "Đang công khai...";
}

function getDialogTitle(isPublished: boolean): string {
  return isPublished ? "Chuyển đề thi sang riêng tư" : "Công khai đề thi";
}

function getDialogDescription(isPublished: boolean): string {
  return isPublished
    ? "Đề thi sẽ không còn hiển thị công khai trên hệ thống."
    : "Đề thi sẽ được hiển thị công khai trên hệ thống.";
}

export function VisibilityStatusBadge({
  isPublished,
  className,
}: VisibilityStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        isPublished
          ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-300"
          : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-900/50 dark:bg-slate-950/25 dark:text-slate-300",
        className,
      )}
    >
      {isPublished ? (
        <Globe className="mr-1.5 size-3" />
      ) : (
        <Lock className="mr-1.5 size-3" />
      )}
      {isPublished ? "Công khai" : "Riêng tư"}
    </Badge>
  );
}

export function ExamVisibilityToggle({
  examId,
  examTitle,
  isPublished,
  trigger = "button",
  className,
  disabled = false,
  onSuccess,
  onError,
}: ExamVisibilityToggleProps) {
  const [open, setOpen] = useState(false);
  const [confirmIsPublished, setConfirmIsPublished] = useState<boolean | null>(
    null,
  );
  const toggleMutation = useToggleExamVisibility();
  const isPending = toggleMutation.isPending;
  const isActionDisabled = disabled || isPending;
  const currentIsPublished = confirmIsPublished ?? isPublished;
  const willMakePrivate = currentIsPublished;
  const actionLabel = getVisibilityActionLabel(currentIsPublished);
  const loadingLabel = getVisibilityLoadingLabel(currentIsPublished);

  function openConfirmDialog() {
    if (isActionDisabled) {
      return;
    }

    setConfirmIsPublished(isPublished);
    setOpen(true);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      setConfirmIsPublished(null);
    }
  }

  async function handleConfirm() {
    try {
      const response = await toggleMutation.mutateAsync({
        examId,
        currentIsPublished,
      });

      onSuccess?.(response);
      setOpen(false);
      setConfirmIsPublished(null);
    } catch (error) {
      console.error(`Failed to update visibility for exam ${examId}`, error);
      onError?.(APP_MESSAGES.UPDATE_EXAM_VISIBILITY_FAILED);
    }
  }

  return (
    <>
      {trigger === "menu-item" ? (
        <DropdownMenuItem
          disabled={isActionDisabled}
          onSelect={(event) => {
            event.preventDefault();
            openConfirmDialog();
          }}
        >
          {isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : willMakePrivate ? (
            <Lock className="size-4" />
          ) : (
            <Globe className="size-4" />
          )}
          {isPending ? loadingLabel : getVisibilityActionLabel(isPublished)}
        </DropdownMenuItem>
      ) : (
        <Button
          type="button"
          variant={isPublished ? "outline" : "default"}
          size="lg"
          disabled={isActionDisabled}
          onClick={openConfirmDialog}
          className={cn(
            "h-10 rounded-[6px] px-4 transition-all",
            !isPublished &&
              "bg-linear-to-r from-indigo-500 to-violet-500 text-white hover:shadow-[0_1px_3px_rgba(30,41,59,0.05)]",
            className,
          )}
        >
          {isPending ? (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          ) : willMakePrivate ? (
            <Lock className="mr-2 size-4" />
          ) : (
            <Globe className="mr-2 size-4" />
          )}
          {isPending ? loadingLabel : getVisibilityActionLabel(isPublished)}
        </Button>
      )}

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getDialogTitle(currentIsPublished)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getDialogDescription(currentIsPublished)}
              <br />
              <br />
              Bạn có chắc chắn muốn tiếp tục không?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-[8px] border border-outline/10 bg-surface px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Đề thi
            </p>
            <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-on-surface">
              {examTitle}
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirm();
              }}
              className={cn(
                willMakePrivate
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "bg-linear-to-r from-indigo-500 to-violet-500 text-white hover:shadow-[0_1px_3px_rgba(30,41,59,0.05)]",
              )}
            >
              {isPending ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : null}
              {isPending ? loadingLabel : actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
