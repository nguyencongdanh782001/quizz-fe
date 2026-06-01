"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  FileCheck,
  FileText,
  GraduationCap,
  LibraryBig,
  Plus,
  RefreshCcw,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherClasses } from "@/hooks/queries/useTeacherClasses";
import { useTeacherSystemDocuments } from "@/hooks/queries/useTeacherSystemDocuments";
import { useTeacherSystemExams } from "@/hooks/queries/useTeacherSystemExams";
import { cn } from "@/lib/utils";
import type { ClassInfo } from "@/types/class.types";
import type { Document } from "@/types/document.types";
import type { TeacherExam, TeacherExamQuery } from "@/types/exam";

const RECENT_ITEM_LIMIT = 5;
const EMPTY_CLASSES: ClassInfo[] = [];
const EMPTY_EXAMS: TeacherExam[] = [];
const EMPTY_DOCUMENTS: Document[] = [];

const DASHBOARD_EXAM_QUERY = {
  sort_by: "updated_at",
  sort_order: "desc",
} satisfies TeacherExamQuery;

const NUMBER_FORMATTER = new Intl.NumberFormat("vi-VN");
const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type DashboardTone = "primary" | "secondary" | "tertiary";

const statToneClassName: Record<DashboardTone, string> = {
  primary: "bg-primary/12 text-primary",
  secondary: "bg-secondary/12 text-secondary",
  tertiary: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
};

function getTimestamp(value?: string | null): number {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDate(value?: string | null): string {
  const timestamp = getTimestamp(value);

  if (!timestamp) {
    return "Chưa có ngày";
  }

  return DATE_FORMATTER.format(new Date(timestamp));
}

function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

function getRecentClasses(classes: ClassInfo[]): ClassInfo[] {
  return [...classes]
    .sort((left, right) => getTimestamp(right.createdAt) - getTimestamp(left.createdAt))
    .slice(0, RECENT_ITEM_LIMIT);
}

function getRecentExams(exams: TeacherExam[]): TeacherExam[] {
  return [...exams]
    .sort((left, right) => getTimestamp(right.updated_at) - getTimestamp(left.updated_at))
    .slice(0, RECENT_ITEM_LIMIT);
}

function getRecentDocuments(documents: Document[]): Document[] {
  return [...documents]
    .sort(
      (left, right) =>
        getTimestamp(right.updatedAt ?? right.createdAt) -
        getTimestamp(left.updatedAt ?? left.createdAt),
    )
    .slice(0, RECENT_ITEM_LIMIT);
}

interface DashboardStatCardProps {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: DashboardTone;
  isLoading: boolean;
}

function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
  isLoading,
}: DashboardStatCardProps) {
  return (
    <article className="group rounded-[1.6rem] border border-white/75 bg-white/84 p-5 shadow-[0_22px_70px_-42px_rgba(15,23,42,0.24)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-[0_30px_80px_-44px_rgba(15,23,42,0.3)]">
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-[1.1rem] shadow-[0_16px_34px_-24px_rgba(15,23,42,0.36)]",
            statToneClassName[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-muted-foreground">
          Tổng quan
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          <Skeleton className="h-10 w-24 rounded-2xl" />
        ) : (
          <p className="font-display text-4xl font-semibold tracking-tight text-on-surface">
            {formatNumber(value)}
          </p>
        )}
        <h2 className="text-base font-semibold text-on-surface">{label}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </article>
  );
}

function RecentListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="rounded-[1.4rem] border border-white/70 bg-white/78 p-4"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-11 w-11 rounded-[1rem]" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface DashboardSectionProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  isLoading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyActionLabel: string;
  emptyActionHref: string;
  emptyIcon: LucideIcon;
  children: React.ReactNode;
}

function DashboardSection({
  title,
  description,
  actionLabel,
  actionHref,
  isLoading,
  isEmpty,
  emptyTitle,
  emptyActionLabel,
  emptyActionHref,
  emptyIcon: EmptyIcon,
  children,
}: DashboardSectionProps) {
  return (
    <SurfacePanel className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-on-surface">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit">
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <RecentListSkeleton />
      ) : isEmpty ? (
        <div className="rounded-[1.4rem] border border-dashed border-outline/20 bg-white/64 px-5 py-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-primary/10 text-primary">
            <EmptyIcon className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-on-surface">
            {emptyTitle}
          </h3>
          <div className="mt-5 flex justify-center">
            <Button asChild>
              <Link href={emptyActionHref}>
                <Plus className="mr-2 h-4 w-4" />
                {emptyActionLabel}
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        children
      )}
    </SurfacePanel>
  );
}

function HeroActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        { href: "/teacher/classes/create", label: "Tạo lớp học" },
        { href: "/teacher/exams/create", label: "Tạo đề thi" },
        { href: "/teacher/documents/create", label: "Đăng tài liệu" },
      ].map((action) => (
        <Button
          key={action.href}
          asChild
          variant="outline"
          size="lg"
          className="border-white/50 bg-white/95 px-4 font-semibold text-primary shadow-[0_18px_38px_-22px_rgba(15,23,42,0.42)] hover:border-white hover:bg-white hover:text-primary"
        >
          <Link href={action.href}>
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}

function DashboardHero({ teacherName }: { teacherName?: string | null }) {
  const welcomeName = teacherName?.trim() || "giáo viên";

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-linear-to-br from-primary via-tertiary to-secondary p-6 text-white shadow-[0_30px_90px_-46px_rgba(79,70,229,0.58)] sm:p-8">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/16 to-transparent" />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center rounded-full border border-white/22 bg-white/14 px-4 py-1.5 text-sm font-medium text-white shadow-[0_16px_42px_-30px_rgba(15,23,42,0.7)] backdrop-blur-xl">
            <Sparkles className="mr-2 h-4 w-4" />
            Không gian giáo viên
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Xin chào, {welcomeName} 👋
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/86 sm:text-base">
              Quản lý lớp học, đề thi và tài liệu của bạn tại một nơi.
            </p>
          </div>
          <HeroActions />
        </div>

        <div className="hidden min-w-72 rounded-[1.6rem] border border-white/18 bg-white/14 p-5 shadow-[0_24px_64px_-40px_rgba(15,23,42,0.72)] backdrop-blur-2xl lg:block">
          <p className="text-sm font-medium text-white/78">Hôm nay nên bắt đầu với</p>
          <div className="mt-4 space-y-3">
            {["Cập nhật lớp học", "Soạn đề thi mới", "Chia sẻ tài liệu"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-white/12 px-3 py-2.5 text-sm font-medium"
                >
                  <span className="h-2 w-2 rounded-full bg-white" />
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClassCard({ classInfo }: { classInfo: ClassInfo }) {
  const joinCode = classInfo.joinCode ?? classInfo.inviteCode;

  return (
    <article className="rounded-[1.4rem] border border-white/70 bg-white/82 p-4 shadow-[0_20px_62px_-44px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-0.5 hover:bg-white">
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] text-sm font-bold text-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.4)]"
          style={{ backgroundColor: classInfo.coverColor }}
        >
          {classInfo.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/teacher/classes/${classInfo.id}`}
            className="line-clamp-1 font-semibold text-on-surface transition-colors hover:text-primary"
          >
            {classInfo.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Mã tham gia:{" "}
            <span className="font-mono font-semibold text-on-surface">
              {joinCode}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2.5">
          <Users className="h-4 w-4 text-primary" />
          <span>{formatNumber(classInfo.studentCount ?? 0)} học sinh</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2.5">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>{formatDate(classInfo.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}

function ExamCard({ exam }: { exam: TeacherExam }) {
  const statusLabel = !exam.is_active
    ? "Tạm ngưng"
    : exam.is_published
      ? "Công khai"
      : "Riêng tư";
  const statusClassName = !exam.is_active
    ? "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
    : exam.is_published
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
      : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";

  return (
    <article className="rounded-[1.4rem] border border-white/70 bg-white/82 p-4 shadow-[0_20px_62px_-44px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-0.5 hover:bg-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-semibold text-on-surface">
            {exam.title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="rounded-xl bg-surface-container-low px-3 py-2">
              {formatNumber(exam.question_count)} câu hỏi
            </span>
            <span className="rounded-xl bg-surface-container-low px-3 py-2">
              {formatNumber(exam.total_points)} điểm
            </span>
          </div>
        </div>
        <span
          className={cn(
            "w-fit rounded-full px-3 py-1 text-xs font-semibold",
            statusClassName,
          )}
        >
          {statusLabel}
        </span>
      </div>
    </article>
  );
}

function DocumentCard({ document }: { document: Document }) {
  return (
    <article className="rounded-[1.4rem] border border-white/70 bg-white/82 p-4 shadow-[0_20px_62px_-44px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-0.5 hover:bg-white">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-tertiary/12 text-tertiary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 font-semibold text-on-surface">
            {document.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {document.description || "Chưa có tóm tắt cho tài liệu này."}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>Cập nhật {formatDate(document.updatedAt ?? document.createdAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function QuickActionsSection() {
  const quickActions: Array<{
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
    className: string;
  }> = [
    {
      href: "/teacher/classes/create",
      title: "Tạo lớp học",
      description: "Mở lớp mới, đặt mã tham gia và bắt đầu quản lý học sinh.",
      icon: GraduationCap,
      className: "from-primary/14 to-sky-100/80 text-primary",
    },
    {
      href: "/teacher/exams/create",
      title: "Tạo đề thi",
      description: "Soạn câu hỏi, điểm số và trạng thái công khai cho đề thi.",
      icon: FileCheck,
      className: "from-secondary/16 to-cyan-100/80 text-secondary",
    },
    {
      href: "/teacher/documents/create",
      title: "Đăng tài liệu",
      description: "Chia sẻ học liệu mới cho hệ thống của giáo viên.",
      icon: BookOpenText,
      className: "from-tertiary/16 to-emerald-100/80 text-tertiary",
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Thao tác nhanh
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Đi thẳng tới những công việc thường dùng nhất.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-[0_22px_70px_-44px_rgba(15,23,42,0.22)] transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_30px_80px_-46px_rgba(15,23,42,0.28)]"
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-linear-to-br",
                action.className,
              )}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-on-surface">
              {action.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {action.description}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Mở ngay
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DashboardError({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <SurfacePanel tone="muted" className="space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-destructive/10 text-destructive">
        <RefreshCcw className={cn("h-8 w-8", isRetrying && "animate-spin")} />
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Không thể tải dữ liệu
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Hệ thống chưa phản hồi đúng lúc. Bạn có thể thử tải lại bảng tổng quan.
        </p>
      </div>
      <Button type="button" onClick={onRetry} disabled={isRetrying}>
        <RefreshCcw className="mr-2 h-4 w-4" />
        Thử lại
      </Button>
    </SurfacePanel>
  );
}

export default function TeacherHomePage() {
  const { user } = useAuth();
  const classesQuery = useTeacherClasses();
  const examsQuery = useTeacherSystemExams(DASHBOARD_EXAM_QUERY);
  const documentsQuery = useTeacherSystemDocuments();

  const classes = classesQuery.data ?? EMPTY_CLASSES;
  const systemExams = examsQuery.data?.items ?? EMPTY_EXAMS;
  const systemDocuments = documentsQuery.data ?? EMPTY_DOCUMENTS;

  const recentClasses = useMemo(() => getRecentClasses(classes), [classes]);
  const recentExams = useMemo(() => getRecentExams(systemExams), [systemExams]);
  const recentDocuments = useMemo(
    () => getRecentDocuments(systemDocuments),
    [systemDocuments],
  );

  const isClassesLoading = classesQuery.isPending && !classesQuery.data;
  const isExamsLoading = examsQuery.isPending && !examsQuery.data;
  const isDocumentsLoading = documentsQuery.isPending && !documentsQuery.data;
  const isRetrying =
    classesQuery.isFetching || examsQuery.isFetching || documentsQuery.isFetching;
  const hasBlockingError =
    (classesQuery.isError && !classesQuery.data) ||
    (examsQuery.isError && !examsQuery.data) ||
    (documentsQuery.isError && !documentsQuery.data);

  function retryDashboard() {
    void Promise.all([
      classesQuery.refetch(),
      examsQuery.refetch(),
      documentsQuery.refetch(),
    ]);
  }

  return (
    <div className="space-y-8">
      <DashboardHero teacherName={user?.full_name} />

      {hasBlockingError ? (
        <DashboardError isRetrying={isRetrying} onRetry={retryDashboard} />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <DashboardStatCard
              label="Lớp học"
              value={classes.length}
              description="Tổng số lớp học đang quản lý"
              icon={Users}
              tone="primary"
              isLoading={isClassesLoading}
            />
            <DashboardStatCard
              label="Đề thi hệ thống"
              value={systemExams.length}
              description="Tổng số đề thi đã tạo"
              icon={FileCheck}
              tone="secondary"
              isLoading={isExamsLoading}
            />
            <DashboardStatCard
              label="Tài liệu"
              value={systemDocuments.length}
              description="Tổng số tài liệu đã đăng"
              icon={LibraryBig}
              tone="tertiary"
              isLoading={isDocumentsLoading}
            />
          </section>

          <QuickActionsSection />

          <div className="grid gap-6 xl:grid-cols-2">
            <DashboardSection
              title="Danh sách lớp học gần đây"
              description="Những lớp học mới nhất đang được bạn quản lý."
              actionLabel="Xem tất cả lớp học"
              actionHref="/teacher/classes"
              isLoading={isClassesLoading}
              isEmpty={recentClasses.length === 0}
              emptyTitle="Chưa có lớp học nào"
              emptyActionLabel="Tạo lớp học đầu tiên"
              emptyActionHref="/teacher/classes/create"
              emptyIcon={Users}
            >
              <div className="grid gap-3">
                {recentClasses.map((classInfo) => (
                  <ClassCard key={classInfo.id} classInfo={classInfo} />
                ))}
              </div>
            </DashboardSection>

            <DashboardSection
              title="Đề thi gần đây"
              description="Các đề thi hệ thống vừa được cập nhật gần đây."
              actionLabel="Xem tất cả đề thi"
              actionHref="/teacher/exams"
              isLoading={isExamsLoading}
              isEmpty={recentExams.length === 0}
              emptyTitle="Chưa có đề thi nào"
              emptyActionLabel="Tạo đề thi đầu tiên"
              emptyActionHref="/teacher/exams/create"
              emptyIcon={FileCheck}
            >
              <div className="grid gap-3">
                {recentExams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            </DashboardSection>
          </div>

          <DashboardSection
            title="Tài liệu gần đây"
            description="Các tài liệu hệ thống mới nhất để bạn theo dõi nhanh."
            actionLabel="Xem tất cả tài liệu"
            actionHref="/teacher/documents"
            isLoading={isDocumentsLoading}
            isEmpty={recentDocuments.length === 0}
            emptyTitle="Chưa có tài liệu nào"
            emptyActionLabel="Đăng tài liệu đầu tiên"
            emptyActionHref="/teacher/documents/create"
            emptyIcon={FileText}
          >
            <div className="grid gap-3 lg:grid-cols-2">
              {recentDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          </DashboardSection>
        </>
      )}
    </div>
  );
}
