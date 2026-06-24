"use client";

import { useState } from "react";
import { LoaderCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadStudentDocument } from "@/lib/student-system-documents";
import type { Document } from "@/types/document.types";
import { useDocumentToast } from "./document-toast";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

interface DocumentDownloadButtonProps {
  document: Document;
  className?: string;
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
}

function getDownloadErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Không thể tải tài liệu. Vui lòng thử lại.";
}

export function DocumentDownloadButton({
  document,
  className,
  label = "Tải xuống",
  variant = "outline",
  size = "default",
}: DocumentDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { notify } = useDocumentToast();

  async function handleDownload() {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadStudentDocument(document);
      notify({
        variant: "success",
        title: "Đã bắt đầu tải xuống",
        description: document.fileName || document.title,
      });
    } catch (error) {
      notify({
        variant: "error",
        title: "Không thể tải tài liệu",
        description: getDownloadErrorMessage(error),
      });
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading}
      className={cn("gap-2", className)}
    >
      {isDownloading ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {label}
    </Button>
  );
}
