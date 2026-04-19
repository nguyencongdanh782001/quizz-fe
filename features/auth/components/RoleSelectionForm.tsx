'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { SurfaceCard } from '@/components/common/SurfaceCard';
import { GraduationCap, Users, Loader2 } from 'lucide-react';

export function RoleSelectionForm() {
  const { selectRole } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<'student' | 'teacher' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    if (!selected) return;
    setIsSubmitting(true);
    selectRole(selected);
    router.push(selected === 'teacher' ? '/teacher' : '/student');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-on-surface">
          Chọn vai trò của bạn
        </h2>
        <p className="mt-2 text-on-surface-variant text-sm">
          Bạn muốn tham gia với tư cách nào?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <SurfaceCard
          as="button"
          onClick={() => setSelected('student')}
          className={cn(
            'p-6 text-left w-full cursor-pointer',
            'hover:ring-2 hover:ring-primary/20',
            'transition-all duration-200',
            'group',
            selected === 'student' && 'ring-2 ring-primary'
          )}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-on-primary-container" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                Học sinh
              </h3>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Làm bài thi, xem kết quả, tham gia lớp học
              </p>
            </div>
            {selected === 'student' && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xs">&#10003;</span>
              </div>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard
          as="button"
          onClick={() => setSelected('teacher')}
          className={cn(
            'p-6 text-left w-full cursor-pointer',
            'hover:ring-2 hover:ring-primary/20',
            'transition-all duration-200',
            'group',
            selected === 'teacher' && 'ring-2 ring-primary'
          )}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center">
              <Users className="w-7 h-7 text-on-secondary-container" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-secondary transition-colors">
                Giáo viên
              </h3>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Tạo bài thi, quản lý lớp học, theo dõi tiến độ
              </p>
            </div>
            {selected === 'teacher' && (
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-white text-xs">&#10003;</span>
              </div>
            )}
          </div>
        </SurfaceCard>
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selected || isSubmitting}
        className={cn(
          'cursor-pointer w-full py-3 rounded-xl font-semibold text-base',
          'bg-primary text-white',
          'hover:bg-primary/90',
          'transition-all duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2',
        )}
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Xác nhận
      </button>
    </div>
  );
}
