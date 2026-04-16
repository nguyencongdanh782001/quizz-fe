'use client';

import Link from 'next/link';
import { Users, FileCheck, ArrowRight } from 'lucide-react';
import { ClassInfo } from '@/types/class.types';
import { cn } from '@/lib/utils';

interface ClassCardProps {
  cls: ClassInfo;
  variant?: 'default' | 'compact';
}

export function ClassCard({ cls, variant = 'default' }: ClassCardProps) {
  return (
    <Link
      href={`/classes/${cls.id}`}
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
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Lớp {cls.grade}
          </span>
        </div>

        <p className={cn(
          'text-sm text-muted-foreground mb-4 line-clamp-2',
          variant === 'compact' && 'mb-3'
        )}>
          {cls.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {cls.studentCount} học sinh
          </span>
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
              {cls.teacherName.charAt(0)}
            </div>
            <span className="text-xs text-muted-foreground">{cls.teacherName}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}
