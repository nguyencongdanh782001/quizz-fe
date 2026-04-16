'use client';

import { GradientHeroSection } from '@/components/features/home/gradient-hero-section';
import { ExamCard } from '@/components/features/exam/exam-card';
import { ClassCard } from '@/components/features/class/class-card';
import { mockExams } from '@/data/mock/mock-exams';
import { mockClasses } from '@/data/mock/mock-classes';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const featuredExams = mockExams.slice(0, 3);
  const recentClasses = mockClasses.slice(0, 2);

  return (
    <div className="space-y-8">
      <GradientHeroSection />

      {/* Featured Exams */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-on-surface">
            Đề thi nổi bật
          </h2>
          <Link
            href="/exams"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredExams.map(exam => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </section>

      {/* My Classes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-on-surface">
            Lớp học của tôi
          </h2>
          <Link
            href="/classes"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {recentClasses.map(cls => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      </section>
    </div>
  );
}
