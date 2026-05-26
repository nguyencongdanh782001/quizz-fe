'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Reveal,
  fadeUpVariants,
  staggerContainer,
} from '@/components/features/landing/landing-motion';

const features = [
  {
    icon: GraduationCap,
    title: 'Quản lý lớp học',
    description:
      'Tạo và quản lý lớp học dễ dàng với mã tham gia nhanh chóng.',
    eyebrow: 'Tổ chức lớp',
    tone: 'from-sky-500/20 via-sky-500/8 to-transparent',
  },
  {
    icon: BookOpen,
    title: 'Tạo bài thi thông minh',
    description:
      'Hỗ trợ nhiều loại câu hỏi và chấm điểm tự động.',
    eyebrow: 'Đánh giá linh hoạt',
    tone: 'from-emerald-500/20 via-emerald-500/8 to-transparent',
  },
  {
    icon: FileText,
    title: 'Chia sẻ tài liệu',
    description:
      'Đăng tải và quản lý tài liệu học tập cho toàn hệ thống hoặc từng lớp học.',
    eyebrow: 'Học liệu tập trung',
    tone: 'from-violet-500/20 via-violet-500/8 to-transparent',
  },
  {
    icon: BarChart3,
    title: 'Theo dõi tiến độ',
    description:
      'Theo dõi kết quả học tập và hiệu suất học sinh theo thời gian thực.',
    eyebrow: 'Phân tích trực quan',
    tone: 'from-cyan-500/20 via-cyan-500/8 to-transparent',
  },
] as const;

const platformValues = [
  {
    icon: Users,
    title: 'Phối hợp giữa giáo viên và học sinh',
  },
  {
    icon: ShieldCheck,
    title: 'Dữ liệu học tập thống nhất và đáng tin cậy',
  },
  {
    icon: BarChart3,
    title: 'Bảng điều khiển giàu thông tin nhưng vẫn dễ tiếp cận',
  },
] as const;

export function LandingFeatures() {
  return (
    <section id="tinh-nang" className="px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="space-y-4">
            <Badge variant="success" className="w-fit rounded-full px-4 py-1">
              Tính năng trọng tâm
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
              Một trang chủ tốt cần giải thích rõ sản phẩm làm được gì ngay
              trong vài giây đầu.
            </h2>
          </div>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            Phần này tập trung vào bốn trụ cột cốt lõi của nền tảng: lớp học,
            bài thi, tài liệu và phân tích học tập. Mỗi khối đều nhấn mạnh giá
            trị cụ thể thay vì mô tả chung chung.
          </p>
        </Reveal>

        <motion.div
          className="grid gap-4 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
        >
          {features.map(({ icon: Icon, title, description, eyebrow, tone }) => (
            <motion.article
              key={title}
              variants={fadeUpVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              className="relative overflow-hidden rounded-[1.9rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(7,30,39,0.08)] backdrop-blur-xl sm:p-7"
            >
              <div className={`absolute inset-x-0 top-0 h-24 bg-linear-to-br ${tone}`} />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-medium text-on-surface-variant">
                    {eyebrow}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-on-surface">
                  {title}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {description}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <Reveal className="mt-6 rounded-[2rem] border border-white/70 bg-linear-to-r from-primary to-sky-500 p-6 text-primary-foreground shadow-[0_28px_90px_rgba(0,70,74,0.22)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-medium text-white/80">
                Luồng trải nghiệm liền mạch
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                Từ tạo lớp, giao bài đến chia sẻ tài liệu và theo dõi kết quả.
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {platformValues.map(({ icon: Icon, title }) => (
                <div
                  key={title}
                  className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5" />
                  <p className="mt-3 text-sm leading-6 text-white/85">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
