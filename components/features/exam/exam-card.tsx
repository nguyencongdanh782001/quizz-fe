'use client';

import Link from 'next/link';
import { Clock, Users, BookOpen, Star, ArrowRight } from 'lucide-react';
import { Exam } from '@/types/exam.types';
import { cn } from '@/lib/utils';

const difficultyColor = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const difficultyLabel = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

interface ExamCardProps {
  exam: Exam;
  compact?: boolean;
}

export function ExamCard({ exam, compact = false }: ExamCardProps) {
  return (
    <div
      className={cn(
        'group bg-surface-container-lowest rounded-xl overflow-hidden',
        'shadow-[0_4px_24px_rgba(7,30,39,0.06)]',
        'transition-all duration-200 hover:shadow-[0_8px_32px_rgba(7,30,39,0.12)]',
        'hover:-translate-y-0.5'
      )}
    >
      {exam.thumbnailUrl && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={exam.thumbnailUrl}
            alt={exam.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className={cn('p-4', compact ? '' : 'p-5')}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={cn(
              'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
              difficultyColor[exam.difficulty]
            )}
          >
            {difficultyLabel[exam.difficulty]}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Lớp {exam.grade}
          </span>
        </div>

        <h3 className={cn(
          'font-display font-semibold text-on-surface leading-snug mb-2 line-clamp-2',
          compact ? 'text-sm' : 'text-base'
        )}>
          {exam.title}
        </h3>

        {!compact && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {exam.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {exam.questionCount} câu
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {exam.duration} phút
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            {exam.passingScore}%
          </span>
        </div>

        <Link
          href={`/exam/${exam.id}/take`}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 rounded-lg',
            'bg-primary text-white text-sm font-medium',
            'transition-all duration-150',
            'hover:bg-primary/90 active:scale-[0.98]'
          )}
        >
          Làm bài thi
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
