"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookMarked,
  Check,
  Copy,
  FileCheck,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTeacherClasses } from "@/lib/teacher-classes";
import type { ClassInfo } from "@/types/class.types";
import { cn } from "@/lib/utils";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Không thể tải danh sách lớp học. Vui lòng thử lại.";
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedClassId, setCopiedClassId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTeacherClasses() {
      try {
        const items = await getTeacherClasses();

        if (!isMounted) {
          return;
        }

        setClasses(items);
        setLoadError(null);
      } catch (error) {
        console.error("Failed to fetch teacher classes", error);

        if (!isMounted) {
          return;
        }

        setClasses([]);
        setLoadError(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingClasses(false);
        }
      }
    }

    void loadTeacherClasses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!copiedClassId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopiedClassId(null);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copiedClassId]);

  async function copyJoinCode(classId: string, joinCode: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(joinCode);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = joinCode;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopiedClassId(classId);
    } catch (error) {
      console.error(`Failed to copy join code for class ${classId}`, error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
            Quản lý lớp học
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoadingClasses
              ? "Đang tải danh sách lớp..."
              : `${classes.length} lớp đang quản lý`}
          </p>
        </div>
        <Link
          href="/teacher/classes/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo lớp mới
        </Link>
      </div>

      {isLoadingClasses ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-muted-foreground">
          Đang tải lớp học...
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200/60 bg-red-50/80 p-5 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Không thể tải lớp học</p>
              <p className="mt-1">{loadError}</p>
            </div>
          </div>
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-xl bg-surface-container-lowest p-8 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p className="font-medium">Chưa có lớp học nào</p>
          <p className="mt-1 text-sm">
            Tạo lớp đầu tiên để bắt đầu quản lý học sinh.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline/10">
                {[
                  "Lớp học",
                  "Học sinh",
                  "Bài thi",
                  "Tài liệu",
                  "Mã lớp",
                  "Hành động",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr
                  key={cls.id}
                  className={cn(
                    "border-b border-outline/10 last:border-0",
                    "hover:bg-surface-container-low transition-colors",
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: cls.coverColor }}
                      >
                        {cls.name.charAt(0)}
                      </div>
                      <div>
                        <Link
                          href={`/teacher/classes/${cls.id}`}
                          className="font-medium text-on-surface text-sm transition-colors hover:text-primary"
                        >
                          {cls.name}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {cls.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-on-surface">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      {cls.studentCount ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-on-surface">
                      <FileCheck className="w-3.5 h-3.5 text-muted-foreground" />
                      {cls.examCount}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-on-surface">
                      <BookMarked className="w-3.5 h-3.5 text-muted-foreground" />
                      {cls.documentCount}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-surface-container px-2 py-1 rounded font-mono text-muted-foreground">
                        {cls.joinCode ?? cls.inviteCode}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          void copyJoinCode(
                            cls.id,
                            cls.joinCode ?? cls.inviteCode,
                          )
                        }
                        title={
                          copiedClassId === cls.id ? "Copied!" : "Copy code"
                        }
                        aria-label="Copy join code"
                        className={cn(
                          "text-muted-foreground hover:text-on-surface",
                          copiedClassId === cls.id && "text-primary",
                        )}
                      >
                        {copiedClassId === cls.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/teacher/classes/${cls.id}`}
                        className="p-2 rounded-lg hover:bg-surface-container transition-colors text-muted-foreground hover:text-on-surface"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
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
      )}
    </div>
  );
}
