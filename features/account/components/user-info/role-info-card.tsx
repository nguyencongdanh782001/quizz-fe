import { Briefcase, GraduationCap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserInfoRole, UserInfoRoleContent } from "./types";

interface BaseRoleInfoCardProps {
  content: UserInfoRoleContent;
  icon: LucideIcon;
}

function RoleInfoCardFrame({ content, icon: Icon }: BaseRoleInfoCardProps) {
  return (
    <div className="rounded-2xl border border-outline/10 bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Vai trò hiện tại
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            content.accentClassName,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold text-on-surface">{content.badgeLabel}</p>
          <p className="text-sm text-muted-foreground">{content.roleLabel}</p>
        </div>
      </div>
    </div>
  );
}

export function StudentRoleInfoCard({
  content,
}: Pick<BaseRoleInfoCardProps, "content">) {
  return <RoleInfoCardFrame content={content} icon={GraduationCap} />;
}

export function TeacherRoleInfoCard({
  content,
}: Pick<BaseRoleInfoCardProps, "content">) {
  return <RoleInfoCardFrame content={content} icon={Briefcase} />;
}

interface RoleInfoCardProps {
  role: UserInfoRole;
  content: UserInfoRoleContent;
}

export function RoleInfoCard({ role, content }: RoleInfoCardProps) {
  if (role === "teacher") {
    return <TeacherRoleInfoCard content={content} />;
  }

  return <StudentRoleInfoCard content={content} />;
}
