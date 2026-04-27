'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle,
  Clock,
  FileCheck,
  Files,
  Hash,
  History,
  Trophy,
} from 'lucide-react';
import { getStudentClassById } from '@/lib/student-classes';
import { getStudentClassDocuments } from '@/lib/student-system-documents';
import {
  getStudentClassExams,
  readAllCachedStudentAttemptResults,
  StudentSubmitAttemptResultData,
} from '@/lib/student-system-exams';
import { DocumentCard } from '@/components/features/document/document-card';
import { ExamCard } from '@/components/features/exam/exam-card';
import type { ClassInfo } from '@/types/class.types';
import type { Document } from '@/types/document.types';
import type { Exam } from '@/types/exam.types';
import { cn } from '@/lib/utils';

type ClassTab = 'exams' | 'results' | 'documents';

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [activeTab, setActiveTab] = useState<ClassTab>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [cachedResults, setCachedResults] = useState<StudentSubmitAttemptResultData[]>([]);
  const [isLoadingClass, setIsLoadingClass] = useState(true);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadClassDetail() {
      try {
        const foundClass = await getStudentClassById(id);

        if (!isMounted) {
          return;
        }

        setCls(foundClass);
      } finally {
        if (isMounted) {
          setIsLoadingClass(false);
        }
      }
    }

    void loadClassDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadClassExams() {
      try {
        const items = await getStudentClassExams(id);

        if (!isMounted) {
          return;
        }

        setExams(items);
      } finally {
        if (isMounted) {
          setIsLoadingExams(false);
        }
      }
    }

    void loadClassExams();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadClassDocuments() {
      try {
        const items = await getStudentClassDocuments(id);

        if (!isMounted) {
          return;
        }

        setDocuments(items);
      } finally {
        if (isMounted) {
          setIsLoadingDocuments(false);
        }
      }
    }

    void loadClassDocuments();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    setCachedResults(readAllCachedStudentAttemptResults());
  }, []);

  const classResults = useMemo(() => {
    const classExamIds = new Set(exams.map((exam) => exam.id));

    return cachedResults
      .filter((result) => classExamIds.has(result.examId))
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      );
  }, [cachedResults, exams]);

  if (isLoadingClass) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Đang tải lớp học...
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="font-medium">Không tìm thấy lớp học</p>
        <Link
          href="/student/classes"
          className="text-primary text-sm mt-2 inline-block"
        >
          ← Quay lại danh sách lớp
        </Link>
      </div>
    );
  }
  const joinedAtLabel = cls.joinedAt
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(cls.joinedAt))
    : null;
  const examCount = isLoadingExams ? cls.examCount : exams.length;
  const documentCount = isLoadingDocuments ? (cls.documentCount ?? 0) : documents.length;
  const tabs: Array<{ id: ClassTab; label: string; count: number }> = [
    { id: 'exams', label: 'Đề thi', count: examCount },
    { id: 'results', label: 'Kết quả', count: classResults.length },
    { id: 'documents', label: 'Tài liệu', count: documentCount },
  ];

  return (
    <div className="space-y-8">
      <Link
        href="/student/classes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại lớp học
      </Link>

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <div className="h-2" style={{ backgroundColor: cls.coverColor }} />
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display font-bold text-2xl text-on-surface">
                  {cls.name}
                </h1>
                {cls.grade > 0 && (
                  <span className="text-sm text-muted-foreground font-medium">
                    Lớp {cls.grade}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{cls.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  {examCount} bài thi
                </span>
                <span className="flex items-center gap-1.5">
                  <Files className="w-4 h-4" />
                  {documentCount} tài liệu
                </span>
                {joinedAtLabel && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    Tham gia {joinedAtLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: cls.coverColor }}
              >
                {cls.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Mã vào lớp</p>
                <p className="text-xs text-muted-foreground">
                  {cls.joinCode ?? cls.inviteCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-surface-container-lowest rounded-xl p-5">
          <h2 className="font-display font-semibold text-lg text-on-surface mb-3">
            Thông tin lớp
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              ID lớp: {cls.id}
            </p>
            <p className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {examCount} bài thi đang liên kết với lớp này
            </p>
            <p className="flex items-center gap-2">
              <Files className="w-4 h-4" />
              {documentCount} tài liệu đã được giao
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5">
          <h2 className="font-display font-semibold text-lg text-on-surface mb-3">
            Ghi chú
          </h2>
          <p className="text-sm text-muted-foreground">
            Đề thi và tài liệu đang được tải theo quyền thành viên của học sinh.
            Tab kết quả hiện hiển thị các lần nộp đã lưu trên thiết bị này cho
            đến khi có API lịch sử kết quả theo lớp.
          </p>
        </div>
      </div>

      <section className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-2xl bg-surface-container-low p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-surface-container-lowest text-on-surface shadow-[0_4px_18px_rgba(7,30,39,0.08)]'
                  : 'text-muted-foreground hover:bg-surface-container-lowest/70 hover:text-on-surface',
              )}
            >
              <span>{tab.label}</span>
              <span className="ml-2 text-xs opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        {activeTab === 'exams' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-on-surface">
                Đề thi
              </h2>
              <span className="text-sm text-muted-foreground">
                {examCount} đề thi
              </span>
            </div>

            {isLoadingExams ? (
              <div className="rounded-xl bg-surface-container-lowest p-5 text-sm text-muted-foreground">
                Đang tải đề thi của lớp...
              </div>
            ) : exams.length === 0 ? (
              <div className="rounded-xl bg-surface-container-lowest p-5 text-sm text-muted-foreground">
                Chưa có đề thi nào cho lớp này.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {exams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-on-surface">
                Kết quả
              </h2>
              <span className="text-sm text-muted-foreground">
                {classResults.length} lượt nộp
              </span>
            </div>

            <div className="rounded-xl border border-outline/10 bg-surface-container-lowest p-4 text-sm text-muted-foreground">
              Kết quả trong tab này đang hiển thị từ các lần nộp đã lưu trên
              thiết bị hiện tại. Khi có API kết quả theo lớp, danh sách sẽ đồng
              bộ đầy đủ hơn.
            </div>

            {classResults.length === 0 ? (
              <div className="rounded-xl bg-surface-container-lowest p-5 text-sm text-muted-foreground">
                Chưa có kết quả nào được lưu cho lớp này.
              </div>
            ) : (
              <div className="space-y-3">
                {classResults.map((result) => {
                  const scorePercent =
                    result.totalPoints > 0
                      ? Math.round((result.score / result.totalPoints) * 100)
                      : 0;

                  return (
                    <div
                      key={result.attemptId}
                      className="rounded-xl border border-outline/10 bg-surface-container-lowest p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-on-surface">
                            {result.examTitle}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Intl.DateTimeFormat('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }).format(new Date(result.submittedAt))}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {result.correctAnswersCount}/{result.totalQuestions} câu đúng
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5" />
                              {result.score}/{result.totalPoints} điểm
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:shrink-0">
                          <div className="rounded-xl bg-primary/10 px-3 py-2 text-center">
                            <p className="text-lg font-display font-bold text-primary">
                              {scorePercent}%
                            </p>
                          </div>
                          <Link
                            href={`/student/exam/${result.examId}/result?attemptId=${result.attemptId}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                          >
                            <History className="w-4 h-4" />
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-on-surface">
                Tài liệu
              </h2>
              <span className="text-sm text-muted-foreground">
                {documentCount} tài liệu
              </span>
            </div>

            {isLoadingDocuments ? (
              <div className="rounded-xl bg-surface-container-lowest p-5 text-sm text-muted-foreground">
                Đang tải tài liệu của lớp...
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-xl bg-surface-container-lowest p-5 text-sm text-muted-foreground">
                Chưa có tài liệu nào cho lớp này.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {documents.map((document) => (
                  <DocumentCard
                    key={document.id}
                    doc={{
                      ...document,
                      url: `/student/materials/${document.id}?classId=${cls.id}`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
