import Link from "next/link";
import { CheckCircle2, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Exam } from "@/types/exam.types";

export function ExamTable({
  classId,
  exams,
}: {
  classId: string;
  exams: Exam[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(7,30,39,0.05)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline/10">
            {["Bài thi", "Thời lượng", "Điểm tối đa", "Trạng thái", "Hành động"].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr
              key={exam.id}
              className="border-b border-outline/10 last:border-0 hover:bg-surface-container-low transition-colors"
            >
              <td className="px-5 py-4">
                <p className="text-sm font-medium text-on-surface">{exam.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {exam.description}
                </p>
              </td>
              <td className="px-5 py-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {exam.duration} phút
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-muted-foreground">
                {exam.totalPoints ?? exam.passingScore}
              </td>
              <td className="px-5 py-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    exam.isActive ?? exam.status === "published"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {exam.isActive ?? exam.status === "published"
                    ? "Đang hoạt động"
                    : "Chưa hoạt động"}
                </span>
              </td>
              <td className="px-5 py-4">
                <Button asChild type="button" variant="ghost" size="sm">
                  <Link href={`/teacher/classes/${classId}/exams/create?edit=${exam.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
