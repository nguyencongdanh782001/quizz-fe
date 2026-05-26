'use client';

import Link from 'next/link';
import {
  ArrowRight,
  FileCheck,
  FileText,
  GraduationCap,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { mockClasses } from '@/data/mock/mock-classes';
import { mockDocuments } from '@/data/mock/mock-documents';
import { mockExams } from '@/data/mock/mock-exams';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/shared/page-hero';
import { SurfacePanel } from '@/components/shared/surface-panel';

export default function TeacherHomePage() {
  const { user } = useAuth();
  const totalStudents = mockClasses.reduce(
    (sum, cls) => sum + (cls.studentCount ?? 0),
    0
  );

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Trung tâm điều hành"
        title={`Xin chào, ${user?.full_name ?? 'giáo viên'}`}
        description="Theo dõi lớp học, đề thi và học liệu trong một không gian thống nhất để bạn ra quyết định nhanh hơn và giữ nhịp giảng dạy mượt hơn."
        icon={Sparkles}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/teacher/exams/create">
                <Plus className="mr-2 h-4 w-4" />
                Tạo bài thi mới
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/teacher/classes/create">Tạo lớp học</Link>
            </Button>
          </>
        }
        metrics={[
          {
            label: 'Lớp đang quản lý',
            value: mockClasses.length,
            description: 'Không gian học tập đang hoạt động cùng học sinh.',
            icon: Users,
            tone: 'primary',
          },
          {
            label: 'Bài thi đã tạo',
            value: mockExams.length,
            description: 'Đề thi sẵn sàng giao và theo dõi kết quả.',
            icon: FileCheck,
            tone: 'secondary',
          },
          {
            label: 'Học sinh theo dõi',
            value: totalStudents,
            description: 'Tổng số học sinh trong các lớp của bạn.',
            icon: TrendingUp,
            tone: 'tertiary',
          },
          {
            label: 'Tài liệu đang có',
            value: mockDocuments.length,
            description: 'Học liệu có thể chia sẻ ngay trên nền tảng.',
            icon: FileText,
            tone: 'neutral',
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SurfacePanel className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">Hành động nhanh</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-on-surface">
                Bắt đầu công việc quan trọng nhất của hôm nay
              </h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/teacher/exams">Xem toàn bộ</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                href: '/teacher/exams/create',
                title: 'Tạo bài thi mới',
                description: 'Khởi tạo đề thi, câu hỏi và thời lượng chỉ trong một luồng.',
                icon: Plus,
                tone: 'from-primary/14 to-tertiary/14',
              },
              {
                href: '/teacher/classes/create',
                title: 'Mở lớp học mới',
                description: 'Tạo lớp, phát mã tham gia và bắt đầu quản lý học sinh.',
                icon: GraduationCap,
                tone: 'from-secondary/14 to-primary/10',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[1.6rem] border border-white/70 bg-linear-to-br p-5 transition-all hover:-translate-y-1 hover:shadow-[0_24px_70px_-34px_rgba(15,23,42,0.26)]"
              >
                <div className={cn('rounded-[1.3rem] p-5', item.tone)}>
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Bắt đầu
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </SurfacePanel>

        <SurfacePanel className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">Bài thi gần đây</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-on-surface">
                Các đề thi đang tạo nhịp cho lớp học
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/teacher/exams">Quản lý đề thi</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {mockExams.slice(0, 4).map((exam) => (
              <article
                key={exam.id}
                className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.24)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface">{exam.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {exam.questionCount} câu hỏi • {exam.duration} phút
                    </p>
                  </div>
                  <span
                    className={cn(
                      'w-fit rounded-full px-3 py-1 text-xs font-semibold',
                      exam.status === 'published'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                    )}
                  >
                    {exam.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </SurfacePanel>
      </div>

      <SurfacePanel className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">Lớp học nổi bật</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-on-surface">
              Tổng quan lớp học đang vận hành
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/teacher/classes">Xem tất cả lớp học</Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {mockClasses.slice(0, 3).map((cls) => (
            <article
              key={cls.id}
              className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.22)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="h-12 w-12 rounded-[1.2rem] shadow-[0_18px_40px_-22px_rgba(79,70,229,0.45)]"
                  style={{ backgroundColor: cls.coverColor }}
                />
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Lớp {cls.grade}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-on-surface">
                {cls.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">
                {cls.description}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[1.2rem] bg-surface-container-low p-3">
                  <p className="text-muted-foreground">Học sinh</p>
                  <p className="mt-1 font-semibold text-on-surface">
                    {cls.studentCount ?? 0}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-surface-container-low p-3">
                  <p className="text-muted-foreground">Bài thi</p>
                  <p className="mt-1 font-semibold text-on-surface">{cls.examCount}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SurfacePanel>
    </div>
  );
}
