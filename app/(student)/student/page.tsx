'use client';

import { useEffect, useState } from 'react';
import { ExamCard } from '@/components/features/exam/exam-card';
import { ClassCard } from '@/components/features/class/class-card';
import { getStudentClasses } from '@/lib/student-classes';
import { getStudentSystemExams } from '@/lib/student-system-exams';
import type { ClassInfo } from '@/types/class.types';
import type { Exam } from '@/types/exam.types';
import { ArrowRight, BookOpen, GraduationCap, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/shared/page-hero';
import { SurfacePanel } from '@/components/shared/surface-panel';
import { AppEmptyState } from '@/components/shared/empty-state';

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
      <PageHero
        eyebrow="Bảng điều khiển học tập"
        title="Học tập rõ ràng hơn trên một nhịp giao diện thống nhất"
        description="Xem đề thi nổi bật, lớp học gần đây và tài liệu mới trong một không gian được thiết kế để bạn tập trung vào tiến độ học tập."
        icon={Sparkles}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/student/exams">Khám phá đề thi</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/student/materials">Mở thư viện tài liệu</Link>
            </Button>
          </>
        }
        metrics={[
          {
            label: 'Đề thi sẵn sàng',
            value: isLoadingExams ? '--' : featuredExams.length,
            description: 'Những đề thi được đề xuất cho bạn ở lần ghé thăm này.',
            icon: BookOpen,
            tone: 'primary',
          },
          {
            label: 'Lớp học gần đây',
            value: isLoadingClasses ? '--' : recentClasses.length,
            description: 'Các lớp học bạn đang tham gia và theo dõi.',
            icon: GraduationCap,
            tone: 'secondary',
          },
          {
            label: 'Nhịp hoàn thành',
            value: isLoadingExams
              ? '--'
              : `${featuredExams.reduce((sum, exam) => sum + exam.questionCount, 0)} câu`,
            description: 'Số lượng nội dung có thể bắt đầu ngay trên hệ thống.',
            icon: Trophy,
            tone: 'tertiary',
          },
        ]}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">Đề thi nổi bật</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-on-surface">
            Đề thi nổi bật
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/student/exams">
              Xem tất cả
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {isLoadingExams ? (
          <SurfacePanel className="text-sm text-muted-foreground">
            Đang tải đề thi hệ thống...
          </SurfacePanel>
        ) : featuredExams.length === 0 ? (
          <AppEmptyState
            icon={BookOpen}
            title="Chưa có đề thi phù hợp lúc này"
            description="Hệ thống sẽ hiển thị những đề thi mới và được gợi ý cho bạn ngay tại đây."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">Lớp học của tôi</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-on-surface">
            Lớp học của tôi
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/student/classes">
              Xem tất cả
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {isLoadingClasses ? (
          <SurfacePanel className="text-sm text-muted-foreground">
            Đang tải lớp học...
          </SurfacePanel>
        ) : recentClasses.length === 0 ? (
          <AppEmptyState
            icon={GraduationCap}
            title="Bạn chưa tham gia lớp học nào"
            description="Hãy nhập mã lớp hoặc tham gia một lớp học mới để thấy hoạt động của mình tại đây."
          />
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
