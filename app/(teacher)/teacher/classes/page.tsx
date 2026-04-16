"use client";

import Link from "next/link";
import {
  Plus,
  Users,
  FileCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { mockClasses } from "@/data/mock/mock-classes";
import { cn } from "@/lib/utils";

export default function TeacherClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
            Quản lý lớp học
          </h1>
          <p className="text-sm text-muted-foreground">
            {mockClasses.length} lớp đang quản lý
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

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline/10">
              {[
                "Lớp học",
                "Khối",
                "Học sinh",
                "Bài thi",
                "Mã lớp",
                "Hành động",
              ].map((h) => (
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
            {mockClasses.map((cls, i) => (
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
                      <p className="font-medium text-on-surface text-sm">
                        {cls.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {cls.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-muted-foreground">
                    Lớp {cls.grade}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-on-surface">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    {cls.studentCount}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-on-surface">
                    <FileCheck className="w-3.5 h-3.5 text-muted-foreground" />
                    {cls.examCount}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <code className="text-xs bg-surface-container px-2 py-1 rounded font-mono text-muted-foreground">
                    {cls.inviteCode}
                  </code>
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
