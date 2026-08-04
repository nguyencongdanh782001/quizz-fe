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
    <div className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white shadow-[0_1px_3px_rgba(30,41,59,0.08)]">
      <table className="w-full text-left">
        <thead className="bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
          <tr className="border-b border-[#DDE2EB]">
            {["Tài liệu", "Ngày tạo", "Hành động"].map((heading) => (
              <th
                key={heading}
                className="px-3.5 py-3.5 text-left"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDE2EB] text-xs text-[#111827]">
          {documents.map((document) => (
            <tr
              key={document.id}
              className="transition-colors hover:bg-[#F8FAFC]"
            >
              <td className="px-3.5 py-2.5">
                <p className="font-medium text-[#111827]">
                  {document.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {document.description}
                </p>
              </td>
              <td className="px-3.5 py-2.5 text-[#526079]">
                {formatDate(document.createdAt)}
              </td>
              <td className="px-3.5 py-2.5">
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
