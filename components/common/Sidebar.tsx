"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  ChevronRight,
  FileCheck,
  FileText,
  GraduationCap,
  History,
  Home,
  Library,
  LogOut,
  Users,
} from "lucide-react";

const studentNav = [
  { href: "/", label: "Trang chu", icon: Home },
  { href: "/exams", label: "De thi", icon: BookOpen },
  { href: "/classes", label: "Lop hoc", icon: GraduationCap },
  { href: "/history", label: "Lich su", icon: History },
  { href: "/documents", label: "Tai lieu", icon: Library },
];

const teacherNav = [
  { href: "/", label: "Tong quan", icon: Home },
  { href: "/teacher/classes", label: "Quan ly lop", icon: Users },
  { href: "/teacher/exams", label: "Quan ly bai thi", icon: FileCheck },
  { href: "/teacher/documents", label: "Tai lieu", icon: FileText },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { role_name, logout } = useAuth();

  const navItems = role_name === "teacher" ? teacherNav : studentNav;

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
          "flex items-center gap-3 pt-4",
          collapsed ? "justify-center px-4" : "px-5",
        )}
      >
        <Logo size="md" showText={!collapsed} />
      </div>

      {!collapsed && role_name && (
        <div className={cn("mx-4 mt-3", collapsed && "hidden")}>
          <span
            className={cn(
              "inline-block px-3 py-1 rounded-full text-xs font-medium",
              role_name === "teacher"
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-primary-container text-on-primary-container",
            )}
          >
            {role_name === "teacher" ? "Giao vien" : "Hoc sinh"}
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
          {!collapsed && "Dang xuat"}
        </button>
      </div>
    </aside>
  );
}
