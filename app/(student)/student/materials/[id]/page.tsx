"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, FileText } from "lucide-react";
import {
  getStudentClassDocument,
  getStudentSystemDocument,
} from "@/lib/student-system-documents";
import type { Document } from "@/types/document.types";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function StudentMaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDocument() {
      try {
        const item = classId
          ? await getStudentClassDocument(classId, id)
          : await getStudentSystemDocument(id);

        if (!isMounted) {
          return;
        }

        setDocument(item);
      } finally {
        if (isMounted) {
          setIsLoadingDocument(false);
        }
      }
    }

    void loadDocument();

    return () => {
      isMounted = false;
    };
  }, [classId, id]);

  if (isLoadingDocument) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Đang tải tài liệu...
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="font-medium">Không tìm thấy tài liệu</p>
        <Link
          href="/student/materials"
          className="text-primary text-sm mt-2 inline-block"
        >
          ← Quay lại thư viện tài liệu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/student/materials"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại thư viện tài liệu
      </Link>

      <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
            <FileText className="w-3.5 h-3.5" />
            Tài liệu
          </span>
          {document.classroomName && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1">
              <BookOpen className="w-3.5 h-3.5" />
              {document.classroomName}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatDate(document.createdAt)}
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl text-on-surface mb-3">
          {document.title}
        </h1>

        <p className="text-sm text-muted-foreground mb-6">
          {document.description}
        </p>

        <div className="rounded-2xl bg-surface-container-low p-5">
          <h2 className="font-display font-semibold text-lg text-on-surface mb-3">
            Nội dung
          </h2>
          <div className="whitespace-pre-wrap text-sm leading-7 text-on-surface">
            {document.content || "Tài liệu này hiện chưa có nội dung hiển thị."}
          </div>
        </div>
      </div>
    </div>
  );
}
