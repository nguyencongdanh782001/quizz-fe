"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import {
  Camera,
  Loader2,
  RefreshCw,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/common/user-avatar";
import { cn } from "@/lib/utils";
import {
  MAX_AVATAR_IMAGE_SIZE_BYTES,
  validateAvatarImageFile,
} from "@/lib/avatar-upload";

interface AvatarUploadFieldProps {
  fullName?: string | null;
  currentAvatarUrl?: string | null;
  currentAvatarCacheKey?: string | number | null;
  selectedFile: File | null;
  onSelectedFileChange: (file: File | null) => void;
  label?: string;
  helperText?: string;
  error?: string | null;
  disabled?: boolean;
  isUploading?: boolean;
  className?: string;
  previewClassName?: string;
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);

  if (mb >= 1) {
    return `${mb.toFixed(mb >= 10 ? 0 : 1)}MB`;
  }

  const kb = bytes / 1024;

  return `${kb.toFixed(kb >= 100 ? 0 : 1)}KB`;
}

export function AvatarUploadField({
  fullName,
  currentAvatarUrl,
  currentAvatarCacheKey,
  selectedFile,
  onSelectedFileChange,
  label = "Ảnh đại diện",
  helperText,
  error,
  disabled = false,
  isUploading = false,
  className,
  previewClassName,
}: AvatarUploadFieldProps) {
  const inputId = `avatar-upload-${useId()}`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const selectedPreviewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
  );
  const previewUrl = selectedPreviewUrl ?? currentAvatarUrl?.trim() ?? null;
  const isBusy = disabled || isUploading;
  const fieldError = localError ?? error ?? null;

  useEffect(() => {
    if (!selectedPreviewUrl) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(selectedPreviewUrl);
    };
  }, [selectedPreviewUrl]);

  function resetFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function focusFilePicker() {
    if (!isBusy) {
      fileInputRef.current?.click();
    }
  }

  function applyFile(file: File | undefined) {
    if (!file || isBusy) {
      return;
    }

    const validationError = validateAvatarImageFile(file);

    if (validationError) {
      setLocalError(validationError);
      onSelectedFileChange(null);
      resetFileInput();
      return;
    }

    setLocalError(null);
    onSelectedFileChange(file);
    resetFileInput();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    applyFile(event.target.files?.[0]);
  }

  function handleRemoveFile() {
    if (isBusy) {
      return;
    }

    setLocalError(null);
    onSelectedFileChange(null);
    resetFileInput();
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    if (!isBusy) {
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

    if (isBusy) {
      return;
    }

    applyFile(event.dataTransfer.files[0]);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label
          htmlFor={inputId}
          className="text-sm font-medium text-on-surface"
        >
          {label}
        </Label>
        <span className="text-xs font-medium text-muted-foreground">
          JPG, PNG, WEBP · tối đa {formatFileSize(MAX_AVATAR_IMAGE_SIZE_BYTES)}
        </span>
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        disabled={isBusy}
      />

      <div
        role="group"
        aria-label={label}
        tabIndex={0}
        onClick={focusFilePicker}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            focusFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-[16px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4 transition-all duration-200 hover:border-[#6366F1] hover:bg-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/20",
          isDragging && "border-[#6366F1] bg-[#EEF2FF]",
          isBusy && "cursor-not-allowed opacity-80",
          fieldError && "border-destructive/40 bg-destructive/5",
        )}
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div
            className={cn(
              "relative flex size-20 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366F1_0%,#A855F7_100%)] p-0.5 shadow-md transition-transform duration-200 group-hover:scale-[1.02]",
              previewClassName,
            )}
          >
            <UserAvatar
              avatarUrl={previewUrl}
              fullName={fullName}
              avatarCacheKey={currentAvatarCacheKey}
              className="size-full border-2 border-white bg-transparent"
              fallbackClassName="text-lg font-bold text-white"
            />

            {!isBusy ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/0 opacity-0 transition-all duration-200 group-hover:bg-slate-950/20 group-hover:opacity-100">
                <div className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-on-surface shadow-[0_10px_24px_-18px_rgba(7,30,39,0.45)]">
                  <Camera className="size-4 text-primary" />
                  Chọn ảnh
                </div>
              </div>
            ) : null}

            {isBusy ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/72 backdrop-blur-sm">
                <div className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-primary shadow-[0_10px_24px_-18px_rgba(7,30,39,0.45)]">
                  <Loader2 className="size-4 animate-spin" />
                  Đang tải...
                </div>
              </div>
            ) : null}

            {isDragging ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/12 backdrop-blur-[2px]">
                <span className="rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-primary shadow-[0_10px_24px_-18px_rgba(7,30,39,0.45)]">
                  Thả ảnh để thay thế
                </span>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
            <div>
              <p className="font-display text-base font-semibold text-on-surface">
                {selectedFile ? selectedFile.name : "Tải ảnh đại diện lên"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Kéo thả ảnh vào khu vực này hoặc nhấp để chọn tệp từ thiết bị.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full px-4"
                onClick={(event) => {
                  event.stopPropagation();
                  focusFilePicker();
                }}
                disabled={isBusy}
              >
                {selectedFile ? (
                  <RefreshCw className="size-3.5" />
                ) : (
                  <UploadCloud className="size-3.5" />
                )}
                {selectedFile ? "Đổi ảnh" : "Chọn ảnh"}
              </Button>

              {selectedFile ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="rounded-full px-4"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveFile();
                  }}
                  disabled={isBusy}
                >
                  <Trash2 className="size-3.5" />
                  Xóa ảnh
                </Button>
              ) : null}
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {helperText ??
                "Ảnh sẽ được cắt tròn trong giao diện. Hãy chọn hình rõ mặt để nhận diện tốt hơn."}
            </p>

            {fieldError ? (
              <p className="text-xs font-medium text-destructive">
                {fieldError}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
