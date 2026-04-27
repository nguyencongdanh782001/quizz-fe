"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import { DocumentCard } from "@/components/features/document/document-card";
import { getStudentSystemDocuments } from "@/lib/student-system-documents";
import type { Document } from "@/types/document.types";
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
  { value: "doc", label: "DOC" },
];

const ALL_CLASSROOMS = "__all_classrooms__";
const ALL_GRADES = "__all_grades__";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [search, setSearch] = useState("");
  const [classroom, setClassroom] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [type, setType] = useState<DocumentType | "">("");

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      try {
        const items = await getStudentSystemDocuments();

        if (!isMounted) {
          return;
        }

        setDocuments(items);
      } finally {
        if (isMounted) {
          setIsLoadingDocuments(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const classroomOptions = useMemo(
    () =>
      Array.from(
        new Set(
          documents
            .map((document) => document.classroomName?.trim())
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b, "vi")),
    [documents],
  );

  const gradeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          documents
            .map((document) => document.grade)
            .filter((value) => value > 0),
        ),
      ).sort((a, b) => a - b),
    [documents],
  );

  const filtered = documents.filter((doc) => {
    if (
      search &&
      ![doc.title, doc.description, doc.content ?? "", doc.classroomName ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;
    if (classroom && doc.classroomName !== classroom) return false;
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
          {documents.length} tài liệu hệ thống dành cho học sinh
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
          value={classroom || ALL_CLASSROOMS}
          onValueChange={(value) =>
            setClassroom(value === ALL_CLASSROOMS ? "" : value)
          }
        >
          <SelectTrigger className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest shadow-none">
            <SelectValue placeholder="Tất cả lớp học" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ALL_CLASSROOMS}>Tất cả lớp học</SelectItem>
            {classroomOptions.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
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
            {gradeOptions.map((g) => (
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
      {isLoadingDocuments ? (
        <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-6 text-sm text-muted-foreground">
          Đang tải tài liệu hệ thống...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Download className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">
            {documents.length === 0
              ? "Chưa có tài liệu hệ thống khả dụng."
              : "Không tìm thấy tài liệu nào"}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Hiển thị {filtered.length} trong {documents.length} tài liệu
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
