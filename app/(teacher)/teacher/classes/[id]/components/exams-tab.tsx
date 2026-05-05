import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Exam } from "@/types/exam.types";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { ExamTable } from "./exam-table";
import { LoadingState } from "./loading-state";

export function ExamsTab({
  exams,
  isLoading,
  error,
  onRetry,
}: {
  exams: Exam[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void | Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-on-surface">
            Bài thi trong lớp
          </h2>
          <p className="text-sm text-muted-foreground">
            Theo dõi và cập nhật các bài thi đã giao cho lớp này.
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/exams/create">
            <Plus className="mr-2 h-4 w-4" />
            Tạo bài thi
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingState label="danh sách bài thi" />
      ) : error ? (
        <ErrorState
          title="Không thể tải bài thi"
          message={error}
          onRetry={onRetry}
        />
      ) : exams.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Chưa có bài thi nào"
          description="Bạn có thể tạo bài thi mới và gán cho lớp này khi backend lớp học hỗ trợ danh sách bài thi riêng."
          action={
            <Button asChild>
              <Link href="/teacher/exams/create">
                <Plus className="mr-2 h-4 w-4" />
                Tạo bài thi
              </Link>
            </Button>
          }
        />
      ) : (
        <ExamTable exams={exams} />
      )}
    </div>
  );
}
