"use client";

import { Bell, Search } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title, className }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 glass flex items-center justify-between",
        "border-b border-outline/15",
        "px-6 py-4",
        className,
      )}
      style={{ background: "rgba(243, 250, 255, 1)" }}
    >
      <div>
        {title && (
          <h1 className="font-display text-xl font-bold text-on-surface">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="cursor-pointer p-2 rounded-xl hover:bg-surface-container-low transition-colors">
          <Search className="w-5 h-5 text-on-surface-variant" />
        </button>
        <button className="cursor-pointer p-2 rounded-xl hover:bg-surface-container-low transition-colors relative">
          <Bell className="w-5 h-5 text-on-surface-variant" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tertiary" />
        </button>
        <button className="cursor-pointer flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-xl hover:bg-surface-container-low transition-colors">
          <UserAvatar
            avatarUrl={user?.avatar_url}
            fullName={user?.full_name}
            avatarCacheKey={user?.updated_at}
            className="h-8 w-8"
            fallbackClassName="text-sm"
          />
          <span className="text-sm font-medium text-on-surface">
            {user?.full_name ?? "User"}
          </span>
        </button>
      </div>
    </header>
  );
}
