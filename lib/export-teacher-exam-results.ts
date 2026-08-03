import { formatExamDateTime } from "@/lib/date";
import type {
  TeacherExamResultItemData,
  TeacherExamResultListData,
} from "@/lib/teacher-exam-results";
import type { WorkSheet } from "xlsx";

interface ExportTeacherExamResultsInput {
  className: string;
  examTitle: string;
  passedCount: number;
  results: TeacherExamResultListData;
}

const NOW_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Format a `submittedAt` timestamp for the CSV column.
 * Uses the wall-clock regex from `@/lib/date` so we never shift by browser TZ.
 */
function formatDateTime(value: string): string {
  return formatExamDateTime(value);
}

function roundNumber(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalizeFileSegment(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "ket-qua";
}

function buildExportFilename(className: string, examTitle: string): string {
  const timestamp = new Date()
    .toISOString()
    .slice(0, 16)
    .replace(/[-:T]/g, "");

  return [
    "ket-qua-bai-thi",
    normalizeFileSegment(className),
    normalizeFileSegment(examTitle),
    timestamp,
  ].join("-") + ".xlsx";
}

function buildOverviewRows({
  className,
  examTitle,
  passedCount,
  results,
}: ExportTeacherExamResultsInput) {
  return [
    ["Thông tin", "Giá trị"],
    ["Tên bài thi", examTitle],
    ["Lớp học", className],
    ["Tổng lượt nộp", results.summary.submittedCount],
    ["Số học sinh đạt", passedCount],
    ["Điểm trung bình (%)", roundNumber(results.summary.averageScorePercent)],
    ["Ngày xuất file", NOW_FORMATTER.format(new Date())],
  ];
}

function buildResultRows(items: TeacherExamResultItemData[]) {
  return items.map((item, index) => ({
    STT: index + 1,
    "Họ tên": item.studentName,
    Email: item.studentEmail,
    "Điểm": roundNumber(item.score),
    "Tổng điểm": roundNumber(item.totalPoints),
    "Phần trăm": roundNumber(item.scorePercent),
    "Câu đúng": item.correctAnswersCount,
    "Tổng câu": item.totalQuestions,
    "Trạng thái": item.isPassed ? "Đạt" : "Chưa đạt",
    "Nộp lúc": formatDateTime(item.submittedAt),
    "Attempt ID": item.attemptId,
  }));
}

function setColumnWidths(worksheet: WorkSheet, widths: number[]) {
  worksheet["!cols"] = widths.map((width) => ({ wch: width }));
}

export async function exportTeacherExamResultsToExcel(
  input: ExportTeacherExamResultsInput,
): Promise<void> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  const overviewSheet = XLSX.utils.aoa_to_sheet(buildOverviewRows(input));
  setColumnWidths(overviewSheet, [24, 48]);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Tong quan");

  const resultSheet = XLSX.utils.json_to_sheet(
    buildResultRows(input.results.items),
  );
  setColumnWidths(resultSheet, [8, 28, 32, 12, 12, 12, 12, 12, 14, 22, 14]);
  XLSX.utils.book_append_sheet(workbook, resultSheet, "Ket qua hoc sinh");

  XLSX.writeFile(
    workbook,
    buildExportFilename(input.className, input.examTitle),
  );
}
