"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  Home,
  Library,
  GraduationCap,
  History,
  FileCheck,
  Users,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";

const studentNav = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/exams", label: "Đề thi", icon: BookOpen },
  { href: "/classes", label: "Lớp học", icon: GraduationCap },
  { href: "/history", label: "Lịch sử", icon: History },
  { href: "/documents", label: "Tài liệu", icon: Library },
];

const teacherNav = [
  { href: "/", label: "Tổng quan", icon: Home },
  { href: "/teacher/classes", label: "Quản lý lớp", icon: Users },
  { href: "/teacher/exams", label: "Quản lý bài thi", icon: FileCheck },
  { href: "/teacher/documents", label: "Tài liệu", icon: FileText },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  const navItems = role === "teacher" ? teacherNav : studentNav;

  return (
    <aside
      className={cn(
        "glass flex flex-col h-full",
        "border-r border-outline/15",
        "transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          collapsed ? "justify-center" : "px-5",
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm">SC</span>
        </div>
        {!collapsed && <Logo />}
      </div>

      {!collapsed && role && (
        <div className={cn("mx-4 mt-3", collapsed && "hidden")}>
          <span
            className={cn(
              "inline-block px-3 py-1 rounded-full text-xs font-medium",
              role === "teacher"
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-primary-container text-on-primary-container",
            )}
          >
            {role === "teacher" ? "Giáo viên" : "Học sinh"}
          </span>
        </div>
      )}

      <nav className="flex-1 mt-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "text-sm font-medium transition-all duration-200",
                collapsed && "justify-center",
                isActive
                  ? "bg-primary text-white"
                  : "text-on-surface hover:bg-surface-container-low",
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && isActive && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-outline/15">
        <button
          onClick={logout}
          className={cn(
            "cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl",
            "text-sm font-medium text-on-surface-variant",
            "hover:bg-surface-container-low transition-all duration-200",
            collapsed && "justify-center w-full",
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && "Đăng xuất"}
        </button>
      </div>
    </aside>
  );
}
