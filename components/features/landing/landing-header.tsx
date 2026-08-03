"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Trang chủ", href: "#hero" },
  { label: "Giới thiệu", href: "#about" },
  { label: "Kho đề thi", href: "#courses" },
  { label: "Hỏi đáp", href: "#faqs" },
  { label: "Bảng giá", href: "#pricing" },
] as const;

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-[#e5e7eb] bg-white/95 shadow-[0_10px_30px_rgba(17,24,39,0.06)] backdrop-blur-md"
          : "border-[#eadfd7] bg-white/90 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 md:px-8">
        <Link
          href="#hero"
          aria-label="QuizzVN - Trang chủ"
          className="shrink-0 flex items-center"
        >
          <Image
            src="/images/landing/logo-quizzvn.png"
            alt="QuizzVN"
            width={200}
            height={50}
            priority
            className="h-8 w-auto sm:h-9 md:h-10 object-contain transition-transform hover:scale-[1.02]"
          />
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Điều hướng chính"
        >
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-[#6b7280] transition-colors hover:text-[#e55a3b]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#e55a3b] px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d4492a]"
          >
            Bắt đầu ngay
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center text-[#111827] lg:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          className="border-t border-[#eee5df] bg-white px-5 py-3 lg:hidden"
          aria-label="Điều hướng di động"
        >
          <div className="mx-auto grid max-w-[1280px] gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="px-2 py-3 text-sm font-semibold text-[#4b5563] hover:text-[#e55a3b]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
