'use client';

import { useEffect, useState } from 'react';
import { GradientHeroSection } from '@/components/features/home/gradient-hero-section';
import { ExamCard } from '@/components/features/exam/exam-card';
import { ClassCard } from '@/components/features/class/class-card';
import { getStudentClasses } from '@/lib/student-classes';
import { getStudentSystemExams } from '@/lib/student-system-exams';
import type { ClassInfo } from '@/types/class.types';
import type { Exam } from '@/types/exam.types';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [featuredExams, setFeaturedExams] = useState<Exam[]>([]);
  const [recentClasses, setRecentClasses] = useState<ClassInfo[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [exams, classes] = await Promise.all([
          getStudentSystemExams(),
          getStudentClasses(),
        ]);

        if (!isMounted) {
          return;
        }

        setFeaturedExams(exams.slice(0, 3));
        setRecentClasses(classes.slice(0, 2));
      } finally {
        if (isMounted) {
          setIsLoadingExams(false);
          setIsLoadingClasses(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

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
            href="/student/exams"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {isLoadingExams ? (
          <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-6 text-sm text-muted-foreground">
            Đang tải đề thi hệ thống...
          </div>
        ) : featuredExams.length === 0 ? (
          <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-6 text-sm text-muted-foreground">
            Chưa có đề thi hệ thống khả dụng lúc này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>

      {/* My Classes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-on-surface">
            Lớp học của tôi
          </h2>
          <Link
            href="/student/classes"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {isLoadingClasses ? (
          <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-6 text-sm text-muted-foreground">
            Đang tải lớp học...
          </div>
        ) : recentClasses.length === 0 ? (
          <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-6 text-sm text-muted-foreground">
            Bạn chưa tham gia lớp học nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {recentClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
