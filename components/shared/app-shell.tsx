"use client";

import { Logo } from "@/components/common/Logo";
import { UserAvatar } from "@/components/common/user-avatar";
import { LoginSuccessToast } from "@/components/shared/login-success-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/queries/useNotifications";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  FileCheck,
  FilePlus2,
  Files,
  FolderOpen,
  GraduationCap,
  History,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Search,
  Settings,
  Trash2,
  UserRound,
  UsersRound,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type AppRole = "teacher" | "student";

interface AppShellProps {
  role: AppRole;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: (pathname: string) => boolean;
}

interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const teacherSections: NavSection[] = [
  {
    id: "teacher-learning",
    label: "Lớp học tập",
    icon: GraduationCap,
    items: [
      {
        href: "/teacher/students",
        label: "Học sinh",
        icon: UsersRound,
      },
      {
        href: "/teacher/assignments",
        label: "Giao đề thi",
        icon: ClipboardList,
      },
      {
        href: "/teacher/classes",
        label: "Lớp học",
        icon: BookOpen,
      },
    ],
  },
  {
    id: "teacher-exams",
    label: "Đề thi",
    icon: FileCheck,
    items: [
      {
        href: "/teacher/exams/create",
        label: "Tạo đề thi mới",
        icon: FilePlus2,
        isActive: (pathname) =>
          pathname === "/teacher/exams/create" ||
          pathname.startsWith("/teacher/ai-exams"),
      },
      {
        href: "/teacher/exams",
        label: "Quản lý đề thi",
        icon: Files,
        isActive: (pathname) =>
          pathname === "/teacher/exams" ||
          pathname.startsWith("/teacher/exams/edit"),
      },
      {
        href: "/teacher/library",
        label: "Kho học liệu",
        icon: Library,
        isActive: (pathname) =>
          pathname === "/teacher/library" ||
          pathname.startsWith("/teacher/documents"),
      },
    ],
  },
  {
    id: "teacher-system",
    label: "Hệ thống",
    icon: Settings,
    items: [
      {
        href: "/teacher/billing",
        label: "Gói dịch vụ",
        icon: WalletCards,
      },
      {
        href: "/teacher/profile",
        label: "Cài đặt",
        icon: Settings,
      },
    ],
  },
];

const studentSections: NavSection[] = [
  {
    id: "student-personal",
    label: "Cá nhân",
    icon: CircleUserRound,
    items: [
      {
        href: "/student",
        label: "Tổng quan",
        icon: LayoutDashboard,
        isActive: (pathname) => pathname === "/student",
      },
      {
        href: "/student/library",
        label: "Thư viện của tôi",
        icon: Library,
        isActive: (pathname: string) => pathname.startsWith("/student/library"),
      },
      {
        href: "/student/recent",
        label: "Truy cập gần đây",
        icon: History,
      },
      {
        href: "/student/results",
        label: "Kết quả thi của tôi",
        icon: FileCheck,
      },
    ],
  },
  {
    id: "student-management",
    label: "Quản lý",
    icon: GraduationCap,
    items: [
      {
        href: "/student/classes",
        label: "Lớp học",
        icon: GraduationCap,
      },

      {
        href: "/student/materials",
        label: "Khám phá đề thi",
        icon: FolderOpen,
        isActive: (pathname: string) =>
          pathname.startsWith("/student/materials"),
      },
      {
        href: "/student/profile",
        label: "Cài đặt",
        icon: Settings,
      },
    ],
  },
];

function itemIsActive(item: NavItem, pathname: string) {
  if (item.isActive) return item.isActive(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const sections = role === "teacher" ? teacherSections : studentSections;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (
      pathname.includes("/teacher/exams/edit") ||
      pathname.includes("/teacher/exams/create") ||
      pathname.includes("/teacher/text-exam-create")
    ) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [pathname]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(sections.map((section) => [section.id, true])),
  );

  const userName = user?.full_name?.trim() || "Người dùng";
  const searchDestination =
    role === "teacher" ? "/teacher/exams" : "/student/materials";

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = searchQuery.trim();
    router.push(
      keyword
        ? `${searchDestination}?search=${encodeURIComponent(keyword)}`
        : searchDestination,
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F3F5F9] font-sans text-[#1E293B] antialiased">
      <aside
        className={cn(
          "relative hidden shrink-0 border-r border-[#DDE2EB] bg-white transition-[width] duration-200 lg:block",
          sidebarCollapsed ? "w-[72px]" : "w-[240px] xl:w-[256px]",
        )}
      >
        <div className="sticky top-0 h-screen">
          <SidebarContent
            role={role}
            pathname={pathname}
            sections={sections}
            collapsed={sidebarCollapsed}
            openSections={openSections}
            onToggleSection={(sectionId) =>
              setOpenSections((current) => ({
                ...current,
                [sectionId]: !current[sectionId],
              }))
            }
            onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center gap-3 border-b border-[#DDE2EB] bg-white px-4 shadow-[0_1px_2px_rgba(30,41,59,0.03)] sm:px-6 xl:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-[8px] lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở điều hướng"
          >
            <Menu className="size-5" />
          </Button>

          <form
            onSubmit={submitSearch}
            className="relative min-w-0 flex-1 sm:max-w-[420px]"
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#7C879B]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm đề thi..."
              className="h-11 w-full rounded-[10px] border border-[#DDE2EB] bg-[#F7F8FB] pl-10 pr-4 text-sm text-[#1E293B] outline-none transition-colors placeholder:text-[#7C879B] hover:bg-[#F1F3F8] focus:border-[#7889FA] focus:bg-white"
            />
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <NotificationDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex min-w-0 items-center gap-3 rounded-[10px] border-0 bg-transparent px-2 py-1.5 text-left outline-none transition-colors hover:bg-[#F7F8FB] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 ring-transparent focus:ring-transparent data-[state=open]:outline-none data-[state=open]:ring-0 data-[state=open]:border-0 select-none shadow-none">
                  <UserAvatar
                    avatarUrl={user?.avatar_url}
                    fullName={user?.full_name}
                    avatarCacheKey={user?.updated_at}
                    className="size-10"
                    fallbackClassName="text-xs"
                  />
                  <span className="hidden min-w-0 sm:block">
                    <span className="block max-w-44 truncate text-sm font-bold text-[#1E293B]">
                      {userName}
                    </span>
                    <span className="block text-xs text-[#64748B]">
                      {role === "teacher" ? "Giáo viên" : "Học sinh"}
                    </span>
                  </span>
                  <ChevronDown className="hidden size-4 text-[#64748B] sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 rounded-[10px] border-[#DDE2EB]"
              >
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-[#1E293B]">
                    {userName}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#64748B]">
                    {user?.email}
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
                    <UserRound className="size-4" />
                    Cài đặt tài khoản
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={logout}>
                  <LogOut className="size-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Đóng điều hướng"
              className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] bg-white lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 z-10 rounded-[8px]"
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng điều hướng"
              >
                <X className="size-4" />
              </Button>
              <SidebarContent
                role={role}
                pathname={pathname}
                sections={sections}
                collapsed={false}
                openSections={openSections}
                onToggleSection={(sectionId) =>
                  setOpenSections((current) => ({
                    ...current,
                    [sectionId]: !current[sectionId],
                  }))
                }
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
      <LoginSuccessToast />
    </div>
  );
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "assignment" | "result" | "system" | "class";
  link_to?: string;
}

const READ_NOTIFICATIONS_KEY = "quizzvn_read_notification_ids";
const DELETED_NOTIFICATIONS_KEY = "quizzvn_deleted_notification_ids";

function getStoredReadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function storeReadIds(readIds: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readIds));
  } catch (err) {
    console.error("Failed to save read notifications", err);
  }
}

function getStoredDeletedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_NOTIFICATIONS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function storeDeletedIds(deletedIds: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DELETED_NOTIFICATIONS_KEY, JSON.stringify(deletedIds));
  } catch (err) {
    console.error("Failed to save deleted notifications", err);
  }
}

function NotificationDropdown() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button
        type="button"
        className="relative flex size-9 items-center justify-center rounded-[8px] border-0 bg-transparent text-[#475569] hover:bg-transparent hover:text-[#1E293B] outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 ring-transparent focus:ring-transparent select-none shadow-none"
        aria-label="Thông báo"
      >
        <Bell className="size-5" />
      </button>
    );
  }

  return <MountedNotificationDropdown />;
}

function MountedNotificationDropdown() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    notifications,
    markRead,
    markAllRead,
    deleteNotif,
    deleteAll,
  } = useNotifications();

  // Set up WebSocket connection for real-time notifications
  useEffect(() => {
    if (typeof window === "undefined") return;

    const getWebSocketUrl = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      let wsHost = "localhost:8000";
      try {
        const url = new URL(apiUrl);
        wsHost = url.host;
      } catch {
        if (apiUrl.startsWith("http")) {
          wsHost = apiUrl.replace(/^https?:\/\//, "");
        }
      }
      return `${wsProtocol}//${wsHost}/chat/ws`;
    };

    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWS = () => {
      const wsUrl = getWebSocketUrl();
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "notification_created") {
            // Play sound notification
            try {
              const audio = new Audio("/notification.mp3");
              void audio.play();
            } catch {
              // Ignore audio play errors
            }
            // Invalidate React Query cache to fetch new notifications list
            void queryClient.invalidateQueries({ queryKey: ["notifications"] });
          }
        } catch (err) {
          console.error("Failed to handle WebSocket message", err);
        }
      };

      socket.onclose = () => {
        // Reconnect after 3 seconds
        reconnectTimeout = setTimeout(connectWS, 3000);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connectWS();

    return () => {
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [queryClient]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  const filteredNotifications = useMemo(
    () => notifications.filter((n) => (filter === "unread" ? n.unread : true)),
    [filter, notifications],
  );

  function handleNotificationClick(item: NotificationItem) {
    markRead(item.id);
    if (item.link_to) {
      router.push(item.link_to);
    }
  }

  function handleMarkAllAsRead() {
    markAllRead();
  }

  function handleDeleteAllNotifications() {
    deleteAll();
  }

  function handleDeleteSingleNotification(id: string) {
    deleteNotif(id);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-[8px] border-0 bg-transparent text-[#475569] hover:bg-transparent hover:text-[#1E293B] outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 ring-transparent focus:ring-transparent data-[state=open]:bg-transparent data-[state=open]:outline-none data-[state=open]:ring-0 data-[state=open]:ring-transparent data-[state=open]:border-0 select-none shadow-none"
          aria-label="Thông báo"
        >
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 rounded-[12px] border-[#DDE2EB] p-0 shadow-lg sm:w-96"
      >
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#1E293B]">Thông báo</span>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-bold text-[#4F46E5]">
                {unreadCount} mới
              </span>
            ) : null}
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs font-semibold text-[#4F46E5] transition-colors hover:text-[#3730A3]"
            >
              Đánh dấu đã đọc
            </button>
          ) : notifications.length > 0 ? (
            <button
              type="button"
              onClick={handleDeleteAllNotifications}
              className="flex items-center gap-1 text-xs font-semibold text-[#EF4444] transition-colors hover:text-[#DC2626]"
              title="Xóa tất cả thông báo"
            >
              <Trash2 className="size-3.5" />
              Xóa tất cả
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1 border-b border-[#F1F5F9] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#64748B]">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-[6px] px-2.5 py-1 transition-colors ${
              filter === "all"
                ? "bg-white font-bold text-[#1E293B] shadow-sm"
                : "hover:text-[#1E293B]"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`rounded-[6px] px-2.5 py-1 transition-colors ${
              filter === "unread"
                ? "bg-white font-bold text-[#1E293B] shadow-sm"
                : "hover:text-[#1E293B]"
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-[#F8FAFC] ${
                  item.unread ? "bg-[#EEF2FF]/40" : ""
                }`}
              >
                <div
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                    item.type === "assignment"
                      ? "bg-blue-100 text-blue-600"
                      : item.type === "result"
                        ? "bg-emerald-100 text-emerald-600"
                        : item.type === "system"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {item.type === "assignment" ? (
                    <ClipboardList className="size-4" />
                  ) : item.type === "result" ? (
                    <FileCheck className="size-4" />
                  ) : item.type === "system" ? (
                    <Bell className="size-4" />
                  ) : (
                    <GraduationCap className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-xs ${
                        item.unread
                          ? "font-bold text-[#1E293B]"
                          : "font-semibold text-[#334155]"
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-[#94A3B8]">
                      {item.time}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-[#64748B]">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSingleNotification(item.id);
                  }}
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[4px] text-[#94A3B8] opacity-60 transition-all hover:bg-rose-50 hover:text-[#EF4444] group-hover:opacity-100"
                  title="Xóa thông báo"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-[#94A3B8]">
              Không có thông báo nào.
            </div>
          )}
        </div>

        <div className="border-t border-[#E2E8F0] p-2 text-center">
          <button
            type="button"
            className="w-full rounded-[6px] py-1.5 text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF2FF]"
          >
            Xem tất cả thông báo
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarContent({
  role,
  pathname,
  sections,
  collapsed,
  openSections,
  onToggleSection,
  onToggleCollapse,
  onNavigate,
}: {
  role: AppRole;
  pathname: string;
  sections: NavSection[];
  collapsed: boolean;
  openSections: Record<string, boolean>;
  onToggleSection: (sectionId: string) => void;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  const homeHref = role === "teacher" ? "/teacher/assignments" : "/student";
  const activeSectionIds = useMemo(
    () =>
      new Set(
        sections
          .filter((section) =>
            section.items.some((item) => itemIsActive(item, pathname)),
          )
          .map((section) => section.id),
      ),
    [pathname, sections],
  );

  return (
    <div className="relative flex h-full flex-col bg-white">
      <div
        className={cn(
          "flex h-[72px] shrink-0 items-center bg-[#F7F7F8]",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <Link
          href={homeHref}
          className="inline-flex min-w-0 items-center"
          aria-label="QuizzVN"
        >
          {collapsed ? (
            <Logo
              size="sm"
              showText={false}
              className="max-w-10 overflow-hidden"
            />
          ) : (
            <Logo size="lg" showText={false} className="max-w-[220px]" />
          )}
        </Link>
      </div>

      {onToggleCollapse ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute -right-4 top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#DDE2EB] bg-white text-[#64748B] shadow-sm transition-colors hover:bg-[#F7F8FB] hover:text-[#1E293B]"
          aria-label={
            collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"
          }
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      ) : null}

      <nav
        className={cn(
          "flex-1 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          collapsed ? "overflow-visible px-3 pt-3" : "overflow-y-auto",
        )}
      >
        <div className="space-y-2">
          {sections.map((section) => {
            const expanded = openSections[section.id] ?? true;
            const sectionActive = activeSectionIds.has(section.id);

            if (collapsed) {
              return (
                <DropdownMenu key={section.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex h-11 w-full items-center justify-center rounded-[10px] transition-colors",
                        sectionActive
                          ? "bg-[#EEF2FF] text-[#4F46E5]"
                          : "text-[#475569] hover:bg-[#F7F8FB]",
                      )}
                      aria-label={section.label}
                    >
                      <section.icon className="size-[18px]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="ml-1 w-56 rounded-[10px] border-[#DDE2EB] p-2"
                  >
                    <DropdownMenuLabel className="text-xs text-[#7C879B]">
                      {section.label}
                    </DropdownMenuLabel>
                    {section.items.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="gap-3 text-sm">
                          <item.icon className="size-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <div key={section.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => onToggleSection(section.id)}
                  className="flex h-10 w-full items-center justify-between bg-[#F7F7F8] px-4 text-left text-[#1E293B] transition-colors hover:bg-[#EDEFF3]"
                >
                  <span className="flex min-w-0 items-center gap-2.5 text-xs font-bold">
                    <section.icon className="size-4 shrink-0 text-[#334155]" />
                    <span className="truncate">{section.label}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 shrink-0 text-[#64748B] transition-transform",
                      !expanded && "-rotate-90",
                    )}
                  />
                </button>

                {expanded ? (
                  <div className="space-y-0.5 px-2">
                    {section.items.map((item) => {
                      const active = itemIsActive(item, pathname);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "group flex h-10 w-full items-center gap-2.5 rounded-[8px] px-3 pl-8 text-xs font-medium transition-colors",
                            active
                              ? "bg-[#EEF2FF] font-semibold text-[#4F46E5]"
                              : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B]",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "size-4 shrink-0 transition-colors",
                              active
                                ? "text-[#4F46E5]"
                                : "text-[#64748B] group-hover:text-[#4F46E5]",
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>

      {!collapsed ? (
        <div className="flex h-14 shrink-0 items-center justify-center border-t border-[#DDE2EB] px-2 text-xs font-medium text-[#7C879B]">
          © QuizzVN {new Date().getFullYear()}
        </div>
      ) : null}
    </div>
  );
}
