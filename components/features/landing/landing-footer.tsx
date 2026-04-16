import Link from 'next/link';

const footerLinks = {
  product: [
    { label: 'Tính năng', href: '#' },
    { label: 'Đề thi', href: '#' },
    { label: 'Bảng giá', href: '#' },
    { label: 'Cập nhật', href: '#' },
  ],
  teachers: [
    { label: 'Tạo bài thi', href: '/teacher/exams/create' },
    { label: 'Quản lý lớp', href: '/teacher/classes' },
    { label: 'Tài liệu', href: '/teacher/documents' },
    { label: 'Hướng dẫn', href: '#' },
  ],
  students: [
    { label: 'Làm bài thi', href: '/exams' },
    { label: 'Lớp học', href: '/classes' },
    { label: 'Tài liệu', href: '/documents' },
    { label: 'Lịch sử', href: '/history' },
  ],
  legal: [
    { label: 'Điều khoản sử dụng', href: '#' },
    { label: 'Chính sách bảo mật', href: '#' },
    { label: 'Liên hệ', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-on-surface text-surface pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">SC</span>
              </div>
              <span className="font-display font-semibold text-white">Scholar Clarity</span>
            </div>
            <p className="text-sm text-surface/60 leading-relaxed max-w-xs">
              Nền tảng thi trực tuyến hàng đầu Việt Nam, kết nối giáo viên và học sinh.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Sản phẩm</h4>
            <ul className="space-y-2">
              {footerLinks.product.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-surface/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Giáo viên</h4>
            <ul className="space-y-2">
              {footerLinks.teachers.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-surface/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Học sinh</h4>
            <ul className="space-y-2">
              {footerLinks.students.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-surface/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface/40">
            © {new Date().getFullYear()} Scholar Clarity. Mọi quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-4">
            {footerLinks.legal.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-surface/40 hover:text-surface/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
