'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, History, Library } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const quickActions = [
  { href: '/exams', label: 'Lam bai thi', icon: BookOpen, desc: 'Kham pha de thi' },
  { href: '/classes', label: 'Lop hoc', icon: GraduationCap, desc: 'Xem lop cua ban' },
  { href: '/history', label: 'Lich su', icon: History, desc: 'Ket qua thi' },
  { href: '/documents', label: 'Tai lieu', icon: Library, desc: 'Tai nguyen hoc tap' },
];

export function GradientHeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 md:p-12 mb-8">
      <div className="absolute top-6 right-8 w-24 h-24 rounded-full bg-white/10 animate-pulse-ring" />
      <div className="absolute bottom-4 left-1/3 w-16 h-16 rounded-full bg-secondary/30" />

      <div className="relative z-10 max-w-2xl">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-3 leading-tight">
          Xin chao, {user?.full_name ?? 'Hoc sinh'}
        </h1>
        <p className="text-white/80 text-base mb-6 leading-relaxed">
          Chao mung ban quay tro lai Scholar Clarity.
          Hom nay ban muon on tap gi?
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl text-center',
                'bg-white/15 text-white backdrop-blur-sm',
                'transition-all duration-150 hover:bg-white/25 active:scale-95',
                'border border-white/10'
              )}
            >
              <Icon className="w-5 h-5" />
              <div>
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-xs text-white/70">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
