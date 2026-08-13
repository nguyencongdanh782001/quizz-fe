"use client";

import Link from "next/link";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TeacherExam } from "@/types/exam";
import { ExamVisibilityToggle } from "./ExamVisibilityToggle";
import type { ToggleVisibilityResponse } from "@/hooks/queries/useToggleExamVisibility";

interface ExamContextMenuProps {
  exam: TeacherExam;
  isDeleting: boolean;
  onViewDetail: (exam: TeacherExam) => void;
  onDeleteRequest: (exam: TeacherExam) => void;
  onToggleVisibility: (response: ToggleVisibilityResponse) => void;
  onToggleError: (message: string) => void;
}

export function ExamContextMenu({
  exam,
  isDeleting,
  onViewDetail,
  onDeleteRequest,
  onToggleVisibility,
  onToggleError,
}: ExamContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground shadow-none ring-0 hover:bg-surface-container hover:text-on-surface focus:border-transparent focus:outline-none focus:ring-0 focus-visible:border-transparent focus-visible:ring-0 data-[state=open]:bg-surface-container"
          aria-label="Thao tác"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem onSelect={() => onViewDetail(exam)}>
          <Eye className="size-4" />
          Xem chi tiết
        </DropdownMenuItem>

        <DropdownMenuItem asChild disabled={exam.attempt_count > 0}>
          <Link
            href={`/teacher/exams/edit?edit=${exam.id}`}
            className="flex cursor-pointer items-center gap-2"
          >
            <Pencil className="size-4" />
            Chỉnh sửa
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <ExamVisibilityToggle
          examId={exam.id}
          examTitle={exam.title}
          isPublished={exam.is_published}
          trigger="menu-item"
          onSuccess={onToggleVisibility}
          onError={onToggleError}
        />

        <DropdownMenuSeparator />

        <DropdownMenuItem
          destructive
          disabled={isDeleting}
          onSelect={() => onDeleteRequest(exam)}
        >
          <Trash2 className="size-4" />
          {isDeleting ? "Đang xóa..." : "Xóa đề thi"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
