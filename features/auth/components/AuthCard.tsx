"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  cardClassName?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <main className="relative min-h-screen w-full bg-white font-sans text-on-surface lg:grid lg:grid-cols-[minmax(0,1.65fr)_minmax(520px,1fr)]">
      {/* Left Column - Fixed Height Sticky Section */}
      <section
        className="sticky top-0 hidden h-screen w-full overflow-hidden bg-[#edf4ff] lg:block"
        aria-hidden="true"
      >
        <Image
          src="/image/logo-01.png"
          alt="QuizzVN Auth Illustration"
          fill
          className="object-cover object-center"
          priority
        />
      </section>

      {/* Right Column - Dynamic Height Scrollable Section */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className={cn("w-full max-w-[440px]", className)}>
          {children}
        </div>
      </section>
    </main>
  );
}
