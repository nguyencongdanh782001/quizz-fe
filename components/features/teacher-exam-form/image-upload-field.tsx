"use client";

import { useMutation } from "@tanstack/react-query";
import {
  ImagePlus,
  // Link2,
  LoaderCircle,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";
import { uploadExamImage } from "@/services/exam-image.service";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type ImageUploadSize = "default" | "compact";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
  label?: string;
  size?: ImageUploadSize;
}

function isAllowedImageType(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.some((type) => type === file.type);
}

function getUploadErrorMessage(error: unknown): string {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : null;

  if (status === null || status >= 500) {
    return "Có lỗi xảy ra, vui lòng thử lại";
  }

  return getApiErrorMessage(error, "Không thể tải ảnh");
}

function getPreviewStyle(imageUrl: string): CSSProperties {
  return {
    backgroundImage: `url(${JSON.stringify(imageUrl)})`,
  };
}

export function ImageUploadField({
  value = "",
  onChange,
  disabled = false,
  error,
  helperText,
  id,
  label = "Ảnh minh họa",
  size = "default",
}: ImageUploadFieldProps) {
  const generatedId = useId();
  const inputId = id ?? `image-upload-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const imageUrl = value.trim();
  const hasImage = imageUrl.length > 0;
  const uploadMutation = useMutation({
    mutationFn: uploadExamImage,
    onSuccess: (response) => {
      const nextImageUrl = response.image.url.trim();

      if (!nextImageUrl) {
        setLocalError("Không nhận được đường dẫn ảnh từ máy chủ.");
        setStatusMessage(null);
        return;
      }

      onChange(nextImageUrl);
      setLocalError(null);
      setStatusMessage(response.message || "Tải ảnh thành công");
    },
    onError: (mutationError) => {
      setLocalError(getUploadErrorMessage(mutationError));
      setStatusMessage(null);
    },
  });
  const isUploading = uploadMutation.isPending;
  const isDisabled = disabled || isUploading;
  const fieldMessage = localError ?? error ?? statusMessage ?? helperText;
  const isError = Boolean(localError ?? error);

  function resetFileInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function validateFile(file: File): string | null {
    if (!isAllowedImageType(file)) {
      return "Định dạng ảnh không được hỗ trợ";
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return "Kích thước ảnh không được vượt quá 5MB";
    }

    return null;
  }

  function uploadFile(file: File) {
    const validationError = validateFile(file);

    setStatusMessage(null);

    if (validationError) {
      setLocalError(validationError);
      resetFileInput();
      return;
    }

    setLocalError(null);
    uploadMutation.mutate(file);
    resetFileInput();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    uploadFile(file);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    if (!isDisabled) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (isDisabled) {
      return;
    }

    const file = event.dataTransfer.files[0];

    if (file) {
      uploadFile(file);
    }
  }

  function openFilePicker() {
    if (!isDisabled) {
      inputRef.current?.click();
    }
  }

  function handleRemoveImage() {
    if (isDisabled) {
      return;
    }

    onChange("");
    setLocalError(null);
    setStatusMessage("Đã xóa ảnh");
    resetFileInput();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label
          htmlFor={inputId}
          className="text-sm font-medium text-on-surface"
        >
          {label}
        </Label>
        {hasImage ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            Đã có ảnh
          </span>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="sr-only"
        disabled={isDisabled}
        onChange={handleFileChange}
      />

      {hasImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group relative overflow-hidden rounded-2xl border bg-surface-container-lowest shadow-[0_18px_44px_-34px_rgba(7,30,39,0.24)] transition-colors",
            isDragging ? "border-primary/55 bg-primary/5" : "border-outline/15",
            isUploading && "opacity-80",
          )}
        >
          <div
            role="img"
            aria-label={`Ảnh đã tải lên cho ${label.toLowerCase()}`}
            className={cn(
              "relative bg-surface-container bg-cover bg-center",
              size === "compact" ? "h-36" : "h-52",
            )}
            style={getPreviewStyle(imageUrl)}
          >
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/12" />
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/68 backdrop-blur-sm dark:bg-surface-container-lowest/70">
                <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-primary shadow-lg dark:bg-surface-container">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Đang tải ảnh...
                </div>
              </div>
            ) : null}
            {isDragging ? (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/16 backdrop-blur-[2px]">
                <div className="rounded-full bg-white/92 px-3 py-2 text-sm font-semibold text-primary shadow-lg dark:bg-surface-container">
                  Thả ảnh để thay thế
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 border-t border-outline/10 bg-white/82 p-3 backdrop-blur dark:bg-surface-container-low/82">
            {/* <div className="flex min-w-0 items-center gap-2 rounded-xl border border-outline/10 bg-surface px-3 py-2 text-xs text-muted-foreground">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{imageUrl}</span>
            </div> */}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFilePicker}
                disabled={isDisabled}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Đổi ảnh
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isDisabled}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa ảnh
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={isDisabled}
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 text-center transition-all duration-200",
            "bg-muted/30 shadow-[0_16px_40px_-34px_rgba(7,30,39,0.28)] hover:border-primary/35 hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-70",
            size === "compact" ? "min-h-36 py-5" : "min-h-48 py-7",
            isDragging
              ? "border-primary/60 bg-primary/8 text-primary"
              : "border-outline/30 text-on-surface",
            isError && "border-destructive/40 bg-destructive/5",
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {isUploading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </span>
          <span className="mt-3 text-sm font-semibold">
            {isUploading ? "Đang tải ảnh..." : "Tải ảnh lên"}
          </span>
          <span className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Kéo thả ảnh vào đây hoặc nhấn để tải ảnh
          </span>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-on-surface-variant shadow-sm dark:bg-surface-container">
            <ImagePlus className="h-3.5 w-3.5" />
            PNG, JPG, WEBP - tối đa 5MB
          </span>
        </button>
      )}

      {/* {fieldMessage ? (
        <p
          className={cn(
            "text-xs",
            isError
              ? "text-destructive"
              : statusMessage
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-muted-foreground",
          )}
          aria-live="polite"
        >
          {fieldMessage}
        </p>
      ) : null} */}
    </div>
  );
}
