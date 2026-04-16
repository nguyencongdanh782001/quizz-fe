'use client';

import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { DocumentCard } from '@/components/features/document/document-card';
import { mockDocuments } from '@/data/mock/mock-documents';
import { SUBJECTS, GRADES } from '@/data/mock/mock-exams';
import { DocumentType } from '@/types/document.types';
import { cn } from '@/lib/utils';

const typeFilters: { value: DocumentType | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'doc', label: 'DOC' },
  { value: 'image', label: 'Hình ảnh' },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState<number | ''>('');
  const [type, setType] = useState<DocumentType | ''>('');

  const filtered = mockDocuments.filter(doc => {
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (subject && doc.subject !== subject) return false;
    if (grade && doc.grade !== grade) return false;
    if (type && doc.type !== type) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Thư viện tài liệu
        </h1>
        <p className="text-sm text-muted-foreground">
          {mockDocuments.length} tài liệu học tập — sách, video, hình ảnh
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm tài liệu..."
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

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className={cn(
            'px-3 py-2.5 rounded-xl text-sm',
            'bg-surface-container-lowest text-on-surface border border-outline/20 outline-none',
            'focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors'
          )}
        >
          <option value="">Tất cả môn</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={grade}
          onChange={e => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
          className={cn(
            'px-3 py-2.5 rounded-xl text-sm',
            'bg-surface-container-lowest text-on-surface border border-outline/20 outline-none',
            'focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors'
          )}
        >
          <option value="">Tất cả khối</option>
          {GRADES.map(g => <option key={g} value={g}>Lớp {g}</option>)}
        </select>
        <div className="flex gap-2">
          {typeFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setType(f.value)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-medium border transition-colors',
                type === f.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface-container-lowest text-on-surface border-outline/20 hover:bg-surface-container-low'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Download className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Không tìm thấy tài liệu nào</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Hiển thị {filtered.length} trong {mockDocuments.length} tài liệu
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(doc => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
