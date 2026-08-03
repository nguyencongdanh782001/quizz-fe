"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  FileText,
  LoaderCircle,
  School,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { useBreadcrumbLabel } from "@/components/shared/breadcrumb-labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { InputField } from "@/components/common/form/input-field";
import { TextareaField } from "@/components/common/form/textarea-field";
import { useQuery } from "@tanstack/react-query";
import { useCreateTeacherClassDocument } from "@/hooks/queries/useCreateTeacherClassDocument";
import { APP_MESSAGES } from "@/lib/app-messages";
import { getTeacherClassById } from "@/lib/teacher-classes";
import { cn } from "@/lib/utils";
import { teacherClassDetailQueryKeys } from "../../query-keys";

interface DocumentCreateFormValues {
  is_published: boolean;
  summary: string;
  title: string;
}

type ToastVariant = "success" | "error";

interface ScreenToastState {
  description?: string;
  open: boolean;
  title: string;
  variant: ToastVariant;
}

const CREATE_DOCUMENT_SUCCESS_MESSAGE = APP_MESSAGES.CREATE_DOCUMENT_SUCCESS;
const CREATE_DOCUMENT_ERROR_MESSAGE = APP_MESSAGES.CREATE_DOCUMENT_FAILED;
const FILE_REQUIRED_MESSAGE = "Vui lòng chọn tài liệu";
const REDIRECT_DELAY_MS = 1200;
const DOCUMENT_UPLOAD_ACCEPT = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
].join(",");

const initialValues: DocumentCreateFormValues = {
  title: "",
  summary: "",
  is_published: false,
};

function formatFileSize(bytes: number): string {
  if (bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"] as const;
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const formatted =
    unitIndex === 0 ? String(bytes) : size.toFixed(size >= 10 ? 0 : 1);

  return `${formatted} ${units[unitIndex]}`;
}

function getFileTypeLabel(file: File): string {
  const extension = file.name.split(".").pop()?.trim();

  if (extension) {
    return extension.toUpperCase();
  }

  const mimeType = file.type.trim().toUpperCase();

  return mimeType || "TỆP";
}

function CardHeader({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: typeof FileText;
  title: string;
  description?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[1.15rem] bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold text-on-surface">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {badge}
    </div>
  );
}

function ClassroomInfoCard({
  classId,
  classroomName,
}: {
  classId: string;
  classroomName: string;
}) {
  return (
    <SurfacePanel className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-secondary/10 text-secondary">
          <School className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface">Lớp học</p>
          <p className="mt-1 text-base font-semibold text-on-surface">
            {classroomName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Mã lớp: {classId}
          </p>
        </div>
      </div>
    </SurfacePanel>
  );
}

function UploadDocumentCard({
  disabled,
  error,
  file,
  onFileSelect,
  onRemoveFile,
}: {
  disabled: boolean;
  error?: string | null;
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
}) {
  const generatedId = useId();
  const inputId = `class-document-file-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hasFile = file !== null;

  function openFilePicker() {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function selectFile(nextFile: File | null) {
    if (!nextFile || disabled) {
      return;
    }

    onFileSelect(nextFile);
    resetInput();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.item(0) ?? null);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    if (!disabled) {
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
    selectFile(event.dataTransfer.files.item(0));
  }

  function handleRemoveFile() {
    if (disabled) {
      return;
    }

    onRemoveFile();
    resetInput();
  }

  return (
    <SurfacePanel className="space-y-5">
      <CardHeader
        icon={UploadCloud}
        title="Tải tài liệu"
        description="Tải trực tiếp tài liệu vào lớp học này."
        badge={
          <Badge variant={hasFile ? "success" : "secondary"}>
            {hasFile ? "Đã chọn tệp" : "Chưa chọn tài liệu"}
          </Badge>
        }
      />

      <div className="space-y-2">
        <Label
          htmlFor={inputId}
          className="text-sm font-medium text-on-surface"
        >
          Tệp tài liệu <span className="text-destructive">*</span>
        </Label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={DOCUMENT_UPLOAD_ACCEPT}
          className="sr-only"
          disabled={disabled}
          onChange={handleFileChange}
        />

        <button
          type="button"
          disabled={disabled}
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex min-h-56 w-full flex-col items-center justify-center rounded-[1.6rem] border border-dashed px-5 py-8 text-center transition-all",
            "bg-surface-container-lowest shadow-[0_20px_54px_-42px_rgba(15,23,42,0.34)]",
            "hover:border-primary/35 hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
            "disabled:cursor-not-allowed disabled:opacity-70",
            isDragging
              ? "border-primary/65 bg-primary/8 text-primary"
              : "border-outline/30 text-on-surface",
            error && "border-destructive/45 bg-destructive/5",
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary">
            <UploadCloud className="size-6" />
          </span>
          <span className="mt-4 text-base font-semibold">
            Kéo thả tài liệu vào đây
          </span>
          <span className="mt-2 text-sm text-muted-foreground">hoặc</span>
          <span className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_18px_34px_-20px_rgba(79,70,229,0.55)]">
            <UploadCloud className="size-4" />
            Chọn tệp
          </span>
          <span className="mt-4 text-xs font-medium text-muted-foreground">
            PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
          </span>
        </button>

        {error ? (
          <p className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="size-3.5" />
            {error}
          </p>
        ) : null}
      </div>

      {file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col gap-4 rounded-[1.35rem] border border-outline/12 bg-white/80 p-4 shadow-[0_18px_48px_-38px_rgba(15,23,42,0.3)] backdrop-blur sm:flex-row sm:items-center sm:justify-between",
            isDragging && "border-primary/45 bg-primary/5",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-secondary/10 text-secondary">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {file.name}
                </p>
                <Badge variant="success" className="shrink-0">
                  Đã chọn tệp
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">{getFileTypeLabel(file)}</Badge>
                <span className="text-xs text-muted-foreground">Loại tệp</span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="lg"
            disabled={disabled}
            onClick={handleRemoveFile}
            className="w-full sm:w-auto"
          >
            <Trash2 className="size-4" />
            Xóa tệp
          </Button>
        </div>
      ) : null}
    </SurfacePanel>
  );
}

function DocumentInformationCard({
  disabled,
  onSummaryChange,
  onTitleChange,
  values,
}: {
  disabled: boolean;
  onSummaryChange: (summary: string) => void;
  onTitleChange: (title: string) => void;
  values: DocumentCreateFormValues;
}) {
  return (
    <SurfacePanel className="space-y-5">
      <CardHeader
        icon={FileText}
        title="Thông tin tài liệu"
        description="Bổ sung tiêu đề và tóm tắt cho tài liệu."
      />

      <div className="grid gap-5">
        <InputField
          id="class-document-title"
          label="Tiêu đề"
          name="title"
          placeholder="Nhập tiêu đề tài liệu"
          disabled={disabled}
          value={values.title}
          onChange={(event) => onTitleChange(event.target.value)}
        />

        <TextareaField
          id="class-document-summary"
          label="Tóm tắt tài liệu"
          name="summary"
          placeholder="Nhập tóm tắt ngắn"
          rows={5}
          disabled={disabled}
          value={values.summary}
          onChange={(event) => onSummaryChange(event.target.value)}
        />
      </div>
    </SurfacePanel>
  );
}

function PublishSettingsCard({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <SurfacePanel className="space-y-5">
      <CardHeader
        icon={CheckCircle2}
        title="Trạng thái"
        description="Quyết định tài liệu có hiển thị ngay cho học sinh hay không."
      />

      <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-outline/15 bg-surface-container-lowest p-4">
        <div className="min-w-0">
          <Label
            htmlFor="class-document-published"
            className="text-sm font-semibold text-on-surface"
          >
            Công khai cho học sinh
          </Label>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Tắt để lưu tài liệu nhưng chưa hiển thị với học sinh.
          </p>
        </div>
        <button
          id="class-document-published"
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative h-8 w-14 shrink-0 rounded-full border border-transparent p-1 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60",
            checked ? "bg-primary" : "bg-outline/25",
          )}
        >
          <span
            className={cn(
              "block size-5.5 rounded-full bg-white shadow-[0_4px_12px_-5px_rgba(7,30,39,0.7)] transition-transform",
              checked && "translate-x-6",
            )}
          />
        </button>
      </div>
    </SurfacePanel>
  );
}

function ActionFooter({
  disabled,
  isUploading,
  submitLabel,
  cancelHref,
}: {
  disabled: boolean;
  isUploading: boolean;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <SurfacePanel className="flex flex-col-reverse gap-3 p-4 sm:flex-row sm:items-center sm:justify-end">
      {disabled ? (
        <Button type="button" variant="outline" size="lg" disabled>
          Hủy
        </Button>
      ) : (
        <Button asChild type="button" variant="outline" size="lg">
          <Link href={cancelHref}>Hủy</Link>
        </Button>
      )}
      <Button type="submit" size="lg" disabled={disabled}>
        {isUploading ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Đang tải lên...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </SurfacePanel>
  );
}

export function TeacherClassDocumentCreateScreen({
  classId,
}: {
  classId: string;
}) {
  const router = useRouter();
  const createMutation = useCreateTeacherClassDocument();
  const classroomQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.detail(classId),
    queryFn: async () => getTeacherClassById(classId),
  });
  const classroomName =
    classroomQuery.data?.name?.trim() ?? `Lớp học #${classId}`;
  const classBreadcrumbHref = `/teacher/classes/${classId}`;
  const classBreadcrumbLabel =
    classroomQuery.data?.name?.trim() ||
    (classroomQuery.isPending ? null : "Chi tiết lớp học");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [toast, setToast] = useState<ScreenToastState | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);
  const cancelHref = `/teacher/classes/${classId}`;

  useBreadcrumbLabel(classBreadcrumbHref, classBreadcrumbLabel);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function openToast(nextToast: Omit<ScreenToastState, "open">) {
    setToast({
      ...nextToast,
      open: true,
    });
  }

  async function handleSubmit(
    values: DocumentCreateFormValues,
    helpers: FormikHelpers<DocumentCreateFormValues>,
  ) {
    helpers.setStatus(undefined);
    setToast(null);

    if (!selectedFile) {
      setFileError(FILE_REQUIRED_MESSAGE);
      helpers.setSubmitting(false);
      return;
    }

    setFileError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const trimmedTitle = values.title.trim();
    const trimmedSummary = values.summary.trim();

    if (trimmedTitle) {
      formData.append("title", trimmedTitle);
    }

    if (trimmedSummary) {
      formData.append("summary", trimmedSummary);
    }

    formData.append("is_published", String(values.is_published));

    try {
      await createMutation.mutateAsync({
        classId,
        formData,
      });

      openToast({
        title: CREATE_DOCUMENT_SUCCESS_MESSAGE,
        description: "Tài liệu đã được lưu. Đang quay lại lớp học...",
        variant: "success",
      });

      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }

      setIsRedirecting(true);
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push(cancelHref);
      }, REDIRECT_DELAY_MS);
    } catch (error) {
      console.error(`Failed to create document for class ${classId}`, error);

      const submitError = CREATE_DOCUMENT_ERROR_MESSAGE;
      helpers.setStatus({
        submitError,
      } satisfies { submitError: string });

      openToast({
        title: CREATE_DOCUMENT_ERROR_MESSAGE,
        description: APP_MESSAGES.NETWORK_ERROR,
        variant: "error",
      });
    }
  }

  return (
    <ToastProvider>
      <div className="space-y-6">
        <Link
          href={cancelHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="size-4" />
          Quay lại lớp học
        </Link>

        <PageHero
          eyebrow="Tài liệu lớp học"
          title={`Thêm tài liệu cho ${classroomName}`}
          description="Tải tệp PDF, DOCX, XLSX, PPTX, TXT lên lớp này và chọn trạng thái hiển thị trước khi lưu."
          icon={UploadCloud}
          badgeVariant="info"
        />

        <ClassroomInfoCard classId={classId} classroomName={classroomName} />

        <Formik<DocumentCreateFormValues>
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setStatus, status, setFieldValue, values }) => {
            const formStatus = status as { submitError?: string } | undefined;
            const isFormDisabled =
              isSubmitting || createMutation.isPending || isRedirecting;

            return (
              <Form className="space-y-5">
                <UploadDocumentCard
                  file={selectedFile}
                  error={fileError}
                  disabled={isFormDisabled}
                  onFileSelect={(file) => {
                    setSelectedFile(file);
                    setFileError(null);
                    setStatus(undefined);
                  }}
                  onRemoveFile={() => {
                    setSelectedFile(null);
                    setFileError(FILE_REQUIRED_MESSAGE);
                    setStatus(undefined);
                  }}
                />

                <DocumentInformationCard
                  values={values}
                  disabled={isFormDisabled}
                  onTitleChange={(title) => {
                    setStatus(undefined);
                    void setFieldValue("title", title);
                  }}
                  onSummaryChange={(summary) => {
                    setStatus(undefined);
                    void setFieldValue("summary", summary);
                  }}
                />

                <PublishSettingsCard
                  checked={values.is_published}
                  disabled={isFormDisabled}
                  onChange={(checked) => {
                    setStatus(undefined);
                    void setFieldValue("is_published", checked);
                  }}
                />

                {formStatus?.submitError ? (
                  <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <div>
                        <p className="font-medium">
                          {CREATE_DOCUMENT_ERROR_MESSAGE}
                        </p>
                        <p className="mt-1">{formStatus.submitError}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <ActionFooter
                  disabled={isFormDisabled}
                  isUploading={isFormDisabled}
                  submitLabel={
                    values.is_published ? "Đăng tài liệu" : "Lưu tài liệu"
                  }
                  cancelHref={cancelHref}
                />
              </Form>
            );
          }}
        </Formik>
      </div>

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
