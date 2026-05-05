import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Document } from "@/types/document.types";
import { formatDate } from "../utils";

export function DocumentTable({ documents }: { documents: Document[] }) {
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
                <Button asChild type="button" variant="ghost" size="sm">
                  <Link href="/teacher/documents">
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
