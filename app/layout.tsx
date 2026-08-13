import type { Metadata } from "next";
import { Manrope, Public_Sans } from "next/font/google";
import { AppProviders } from "./providers";
import "katex/dist/katex.min.css";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuizzVn — Hệ thống đánh giá & thi trắc nghiệm online",
  description: "Hệ thống đánh giá & thi trắc nghiệm online",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${manrope.variable} ${publicSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
