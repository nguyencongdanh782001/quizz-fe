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
        'group block overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/82',
        'shadow-[0_20px_70px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-38px_rgba(15,23,42,0.28)]'
      )}
    >
      <div className="h-24 bg-linear-to-r from-primary/8 via-secondary/8 to-tertiary/10" />
      <div className="-mt-10 p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.3rem] text-base font-bold text-white shadow-[0_18px_40px_-22px_rgba(79,70,229,0.48)]"
            style={{ backgroundColor: cls.coverColor }}
          >
            {cls.name.charAt(0).toUpperCase()}
          </div>
          <span className="shrink-0 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            {cls.grade > 0 ? `Lớp ${cls.grade}` : 'Lớp học'}
          </span>
        </div>

        <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-on-surface line-clamp-2">
          {cls.name}
        </h3>
        <p
          className={cn(
            'mt-2 text-sm leading-7 text-muted-foreground line-clamp-2',
            variant === 'compact' && 'line-clamp-1'
          )}
        >
          {cls.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {typeof cls.studentCount === 'number' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5">
              <Users className="w-3.5 h-3.5" />
              {cls.studentCount} học sinh
            </span>
          ) : joinedAtLabel ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Tham gia {joinedAtLabel}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            {cls.examCount} bài thi
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-[1.35rem] border border-border/50 bg-surface-container-low p-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
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
          <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
