import { Mail } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import type { ClassStudent } from "@/types/class.types";
import { formatDate } from "../utils";
import { RemoveStudentButton } from "./remove-student-button";

export function StudentTable({
  students,
  isRemovingStudent,
  onRemoveStudent,
}: {
  students: ClassStudent[];
  isRemovingStudent: boolean;
  onRemoveStudent: (student: ClassStudent) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(7,30,39,0.05)]">
      <table className="min-w-[720px] w-full">
        <thead>
          <tr className="border-b border-outline/10">
            {["Học sinh", "Email / Mã học sinh", "Ngày tham gia", "Hành động"].map(
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
                  <UserAvatar
                    avatarUrl={student.avatarUrl}
                    fullName={student.name}
                    className="h-9 w-9"
                    fallbackClassName="text-sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-on-surface">
                      {student.name}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-muted-foreground">
                <div className="space-y-1">
                  {student.email ? (
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      {student.email}
                    </span>
                  ) : (
                    <span>Chưa có email</span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Mã học sinh: {student.studentCode}
                  </p>
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-muted-foreground">
                {formatDate(student.joinedAt)}
              </td>
              <td className="px-5 py-4">
                <RemoveStudentButton
                  disabled={isRemovingStudent}
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
