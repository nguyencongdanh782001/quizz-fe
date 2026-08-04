'use client';

import { motion } from 'framer-motion';
import { BarChart3, FileText, GraduationCap, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AnimatedCounter,
  Reveal,
  fadeUpVariants,
  staggerContainer,
} from '@/components/features/landing/landing-motion';

const stats = [
  {
    icon: Users,
    value: 10000,
    suffix: '+',
    label: 'Học sinh',
    description: 'Tham gia ôn tập và thi trực tuyến mỗi ngày.',
    accent: 'from-sky-500/20 via-sky-500/10 to-transparent',
  },
  {
    icon: GraduationCap,
    value: 500,
    suffix: '+',
    label: 'Lớp học',
    description: 'Được giáo viên tổ chức và quản lý trên cùng một nền tảng.',
    accent: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
  },
  {
    icon: BarChart3,
    value: 2000,
    suffix: '+',
    label: 'Bài thi',
    description: 'Sẵn sàng giao, chấm điểm và phân tích kết quả tức thì.',
    accent: 'from-violet-500/20 via-violet-500/10 to-transparent',
  },
  {
    icon: FileText,
    value: 15000,
    suffix: '+',
    label: 'Tài liệu',
    description: 'Tập trung, dễ chia sẻ theo hệ thống hoặc theo từng lớp học.',
    accent: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
  },
] as const;

export function LandingStats() {
  return (
    <section id="thong-ke" className="px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="info" className="w-fit rounded-full px-4 py-1">
              Chỉ số nổi bật
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
              Những con số cho thấy nền tảng đang tạo ra nhịp học tập thực sự.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Giao diện mới không chỉ đẹp hơn mà còn giúp người dùng nhận ra ngay
            giá trị cốt lõi: học tập có tổ chức, theo dõi rõ ràng và phối hợp
            hiệu quả giữa giáo viên với học sinh.
          </p>
        </Reveal>

        <motion.div
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {stats.map(({ icon: Icon, value, suffix, label, description, accent }) => (
            <motion.div
              key={label}
              variants={fadeUpVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/75 p-6 shadow-[0_22px_70px_rgba(7,30,39,0.08)] backdrop-blur-xl"
            >
              <div
                className={`absolute inset-x-0 top-0 h-24 bg-linear-to-br ${accent}`}
              />
              <div className="relative flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <div className="inline-flex rounded-2xl border border-white/80 bg-white/85 p-3 text-primary shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <AnimatedCounter
                      value={value}
                      suffix={suffix}
                      className="font-display text-4xl font-semibold text-on-surface sm:text-[2.65rem]"
                    />
                    <p className="text-lg font-semibold text-on-surface">{label}</p>
                  </div>
                </div>
                <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-medium text-on-surface-variant">
                  Trực quan
                </span>
              </div>
              <p className="relative mt-6 text-sm leading-7 text-muted-foreground">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
