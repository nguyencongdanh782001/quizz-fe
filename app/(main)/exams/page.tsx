'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ExamCard } from '@/components/features/exam/exam-card';
import { mockExams, SUBJECTS, GRADES } from '@/data/mock/mock-exams';
import { ExamDifficulty } from '@/types/exam.types';
import { cn } from '@/lib/utils';

const difficultyOptions: { value: ExamDifficulty | ''; label: string }[] = [
  { value: '', label: 'Tất cả mức' },
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'hard', label: 'Khó' },
];

export default function ExamsPage() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState<number | ''>('');
  const [difficulty, setDifficulty] = useState<ExamDifficulty | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockExams.filter(exam => {
    if (search && !exam.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (subject && exam.subject !== subject) return false;
    if (grade && exam.grade !== grade) return false;
    if (difficulty && exam.difficulty !== difficulty) return false;
    return true;
  });

  const activeFilterCount = [subject, grade, difficulty].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Thư viện đề thi
        </h1>
        <p className="text-sm text-muted-foreground">
          {mockExams.length} đề thi available — tìm kiếm và làm bài ngay
        </p>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm đề thi..."
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
        <button
          onClick={() => setShowFilters(v => !v)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
            'border transition-colors shrink-0',
            showFilters || activeFilterCount > 0
              ? 'bg-primary text-white border-primary'
              : 'bg-surface-container-lowest text-on-surface border-outline/20 hover:bg-surface-container-low'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-surface-container-lowest rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
              Môn học
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-surface text-on-surface border border-outline/20 outline-none',
                'focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors'
              )}
            >
              <option value="">Tất cả môn</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
              Khối lớp
            </label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-surface text-on-surface border border-outline/20 outline-none',
                'focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors'
              )}
            >
              <option value="">Tất cả khối</option>
              {GRADES.map(g => <option key={g} value={g}>Lớp {g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
              Mức độ
            </label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as ExamDifficulty | '')}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-surface text-on-surface border border-outline/20 outline-none',
                'focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors'
              )}
            >
              {difficultyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Không tìm thấy đề thi nào</p>
          <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Hiển thị {filtered.length} trong {mockExams.length} đề thi
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(exam => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
