import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/Logo';

const navLinks = [
  { label: 'Tổng quan', href: '#tong-quan' },
  { label: 'Thống kê', href: '#thong-ke' },
  { label: 'Tính năng', href: '#tinh-nang' },
  { label: 'Bảng điều khiển', href: '#dashboard' },
  { label: 'Phản hồi', href: '#phan-hoi' },
] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-background/80 px-4 py-3 shadow-[0_20px_60px_rgba(7,30,39,0.08)] backdrop-blur-xl md:px-6">
        <Link href="#tong-quan" className="flex items-center gap-3">
          <Logo size="md" />
          <p className="hidden text-xs text-muted-foreground sm:block">
            Nền tảng quản lý học tập hiện đại
          </p>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-4 text-on-surface"
            asChild
          >
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-full px-4 shadow-[0_14px_30px_rgba(0,70,74,0.22)]"
            asChild
          >
            <Link href="/register">Bắt đầu ngay</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
