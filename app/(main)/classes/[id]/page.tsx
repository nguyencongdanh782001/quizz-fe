'use client';

import { use } from 'react';
import Link from 'next/link';
import { Users, FileCheck, ArrowLeft, BookOpen } from 'lucide-react';
import { mockClasses } from '@/data/mock/mock-classes';
import { mockExams } from '@/data/mock/mock-exams';
import { ExamCard } from '@/components/features/exam/exam-card';
import { cn } from '@/lib/utils';

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const cls = mockClasses.find(c => c.id === id);

  if (!cls) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="font-medium">Không tìm thấy lớp học</p>
        <Link href="/classes" className="text-primary text-sm mt-2 inline-block">
          ← Quay lại danh sách lớp
        </Link>
      </div>
    );
  }

  const classExams = mockExams.filter(exam => exam.classIds.includes(cls.id));

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/classes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại lớp học
      </Link>

      {/* Header */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <div className="h-2" style={{ backgroundColor: cls.coverColor }} />
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display font-bold text-2xl text-on-surface">
                  {cls.name}
                </h1>
                <span className="text-sm text-muted-foreground font-medium">
                  Lớp {cls.grade}
                </span>
              </div>
              <p className="text-muted-foreground mb-4">{cls.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {cls.studentCount} học sinh
                </span>
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  {classExams.length} bài thi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: cls.coverColor }}
              >
                {cls.teacherName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">{cls.teacherName}</p>
                <p className="text-xs text-muted-foreground">Giáo viên chủ nhiệm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students */}
      <div className="bg-surface-container-lowest rounded-xl p-5">
        <h2 className="font-display font-semibold text-lg text-on-surface mb-4">
          Danh sách học sinh ({cls.students.length})
        </h2>
        <div className="space-y-2">
          {cls.students.map((student, i) => (
            <div
              key={student.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'bg-surface-container-low transition-colors',
                i === 0 && 'bg-primary-container/30'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                {student.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.email}</p>
              </div>
              {i === 0 && (
                <span className="ml-auto text-xs text-primary font-medium">✓ Đã gia nhập</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exams */}
      <div>
        <h2 className="font-display font-semibold text-lg text-on-surface mb-4">
          Bài thi của lớp ({classExams.length})
        </h2>
        {classExams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-surface-container-lowest rounded-xl">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Chưa có bài thi nào được giao</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
