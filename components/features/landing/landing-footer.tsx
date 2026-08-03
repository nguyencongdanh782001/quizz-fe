import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

const companyLinks = [
  { label: "Giới thiệu", href: "#about" },
  { label: "Kho đề thi", href: "#courses" },
  { label: "Bảng giá", href: "#pricing" },
] as const;

const supportLinks = [
  { label: "Câu hỏi thường gặp", href: "#faqs" },
  { label: "Đăng nhập", href: "/login" },
  { label: "Đăng ký tài khoản", href: "/login" },
] as const;

const socials = [
  { label: "Facebook", href: "https://facebook.com", src: "/images/landing/fb.png" },
  { label: "Instagram", href: "https://instagram.com", src: "/images/landing/ig.png" },
  { label: "TikTok", href: "https://tiktok.com", src: "/images/landing/tik.png" },
  { label: "YouTube", href: "https://youtube.com", src: "/images/landing/ytb.png" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-[#fceddd] bg-[#fff7f0] pb-6 pt-16 text-[#111827]">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="flex flex-col justify-between gap-8 pb-8 lg:flex-row lg:items-center">
          <div className="max-w-lg">
            <Image
              src="/images/landing/logo-quizzvn.png"
              alt="QuizzVN"
              width={240}
              height={60}
              className="h-8 sm:h-9 md:h-10 w-auto object-contain"
            />
            <p className="mt-2 text-sm leading-7 text-[#6b7280]">
              Giải pháp kiểm tra và đánh giá trực tuyến thông minh, hỗ trợ giáo
              viên và học sinh Việt Nam học tập hiệu quả hơn.
            </p>
          </div>
          <div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="landing-newsletter" className="sr-only">
                Email nhận bản tin
              </label>
              <input
                id="landing-newsletter"
                type="email"
                placeholder="Nhập email của bạn"
                className="h-12 w-full rounded-lg border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] outline-none focus:border-[#e55a3b] sm:w-80"
              />
              <button
                type="button"
                className="h-12 rounded-lg bg-[#e55a3b] px-7 text-sm font-bold text-white transition-colors hover:bg-[#d4492a]"
              >
                Đăng ký
              </button>
            </div>
            <p className="mt-2 text-xs text-[#6b7280]">
              Nhận tin tức và cập nhật mới từ QuizzVN.
            </p>
          </div>
        </div>

        <div className="grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-extrabold">Liên hệ</h3>
            <div className="mt-4 space-y-3 text-sm text-[#6b7280]">
              <a
                href="mailto:support@quizzvn.vn"
                className="flex items-center gap-2 hover:text-[#e55a3b]"
              >
                <Mail className="h-4 w-4" /> support@quizzvn.vn
              </a>
              <a
                href="tel:19001234"
                className="flex items-center gap-2 hover:text-[#e55a3b]"
              >
                <Phone className="h-4 w-4" /> 1900 1234
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold">QuizzVN</h3>
            <div className="mt-4 space-y-3">
              {companyLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-sm text-[#6b7280] hover:text-[#e55a3b]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold">Hỗ trợ</h3>
            <div className="mt-4 space-y-3">
              {supportLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-sm text-[#6b7280] hover:text-[#e55a3b]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold">Theo dõi chúng tôi</h3>
            <div className="mt-4 flex items-center gap-3">
              {socials.map(({ label, href, src }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition-transform hover:scale-110"
                >
                  <Image
                    src={src}
                    alt={label}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 rounded-xl bg-[#111827] px-6 py-5 text-xs text-slate-300 sm:flex-row">
          <p>© {new Date().getFullYear()} QuizzVN. Mọi quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white">
              Điều khoản sử dụng
            </Link>
            <Link href="#" className="hover:text-white">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
