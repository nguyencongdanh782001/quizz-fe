'use client';

import Link from 'next/link';
import { CalendarDays, FileCheck, ArrowRight, Users } from 'lucide-react';
import { ClassInfo } from '@/types/class.types';
import { cn } from '@/lib/utils';

interface ClassCardProps {
  cls: ClassInfo;
  variant?: 'default' | 'compact';
}

function formatJoinedAt(joinedAt?: string | null): string | null {
  if (!joinedAt) {
    return null;
  }

  const date = new Date(joinedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function ClassCard({ cls, variant = 'default' }: ClassCardProps) {
  const joinedAtLabel = formatJoinedAt(cls.joinedAt);
  const teacherLabel =
    cls.teacherName?.trim() || cls.joinCode || cls.inviteCode || cls.name;

  return (
    <Link
      href={`/student/classes/${cls.id}`}
      className={cn(
        'block bg-surface-container-lowest rounded-xl overflow-hidden',
        'shadow-[0_4px_24px_rgba(7,30,39,0.06)]',
        'transition-all duration-200 hover:shadow-[0_8px_32px_rgba(7,30,39,0.12)]',
        'hover:-translate-y-0.5'
      )}
    >
      <div
        className="h-2"
        style={{ backgroundColor: cls.coverColor }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display font-semibold text-on-surface text-base leading-snug line-clamp-2 flex-1">
            {cls.name}
          </h3>
          {cls.grade > 0 && (
            <span className="text-xs text-muted-foreground font-medium shrink-0">
              Lớp {cls.grade}
            </span>
          )}
        </div>

        <p className={cn(
          'text-sm text-muted-foreground mb-4 line-clamp-2',
          variant === 'compact' && 'mb-3'
        )}>
          {cls.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          {typeof cls.studentCount === 'number' ? (
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {cls.studentCount} học sinh
            </span>
          ) : joinedAtLabel ? (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Tham gia {joinedAtLabel}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            {cls.examCount} bài thi
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: cls.coverColor }}
            >
              {teacherLabel.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground line-clamp-1">
              {cls.teacherName?.trim()
                ? cls.teacherName
                : `Mã vào lớp: ${teacherLabel}`}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}
