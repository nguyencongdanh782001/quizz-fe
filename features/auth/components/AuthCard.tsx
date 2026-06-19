import { SurfaceCard } from '@/components/common/SurfaceCard';
import { Logo } from '@/components/common/Logo';

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
          <p className="mt-2 text-on-surface-variant text-sm">
            Cổng Giải Đề Trực Tuyến
          </p>
        </div>

        <SurfaceCard className="p-8">
          {children}
        </SurfaceCard>
      </div>
    </div>
  );
}
