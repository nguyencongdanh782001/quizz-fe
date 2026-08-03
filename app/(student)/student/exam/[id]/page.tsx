"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  PlayCircle,
  RotateCcw,
  Star,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import {
  getStudentExamDetail,
  startStudentExamAttempt,
  StudentExamDetailData,
} from "@/lib/student-system-exams";
import { useBreadcrumbLabel } from "@/components/shared/breadcrumb-labels";
import { ExamAvailabilityCard } from "@/components/features/exam/exam-availability-card";
import { getExamAvailabilityStatus } from "@/lib/exam-availability";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const now = useNow();
  const [examDetail, setExamDetail] = useState<StudentExamDetailData | null>(
    null,
  );
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isStartingAttempt, setIsStartingAttempt] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const examBreadcrumbHref = `/student/exam/${id}`;
  const examBreadcrumbLabel =
    examDetail?.exam.title?.trim() ||
    (isLoadingExam ? null : "Chi tiết đề thi");

  useBreadcrumbLabel(examBreadcrumbHref, examBreadcrumbLabel);

  useEffect(() => {
    let isMounted = true;

    async function loadExamDetail() {
      setIsLoadingExam(true);
      setLoadError(null);
      setExamDetail(null);

      try {
        const detail = await getStudentExamDetail(id);

        if (!isMounted) {
          return;
        }

        if (!detail) {
          setLoadError("Không thể tải chi tiết đề thi.");
          return;
        }

        setExamDetail(detail);
      } finally {
        if (isMounted) {
          setIsLoadingExam(false);
        }
      }
    }

    void loadExamDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoadingExam) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">Đang tải đề thi...</div>
        <div className="rounded-[8px] border border-outline/10 bg-surface-container-lowest p-6 text-sm text-muted-foreground">
          Vui lòng chờ trong giây lát để xem chi tiết đề thi.
        </div>
      </div>
    );
  }

  if (!examDetail) {
    return (
      <div className="space-y-6">
        <Link
          href="/student/exams"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại thư viện đề thi
        </Link>

        <div className="rounded-[8px] border border-outline/10 bg-surface-container-lowest p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium text-on-surface">
            {loadError ?? "Không tìm thấy đề thi."}
          </p>
        </div>
      </div>
    );
  }

  const { exam, inProgressAttemptId } = examDetail;
  const availability = getExamAvailabilityStatus(exam, now);
  const isExamAvailableNow = availability.status === "available";
  const actionLabel = inProgressAttemptId
    ? "Tiếp tục làm bài"
    : "Bắt đầu làm bài";
  const actionIcon = inProgressAttemptId ? RotateCcw : PlayCircle;
  const ActionIcon = actionIcon;

  async function handleStartAttempt() {
    setIsStartingAttempt(true);
    setStartError(null);

    try {
      const attempt = await startStudentExamAttempt(id);
      router.push(`/student/exam/${exam.id}/take?attemptId=${attempt.id}`);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Không thể bắt đầu làm bài. Vui lòng thử lại.";

      setStartError(message);
      setIsStartingAttempt(false);
    }
  }

  return (
    <div className="space-y-8">
      <Link
        href="/student/exams"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại thư viện đề thi
      </Link>

      <ExamAvailabilityCard exam={exam} />

      <section className="overflow-hidden rounded-[10px] border border-outline/10 bg-surface-container-lowest shadow-[0_1px_3px_rgba(30,41,59,0.05)]">
        <div className="bg-linear-to-r from-primary/8 via-secondary/10 to-surface px-6 py-8 md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-semibold text-on-primary-container">
                  {exam.scope === "system" ? "Hệ thống" : "Giáo viên"}
                </span>
                {exam.classroomName && (
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                    {exam.classroomName}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl font-bold text-on-surface md:text-3xl">
                {exam.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                {exam.description ||
                  "Xem trước cấu trúc đề thi trước khi bắt đầu làm bài."}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:max-w-xs">
              <button
                type="button"
                onClick={() => void handleStartAttempt()}
                disabled={isStartingAttempt || !isExamAvailableNow}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-[8px] px-5 py-3 text-sm font-semibold",
                  "bg-primary text-white transition-colors hover:bg-primary/90",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                <ActionIcon className="h-4 w-4" />
                {isStartingAttempt ? "Đang khởi tạo..." : actionLabel}
              </button>
              {!isExamAvailableNow && (
                <p className="text-xs text-muted-foreground">
                  {availability.status === "upcoming"
                    ? "Đề thi chưa mở. Vui lòng quay lại sau."
                    : availability.status === "expired"
                      ? "Đề thi đã hết hạn."
                      : "Đề thi tạm thời không khả dụng."}
                </p>
              )}
              <Link
                href="/student/exams"
                className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-outline/20 px-5 py-3 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Danh sách đề thi
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-outline/10 px-6 py-6 md:grid-cols-3 md:px-8">
          <div className="rounded-[8px] bg-surface px-4 py-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Số câu hỏi
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-on-surface">
              {exam.questionCount}
            </p>
          </div>

          <div className="rounded-[8px] bg-surface px-4 py-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Thời lượng
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-on-surface">
              {exam.duration} phút
            </p>
          </div>

          <div className="rounded-[8px] bg-surface px-4 py-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Tổng điểm
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-on-surface">
              {exam.totalPoints ?? 0}
            </p>
          </div>
        </div>
      </section>

      {startError && (
        <div className="rounded-[8px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {startError}
        </div>
      )}

      {inProgressAttemptId && (
        <div className="rounded-[8px] border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-yellow-800">
          Bạn đang có một lượt làm bài chưa hoàn tất cho đề thi này. Bạn có thể
          tiếp tục từ trang làm bài.
        </div>
      )}
    </div>
  );
}
