'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Reveal,
  fadeUpVariants,
  staggerContainer,
} from '@/components/features/landing/landing-motion';

const testimonials = [
  {
    quote:
      '"Nền tảng giúp tôi tiết kiệm rất nhiều thời gian trong việc quản lý lớp học."',
    name: 'Nguyễn Thị Minh',
    role: 'Giáo viên Toán',
    initials: 'NM',
    accent: 'from-sky-500/20 via-sky-500/8 to-transparent',
  },
  {
    quote:
      '"Tôi có thể xem tài liệu, làm bài thi và theo dõi kết quả ngay trên một màn hình rất rõ ràng."',
    name: 'Trần Gia Huy',
    role: 'Học sinh lớp 11',
    initials: 'TH',
    accent: 'from-emerald-500/20 via-emerald-500/8 to-transparent',
  },
  {
    quote:
      '"Phần dashboard trực quan giúp tổ chuyên môn nắm được tiến độ của từng lớp mà không cần ghép báo cáo thủ công."',
    name: 'Lê Khánh An',
    role: 'Tổ trưởng chuyên môn',
    initials: 'LA',
    accent: 'from-violet-500/20 via-violet-500/8 to-transparent',
  },
] as const;

export function LandingTestimonials() {
  return (
    <section id="phan-hoi" className="px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 max-w-3xl space-y-4">
          <Badge variant="warning" className="w-fit rounded-full px-4 py-1">
            Phản hồi người dùng
          </Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
            Cảm giác tin cậy đến từ trải nghiệm thật, không chỉ từ hình thức.
          </h2>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            Trang chủ mới cần vừa tạo ấn tượng đầu tiên tốt hơn, vừa cho thấy
            nền tảng đã sẵn sàng cho môi trường học tập nghiêm túc và quy mô.
          </p>
        </Reveal>

        <motion.div
          className="grid gap-4 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {testimonials.map((testimonial) => (
            <motion.article
              key={testimonial.name}
              variants={fadeUpVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              className="relative overflow-hidden rounded-[1.85rem] border border-white/70 bg-white/80 p-6 shadow-[0_26px_90px_rgba(7,30,39,0.08)] backdrop-blur-xl"
            >
              <div
                className={`absolute inset-x-0 top-0 h-28 bg-linear-to-br ${testimonial.accent}`}
              />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-lg font-semibold">
                    {testimonial.initials}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <Quote className="h-8 w-8 text-primary/30" />
                <p className="mt-4 text-base leading-8 text-on-surface">
                  {testimonial.quote}
                </p>
                <div className="mt-6 border-t border-border/50 pt-5">
                  <p className="font-semibold text-on-surface">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
