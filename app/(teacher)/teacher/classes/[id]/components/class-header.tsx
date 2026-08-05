"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClassInfo } from "@/types/class.types";

export function ClassHeader({
  cls,
  actions,
  testCount,
  examCount,
}: {
  cls: ClassInfo;
  actions?: React.ReactNode;
  testCount?: number;
  examCount?: number;
}) {
  const router = useRouter();
  const code = cls.joinCode || cls.inviteCode || "--";

  return (
    <section className="rounded-[10px] border border-[#DDE2EB] bg-white p-5 shadow-[0_1px_3px_rgba(30,41,59,0.04)] sm:p-6">
      {/* Top Row: Class Title + Red "Trở về" Button */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#1E293B]">{cls.name}</h1>
        <div className="flex items-center gap-2">
          {actions}
          <Button
            type="button"
            onClick={() => router.back()}
            className="h-9 gap-1.5 rounded-[6px] bg-[#DC2626] px-3.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#B91C1C]"
          >
            <ArrowLeft className="size-3.5" />
            Trở về
          </Button>
        </div>
      </div>

      {/* Middle Row: Classroom Image + Info aligned to top-right of image */}
      <div className="mt-2.5 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-28 w-48 shrink-0 overflow-hidden rounded-[8px] border border-[#ECECEC] bg-[#F8FAFC]">
          <img
            src={cls.imageUrl || "/image/class-01.png"}
            alt={cls.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-2 pt-0.5">
          <span className="inline-block rounded-[4px] bg-[#15803D] px-2.5 py-0.5 text-xs font-semibold text-white">
            Hoạt động
          </span>
          <p className="text-sm font-medium text-[#1E293B]">
            Mã lớp học: <span className="font-mono font-bold text-[#1E293B]">{code}</span>
          </p>
        </div>
      </div>

      {/* Bottom Row: 3 Metric Cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[8px] bg-[#E0F2FE] p-4 text-center">
          <div className="text-2xl font-bold text-[#0284C7]">
            {cls.studentCount ?? 0}
          </div>
          <div className="mt-1 text-xs font-medium text-[#64748B]">
            Tổng học viên
          </div>
        </div>

        <div className="rounded-[8px] bg-[#DCFCE7] p-4 text-center">
          <div className="text-2xl font-bold text-[#16A34A]">
            {testCount ?? cls.examCount ?? 0}
          </div>
          <div className="mt-1 text-xs font-medium text-[#64748B]">
            Bài kiểm tra
          </div>
        </div>

        <div className="rounded-[8px] bg-[#F3E8FF] p-4 text-center">
          <div className="text-2xl font-bold text-[#9333EA]">
            {examCount ?? 0}
          </div>
          <div className="mt-1 text-xs font-medium text-[#64748B]">
            Đề thi ôn tập
          </div>
        </div>
      </div>
    </section>
  );
}
