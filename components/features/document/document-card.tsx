'use client';

import { FileText, Video, Image, Link2, Download } from 'lucide-react';
import { Document as Doc } from '@/types/document.types';
import { cn } from '@/lib/utils';

const typeIcon = {
  pdf: FileText,
  video: Video,
  image: Image,
  doc: FileText,
  link: Link2,
};

const typeColor = {
  pdf: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  video: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  image: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  doc: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  link: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const typeLabel = {
  pdf: 'PDF',
  video: 'Video',
  image: 'Hình ảnh',
  doc: 'DOC',
  link: 'Liên kết',
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentCardProps {
  doc: Doc;
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const Icon = typeIcon[doc.type];

  return (
    <div
      className={cn(
        'bg-surface-container-lowest rounded-xl overflow-hidden',
        'shadow-[0_4px_24px_rgba(7,30,39,0.06)]',
        'transition-all duration-200 hover:shadow-[0_8px_32px_rgba(7,30,39,0.12)]',
        'hover:-translate-y-0.5 flex flex-col'
      )}
    >
      {doc.thumbnailUrl && doc.type === 'video' && (
        <div className="relative h-36 overflow-hidden">
          <img src={doc.thumbnailUrl} alt={doc.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Video className="w-8 h-8 text-white" />
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              typeColor[doc.type]
            )}
          >
            <Icon className="w-3 h-3" />
            {typeLabel[doc.type]}
          </span>
          <span className="text-xs text-muted-foreground font-medium">Lớp {doc.grade}</span>
        </div>

        <h3 className="font-display font-semibold text-on-surface text-sm leading-snug mb-2 line-clamp-2 flex-1">
          {doc.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {doc.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {doc.fileSize && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {formatFileSize(doc.fileSize)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {doc.downloadCount}
          </span>
        </div>

        <a
          href={doc.url}
          className={cn(
            'flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium',
            'bg-primary text-white transition-colors hover:bg-primary/90'
          )}
        >
          <Download className="w-4 h-4" />
          Tải về
        </a>
      </div>
    </div>
  );
}
