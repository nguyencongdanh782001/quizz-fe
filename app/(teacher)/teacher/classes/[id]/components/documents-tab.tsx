"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { DeleteConfirmDialog } from "@/components/features/document/document-context-menu";
import { TeacherDocumentList } from "@/components/features/document/teacher-document-list";
import { useDeleteClassroomDocumentMutation } from "@/hooks/queries/useDeleteClassroomDocument";
import { APP_MESSAGES } from "@/lib/app-messages";
import type { Document } from "@/types/document.types";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";

type ToastVariant = "success" | "error";

interface ScreenToastState {
  description?: string;
  open: boolean;
  title: string;
  variant: ToastVariant;
}

export function DocumentsTab({
  classId,
  documents,
  isLoading,
  error,
  onRetry,
}: {
  classId: string;
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void | Promise<void>;
}) {
  const deleteDocumentMutation = useDeleteClassroomDocumentMutation();
  const [deleteCandidate, setDeleteCandidate] = useState<Document | null>(
    null,
  );
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null,
  );
  const [toast, setToast] = useState<ScreenToastState | null>(null);

  function openToast(nextToast: Omit<ScreenToastState, "open">) {
    setToast({
      ...nextToast,
      open: true,
    });
  }

  function handleDeleteRequest(document: Document) {
    if (deletingDocumentId !== null) {
      return;
    }

    setDeleteCandidate(document);
  }

  async function handleDeleteConfirm() {
    if (!deleteCandidate) {
      return false;
    }

    const documentToDelete = deleteCandidate;
    const documentId = Number(documentToDelete.id);

    if (!Number.isFinite(documentId)) {
      openToast({
        title: APP_MESSAGES.DELETE_DOCUMENT_FAILED,
        description: APP_MESSAGES.NETWORK_ERROR,
        variant: "error",
      });

      return false;
    }

    setDeletingDocumentId(documentToDelete.id);

    try {
      await deleteDocumentMutation.mutateAsync({
        classId,
        documentId,
      });

      openToast({
        title: APP_MESSAGES.DELETE_DOCUMENT_SUCCESS,
        variant: "success",
      });
      setDeleteCandidate(null);

      return true;
    } catch (error) {
      console.error(
        `Failed to delete classroom document ${documentToDelete.id} from class ${classId}`,
        error,
      );

      openToast({
        title: APP_MESSAGES.DELETE_DOCUMENT_FAILED,
        description: APP_MESSAGES.NETWORK_ERROR,
        variant: "error",
      });

      return false;
    } finally {
      setDeletingDocumentId((current) =>
        current === documentToDelete.id ? null : current,
      );
    }
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    if (deletingDocumentId !== null) {
      return;
    }

    if (!open) {
      setDeleteCandidate(null);
    }
  }

  return (
    <ToastProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#1E293B]">
              Tài liệu lớp học
            </h2>
          </div>

          <Button
            asChild
            type="button"
            className="h-9 gap-1.5 rounded-[6px] bg-[#3F63F3] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[#3451D1]"
          >
            <Link href={`/teacher/classes/${classId}/documents/create`}>
              <Plus className="size-4" />
              Thêm tài liệu
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <LoadingState label="danh sách tài liệu" />
        ) : error ? (
          <ErrorState
            title="Không thể tải tài liệu"
            message={error}
            onRetry={onRetry}
          />
        ) : documents.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-[10px] border border-[#DDE2EB] bg-white px-6 py-10 text-center shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
            <FileText className="size-8 text-[#A6AFBF]" />
            <h3 className="mt-3 text-sm font-semibold text-[#1E293B]">
              Chưa có tài liệu nào
            </h3>
            <p className="mt-1 max-w-xl text-xs leading-5 text-[#64748B]">
              Tài liệu được thêm cho lớp sẽ xuất hiện tại đây để bạn dễ theo dõi và cập nhật.
            </p>
          </div>
        ) : (
          <TeacherDocumentList
            deletingDocumentId={deletingDocumentId}
            documents={documents}
            onDeleteRequest={handleDeleteRequest}
          />
        )}
      </div>

      <DeleteConfirmDialog
        documentTitle={deleteCandidate?.title ?? ""}
        isDeleting={deletingDocumentId !== null}
        open={deleteCandidate !== null}
        onConfirm={handleDeleteConfirm}
        onOpenChange={handleDeleteDialogOpenChange}
      />

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
