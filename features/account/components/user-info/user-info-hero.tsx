import { cn } from "@/lib/utils";
import type { UserInfoRoleContent } from "./types";

interface UserInfoHeroProps {
  content: UserInfoRoleContent;
  displayName: string;
  displayEmail: string;
}

export function UserInfoHero({
  content,
  displayName,
  displayEmail,
}: UserInfoHeroProps) {
  const RoleIcon = content.icon;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] p-6 shadow-[0_12px_42px_rgba(7,30,39,0.14)] sm:p-8",
        content.heroClassName,
      )}
    >
      <div className="absolute right-0 top-0 h-40 w-40 -translate-y-8 translate-x-10 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 -translate-x-6 translate-y-6 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl",
              content.iconWrapClassName,
            )}
          >
            <RoleIcon className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                content.badgeClassName,
              )}
            >
              {content.badgeLabel}
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {content.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                {content.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-white/65">
            Đang đăng nhập với
          </p>
          <p className="mt-1 text-lg font-semibold text-white">{displayName}</p>
          <p className="text-sm text-white/75">{displayEmail}</p>
        </div>
      </div>
    </section>
  );
}
