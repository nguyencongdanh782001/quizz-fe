"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Search, Sparkles } from "lucide-react";
import { DocumentCard } from "@/components/features/document/document-card";
import { getStudentSystemDocuments } from "@/lib/student-system-documents";
import type { Document } from "@/types/document.types";
import { DocumentType } from "@/types/document.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHero } from "@/components/shared/page-hero";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { AppEmptyState } from "@/components/shared/empty-state";
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

  const filtered = documents.filter((document) => {
    if (
      search &&
      ![
        document.title,
        document.description,
        document.content ?? "",
        document.classroomName ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    ) {
      return false;
    }
    if (classroom && document.classroomName !== classroom) return false;
    if (grade && document.grade !== grade) return false;
    if (type && document.type !== type) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Thư viện tài liệu"
        title="Kho học liệu được tổ chức để bạn đọc và quay lại dễ dàng"
        description="Tìm tài liệu theo lớp học, khối lớp và loại nội dung trong cùng một trải nghiệm đọc thống nhất với phần còn lại của nền tảng."
        icon={Sparkles}
        actions={
          <Button asChild variant="outline" size="lg">
            <a href="#bo-loc-tai-lieu">Đi đến bộ lọc</a>
          </Button>
        }
        metrics={[
          {
            label: "Tài liệu đang có",
            value: isLoadingDocuments ? "--" : documents.length,
            description: "Học liệu hệ thống sẵn sàng cho việc ôn tập.",
            icon: FileText,
            tone: "primary",
          },
          {
            label: "Khối lớp xuất hiện",
            value: gradeOptions.length || "--",
            description: "Số nhóm khối lớp có tài liệu trong thư viện.",
            icon: Download,
            tone: "secondary",
          },
        ]}
      />

      <SurfacePanel id="bo-loc-tai-lieu" tone="muted" className="relative">
        <Search className="absolute left-9 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm tài liệu..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest pl-10 pr-4 shadow-none"
        />
      </SurfacePanel>

      <SurfacePanel tone="muted" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            {gradeOptions.map((gradeOption) => (
              <SelectItem key={gradeOption} value={String(gradeOption)}>
                Lớp {gradeOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setType(filter.value)}
              className={cn(
                "cursor-pointer flex-1 py-2 rounded-xl text-xs font-medium border transition-colors",
                type === filter.value
                  ? "bg-primary text-white border-primary"
                  : "bg-surface-container-lowest text-on-surface border-outline/20 hover:bg-surface-container-low",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </SurfacePanel>

      {isLoadingDocuments ? (
        <SurfacePanel className="text-sm text-muted-foreground">
          Đang tải tài liệu hệ thống...
        </SurfacePanel>
      ) : filtered.length === 0 ? (
        <AppEmptyState
          icon={FileText}
          title={
            documents.length === 0
              ? "Chưa có tài liệu hệ thống khả dụng"
              : "Không tìm thấy tài liệu nào"
          }
          description={
            documents.length === 0
              ? "Thư viện sẽ hiển thị học liệu mới tại đây ngay khi hệ thống cập nhật."
              : "Thử điều chỉnh bộ lọc để tìm đúng tài liệu bạn đang cần."
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Hiển thị {filtered.length} trong {documents.length} tài liệu
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((document) => (
              <DocumentCard key={document.id} doc={document} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
