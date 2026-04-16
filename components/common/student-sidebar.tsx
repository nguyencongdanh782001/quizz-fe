'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen, Home, Library, GraduationCap, History, LogOut, ChevronRight
} from 'lucide-react';

const studentNav = [
  { href: '/student', label: 'Trang chủ', icon: Home },
  { href: '/student/exams', label: 'Đề thi', icon: BookOpen },
  { href: '/student/classes', label: 'Lớp học', icon: GraduationCap },
  { href: '/student/results', label: 'Kết quả', icon: History },
  { href: '/student/materials', label: 'Tài liệu', icon: Library },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className={cn('glass flex flex-col h-full border-r border-outline/15 w-60')}>
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm">SC</span>
        </div>
        <Logo />
      </div>

      <div className="mx-4 mt-1">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-container text-on-primary-container">
          Học sinh
        </span>
      </div>

      <nav className="flex-1 mt-5 px-3 space-y-1">
        {studentNav.map(item => {
          const isActive = pathname === item.href || (item.href !== '/student' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-on-surface hover:bg-surface-container-low'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-outline/15">
        <div className="flex items-center gap-2.5 px-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">
              {user?.name?.charAt(0) ?? 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-on-surface">{user?.name ?? 'User'}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}