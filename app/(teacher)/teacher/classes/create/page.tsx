"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateClassForm } from "./components/create-class-form";

export default function CreateClassPage() {
  return (
    <div className="mx-auto max-w-full space-y-6">
      <Link
        href="/teacher/classes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách lớp
      </Link>

      <div className="rounded-[10px] border border-outline/10 bg-surface-container-lowest p-6 shadow-[0_1px_3px_rgba(30,41,59,0.05)] sm:p-7">
        <div className="border-b border-outline/10 pb-5">
          <h1 className="text-lg font-bold text-[#1E293B]">
            Tạo lớp học mới
          </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            Điền các thông tin cơ bản để tạo lớp học cho học sinh tham gia.
          </p>
        </div>

        <CreateClassForm />
      </div>
    </div>
  );
}
