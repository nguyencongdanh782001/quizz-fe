'use client';

import { motion } from 'framer-motion';
import { Bell, CalendarDays, CheckCircle2, Clock3, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Reveal,
  fadeUpVariants,
  staggerContainer,
} from '@/components/features/landing/landing-motion';

const activities = [
  {
    title: 'Nguyễn Văn A vừa hoàn thành bài thi Toán học',
    time: '2 phút trước',
    tone: 'bg-sky-100 text-sky-700',
  },
  {
    title: 'Lớp học ReactJS đã được tạo',
    time: '10 phút trước',
    tone: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Tài liệu "Giải tích cơ bản" vừa được xuất bản',
    time: '22 phút trước',
    tone: 'bg-violet-100 text-violet-700',
  },
  {
    title: 'Bài thi trắc nghiệm Vật lý đã được chấm điểm tự động',
    time: '35 phút trước',
    tone: 'bg-amber-100 text-amber-700',
  },
] as const;

const updates = [
  {
    icon: Bell,
    title: 'Thông báo mới',
    description: '4 học sinh vừa nộp bài và chờ giáo viên xem lại.',
  },
  {
    icon: CalendarDays,
    title: 'Lịch hôm nay',
    description: '3 buổi học trực tuyến và 2 bài kiểm tra đang được lên lịch.',
  },
  {
    icon: FileText,
    title: 'Tài liệu chờ duyệt',
    description: '6 tài liệu mới đã sẵn sàng để xuất bản cho toàn hệ thống.',
  },
] as const;

export function LandingActivity() {
  return (
    <section id="hoat-dong" className="px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 max-w-3xl space-y-4">
          <Badge variant="secondary" className="w-fit rounded-full px-4 py-1">
            Hoạt động gần đây
          </Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
            Dòng hoạt động giàu ngữ cảnh giúp nền tảng bớt trống và tăng độ sống.
          </h2>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            Trang chủ mới cho người dùng thấy nhịp vận hành của hệ thống ngay từ
            cái nhìn đầu tiên: ai vừa làm bài, lớp nào vừa được tạo, tài liệu nào
            vừa được phát hành.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(7,30,39,0.08)] backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Nhịp hoạt động</p>
                <h3 className="font-display text-2xl font-semibold text-on-surface">
                  Bảng tin theo thời gian thực
                </h3>
              </div>
              <span className="rounded-full border border-border/40 bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant">
                Cập nhật liên tục
              </span>
            </div>

            <div className="space-y-5">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.title}
                  variants={fadeUpVariants}
                  className="grid grid-cols-[auto_1fr] gap-4"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${activity.tone}`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    {index < activities.length - 1 ? (
                      <span className="mt-2 h-full w-px bg-border/60" />
                    ) : null}
                  </div>
                  <div className="rounded-[1.35rem] border border-border/40 bg-surface-container-low p-4">
                    <p className="font-semibold text-on-surface">{activity.title}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {updates.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUpVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(7,30,39,0.08)] backdrop-blur-xl"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-on-surface">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
