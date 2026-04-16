import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">SC</span>
          </div>
          <span className="font-display font-semibold text-on-surface">Scholar Clarity</span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {['Tính năng', 'Đề thi', 'Giáo viên', 'Học sinh'].map(item => (
            <Link
              key={item}
              href="#"
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Đăng nhập</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Bắt đầu ngay</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
