import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Document } from "@/types/document.types";
import { DocumentTable } from "./document-table";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";

export function DocumentsTab({
  documents,
  isLoading,
  error,
  onRetry,
}: {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void | Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-on-surface">
            Tài liệu lớp học
          </h2>
          <p className="text-sm text-muted-foreground">
            Quản lý tài liệu chia sẻ riêng cho lớp này.
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/documents">
            <Plus className="mr-2 h-4 w-4" />
            Tải lên tài liệu
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingState label="danh sách tài liệu" />
      ) : error ? (
        <ErrorState
          title="Không thể tải tài liệu"
          message={error}
          onRetry={onRetry}
        />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có tài liệu nào"
          description="Tài liệu được thêm cho lớp sẽ xuất hiện tại đây để bạn dễ theo dõi và cập nhật."
          action={
            <Button asChild>
              <Link href="/teacher/documents">
                <Plus className="mr-2 h-4 w-4" />
                Mở kho tài liệu
              </Link>
            </Button>
          }
        />
      ) : (
        <DocumentTable documents={documents} />
      )}
    </div>
  );
}
