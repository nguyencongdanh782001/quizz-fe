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
import { Form, Formik, type FormikErrors, type FormikHelpers } from "formik";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Globe2,
  LoaderCircle,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { InputField } from "@/components/common/form/input-field";
import { TextareaField } from "@/components/common/form/textarea-field";
import { PageHero } from "@/components/shared/page-hero";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useCreateTeacherDocument } from "@/hooks/queries/useCreateTeacherDocument";
import { useTeacherClassrooms } from "@/hooks/queries/useTeacherClassrooms";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { APP_MESSAGES } from "@/lib/app-messages";
import { cn } from "@/lib/utils";

type DocumentScope = "system" | "classroom";
type ToastVariant = "success" | "error";

interface TeacherDocumentCreateFormStatus {
  submitError?: string;
}

interface ScreenToastState {
  description?: string;
  open: boolean;
  title: string;
  variant: ToastVariant;
}

interface DocumentCreateFormValues {
  classroom_id: string;
  is_published: boolean;
  scope: DocumentScope;
  summary: string;
  title: string;
}

interface ClassroomOption {
  id: string;
  name: string;
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
  scope: "system",
  classroom_id: "",
  is_published: false,
};

function validateDocumentForm(
  values: DocumentCreateFormValues,
): FormikErrors<DocumentCreateFormValues> {
  const errors: FormikErrors<DocumentCreateFormValues> = {};

  if (values.scope === "classroom" && !values.classroom_id.trim()) {
    errors.classroom_id = "Vui lòng chọn lớp học";
  }

  return errors;
}

function buildDocumentFormData(
  values: DocumentCreateFormValues,
  file: File,
): FormData {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("title", values.title.trim());
  formData.append("summary", values.summary.trim());
  formData.append("scope", values.scope);
  formData.append("is_published", String(values.is_published));

  if (values.scope === "classroom" && values.classroom_id.trim()) {
    formData.append("classroom_id", values.classroom_id.trim());
  }

  return formData;
}

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

  if (unitIndex === 0) {
    return `${bytes} B`;
  }

  const formatted = size >= 10 ? size.toFixed(0) : size.toFixed(1);

  return `${formatted} ${units[unitIndex]}`;
}

function CardHeader({
  badge,
  description,
  icon: Icon,
  title,
}: {
  badge?: React.ReactNode;
  description?: string;
  icon: typeof FileText;
  title: string;
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
  const inputId = `teacher-document-file-${generatedId}`;
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
        description="Tải trực tiếp tệp tài liệu vào hệ thống."
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
        description="Bổ sung tên và mô tả ngắn cho tài liệu."
      />

      <div className="grid gap-5">
        <InputField
          id="teacher-document-title"
          label="Tiêu đề"
          name="title"
          placeholder="Nhập tiêu đề tài liệu"
          disabled={disabled}
          value={values.title}
          onChange={(event) => onTitleChange(event.target.value)}
        />

        <TextareaField
          id="teacher-document-summary"
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

function ScopeOption({
  checked,
  description,
  disabled,
  icon: Icon,
  id,
  label,
  value,
}: {
  checked: boolean;
  description: string;
  disabled: boolean;
  icon: typeof Globe2;
  id: string;
  label: string;
  value: DocumentScope;
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-outline/15 bg-surface-container-lowest p-4 transition-all",
        checked &&
          "border-primary/35 bg-primary/6 shadow-[0_18px_44px_-34px_rgba(79,70,229,0.36)]",
        !checked && "hover:border-primary/25 hover:bg-surface",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <RadioGroupItem
        id={id}
        value={value}
        disabled={disabled}
        className="mt-0.5"
      />
      <span className="flex min-w-0 flex-1 gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-on-surface">
            {label}
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {description}
          </span>
        </span>
      </span>
    </Label>
  );
}

function ScopeSelectionCard({
  classroomError,
  classroomOptions,
  disabled,
  isClassroomsError,
  isClassroomsLoading,
  onClassroomChange,
  onRetryClassrooms,
  onScopeChange,
  values,
}: {
  classroomError?: string;
  classroomOptions: ClassroomOption[];
  disabled: boolean;
  isClassroomsError: boolean;
  isClassroomsLoading: boolean;
  onClassroomChange: (classroomId: string) => void;
  onRetryClassrooms: () => void;
  onScopeChange: (scope: DocumentScope) => void;
  values: DocumentCreateFormValues;
}) {
  const isClassroomScope = values.scope === "classroom";
  const classroomSelectDisabled =
    disabled || isClassroomsLoading || classroomOptions.length === 0;

  return (
    <SurfacePanel className="space-y-5">
      <CardHeader
        icon={Globe2}
        title="Phạm vi"
        description="Chọn nơi tài liệu sẽ được hiển thị."
      />

      <RadioGroup
        value={values.scope}
        onValueChange={(nextValue) => onScopeChange(nextValue as DocumentScope)}
        className="grid gap-3"
      >
        <ScopeOption
          id="teacher-document-scope-system"
          value="system"
          label="Hệ thống"
          description="Tài liệu dùng chung trong hệ thống."
          icon={Globe2}
          checked={values.scope === "system"}
          disabled={disabled}
        />
        {/* <ScopeOption
          id="teacher-document-scope-classroom"
          value="classroom"
          label="Lớp học"
          description="Tài liệu gắn với một lớp học cụ thể."
          icon={School}
          checked={isClassroomScope}
          disabled={disabled}
        /> */}
      </RadioGroup>

      {isClassroomScope ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-sm font-medium text-on-surface">
              Lớp học <span className="text-destructive">*</span>
            </Label>
            {isClassroomsLoading ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
                <LoaderCircle className="size-3 animate-spin" />
                Đang tải
              </span>
            ) : null}
          </div>

          <Select
            value={values.classroom_id || undefined}
            onValueChange={onClassroomChange}
            disabled={classroomSelectDisabled}
          >
            <SelectTrigger
              aria-invalid={Boolean(classroomError)}
              className={cn(
                "h-12 rounded-xl border-outline/15 bg-surface-container-lowest shadow-none",
                classroomError &&
                  "border-destructive focus-visible:ring-destructive/20",
              )}
            >
              <SelectValue placeholder="Chọn lớp học" />
            </SelectTrigger>
            <SelectContent position="popper">
              {classroomOptions.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {classroomError ? (
            <p className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="size-3.5" />
              {classroomError}
            </p>
          ) : null}

          {isClassroomsError ? (
            <div className="flex flex-col gap-3 rounded-xl border border-destructive/15 bg-destructive/5 p-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
              <span>Không thể tải lớp học.</span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRetryClassrooms}
                disabled={disabled}
              >
                <RefreshCw className="size-3.5" />
                Tải lại
              </Button>
            </div>
          ) : null}

          {!isClassroomsLoading &&
          !isClassroomsError &&
          classroomOptions.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa có lớp học để chọn.
            </p>
          ) : null}
        </div>
      ) : null}
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
        description="Quyết định tài liệu được công khai ngay hay lưu nháp."
      />

      <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-outline/15 bg-surface-container-lowest p-4">
        <div className="min-w-0">
          <Label
            htmlFor="teacher-document-published"
            className="text-sm font-semibold text-on-surface"
          >
            Công khai
          </Label>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Tắt để lưu tài liệu nhưng chưa hiển thị.
          </p>
        </div>
        <button
          id="teacher-document-published"
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
              "block size-6 rounded-full bg-white shadow-[0_4px_12px_-5px_rgba(7,30,39,0.7)] transition-transform",
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
}: {
  disabled: boolean;
  isUploading: boolean;
  submitLabel: string;
}) {
  return (
    <SurfacePanel className="flex flex-col-reverse gap-3 p-4 sm:flex-row sm:items-center sm:justify-end">
      {disabled ? (
        <Button type="button" variant="outline" size="lg" disabled>
          Hủy
        </Button>
      ) : (
        <Button asChild type="button" variant="outline" size="lg">
          <Link href="/teacher/documents">Hủy</Link>
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

export function TeacherDocumentsCreateScreen() {
  const router = useRouter();
  const createMutation = useCreateTeacherDocument();
  const classroomsQuery = useTeacherClassrooms();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [toast, setToast] = useState<ScreenToastState | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);
  const classroomOptions =
    classroomsQuery.data?.map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
    })) ?? [];

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

    try {
      const formData = buildDocumentFormData(values, selectedFile);
      await createMutation.mutateAsync(formData);

      openToast({
        title: CREATE_DOCUMENT_SUCCESS_MESSAGE,
        description:
          "Tài liệu đã được lưu. Đang quay lại danh sách tài liệu...",
        variant: "success",
      });

      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }

      setIsRedirecting(true);
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push("/teacher/documents");
      }, REDIRECT_DELAY_MS);
    } catch (error) {
      const message = getApiErrorMessage(error, CREATE_DOCUMENT_ERROR_MESSAGE);

      helpers.setSubmitting(false);
      helpers.setStatus({
        submitError: message,
      } satisfies TeacherDocumentCreateFormStatus);

      openToast({
        title: CREATE_DOCUMENT_ERROR_MESSAGE,
        description: message,
        variant: "error",
      });
    }
  }

  return (
    <ToastProvider>
      <div className="space-y-6">
        <Link
          href="/teacher/documents"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="size-4" />
          Quay lại tài liệu
        </Link>

        <PageHero
          eyebrow="Tài liệu giáo viên"
          title="Tải lên tài liệu"
          description="Tạo tài liệu mới bằng tệp PDF, DOCX, XLSX, PPTX, TXT và chọn phạm vi hiển thị trước khi lưu."
          icon={UploadCloud}
          badgeVariant="info"
        />

        <Formik<DocumentCreateFormValues>
          initialValues={initialValues}
          validate={validateDocumentForm}
          onSubmit={handleSubmit}
        >
          {({
            errors,
            isSubmitting,
            setFieldTouched,
            setFieldValue,
            setStatus,
            status,
            touched,
            values,
          }) => {
            const formStatus = status as
              | TeacherDocumentCreateFormStatus
              | undefined;
            const isFormDisabled =
              isSubmitting || createMutation.isPending || isRedirecting;
            const classroomError =
              touched.classroom_id && errors.classroom_id
                ? errors.classroom_id
                : undefined;

            return (
              <Form className="space-y-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start">
                  <div className="space-y-5">
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
                  </div>

                  <div className="space-y-5">
                    <ScopeSelectionCard
                      values={values}
                      classroomOptions={classroomOptions}
                      classroomError={classroomError}
                      disabled={isFormDisabled}
                      isClassroomsError={classroomsQuery.isError}
                      isClassroomsLoading={classroomsQuery.isPending}
                      onRetryClassrooms={() => {
                        void classroomsQuery.refetch();
                      }}
                      onClassroomChange={(classroomId) => {
                        setStatus(undefined);
                        void setFieldValue("classroom_id", classroomId);
                        void setFieldTouched("classroom_id", true, false);
                      }}
                      onScopeChange={(scope) => {
                        setStatus(undefined);
                        void setFieldValue("scope", scope);

                        if (scope === "system") {
                          void setFieldValue("classroom_id", "");
                          void setFieldTouched("classroom_id", false, false);
                        }
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
                  </div>
                </div>

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
