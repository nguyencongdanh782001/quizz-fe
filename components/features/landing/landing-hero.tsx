'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const learnerAvatars = [
  '/images/landing/avatar-1.jpg',
  '/images/landing/avatar-2.jpg',
  '/images/landing/avatar-3.jpg',
  '/images/landing/avatar-4.jpg',
] as const;

export function LandingHero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[690px] items-end overflow-hidden border-b border-[#fceddd] bg-[#fff7f0] pb-10 pt-28 md:min-h-[740px] md:pb-0 md:pt-36"
    >
      <div className="pointer-events-none absolute -left-40 -top-40 h-[430px] w-[430px] rounded-full border border-dashed border-[#e55a3b]/20" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-[280px] w-[280px] rounded-full border border-[#e55a3b]/15" />
      <div className="pointer-events-none absolute right-[8%] top-[28%] h-10 w-10 rotate-45 border border-[#e55a3b]/25" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] items-end gap-10 px-5 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="max-w-[640px] pb-8 md:pb-16">
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="mb-5 flex items-center gap-3 text-xs font-extrabold uppercase text-[#e55a3b]"
          >
            <span className="h-0.5 w-8 bg-[#e55a3b]" />
            Nền tảng thi trắc nghiệm online thông minh
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-[42px] font-extrabold leading-[1.08] text-[#111827] sm:text-[54px] lg:text-[64px]"
          >
            QuizzVN
            <span className="mt-1 block text-[#e55a3b]">Tạo đề thi AI, chấm điểm tức thì</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-6 max-w-[560px] text-base leading-8 text-[#6b7280] sm:text-lg"
          >
            Tạo câu hỏi và đề thi nhanh với những giải pháp thông minh. QuizzVN tận dụng công nghệ để nâng cao hiệu quả dạy và học.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/login"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#e55a3b] px-7 text-base font-bold text-white shadow-[0_14px_30px_rgba(229,90,59,0.2)] transition hover:bg-[#d4492a]"
            >
              <Sparkles className="h-4 w-4" />
              Tạo bài kiểm tra miễn phí
            </Link>
            <Link
              href="/login"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-[#d1d5db] bg-white/45 px-7 text-base font-bold text-[#111827] transition hover:border-[#111827] hover:bg-white"
            >
              Dành cho học sinh
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="mt-7 flex items-center gap-4"
          >
            <div className="flex -space-x-2.5">
              {learnerAvatars.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt={`Học viên QuizzVN ${index + 1}`}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border-2 border-[#fff7f0] object-cover"
                />
              ))}
            </div>
            <div className="text-xs font-semibold leading-5 text-[#6b7280]">
              <div className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                4.9/5 từ hơn 2.500 đánh giá
              </div>
              <p>Được tin dùng bởi học sinh và giáo viên trên toàn quốc</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="relative mx-auto hidden h-[570px] w-full max-w-[610px] items-end justify-center md:flex"
        >
          <div className="absolute bottom-20 h-[410px] w-[410px] rounded-full border-2 border-dashed border-[#e55a3b]/25" />
          <div className="absolute bottom-16 h-[390px] w-[300px] -rotate-6 rounded-[36px] border-[12px] border-white bg-[#e55a3b] shadow-xl" />
          <Image
            src="/images/landing/hero-students.png"
            alt="Học sinh sử dụng QuizzVN"
            width={1254}
            height={1254}
            priority
            sizes="(max-width: 1024px) 50vw, 610px"
            className="relative z-10 h-auto w-full max-w-[600px] object-contain drop-shadow-2xl"
          />
        </motion.div>

        <div className="relative mx-auto -mb-10 flex w-full max-w-[520px] justify-center md:hidden">
          <div className="absolute bottom-8 h-[270px] w-[220px] -rotate-6 rounded-[28px] border-8 border-white bg-[#e55a3b]" />
          <Image
            src="/images/landing/hero-students.png"
            alt="Học sinh sử dụng QuizzVN"
            width={1254}
            height={1254}
            priority
            className="relative z-10 h-auto w-full object-contain drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
