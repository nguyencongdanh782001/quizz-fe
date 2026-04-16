'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { SurfaceCard } from '@/components/common/SurfaceCard';
import { GraduationCap, Users } from 'lucide-react';

export function RoleSelectionForm() {
  const { role, selectRole } = useAuth();
  const router = useRouter();

  const handleSelect = (selectedRole: 'student' | 'teacher') => {
    selectRole(selectedRole);
    if (selectedRole === 'teacher') {
      router.push('/teacher');
    } else {
      router.push('/');
    }
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
          onClick={() => handleSelect('student')}
          className={cn(
            'p-6 text-left w-full cursor-pointer',
            'hover:ring-2 hover:ring-primary/20',
            'transition-all duration-200',
            'group',
            role === 'student' && 'ring-2 ring-primary'
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
            {role === 'student' && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xs">&#10003;</span>
              </div>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard
          as="button"
          onClick={() => handleSelect('teacher')}
          className={cn(
            'p-6 text-left w-full cursor-pointer',
            'hover:ring-2 hover:ring-primary/20',
            'transition-all duration-200',
            'group',
            role === 'teacher' && 'ring-2 ring-primary'
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
            {role === 'teacher' && (
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-white text-xs">&#10003;</span>
              </div>
            )}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
