'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { ClassCard } from '@/components/features/class/class-card';
import { mockClasses } from '@/data/mock/mock-classes';
import { cn } from '@/lib/utils';
import { GRADES } from '@/data/mock/mock-exams';

export default function ClassesPage() {
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState<number | ''>('');

  const filtered = mockClasses.filter(cls => {
    if (search && !cls.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (grade && cls.grade !== grade) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Lớp học của tôi
        </h1>
        <p className="text-sm text-muted-foreground">
          {mockClasses.length} lớp đã tham gia
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm lớp học..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm',
              'bg-surface-container-lowest text-on-surface',
              'border border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary/30',
              'outline-none transition-colors placeholder:text-muted-foreground'
            )}
          />
        </div>
        <select
          value={grade}
          onChange={e => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
          className={cn(
            'px-3 py-2.5 rounded-xl text-sm shrink-0',
            'bg-surface-container-lowest text-on-surface border border-outline/20 outline-none',
            'focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors'
          )}
        >
          <option value="">Tất cả khối</option>
          {GRADES.map(g => <option key={g} value={g}>Lớp {g}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Không tìm thấy lớp học nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(cls => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  );
}
