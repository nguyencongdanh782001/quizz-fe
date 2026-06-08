"use client";

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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Document } from "@/types/document.types";
import { LoaderCircle, MoreVertical, Trash } from "lucide-react";
import type { MouseEvent } from "react";

interface DocumentContextMenuProps {
  document: Document;
  isDeleting: boolean;
  onDeleteRequest: (document: Document) => void;
}

interface DeleteConfirmDialogProps {
  documentTitle: string;
  isDeleting: boolean;
  open: boolean;
  onConfirm: () => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
}

// function EditAction({ document }: { document: Document }) {
//   return (
//     <DropdownMenuItem asChild>
//       <Link
//         href={document.url}
//         className="flex cursor-pointer items-center gap-2"
//       >
//         <Pencil className="size-4" />
//         Chỉnh sửa
//       </Link>
//     </DropdownMenuItem>
//   );
// }

function DeleteAction({
  isDeleting,
  onSelect,
}: {
  isDeleting: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem destructive disabled={isDeleting} onSelect={onSelect}>
      {isDeleting ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Trash className="size-4" />
      )}
      {isDeleting ? "Đang xóa..." : "Xóa tài liệu"}
    </DropdownMenuItem>
  );
}

function DeleteConfirmDialog({
  documentTitle,
  isDeleting,
  open,
  onConfirm,
  onOpenChange,
}: DeleteConfirmDialogProps) {
  function handleOpenChange(nextOpen: boolean) {
    if (isDeleting) {
      return;
    }

    onOpenChange(nextOpen);
  }

  async function handleConfirmClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const didDelete = await onConfirm();

    if (didDelete) {
      onOpenChange(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Trash className="size-5" />
            </div>
            <div className="min-w-0">
              <AlertDialogTitle>Xóa tài liệu</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                Bạn có chắc chắn muốn xóa tài liệu này không?
                <br />
                <br />
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
              <p className="mt-3 truncate rounded-xl border border-outline/10 bg-surface-container-low px-3 py-2 text-sm font-medium text-on-surface">
                {documentTitle}
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={handleConfirmClick}>
            {isDeleting ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash className="mr-2 size-4" />
                Xóa tài liệu
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DocumentContextMenu({
  document,
  isDeleting,
  onDeleteRequest,
}: DocumentContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-on-surface"
          aria-label={`Thao tác với tài liệu ${document.title}`}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {/* <EditAction document={document} />
        <DropdownMenuSeparator /> */}
        <DeleteAction
          isDeleting={isDeleting}
          onSelect={() => onDeleteRequest(document)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { DeleteConfirmDialog };
