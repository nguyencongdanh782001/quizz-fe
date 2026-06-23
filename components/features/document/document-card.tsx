'use client';

import Image from 'next/image';
import { FileText, Video, Image as ImageIcon, Link2, Download } from 'lucide-react';
import { Document as Doc } from '@/types/document.types';
import { cn } from '@/lib/utils';

const typeIcon = {
  pdf: FileText,
  video: Video,
  image: ImageIcon,
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
  const actionLabel = doc.actionLabel ?? 'Tải về';

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/82',
        'shadow-[0_22px_80px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_-40px_rgba(15,23,42,0.28)]'
      )}
    >
      {doc.thumbnailUrl && doc.type === 'video' && (
        <div className="relative h-36 overflow-hidden">
          <Image
            src={doc.thumbnailUrl}
            alt={doc.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Video className="w-8 h-8 text-white" />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium shadow-sm',
              typeColor[doc.type]
            )}
          >
            <Icon className="w-3 h-3" />
            {typeLabel[doc.type]}
          </span>
          {doc.grade > 0 ? (
            <span className="text-xs text-muted-foreground font-medium">
              Lớp {doc.grade}
            </span>
          ) : doc.classroomName ? (
            <span className="text-xs text-muted-foreground font-medium">
              {doc.classroomName}
            </span>
          ) : null}
        </div>

        <h3 className="font-display font-semibold text-on-surface text-base leading-snug mb-2 line-clamp-2 flex-1">
          {doc.title}
        </h3>

        <p className="text-sm leading-7 text-muted-foreground line-clamp-2 mb-4">
          {doc.description}
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {doc.fileSize && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5">
              <FileText className="w-3 h-3" />
              {formatFileSize(doc.fileSize)}
            </span>
          )}
          {doc.downloadCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5">
              <Download className="w-3 h-3" />
              {doc.downloadCount}
            </span>
          )}
        </div>

        <a
          href={doc.url}
          className={cn(
            'mt-auto flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold',
            'bg-linear-to-r from-primary to-tertiary text-white shadow-[0_18px_36px_-20px_rgba(79,70,229,0.52)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_42px_-18px_rgba(79,70,229,0.42)]'
          )}
        >
          <Download className="w-4 h-4" />
          {actionLabel}
        </a>
      </div>
    </div>
  );
}
