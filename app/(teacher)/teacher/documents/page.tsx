"use client";

import { Plus, Download, Trash2, Pencil } from "lucide-react";
import { mockDocuments } from "@/data/mock/mock-documents";
import { DocumentCard } from "@/components/features/document/document-card";

export default function TeacherDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
            Quản lý tài liệu
          </h1>
          <p className="text-sm text-muted-foreground">
            {mockDocuments.length} tài liệu đã tải lên
          </p>
        </div>
        <button className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Tải lên tài liệu
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline/10">
              {["Tài liệu", "Môn", "Khối", "Tải về", "Hành động"].map((h) => (
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
            {mockDocuments.map((doc, i) => (
              <tr
                key={doc.id}
                className="border-b border-outline/10 last:border-0 hover:bg-surface-container-low transition-colors"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-on-surface text-sm line-clamp-1">
                    {doc.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {doc.type.toUpperCase()}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {doc.subject}
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  Lớp {doc.grade}
                </td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1 text-sm text-on-surface">
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    {doc.downloadCount}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button className="cursor-pointer p-2 rounded-lg hover:bg-surface-container transition-colors text-muted-foreground hover:text-on-surface">
                      <Pencil className="w-4 h-4" />
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
