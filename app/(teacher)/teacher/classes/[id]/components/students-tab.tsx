import { Users } from "lucide-react";
import type { ClassStudent } from "@/types/class.types";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";
import { StudentTable } from "./student-table";

export function StudentsTab({
  students,
  isLoading,
  error,
  successMessage,
  actionError,
  removingStudentId,
  onRetry,
  onRemoveStudent,
}: {
  students: ClassStudent[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  actionError: string | null;
  removingStudentId: string | null;
  onRetry: () => void | Promise<void>;
  onRemoveStudent: (student: ClassStudent) => void;
}) {
  return (
    <div className="space-y-4">
      {successMessage ? (
        <div className="rounded-2xl border border-green-200/70 bg-green-50/80 p-4 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-950/20 dark:text-green-300">
          {successMessage}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
          {actionError}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState label="danh sách học sinh" />
      ) : error ? (
        <ErrorState
          title="Không thể tải học sinh"
          message={error}
          onRetry={onRetry}
        />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có học sinh nào trong lớp"
          description="Danh sách học sinh sẽ xuất hiện tại đây khi các em tham gia lớp bằng mã lớp."
        />
      ) : (
        <StudentTable
          students={students}
          removingStudentId={removingStudentId}
          onRemoveStudent={onRemoveStudent}
        />
      )}
    </div>
  );
}
