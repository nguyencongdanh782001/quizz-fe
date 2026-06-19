import Link from 'next/link';
import { Globe, Mail, MessageCircle, Phone, Play, Radio } from 'lucide-react';

const footerGroups = {
  sanPham: [
    { label: 'Tổng quan', href: '#tong-quan' },
    { label: 'Tính năng', href: '#tinh-nang' },
    { label: 'Bảng điều khiển', href: '#dashboard' },
    { label: 'Phản hồi', href: '#phan-hoi' },
  ],
  truyCap: [
    { label: 'Đăng ký', href: '/register' },
    { label: 'Đăng nhập', href: '/login' },
    { label: 'Vai trò người dùng', href: '/select-role' },
  ],
  hoTro: [
    { label: 'Điều khoản sử dụng', href: '#' },
    { label: 'Chính sách bảo mật', href: '#' },
    { label: 'Trung tâm trợ giúp', href: '#' },
  ],
} as const;

const socials = [
  { label: 'Trang thông tin', href: '#', icon: Globe },
  { label: 'Kênh video', href: '#', icon: Play },
  { label: 'Hỗ trợ chat', href: '#', icon: MessageCircle },
  { label: 'Bản tin', href: '#', icon: Radio },
] as const;

export function LandingFooter() {
  return (
    <footer className="relative z-10 mt-10 bg-on-surface px-4 pb-8 pt-16 text-surface sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.1fr_0.9fr_0.8fr_0.8fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold text-white">
                SC
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-white">
                  Scholar Clarity
                </p>
                <p className="text-sm text-white/55">
                  Nền tảng học tập và quản lý lớp học hiện đại
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-7 text-white/65">
              Kết nối bài thi, lớp học, tài liệu và phân tích học tập trong
              một trải nghiệm nhất quán để giáo viên và học sinh cùng tiến bộ.
            </p>

            <div className="space-y-3 text-sm text-white/70">
              <a href="mailto:support@scholarclarity.vn" className="flex items-center gap-3 hover:text-white">
                <Mail className="h-4 w-4" />
                <span>support@scholarclarity.vn</span>
              </a>
              <a href="tel:19001234" className="flex items-center gap-3 hover:text-white">
                <Phone className="h-4 w-4" />
                <span>1900 1234</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
              Sản phẩm
            </h3>
            <div className="mt-4 space-y-3">
              {footerGroups.sanPham.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/65 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
              Truy cập
            </h3>
            <div className="mt-4 space-y-3">
              {footerGroups.truyCap.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/65 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
              Hỗ trợ
            </h3>
            <div className="mt-4 space-y-3">
              {footerGroups.hoTro.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/65 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Scholar Clarity. Mọi quyền được bảo lưu.</p>
          <p>Thiết kế lại để mang lại trải nghiệm giáo dục số hiện đại, rõ ràng và giàu dữ liệu hơn.</p>
        </div>
      </div>
    </footer>
  );
}
