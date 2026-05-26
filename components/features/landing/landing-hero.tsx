'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileText,
  Sparkles,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Reveal,
  fadeUpVariants,
  staggerContainer,
} from '@/components/features/landing/landing-motion';

const highlights = [
  {
    icon: BookOpen,
    title: 'Tạo bài thi linh hoạt',
    description: 'Nhiều kiểu câu hỏi, chấm điểm tự động và giao bài theo lớp.',
  },
  {
    icon: FileText,
    title: 'Kho tài liệu tập trung',
    description: 'Chia sẻ học liệu theo hệ thống hoặc theo từng lớp học cụ thể.',
  },
  {
    icon: BarChart3,
    title: 'Theo dõi tiến độ rõ ràng',
    description: 'Thấy ngay kết quả học tập, mức hoàn thành và hoạt động gần đây.',
  },
] as const;

const heroMetrics = [
  { label: 'Lớp đang hoạt động', value: '24' },
  { label: 'Tài liệu mới', value: '128' },
  { label: 'Tỷ lệ đúng hạn', value: '94%' },
] as const;

const classProgress = [
  { name: 'Lớp ReactJS', students: '36 học sinh', progress: 88 },
  { name: 'Toán nâng cao 12', students: '42 học sinh', progress: 73 },
  { name: 'Ôn thi THPT', students: '55 học sinh', progress: 91 },
] as const;

const documentUpdates = [
  { title: 'Giải tích cơ bản', scope: 'Hệ thống' },
  { title: 'React Hooks chuyên sâu', scope: 'Lớp học' },
  { title: 'Bộ đề Hóa học 11', scope: 'Hệ thống' },
] as const;

export function LandingHero() {
  return (
    <section id="tong-quan" className="relative px-4 pb-16 pt-10 sm:px-6 lg:pb-20 lg:pt-16">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-45" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="relative z-10">
          <Reveal className="space-y-8">
            <Badge
              variant="secondary"
              className="rounded-full border-white/70 bg-white/75 px-4 py-1.5 text-sm shadow-sm backdrop-blur"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Nền tảng giáo dục số dành cho giáo viên và học sinh
            </Badge>

            <div className="space-y-5">
              <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
                Nền tảng học tập và quản lý lớp học hiện đại
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Tạo bài thi, quản lý lớp học, chia sẻ tài liệu và theo dõi tiến
                độ học tập trên một nền tảng duy nhất.
              </p>
            </div>

            <motion.div
              className="flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65, delay: 0.12 }}
            >
              <Button
                size="lg"
                className="h-12 rounded-full px-6 text-base shadow-[0_18px_40px_rgba(0,70,74,0.22)]"
                asChild
              >
                <Link href="/register">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-white/70 bg-white/75 px-6 text-base backdrop-blur hover:bg-white"
                asChild
              >
                <Link href="#tinh-nang">Khám phá thêm</Link>
              </Button>
            </motion.div>

            <motion.div
              className="grid gap-3 sm:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={staggerContainer}
            >
              {highlights.map(({ icon: Icon, title, description }) => (
                <motion.div
                  key={title}
                  variants={fadeUpVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="rounded-[1.6rem] border border-white/70 bg-white/75 p-4 shadow-[0_16px_50px_rgba(7,30,39,0.06)] backdrop-blur-xl"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-on-surface">{title}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </div>

        <div className="relative z-10">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-4 top-10 hidden rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(7,30,39,0.12)] backdrop-blur-xl lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lớp học mới</p>
                <p className="font-semibold text-on-surface">12 lớp được tạo tuần này</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-3 bottom-12 hidden rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-[0_20px_50px_rgba(7,30,39,0.12)] backdrop-blur-xl lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nộp bài đúng hạn</p>
                <p className="font-semibold text-on-surface">94% trong 30 ngày gần đây</p>
              </div>
            </div>
          </motion.div>

          <Reveal
            delay={0.08}
            className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_28px_90px_rgba(7,30,39,0.12)] backdrop-blur-xl"
          >
            <div className="border-b border-border/40 px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Không gian điều hành học tập</p>
                  <h2 className="font-display text-2xl font-semibold text-on-surface">
                    Bảng điều khiển trực quan cho mọi vai trò
                  </h2>
                </div>
                <span className="rounded-full border border-border/50 bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant">
                  Cập nhật trực tiếp
                </span>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[1.4rem] border border-border/40 bg-surface-container-low p-4"
                  >
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="mt-2 font-display text-3xl font-semibold text-on-surface">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[1.5rem] border border-border/40 bg-white/85 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">Tiến độ lớp học</p>
                      <p className="text-sm text-muted-foreground">
                        Tỷ lệ hoàn thành theo từng nhóm học sinh
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {classProgress.map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-medium text-on-surface">{item.name}</p>
                            <p className="text-muted-foreground">{item.students}</p>
                          </div>
                          <span className="font-semibold text-primary">
                            {item.progress}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-primary/10">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-primary to-cyan-400"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/40 bg-surface-container-low p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">Tài liệu mới xuất bản</p>
                      <p className="text-sm text-muted-foreground">
                        Chia sẻ nhanh tới toàn hệ thống hoặc từng lớp học
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {documentUpdates.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-[1.25rem] border border-white/80 bg-white/85 p-4"
                      >
                        <p className="font-semibold text-on-surface">{item.title}</p>
                        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                          <span>{item.scope}</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
