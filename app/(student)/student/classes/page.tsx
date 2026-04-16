'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { ClassCard } from '@/components/features/class/class-card';
import { mockClasses } from '@/data/mock/mock-classes';
import { GRADES } from '@/data/mock/mock-exams';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_GRADES = '__all_grades__';

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
          <Input
            type="text"
            placeholder="Tìm kiếm lớp học..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest pl-10 pr-4 shadow-none"
          />
        </div>
        <Select
          value={grade === '' ? ALL_GRADES : String(grade)}
          onValueChange={value => setGrade(value === ALL_GRADES ? '' : Number(value))}
        >
          <SelectTrigger className="h-12 w-[180px] rounded-2xl border-outline/15 bg-surface-container-lowest shadow-none">
            <SelectValue placeholder="Tất cả khối" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ALL_GRADES}>Tất cả khối</SelectItem>
            {GRADES.map(g => (
              <SelectItem key={g} value={String(g)}>
                Lớp {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
