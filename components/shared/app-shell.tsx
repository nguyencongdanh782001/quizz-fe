"use client";

import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
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
  Menu,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BREADCRUMB_LOADING_LABEL,
  getBreadcrumbLabelOverride,
  isDynamicBreadcrumbSegment,
  useBreadcrumbLabelStoreVersion,
} from "./breadcrumb-labels";

type AppRole = "teacher" | "student";

interface AppShellProps {
  role: AppRole;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const teacherNav: NavItem[] = [
  {
    href: "/teacher",
    label: "Tổng quan",
    description: "Theo dõi lớp học, đề thi và tài liệu",
    icon: Home,
  },
  {
    href: "/teacher/classes",
    label: "Lớp học",
    description: "Quản lý học sinh và mã tham gia",
    icon: Users,
  },
  {
    href: "/teacher/exams",
    label: "Bài thi",
    description: "Tạo, chỉnh sửa và xuất bản đề thi",
    icon: FileCheck,
  },
  {
    href: "/teacher/documents",
    label: "Tài liệu",
    description: "Chia sẻ học liệu trong hệ thống",
    icon: FileText,
  },
  {
    href: "/teacher/profile",
    label: "Hồ sơ",
    description: "Thông tin tài khoản và cài đặt",
    icon: UserRound,
  },
] as const;

const studentNav: NavItem[] = [
  {
    href: "/student",
    label: "Trang chủ",
    description: "Nắm bắt đề thi, lớp học và tài liệu",
    icon: Home,
  },
  {
    href: "/student/exams",
    label: "Đề thi",
    description: "Khám phá và làm bài thi trực tuyến",
    icon: BookOpen,
  },
  {
    href: "/student/classes",
    label: "Lớp học",
    description: "Theo dõi lớp học và mã tham gia",
    icon: GraduationCap,
  },
  {
    href: "/student/results",
    label: "Kết quả",
    description: "Xem lịch sử làm bài và điểm số",
    icon: History,
  },
  {
    href: "/student/materials",
    label: "Tài liệu",
    description: "Truy cập thư viện tài liệu học tập",
    icon: Library,
  },
  {
    href: "/student/profile",
    label: "Hồ sơ",
    description: "Thông tin tài khoản và cài đặt",
    icon: UserRound,
  },
] as const;

const routeLabelMap: Record<string, string> = {
  teacher: "Giáo viên",
  student: "Học sinh",
  classes: "Lớp học",
  exams: "Bài thi",
  documents: "Tài liệu",
  materials: "Tài liệu",
  profile: "Hồ sơ",
  create: "Tạo mới",
  results: "Kết quả",
  exam: "Bài thi",
  result: "Kết quả",
  take: "Làm bài",
};

// const notificationCopy: Record<AppRole, string[]> = {
//   teacher: [
//     "3 lớp học vừa có học sinh nộp bài mới.",
//     "2 tài liệu đang chờ xuất bản cho hệ thống.",
//     "Báo cáo tiến độ tuần này đã sẵn sàng.",
//   ],
//   student: [
//     "Có 4 đề thi mới phù hợp với lớp học của bạn.",
//     "Giáo viên vừa chia sẻ thêm tài liệu mới.",
//     "Kết quả bài thi gần nhất đã được cập nhật.",
//   ],
// };

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  let href = "";

  return segments.map((segment, index) => {
    href += `/${segment}`;
    const overrideLabel = getBreadcrumbLabelOverride(href);

    return {
      href,
      label:
        overrideLabel ??
        routeLabelMap[segment] ??
        (isDynamicBreadcrumbSegment(segment)
          ? BREADCRUMB_LOADING_LABEL
          : decodeURIComponent(segment)),
      isCurrent: index === segments.length - 1,
    };
  });
}

function isActivePath(pathname: string, href: string) {
  return pathname === href;
}

function BrandMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-[1.35rem] bg-linear-to-br from-primary to-tertiary text-sm font-bold text-primary-foreground shadow-[0_18px_36px_-18px_rgba(79,70,229,0.58)]">
      SC
    </div>
  );
}

export function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();
  useBreadcrumbLabelStoreVersion();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = role === "teacher" ? teacherNav : studentNav;
  const roleTitle =
    role === "teacher" ? "Không gian giáo viên" : "Không gian học sinh";
  const roleDescription =
    role === "teacher"
      ? "Điều hành lớp học, bài thi và học liệu trong một giao diện thống nhất."
      : "Theo dõi tiến độ học tập, lớp học và tài liệu từ một bảng điều khiển rõ ràng.";

  const breadcrumbs = buildBreadcrumbs(pathname);
  const currentLabel = breadcrumbs[breadcrumbs.length - 1]?.label ?? roleTitle;
  const userName = user?.full_name?.trim() || "Người dùng";

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#f7f8ff_0%,#f4f7ff_38%,#eef7ff_100%)]">
      <div className="app-grid pointer-events-none absolute inset-0 opacity-45" />
      <div className="app-glow -left-32 top-24 h-72 w-72 bg-primary/12" />
      <div className="app-glow -right-28 top-112 h-72 w-72 bg-secondary/16" />
      <div className="app-glow bottom-12 left-1/2 h-56 w-56 -translate-x-1/2 bg-tertiary/12" />

      <div className="relative mx-auto flex min-h-screen max-w-430 gap-4 px-3 py-3 sm:px-4 lg:gap-6 lg:px-6 lg:py-5">
        <aside className="hidden lg:block lg:w-75 lg:shrink-0">
          <div className="sticky top-5">
            <SidebarContent
              role={role}
              currentPath={pathname}
              navItems={navItems}
              userName={userName}
              userFullName={user?.full_name}
              userAvatarUrl={user?.avatar_url}
              roleTitle={roleTitle}
              roleDescription={roleDescription}
              onNavigate={() => undefined}
              onLogout={logout}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="surface-panel sticky top-3 z-40 rounded-[1.7rem] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Mở điều hướng"
              >
                <Menu className="h-4 w-4" />
              </Button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {breadcrumbs.map((item, index) => (
                    <div key={item.href} className="flex items-center gap-2">
                      {index > 0 ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                      ) : null}
                      {item.isCurrent ? (
                        <span className="text-on-surface">{item.label}</span>
                      ) : (
                        <Link
                          href={item.href}
                          className="transition-colors hover:text-on-surface"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <p className="font-display text-lg font-semibold text-on-surface">
                    {currentLabel}
                  </p>
                  <span className="hidden rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary sm:inline-flex">
                    {role === "teacher" ? "Điều phối" : "Học tập"}
                  </span>
                </div>
              </div>

              {/* <div className="hidden min-w-0 max-w-md flex-1 xl:block">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-label="Tìm kiếm nhanh"
                    placeholder="Tìm kiếm nhanh lớp học, bài thi, tài liệu..."
                    className="h-11 rounded-2xl border-white/70 bg-white/72 pl-10"
                  />
                </div>
              </div> */}

              <div className="flex items-center gap-2">
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="relative rounded-2xl"
                      aria-label="Thông báo"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-tertiary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="px-3 py-2">
                      <p className="font-display text-base font-semibold text-on-surface">
                        Cập nhật mới
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Những thay đổi quan trọng gần đây trong hệ thống.
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {notificationCopy[role].map((item) => (
                      <DropdownMenuItem
                        key={item}
                        className="items-start gap-3"
                      >
                        <span className="mt-0.5 rounded-full bg-primary/12 p-2 text-primary">
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                        <span className="whitespace-normal text-sm leading-6">
                          {item}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu> */}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-3 rounded-[1.15rem] px-2 py-1.5 transition-colors hover:bg-white/60">
                      <UserAvatar
                        avatarUrl={user?.avatar_url}
                        fullName={user?.full_name}
                        className="size-10 shadow-[0_14px_28px_-18px_rgba(79,70,229,0.55)]"
                        fallbackClassName="text-sm"
                      />
                      <div className="hidden text-left sm:block">
                        <p className="text-sm font-semibold text-on-surface">
                          {userName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {role === "teacher" ? "Giáo viên" : "Học sinh"}
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="px-3 py-2">
                      <p className="font-medium text-on-surface">{userName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {user?.email || "Tài khoản đang hoạt động"}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          role === "teacher"
                            ? "/teacher/profile"
                            : "/student/profile"
                        }
                      >
                        <UserRound className="h-4 w-4" />
                        Hồ sơ tài khoản
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={logout}>
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="min-w-0 pb-8 pt-4 lg:pt-5">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-[92vw] max-w-85 p-3 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="relative h-full">
                <SidebarContent
                  role={role}
                  currentPath={pathname}
                  navItems={navItems}
                  userName={userName}
                  userFullName={user?.full_name}
                  userAvatarUrl={user?.avatar_url}
                  roleTitle={roleTitle}
                  roleDescription={roleDescription}
                  onNavigate={() => setMobileOpen(false)}
                  onLogout={logout}
                  mobileCloseButton={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-4"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Đóng điều hướng"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({
  role,
  currentPath,
  navItems,
  userName,
  userFullName,
  userAvatarUrl,
  roleTitle,
  roleDescription,
  onNavigate,
  onLogout,
  mobileCloseButton,
}: {
  role: AppRole;
  currentPath: string;
  navItems: NavItem[];
  userName: string;
  userFullName?: string | null;
  userAvatarUrl?: string | null;
  roleTitle: string;
  roleDescription: string;
  onNavigate: () => void;
  onLogout: () => void;
  mobileCloseButton?: React.ReactNode;
}) {
  return (
    <div className="surface-panel relative flex h-[calc(100vh-1.5rem)] flex-col rounded-[2rem] px-4 py-5">
      {mobileCloseButton}
      <div className="flex items-center gap-3 px-2">
        <BrandMark />
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-on-surface">
            {APP_NAME}
          </p>
          <p className="text-xs text-muted-foreground">
            Nền tảng giáo dục số hiện đại
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.7rem] border border-white/70 bg-linear-to-br from-primary/10 via-white/80 to-secondary/10 p-4 shadow-[0_22px_60px_-44px_rgba(79,70,229,0.42)]">
        <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
          {role === "teacher" ? "Giáo viên" : "Học sinh"}
        </span>
        <h2 className="mt-3 font-display text-xl font-semibold text-on-surface">
          {roleTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {roleDescription}
        </p>
      </div>

      <nav className="mt-6 flex-1 space-y-2 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const active = isActivePath(currentPath, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-start gap-3 rounded-[1.35rem] border px-3.5 py-3 transition-all",
                active
                  ? "border-primary/15 bg-linear-to-r from-primary to-tertiary text-primary-foreground shadow-[0_20px_38px_-20px_rgba(79,70,229,0.55)]"
                  : "border-transparent bg-white/45 text-on-surface hover:border-white/70 hover:bg-white/70",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex rounded-2xl p-2.5 transition-colors",
                  active
                    ? "bg-white/16 text-white"
                    : "bg-primary/10 text-primary group-hover:bg-primary/12",
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-xs leading-5",
                    active ? "text-white/80" : "text-muted-foreground",
                  )}
                >
                  {item.description}
                </span>
              </span>
              <ChevronRight
                className={cn(
                  "mt-2 h-4 w-4 shrink-0 transition-transform",
                  active
                    ? "text-white/85"
                    : "text-muted-foreground group-hover:translate-x-0.5",
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-[1.6rem] border border-white/70 bg-white/72 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)]">
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={userAvatarUrl}
            fullName={userFullName}
            className="size-11"
            fallbackClassName="text-sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-on-surface">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground">
              {role === "teacher" ? "Quản lý giảng dạy" : "Hồ sơ học tập"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="mt-4 h-11 w-full justify-start rounded-2xl"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
