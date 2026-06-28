"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  History,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExamVisibilityToggle } from "@/components/exams/ExamVisibilityToggle";
import { VisibilityStatusBadge } from "@/components/exams/ExamVisibilityToggle";
import { mergeClassExamPublishUpdate } from "@/components/exams/exam-publish-utils";
import type { ToggleVisibilityResponse } from "@/hooks/queries/useToggleExamVisibility";
import { cn } from "@/lib/utils";
import type { Exam } from "@/types/exam.types";
import { teacherClassDetailQueryKeys } from "../query-keys";

export function ExamTable({
  classId,
  exams,
  onToggleVisibility,
  onToggleError,
}: {
  classId: string;
  exams: Exam[];
  onToggleVisibility: (response: ToggleVisibilityResponse) => void;
  onToggleError: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  function handleToggleSuccess(response: ToggleVisibilityResponse) {
    queryClient.setQueryData<Exam[] | undefined>(
      teacherClassDetailQueryKeys.exams(classId),
      (current) =>
        current?.map((exam) =>
          exam.id === String(response.exam.id)
            ? mergeClassExamPublishUpdate(exam, response.exam)
            : exam,
        ),
    );
    void queryClient.invalidateQueries({
      queryKey: teacherClassDetailQueryKeys.exams(classId),
    });
    onToggleVisibility(response);
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(7,30,39,0.05)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline/10">
            {[
              "Bài thi",
              "Thở lượng",
              "Điểm tối đa",
              "Trạng thái",
              "Hành động",
            ].map((heading) => (
              <th
                key={heading}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr
              key={exam.id}
              className="border-b border-outline/10 last:border-0 hover:bg-surface-container-low transition-colors"
            >
              <td className="px-5 py-4">
                <p className="text-sm font-medium text-on-surface">
                  {exam.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {exam.description}
                </p>
              </td>
              <td className="px-5 py-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {exam.duration} phút
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-muted-foreground">
                {exam.totalPoints ?? exam.passingScore}
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  <VisibilityStatusBadge
                    isPublished={Boolean(
                      exam.isPublished ?? exam.status === "published",
                    )}
                  />
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      (exam.isActive ?? exam.status === "published")
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {(exam.isActive ?? exam.status === "published")
                      ? "Đang hoạt động"
                      : "Tạm ngưng"}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-muted-foreground hover:text-on-surface"
                        aria-label="Thao tác"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/teacher/classes/${classId}/exams/${exam.id}/results`}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <History className="h-4 w-4" />
                          Kết quả
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/teacher/classes/${classId}/exams/edit?edit=${exam.id}`}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <ExamVisibilityToggle
                        examId={exam.id}
                        examTitle={exam.title}
                        isPublished={Boolean(
                          exam.isPublished ?? exam.status === "published",
                        )}
                        trigger="menu-item"
                        onSuccess={handleToggleSuccess}
                        onError={onToggleError}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
