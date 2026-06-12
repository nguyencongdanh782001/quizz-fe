import type { ReactNode } from "react";
import { BookOpen, CalendarDays, FileText, Hash, Users } from "lucide-react";
import type { ClassInfo } from "@/types/class.types";
import { formatDate } from "../utils";

export function ClassHeader({
  cls,
  actions,
}: {
  cls: ClassInfo;
  actions?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_18px_60px_rgba(7,30,39,0.08)]">
      {/* test */}
      <div className="bg-linear-to-r from-primary/10 via-surface-container-lowest to-secondary/10 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg"
                style={{ backgroundColor: cls.coverColor }}
              >
                {cls.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  Quản lý lớp học
                </p>
                <h1 className="mt-1 font-display text-2xl font-bold text-on-surface sm:text-3xl">
                  {cls.name}
                </h1>
                {cls.description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                    {cls.description}
                  </p>
                ) : null}
                {actions ? <div className="mt-4">{actions}</div> : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface-container p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Học sinh
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-on-surface">
                {cls.studentCount ?? 0}
              </p>
            </div>
            <div className="rounded-2xl bg-surface-container p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Bài thi
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-on-surface">
                {cls.examCount}
              </p>
            </div>
            <div className="rounded-2xl bg-surface-container p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Tài liệu
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-on-surface">
                {cls.documentCount ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5">
            <Hash className="h-4 w-4" />
            Mã lớp:{" "}
            <code className="font-mono text-xs text-on-surface">
              {cls.joinCode ?? cls.inviteCode}
            </code>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5">
            <CalendarDays className="h-4 w-4" />
            Tạo ngày {formatDate(cls.createdAt)}
          </span>
        </div>
      </div>
    </section>
  );
}
