import { DocumentContextMenu } from "@/components/features/document/document-context-menu";
import type { Document } from "@/types/document.types";
import { formatDate } from "../utils";

export function DocumentTable({
  deletingDocumentId,
  documents,
  onDeleteRequest,
}: {
  deletingDocumentId: string | null;
  documents: Document[];
  onDeleteRequest: (document: Document) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(7,30,39,0.05)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline/10">
            {["Tài liệu", "Ngày tạo", "Hành động"].map((heading) => (
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
          {documents.map((document) => (
            <tr
              key={document.id}
              className="border-b border-outline/10 last:border-0 hover:bg-surface-container-low transition-colors"
            >
              <td className="px-5 py-4">
                <p className="text-sm font-medium text-on-surface">
                  {document.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {document.description}
                </p>
              </td>
              <td className="px-5 py-4 text-sm text-muted-foreground">
                {formatDate(document.createdAt)}
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end">
                  <DocumentContextMenu
                    document={document}
                    isDeleting={deletingDocumentId === document.id}
                    onDeleteRequest={onDeleteRequest}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
