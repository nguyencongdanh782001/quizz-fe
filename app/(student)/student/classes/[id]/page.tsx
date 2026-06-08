'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
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
import { getStudentClassExams } from '@/lib/student-system-exams';
import {
  createEmptyStudentSystemResults,
  getStudentClassResults,
  type StudentSystemResultListData,
} from '@/lib/student-system-results';
import { DocumentCard } from '@/components/features/document/document-card';
import { ExamCard } from '@/components/features/exam/exam-card';
import { useBreadcrumbLabel } from '@/components/shared/breadcrumb-labels';
import { Button } from '@/components/ui/button';
import type { ClassInfo } from '@/types/class.types';
import type { Document } from '@/types/document.types';
import type { Exam } from '@/types/exam.types';
import { cn } from '@/lib/utils';

type ClassTab = 'exams' | 'results' | 'documents';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(iso: string): string {
  return DATE_TIME_FORMATTER.format(new Date(iso));
}

function formatPercent(value: number): string {
  const roundedValue = Math.round(value * 10) / 10;
  return Number.isInteger(roundedValue)
    ? `${roundedValue}%`
    : `${roundedValue.toFixed(1)}%`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [activeTab, setActiveTab] = useState<ClassTab>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [resultsData, setResultsData] = useState<StudentSystemResultListData>(
    () => createEmptyStudentSystemResults(),
  );
  const [isLoadingClass, setIsLoadingClass] = useState(true);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [examsError, setExamsError] = useState<string | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [tabRequestKey, setTabRequestKey] = useState(0);
  const classBreadcrumbHref = `/student/classes/${id}`;
  const classBreadcrumbLabel = cls?.name?.trim() || (
    isLoadingClass ? null : 'Chi tiết lớp học'
  );

  useBreadcrumbLabel(classBreadcrumbHref, classBreadcrumbLabel);

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

    async function loadActiveTabData() {
      switch (activeTab) {
        case 'exams': {
          setIsLoadingExams(true);
          setExamsError(null);
          setExams([]);

          try {
            const items = await getStudentClassExams(id, { throwOnError: true });

            if (!isMounted) {
              return;
            }

            setExams(items);
          } catch (error) {
            console.error(`Failed to fetch exams for class ${id}`, error);

            if (!isMounted) {
              return;
            }

            setExams([]);
            setExamsError(
              getErrorMessage(error, 'Không thể tải danh sách đề thi. Vui lòng thử lại.'),
            );
          } finally {
            if (isMounted) {
              setIsLoadingExams(false);
            }
          }

          return;
        }

        case 'results': {
          setIsLoadingResults(true);
          setResultsError(null);
          setResultsData(createEmptyStudentSystemResults());

          try {
            const nextResults = await getStudentClassResults(id);

            if (!isMounted) {
              return;
            }

            setResultsData(nextResults);
          } catch (error) {
            console.error(`Failed to fetch results for class ${id}`, error);

            if (!isMounted) {
              return;
            }

            setResultsData(createEmptyStudentSystemResults());
            setResultsError(
              getErrorMessage(error, 'Không thể tải kết quả của lớp. Vui lòng thử lại.'),
            );
          } finally {
            if (isMounted) {
              setIsLoadingResults(false);
            }
          }

          return;
        }

        case 'documents': {
          setIsLoadingDocuments(true);
          setDocumentsError(null);
          setDocuments([]);

          try {
            const items = await getStudentClassDocuments(id, {
              throwOnError: true,
            });

            if (!isMounted) {
              return;
            }

            setDocuments(items);
          } catch (error) {
            console.error(`Failed to fetch documents for class ${id}`, error);

            if (!isMounted) {
              return;
            }

            setDocuments([]);
            setDocumentsError(
              getErrorMessage(error, 'Không thể tải tài liệu của lớp. Vui lòng thử lại.'),
            );
          } finally {
            if (isMounted) {
              setIsLoadingDocuments(false);
            }
          }

          return;
        }
      }
    }

    void loadActiveTabData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, id, tabRequestKey]);

  const classResults = resultsData.items;
  const resultSummary = resultsData.summary;

  function retryActiveTab() {
    setTabRequestKey((current) => current + 1);
  }

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
  const resultCount = isLoadingResults ? 0 : resultSummary.totalCompletedExams;
  const documentCount = isLoadingDocuments ? (cls.documentCount ?? 0) : documents.length;
  const tabs: Array<{ id: ClassTab; label: string; count: number }> = [
    { id: 'exams', label: 'Đề thi', count: examCount },
    { id: 'results', label: 'Kết quả', count: resultCount },
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
            Mỗi lần chuyển tab, hệ thống sẽ tải mới dữ liệu tương ứng từ máy
            chủ để học sinh luôn xem được thông tin cập nhật nhất.
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
            ) : examsError ? (
              <div className="rounded-xl border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-medium">Không thể tải đề thi</p>
                      <p className="mt-1">{examsError}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={retryActiveTab}
                    className="border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800/30 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
                  >
                    Thử lại
                  </Button>
                </div>
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
                {isLoadingResults ? 'Đang tải...' : `${resultCount} lượt nộp`}
              </span>
            </div>

            {isLoadingResults ? (
              <div className="rounded-xl bg-surface-container-lowest p-5 text-sm text-muted-foreground">
                Đang tải kết quả của lớp...
              </div>
            ) : resultsError ? (
              <div className="rounded-xl border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-medium">Không thể tải kết quả</p>
                      <p className="mt-1">{resultsError}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={retryActiveTab}
                    className="border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800/30 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            ) : classResults.length === 0 ? (
              <div className="rounded-xl bg-surface-container-lowest p-5 text-sm text-muted-foreground">
                Chưa có kết quả nào cho lớp này.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-surface-container-lowest p-4">
                    <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
                    <p className="mt-1 font-display text-2xl font-bold text-on-surface">
                      {resultSummary.totalCompletedExams}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container-lowest p-4">
                    <p className="text-xs text-muted-foreground">Đã đạt</p>
                    <p className="mt-1 font-display text-2xl font-bold text-on-surface">
                      {resultSummary.passedExams}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container-lowest p-4">
                    <p className="text-xs text-muted-foreground">Điểm trung bình</p>
                    <p className="mt-1 font-display text-2xl font-bold text-on-surface">
                      {formatPercent(resultSummary.averageScorePercent)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {classResults.map((result) => (
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
                              {formatDate(result.submittedAt)}
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
                              {formatPercent(result.scorePercent)}
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
                  ))}
                </div>
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
            ) : documentsError ? (
              <div className="rounded-xl border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-medium">Không thể tải tài liệu</p>
                      <p className="mt-1">{documentsError}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={retryActiveTab}
                    className="border-red-200 bg-white text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800/30 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
                  >
                    Thử lại
                  </Button>
                </div>
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
