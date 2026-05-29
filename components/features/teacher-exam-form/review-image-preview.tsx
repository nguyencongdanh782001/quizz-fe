"use client";
/* eslint-disable @next/next/no-img-element */

import { memo, useState } from "react";
import { ImageIcon, Maximize2, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ReviewImageVariant = "exam" | "question" | "option";
type ImageLoadState = "idle" | "loading" | "loaded" | "error";

interface ReviewImagePreviewProps {
  src: string;
  alt: string;
  label?: string;
  variant?: ReviewImageVariant;
  className?: string;
}

interface VariantConfig {
  rootClassName: string;
  frameClassName: string;
  imageClassName: string;
  fallbackClassName: string;
}

const VARIANT_CONFIG: Record<ReviewImageVariant, VariantConfig> = {
  exam: {
    rootClassName: "w-full min-w-0 max-w-full",
    frameClassName:
      "h-48 max-h-[300px] rounded-2xl sm:h-56 lg:h-44 xl:h-48",
    imageClassName: "h-full w-full object-cover",
    fallbackClassName: "h-48 rounded-2xl sm:h-56 lg:h-44 xl:h-48",
  },
  question: {
    rootClassName: "w-full min-w-0 max-w-full",
    frameClassName: "h-56 max-h-[300px] rounded-xl sm:h-64 lg:h-72",
    imageClassName: "h-full w-full object-cover",
    fallbackClassName: "h-56 rounded-xl sm:h-64 lg:h-72",
  },
  option: {
    rootClassName: "w-16 shrink-0",
    frameClassName: "size-16 rounded-lg",
    imageClassName: "size-16 object-cover",
    fallbackClassName: "size-16 rounded-lg",
  },
};

function ImageSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn(
        "absolute inset-0 rounded-none bg-surface-container-high/70",
        className,
      )}
    />
  );
}

function BrokenImageFallback({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-center gap-2 border border-destructive/15 bg-destructive/6 text-destructive",
        compact ? "flex-col px-2 text-center text-[0.68rem]" : "px-4 text-sm",
        className,
      )}
    >
      <TriangleAlert className={compact ? "size-4" : "size-5"} />
      <span className="font-medium">Không thể tải ảnh</span>
    </div>
  );
}

function FullscreenPreviewDialog({
  open,
  onOpenChange,
  src,
  alt,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt: string;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100%-1rem,76rem)] gap-0 overflow-hidden p-0 sm:p-0">
        <DialogHeader className="border-b border-outline/10 px-5 py-4 pr-14 sm:px-6">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>
            Xem ảnh ở kích thước lớn để kiểm tra nội dung trước khi lưu.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[76vh] overflow-auto bg-slate-950 p-3 sm:p-4">
          <img
            src={src}
            alt={alt}
            className="mx-auto max-h-[72vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImagePreview({
  src,
  alt,
  label,
  variant,
  loadState,
  onLoad,
  onError,
  onOpen,
}: {
  src: string;
  alt: string;
  label: string;
  variant: ReviewImageVariant;
  loadState: ImageLoadState;
  onLoad: () => void;
  onError: () => void;
  onOpen: () => void;
}) {
  const config = VARIANT_CONFIG[variant];
  const isLoaded = loadState === "loaded";

  if (loadState === "error") {
    return (
      <BrokenImageFallback
        compact={variant === "option"}
        className={config.fallbackClassName}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`Mở xem ảnh: ${label}`}
      disabled={!isLoaded}
      onClick={onOpen}
      className={cn(
        "group relative block w-full max-w-full overflow-hidden border border-outline/15 bg-muted/30 shadow-[0_18px_44px_-34px_rgba(7,30,39,0.28)] transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
        isLoaded && "hover:-translate-y-0.5 hover:border-primary/25",
        !isLoaded && "cursor-default",
        config.frameClassName,
      )}
    >
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        className={cn(
          "transition duration-300 ease-out",
          isLoaded
            ? "scale-100 opacity-100 group-hover:scale-[1.025]"
            : "scale-100 opacity-0",
          config.imageClassName,
        )}
      />
      {loadState === "loading" || loadState === "idle" ? (
        <ImageSkeleton />
      ) : null}
      {isLoaded ? (
        <span className="absolute inset-0 flex items-end justify-end bg-black/0 p-2 opacity-0 transition-opacity group-hover:bg-black/12 group-hover:opacity-100">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg backdrop-blur">
            <Maximize2 className="size-4" />
          </span>
        </span>
      ) : null}
    </button>
  );
}

export const ReviewImagePreview = memo(function ReviewImagePreview({
  src,
  alt,
  label = "Ảnh xem trước",
  variant = "question",
  className,
}: ReviewImagePreviewProps) {
  const imageUrl = src.trim();
  const [loadSnapshot, setLoadSnapshot] = useState<{
    src: string;
    state: ImageLoadState;
  }>({ src: "", state: "idle" });
  const [dialogSnapshot, setDialogSnapshot] = useState<{
    src: string;
    open: boolean;
  }>({ src: "", open: false });
  const config = VARIANT_CONFIG[variant];
  const shouldShowLabel = variant !== "option";
  const loadState =
    loadSnapshot.src === imageUrl
      ? loadSnapshot.state
      : imageUrl
        ? "loading"
        : "idle";
  const isDialogOpen = dialogSnapshot.src === imageUrl && dialogSnapshot.open;

  if (!imageUrl) {
    return null;
  }

  function setCurrentLoadState(state: ImageLoadState) {
    setLoadSnapshot({ src: imageUrl, state });
  }

  return (
    <div className={cn("space-y-2", config.rootClassName, className)}>
      {shouldShowLabel ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
          <ImageIcon className="size-4 text-primary" />
          {label}
        </div>
      ) : null}

      <ImagePreview
        src={imageUrl}
        alt={alt}
        label={label}
        variant={variant}
        loadState={loadState}
        onLoad={() => setCurrentLoadState("loaded")}
        onError={() => setCurrentLoadState("error")}
        onOpen={() => setDialogSnapshot({ src: imageUrl, open: true })}
      />

      {loadState === "loaded" ? (
        <FullscreenPreviewDialog
          open={isDialogOpen}
          onOpenChange={(open) => setDialogSnapshot({ src: imageUrl, open })}
          src={imageUrl}
          alt={alt}
          title={label}
        />
      ) : null}
    </div>
  );
});
