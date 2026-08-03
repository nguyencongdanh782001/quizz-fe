"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, FileCheck2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassInfo } from "@/types/class.types";

interface ClassCardProps {
  cls: ClassInfo;
  variant?: "default" | "compact";
}

function formatJoinedAt(joinedAt?: string | null): string | null {
  if (!joinedAt) return null;
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function ClassCard({ cls, variant = "default" }: ClassCardProps) {
  const joinedAtLabel = formatJoinedAt(cls.joinedAt);
  const teacherLabel =
    cls.teacherName?.trim() || cls.joinCode || cls.inviteCode || cls.name;

  return (
    <Link
      href={`/student/classes/${cls.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-[#DDE2EB] bg-white transition-colors hover:border-[#BFC8D8] hover:bg-[#FBFCFE]"
    >
      <div className="h-1.5" style={{ backgroundColor: cls.coverColor }} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-[8px] text-sm font-bold text-white"
            style={{ backgroundColor: cls.coverColor }}
          >
            {cls.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#1E293B]">
                {cls.name}
              </h3>
              <span className="shrink-0 rounded-[6px] bg-[#EEF2FF] px-2 py-1 text-[10px] font-semibold text-[#4F62F2]">
                {cls.grade > 0 ? `Lớp ${cls.grade}` : "Lớp học"}
              </span>
            </div>
            <p className={cn("mt-1 line-clamp-2 text-[11px] leading-5 text-[#64748B]", variant === "compact" && "line-clamp-1")}>
              {cls.description || "Chưa có mô tả lớp học."}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[10.5px] text-[#526079]">
          <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#F7F8FB] px-2.5 py-2">
            {typeof cls.studentCount === "number" ? (
              <>
                <Users className="size-3.5 text-[#4F62F2]" />
                {cls.studentCount} học sinh
              </>
            ) : (
              <>
                <CalendarDays className="size-3.5 text-[#4F62F2]" />
                {joinedAtLabel ? `Tham gia ${joinedAtLabel}` : "Đã tham gia"}
              </>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#F7F8FB] px-2.5 py-2">
            <FileCheck2 className="size-3.5 text-[#F59E0B]" />
            {cls.examCount} bài thi
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[#E9EDF3] pt-3">
          <span className="truncate text-[10.5px] text-[#64748B]">
            {cls.teacherName?.trim() ? cls.teacherName : `Mã lớp: ${teacherLabel}`}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4F62F2]">
            Mở lớp
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
