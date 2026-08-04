"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import type { WorkBook } from "xlsx";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { TeacherExamFormValues } from "./types";
import {
  formatImportValidationError,
  parseExamImportRows,
  type ExamImportParseResult,
  type SpreadsheetRow,
} from "./exam-import-utils";
import { getTeacherExamTotalPoints } from "./utils";

type XlsxModule = typeof import("xlsx");

interface ExamImportDialogProps {
  baseValues: Pick<TeacherExamFormValues, "classroom_id" | "scope">;
  isImporting: boolean;
  onImport: (values: TeacherExamFormValues) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function isExcelFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  return fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
}

function findSheetName(
  workbook: WorkBook,
  expectedName: string,
): string | null {
  return (
    workbook.SheetNames.find(
      (sheetName) => sheetName.trim().toLowerCase() === expectedName,
    ) ?? null
  );
}

function readSheetRows(
  XLSX: XlsxModule,
  workbook: WorkBook,
  sheetName: "exam" | "questions" | "options",
): SpreadsheetRow[] {
  const matchedSheetName = findSheetName(workbook, sheetName);

  if (!matchedSheetName) {
    return [];
  }

  const sheet = workbook.Sheets[matchedSheetName];

  if (!sheet) {
    return [];
  }

  return XLSX.utils.sheet_to_json<SpreadsheetRow>(sheet, {
    defval: "",
    raw: false,
  });
}

async function downloadExamImportTemplate() {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const examSheet = XLSX.utils.json_to_sheet(
    [
      {
        title: "Đề mẫu REST API",
        description: "Mô tả ngắn cho đề thi",
        grade: "Lớp 10",
        duration_minutes: 45,
        start_time: "2026-08-01T08:00",
        end_time: "2026-08-01T08:45",
        is_published: false,
      },
    ],
    {
      header: [
        "title",
        "description",
        "grade",
        "duration_minutes",
        "start_time",
        "end_time",
        "is_published",
      ],
    },
  );
  const questionsSheet = XLSX.utils.json_to_sheet(
    [
      {
        order_index: 1,
        question_type: "single_choice",
        prompt: "REST là viết tắt của cụm từ nào?",
        explanation: "REST là phong cách kiến trúc Representational State Transfer.",
        points: 1,
        accepted_answers: "",
      },
      {
        order_index: 2,
        question_type: "multiple_choice",
        prompt: "Những phương thức HTTP nào thường dùng trong REST?",
        explanation: "GET và POST là hai phương thức phổ biến khi thiết kế REST API.",
        points: 2,
        accepted_answers: "",
      },
      {
        order_index: 3,
        question_type: "text",
        prompt: "Hãy giải thích khái niệm REST API.",
        explanation: "Câu trả lời nên nêu được giao tiếp qua HTTP và tài nguyên.",
        points: 3,
        accepted_answers: "REST API là kiến trúc giao tiếp qua HTTP",
      },
    ],
    {
      header: [
        "order_index",
        "question_type",
        "prompt",
        "explanation",
        "points",
        "accepted_answers",
      ],
    },
  );
  const optionsSheet = XLSX.utils.json_to_sheet(
    [
      {
        question_order: 1,
        option_key: "A",
        option_text: "Representational State Transfer",
        is_correct: true,
      },
      {
        question_order: 1,
        option_key: "B",
        option_text: "Remote State Transaction",
        is_correct: false,
      },
      {
        question_order: 2,
        option_key: "A",
        option_text: "GET",
        is_correct: true,
      },
      {
        question_order: 2,
        option_key: "B",
        option_text: "POST",
        is_correct: true,
      },
      {
        question_order: 2,
        option_key: "C",
        option_text: "TRACE",
        is_correct: false,
      },
    ],
    {
      header: ["question_order", "option_key", "option_text", "is_correct"],
    },
  );

  XLSX.utils.book_append_sheet(workbook, examSheet, "exam");
  XLSX.utils.book_append_sheet(workbook, questionsSheet, "questions");
  XLSX.utils.book_append_sheet(workbook, optionsSheet, "options");
  XLSX.writeFile(workbook, "mau-import-de-thi.xlsx");
}

function getQuestionTypeLabel(questionType: string): string {
  if (questionType === "multiple_choice") {
    return "Nhiều đáp án";
  }

  if (questionType === "text") {
    return "Tự luận";
  }

  return "Một đáp án";
}

export function ExamImportDialog({
  baseValues,
  isImporting,
  onImport,
  onOpenChange,
  open,
}: ExamImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ExamImportParseResult | null>(
    null,
  );
  const hasValidationErrors = (parseResult?.errors.length ?? 0) > 0;
  const canImport = Boolean(parseResult) && !hasValidationErrors && !isParsing;
  const questionCount = parseResult?.values.questions.length ?? 0;
  const totalPoints = getTeacherExamTotalPoints(questionCount);

  useEffect(() => {
    if (!open) {
      setIsDragging(false);
      setIsParsing(false);
      setFileName(null);
      setUploadError(null);
      setParseResult(null);
    }
  }, [open]);

  async function handleDownloadTemplate() {
    setIsDownloadingTemplate(true);

    try {
      await downloadExamImportTemplate();
    } finally {
      setIsDownloadingTemplate(false);
    }
  }

  async function handleFile(file: File) {
    setUploadError(null);
    setParseResult(null);

    if (!isExcelFile(file)) {
      setFileName(file.name);
      setUploadError("Chỉ hỗ trợ file Excel (.xlsx, .xls)");
      return;
    }

    setFileName(file.name);
    setIsParsing(true);

    try {
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const result = parseExamImportRows({
        classroomId: baseValues.classroom_id,
        examRows: readSheetRows(XLSX, workbook, "exam"),
        optionRows: readSheetRows(XLSX, workbook, "options"),
        questionRows: readSheetRows(XLSX, workbook, "questions"),
        scope: baseValues.scope,
      });
      console.log(result);
      setParseResult(result);
    } catch (error) {
      console.error("Failed to parse exam import file", error);
      setUploadError("Không thể đọc file Excel. Vui lòng kiểm tra lại file.");
    } finally {
      setIsParsing(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files.item(0);

    if (file) {
      void handleFile(file);
    }
  }

  async function handleImport() {
    if (!parseResult || hasValidationErrors) {
      return;
    }

    await onImport(parseResult.values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100%-1rem,76rem)] gap-0 p-0">
        <div className="border-b border-outline/10 px-5 py-5 sm:px-7">
          <DialogHeader className="pr-10">
            <DialogTitle>Tạo đề thi từ Excel</DialogTitle>
            <DialogDescription>
              Tải file mẫu, điền dữ liệu theo 3 trang tính rồi tải lên để kiểm
              tra trước khi import.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(85vh-10rem)] overflow-y-auto px-5 py-5 sm:px-7">
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleDownloadTemplate()}
                disabled={isDownloadingTemplate}
                className="w-full justify-center"
              >
                {isDownloadingTemplate ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Download />
                )}
                Tải file mẫu
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.item(0);

                  if (file) {
                    void handleFile(file);
                  }

                  event.currentTarget.value = "";
                }}
              />

              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-center transition-colors",
                  isDragging
                    ? "border-primary bg-primary/8"
                    : "border-outline/25 bg-surface hover:border-primary/35 hover:bg-surface-container-low",
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {isParsing ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Upload className="size-5" />
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold text-on-surface">
                  Kéo thả file Excel vào đây hoặc nhấn để tải lên
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hỗ trợ định dạng .xlsx và .xls
                </p>
                {fileName ? (
                  <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-surface-container px-3 py-1 text-xs text-muted-foreground">
                    <FileSpreadsheet className="size-3.5 shrink-0" />
                    <span className="truncate">{fileName}</span>
                  </p>
                ) : null}
              </div>

              {uploadError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {uploadError}
                </div>
              ) : null}

              {parseResult ? (
                <div
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm",
                    hasValidationErrors
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700",
                  )}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {hasValidationErrors ? (
                      <TriangleAlert className="size-4" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    {hasValidationErrors
                      ? "Cần sửa dữ liệu trong file Excel"
                      : "Dữ liệu hợp lệ, có thể tạo đề thi"}
                  </div>
                  <p className="mt-1">
                    {questionCount} câu hỏi, tổng {totalPoints} điểm
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              {parseResult?.errors.length ? (
                <div className="rounded-[8px] border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                    <TriangleAlert className="size-4" />
                    Lỗi kiểm tra dữ liệu
                  </div>
                  <ul className="mt-3 max-h-36 space-y-2 overflow-y-auto text-sm text-red-700">
                    {parseResult.errors.map((error, index) => (
                      <li
                        key={`${error.sheet}-${error.rowNumber ?? 0}-${index}`}
                      >
                        {formatImportValidationError(error)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {parseResult ? (
                <div className="rounded-[8px] border border-outline/10 bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Xem trước đề thi
                      </p>
                      <h3 className="mt-1 font-display text-lg font-semibold text-on-surface">
                        {parseResult.values.title || "Chưa có tiêu đề"}
                      </h3>
                      {parseResult.values.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {parseResult.values.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="info">
                        {parseResult.values.duration_minutes} phút
                      </Badge>
                      <Badge
                        variant={
                          parseResult.values.is_published
                            ? "success"
                            : "secondary"
                        }
                      >
                        {parseResult.values.is_published
                          ? "Xuất bản"
                          : "Chưa xuất bản"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[8px] border border-[#DDE2EB]">
                    <div className="max-h-80 overflow-auto">
                      <table className="w-full min-w-2xl text-left">
                        <thead className="sticky top-0 bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
                          <tr>
                            <th className="px-3.5 py-3.5">Câu</th>
                            <th className="px-3.5 py-3.5">Loại</th>
                            <th className="px-3.5 py-3.5">Nội dung</th>
                            <th className="px-3.5 py-3.5">Điểm</th>
                            <th className="px-3.5 py-3.5">Dữ liệu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
                          {parseResult.values.questions.map(
                            (question, index) => (
                              <tr key={question.client_id} className="transition-colors hover:bg-[#F8FAFC]">
                                <td className="px-3.5 py-2.5 text-muted-foreground">
                                  {index + 1}
                                </td>
                                <td className="px-3.5 py-2.5">
                                  {getQuestionTypeLabel(question.question_type)}
                                </td>
                                <td className="px-3.5 py-2.5 text-on-surface">
                                  {question.prompt || "Chưa có nội dung"}
                                </td>
                                <td className="px-3.5 py-2.5">{question.points}</td>
                                <td className="px-3.5 py-2.5 text-muted-foreground">
                                  {question.question_type === "text"
                                    ? `${question.accepted_answers.length} đáp án chấp nhận`
                                    : `${question.options.length} lựa chọn`}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-72 items-center justify-center rounded-[8px] border border-dashed border-outline/20 bg-surface p-6 text-center text-sm text-muted-foreground">
                  Sau khi tải file lên, phần xem trước và lỗi kiểm tra sẽ hiển
                  thị tại đây.
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-outline/10 px-5 py-4 sm:px-7">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={() => void handleImport()}
            disabled={!canImport || isImporting}
          >
            {isImporting ? <Loader2 className="animate-spin" /> : null}
            Tạo đề thi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
