'use client';

import { cn } from '@/lib/utils';

export type OrbState = 'unanswered' | 'answered' | 'current' | 'flagged';

interface ProgressOrbsProps {
  total: number;
  currentIndex: number;
  answeredIds: Set<string>;
  questionIds: string[];
  onJumpTo: (index: number) => void;
}

export function ProgressOrbs({
  total,
  currentIndex,
  answeredIds,
  questionIds,
  onJumpTo,
}: ProgressOrbsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-xs">
      {Array.from({ length: total }, (_, i) => {
        const qId = questionIds[i];
        const isAnswered = qId ? answeredIds.has(qId) : false;
        const isCurrent = i === currentIndex;

        return (
          <button
            key={i}
            onClick={() => onJumpTo(i)}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-200',
              'hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary/50',
              isCurrent
                ? 'bg-secondary scale-125 shadow-[0_0_8px_var(--secondary)]'
                : isAnswered
                ? 'bg-primary'
                : 'bg-outline-variant',
            )}
            aria-label={`Câu hỏi ${i + 1}${isAnswered ? ' (đã trả lời)' : ''}${isCurrent ? ' (hiện tại)' : ''}`}
          />
        );
      })}
    </div>
  );
}
