'use client';

import Link from 'next/link';
import { Users, FileCheck, Plus, BookOpen, ArrowRight, TrendingUp } from 'lucide-react';
import { mockClasses } from '@/data/mock/mock-classes';
import { mockExams } from '@/data/mock/mock-exams';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function TeacherHomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <div className="bg-gradient-hero rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-6 right-8 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative z-10">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
            Xin chào, {user?.name ?? 'Giáo viên'} 👩‍🏫
          </h1>
          <p className="text-white/80 text-base">
            Chào mừng bạn quay trở lại Scholar Clarity. Chúc một ngày giảng dạy hiệu quả!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng lớp', value: mockClasses.length, icon: Users, color: 'bg-primary-container text-on-primary-container' },
          { label: 'Bài thi', value: mockExams.length, icon: FileCheck, color: 'bg-secondary-container text-on-secondary-container' },
          { label: 'Học sinh', value: mockClasses.reduce((sum, c) => sum + c.studentCount, 0), icon: TrendingUp, color: 'bg-tertiary-container text-on-tertiary-container' },
          { label: 'Bài thi mới', value: 3, icon: BookOpen, color: 'bg-primary-container text-on-primary-container' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl p-5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color)}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-display font-bold text-2xl text-on-surface">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/teacher/exams/create"
          className="group bg-surface-container-lowest rounded-xl p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-on-surface">Tạo bài thi mới</h3>
              <p className="text-sm text-muted-foreground">Wizard 4 bước đơn giản</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/teacher/classes/create"
          className="group bg-surface-container-lowest rounded-xl p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-on-surface">Tạo lớp học</h3>
              <p className="text-sm text-muted-foreground">Quản lý học sinh dễ dàng</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent exams */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-on-surface">
            Bài thi gần đây
          </h2>
          <Link
            href="/teacher/exams"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          {mockExams.slice(0, 4).map((exam, i) => (
            <div
              key={exam.id}
              className={cn(
                'flex items-center justify-between px-5 py-4',
                i > 0 && 'border-t border-outline/10'
              )}
            >
              <div>
                <p className="font-medium text-on-surface text-sm">{exam.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {exam.questionCount} câu · {exam.duration} phút
                </p>
              </div>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                exam.status === 'published'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              )}>
                {exam.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
