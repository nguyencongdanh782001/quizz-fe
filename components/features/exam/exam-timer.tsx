'use client';

import { Clock } from 'lucide-react';
import { formatTime } from '@/hooks/use-exam-timer';
import { cn } from '@/lib/utils';

interface ExamTimerProps {
  timeLeft: number; // seconds
  total: number; // seconds
  compact?: boolean;
}

export function ExamTimer({ timeLeft, total, compact = false }: ExamTimerProps) {
  const percentage = (timeLeft / total) * 100;
  const isWarning = percentage < 20;
  const isCritical = percentage < 10;

  return (
    <div
      className={cn(
        'glass rounded-[6px] flex items-center gap-2 px-4 py-2.5 border border-outline/15',
        'font-display font-semibold tabular-nums',
        compact ? 'text-sm' : 'text-base',
        isCritical && 'animate-pulse-ring ring-2 ring-red-400/50',
        isWarning && !isCritical && 'ring-1 ring-yellow-400/40'
      )}
    >
      <Clock
        className={cn(
          'w-4 h-4 shrink-0',
          isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-secondary'
        )}
      />
      <span
        className={cn(
          isCritical
            ? 'text-red-600 dark:text-red-400'
            : isWarning
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-on-surface'
        )}
      >
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}
