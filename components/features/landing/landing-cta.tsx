"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/features/landing/landing-motion";

const ctaPoints = [
  "Khởi tạo lớp học trong vài phút",
  "Tạo bài thi và chia sẻ tài liệu ngay",
  "Theo dõi tiến độ học tập trên dashboard trực quan",
] as const;

export function LandingCTA() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:py-24">
      <Reveal className="mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-linear-to-br from-primary via-primary-container to-sky-500 px-6 py-10 text-primary-foreground shadow-[0_30px_100px_rgba(0,70,74,0.28)] sm:px-10 lg:px-12 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
              Bắt đầu ngay hôm nay
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Sẵn sàng bắt đầu hành trình học tập hiện đại?
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Tạo lớp học, giao bài, chia sẻ tài liệu và xây dựng trải nghiệm
              học tập rõ ràng hơn cho cả giáo viên lẫn học sinh trên một nền
              tảng thống nhất.
            </p>

            <motion.div
              className="flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65, delay: 0.12 }}
            >
              <Button
                size="lg"
                className="h-12 rounded-full bg-white px-6 text-primary hover:bg-white/90 text-white"
                asChild
              >
                <Link href="/register">
                  Tạo lớp học ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/15"
                asChild
              >
                <Link href="/login">Đăng nhập</Link>
              </Button>
            </motion.div>
          </div>

          <div className="rounded-[1.8rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm font-medium text-white/75">
              Những gì bạn nhận được
            </p>
            <div className="mt-5 space-y-4">
              {ctaPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex rounded-full bg-white/15 p-2">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-7 text-white/85">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
