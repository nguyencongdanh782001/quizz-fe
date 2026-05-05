import { Mail } from "lucide-react";
import type { ClassStudent } from "@/types/class.types";
import { formatDate } from "../utils";
import { RemoveStudentButton } from "./remove-student-button";

export function StudentTable({
  students,
  removingStudentId,
  onRemoveStudent,
}: {
  students: ClassStudent[];
  removingStudentId: string | null;
  onRemoveStudent: (student: ClassStudent) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(7,30,39,0.05)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline/10">
            {["Học sinh", "Email", "Ngày tham gia", "Hành động"].map(
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
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-outline/10 last:border-0 hover:bg-surface-container-low transition-colors"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">
                      {student.name}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-muted-foreground">
                {student.email ? (
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {student.email}
                  </span>
                ) : (
                  "Chưa có email"
                )}
              </td>
              <td className="px-5 py-4 text-sm text-muted-foreground">
                {formatDate(student.joinedAt)}
              </td>
              <td className="px-5 py-4">
                <RemoveStudentButton
                  isLoading={removingStudentId === student.id}
                  onClick={() => onRemoveStudent(student)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
