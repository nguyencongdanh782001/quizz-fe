"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";
import { DocumentCard } from "@/components/features/document/document-card";
import { mockDocuments } from "@/data/mock/mock-documents";
import { SUBJECTS, GRADES } from "@/data/mock/mock-exams";
import { DocumentType } from "@/types/document.types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const typeFilters: { value: DocumentType | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Video" },
  { value: "doc", label: "DOC" },
  { value: "image", label: "Hình ảnh" },
];

const ALL_SUBJECTS = "__all_subjects__";
const ALL_GRADES = "__all_grades__";

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [type, setType] = useState<DocumentType | "">("");

  const filtered = mockDocuments.filter((doc) => {
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (subject && doc.subject !== subject) return false;
    if (grade && doc.grade !== grade) return false;
    if (type && doc.type !== type) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Thư viện tài liệu
        </h1>
        <p className="text-sm text-muted-foreground">
          {mockDocuments.length} tài liệu học tập — sách, video, hình ảnh
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm tài liệu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest pl-10 pr-4 shadow-none"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          value={subject || ALL_SUBJECTS}
          onValueChange={(value) =>
            setSubject(value === ALL_SUBJECTS ? "" : value)
          }
        >
          <SelectTrigger className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest shadow-none">
            <SelectValue placeholder="Tất cả môn" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ALL_SUBJECTS}>Tất cả môn</SelectItem>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={grade === "" ? ALL_GRADES : String(grade)}
          onValueChange={(value) =>
            setGrade(value === ALL_GRADES ? "" : Number(value))
          }
        >
          <SelectTrigger className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest shadow-none">
            <SelectValue placeholder="Tất cả khối" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ALL_GRADES}>Tất cả khối</SelectItem>
            {GRADES.map((g) => (
              <SelectItem key={g} value={String(g)}>
                Lớp {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setType(f.value)}
              className={cn(
                "cursor-pointer flex-1 py-2 rounded-xl text-xs font-medium border transition-colors",
                type === f.value
                  ? "bg-primary text-white border-primary"
                  : "bg-surface-container-lowest text-on-surface border-outline/20 hover:bg-surface-container-low",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Download className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Không tìm thấy tài liệu nào</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Hiển thị {filtered.length} trong {mockDocuments.length} tài liệu
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
