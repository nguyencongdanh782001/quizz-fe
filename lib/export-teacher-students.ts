import type { TeacherStudentRecord } from "@/lib/teacher-classes";
import type { WorkSheet } from "xlsx";

function formatJoinedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildFilename() {
  const timestamp = new Date()
    .toISOString()
    .slice(0, 16)
    .replace(/[-:T]/g, "");

  return `danh-sach-hoc-sinh-${timestamp}.xlsx`;
}

function setColumnWidths(worksheet: WorkSheet, widths: number[]) {
  worksheet["!cols"] = widths.map((width) => ({ wch: width }));
}

export async function exportTeacherStudentsToExcel(
  students: TeacherStudentRecord[],
) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const rows = students.map((student, index) => ({
    STT: index + 1,
    "Mã học sinh": student.studentCode || student.id,
    "Họ tên": student.name,
    Email: student.email || "Chưa cập nhật",
    "Lớp học": student.classroomName,
    "Ngày tham gia": formatJoinedDate(student.joinedAt),
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);

  setColumnWidths(worksheet, [8, 20, 28, 34, 26, 18]);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sach hoc sinh");
  XLSX.writeFile(workbook, buildFilename());
}
