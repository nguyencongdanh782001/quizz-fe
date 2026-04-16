"use client";

import Link from "next/link";
import {
  Plus,
  BookOpen,
  Clock,
  Users,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";
import { mockExams } from "@/data/mock/mock-exams";
import { cn } from "@/lib/utils";

const difficultyColor = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function TeacherExamsPage() {
  const exams = mockExams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
            Quản lý bài thi
          </h1>
          <p className="text-sm text-muted-foreground">
            {exams.length} bài thi đã tạo
          </p>
        </div>
        <Link
          href="/teacher/exams/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo bài thi
        </Link>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline/10">
              {[
                "Bài thi",
                "Môn",
                "Khối",
                "Câu hỏi",
                "Thời gian",
                "Trạng thái",
                "Hành động",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exams.map((exam, i) => (
              <tr
                key={exam.id}
                className={cn(
                  "border-b border-outline/10 last:border-0",
                  "hover:bg-surface-container-low transition-colors",
                )}
              >
                <td className="px-5 py-4 max-w-xs">
                  <p className="font-medium text-on-surface text-sm line-clamp-1">
                    {exam.title}
                  </p>
                  <span
                    className={cn(
                      "inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium",
                      difficultyColor[exam.difficulty],
                    )}
                  >
                    {exam.difficulty === "easy"
                      ? "Dễ"
                      : exam.difficulty === "medium"
                        ? "Trung bình"
                        : "Khó"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-muted-foreground">
                    {exam.subject}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-muted-foreground">
                    {exam.grade}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-on-surface">
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                    {exam.questionCount}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-on-surface">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {exam.duration}p
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      exam.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                    )}
                  >
                    {exam.status === "published" ? "Đã xuất bản" : "Nháp"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/teacher/exams/create?edit=${exam.id}`}
                      className="p-2 rounded-lg hover:bg-surface-container transition-colors text-muted-foreground hover:text-on-surface"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button className="cursor-pointer p-2 rounded-lg hover:bg-surface-container transition-colors text-muted-foreground hover:text-primary">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="cursor-pointer p-2 rounded-lg hover:bg-surface-container transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
