"use client";

import { KeyRound, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ProfileTab = "account" | "password";

export function ProfileWorkspace({
  account,
  password,
}: {
  account: ReactNode;
  password: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#1E293B]">Cài đặt tài khoản</h1>
        <p className="mt-1 text-xs text-[#64748B]">Quản lý thông tin cá nhân và bảo mật tài khoản.</p>
      </div>

      <div className="grid items-start gap-4 md:grid-cols-4">
        <aside className="space-y-1 rounded-[10px] border border-[#ECECEC] bg-white p-1.5 shadow-sm md:col-span-1">
          <SideTab
            active={activeTab === "account"}
            icon={UserRound}
            label="Thông tin tài khoản"
            onClick={() => setActiveTab("account")}
          />
          <SideTab
            active={activeTab === "password"}
            icon={KeyRound}
            label="Mật khẩu"
            onClick={() => setActiveTab("password")}
          />
        </aside>

        <main className="min-w-0 md:col-span-3">
          {activeTab === "account" ? account : password}
        </main>
      </div>
    </div>
  );
}

function SideTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof UserRound;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-[8px] px-3 text-left text-xs font-semibold transition-colors",
        active
          ? "bg-[#EEF2FF] text-[#4F46E5]"
          : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]",
      )}
    >
      <span className={cn("flex size-6 items-center justify-center rounded-[6px]", active && "bg-white/70")}>
        <Icon className="size-4" />
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}
