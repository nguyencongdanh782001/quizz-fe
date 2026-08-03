"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Clock,
  DoorOpen,
  FileText,
  Flame,
  Library,
  MoreVertical,
  Play,
  Star,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useStudentActivityChart,
  useStudentDashboardClasses,
  useStudentDashboardMetrics,
  useStudentInProgress,
  useStudentRecentActivities,
  useStudentRecommendedExams,
  useStudentSubjectProgress,
} from "@/hooks/queries/use-student-dashboard";
import { getStudentClasses, joinStudentClass } from "@/lib/student-classes";
import { cn } from "@/lib/utils";
import type { ClassInfo } from "@/types/class.types";

const DEFAULT_WEEKLY_ACTIVITY = [
  { day: "Thứ 2", tests_completed: 0, study_minutes: 0 },
  { day: "Thứ 3", tests_completed: 0, study_minutes: 0 },
  { day: "Thứ 4", tests_completed: 0, study_minutes: 0 },
  { day: "Thứ 5", tests_completed: 0, study_minutes: 0 },
  { day: "Thứ 6", tests_completed: 0, study_minutes: 0 },
  { day: "Thứ 7", tests_completed: 0, study_minutes: 0 },
  { day: "CN", tests_completed: 0, study_minutes: 0 },
];

export default function StudentHomePage() {
  const { user } = useAuth();

  // API Hooks Integration (7 Backend Endpoints)
  const inProgressQuery = useStudentInProgress();
  const metricsQuery = useStudentDashboardMetrics();
  const activityChartQuery = useStudentActivityChart();
  const subjectProgressQuery = useStudentSubjectProgress();
  const dashboardClassesQuery = useStudentDashboardClasses(6);
  const recommendedExamsQuery = useStudentRecommendedExams(3);
  const recentActivitiesQuery = useStudentRecentActivities(5);

  const [localClasses, setLocalClasses] = useState<ClassInfo[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadClasses() {
      const items = await getStudentClasses();
      if (mounted) {
        setLocalClasses(items);
      }
    }
    void loadClasses();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleJoinClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = joinCode.trim().toUpperCase();

    if (!normalizedCode) {
      setJoinMessage({ type: "error", text: "Vui lòng nhập mã lớp." });
      return;
    }

    setIsJoining(true);
    setJoinMessage(null);
    try {
      const joinedClass = await joinStudentClass(normalizedCode);
      setLocalClasses((current) => [
        joinedClass,
        ...current.filter((item) => item.id !== joinedClass.id),
      ]);
      setJoinCode("");
      setJoinMessage({
        type: "success",
        text: `Đã tham gia lớp ${joinedClass.name}.`,
      });
      void dashboardClassesQuery.refetch();
    } catch (error) {
      const text =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Không thể tham gia lớp. Vui lòng thử lại.";
      setJoinMessage({ type: "error", text });
    } finally {
      setIsJoining(false);
    }
  }

  const userName = user?.full_name?.trim() || "Học sinh";

  // Real API Data Processing
  const inProgressData = inProgressQuery.data;
  const metricsData = metricsQuery.data;

  // Activity Chart Data
  const rawChartActivities = activityChartQuery.data?.daily_activities;
  const chartData =
    rawChartActivities && rawChartActivities.length > 0
      ? rawChartActivities
      : DEFAULT_WEEKLY_ACTIVITY;

  const hasActivityData = useMemo(() => {
    return chartData.some(
      (item) => (item.tests_completed ?? 0) > 0 || (item.study_minutes ?? 0) > 0,
    );
  }, [chartData]);

  const comparisonNote = hasActivityData
    ? activityChartQuery.data?.comparison_note ||
      "Hôm nay bạn đã hoàn thành bài thi trong tuần."
    : "Bạn chưa có hoạt động làm bài nào tuần này. Hãy bắt đầu ngay!";

  // Subject Progress Data (Direct from BE API response)
  const subjectProgressData = useMemo(() => {
    const raw = subjectProgressQuery.data;
    if (raw && raw.length > 0) {
      return raw.map((item, idx) => ({
        name: item.name,
        progress: item.progress ?? 0,
        color:
          item.color ||
          ["bg-[#8B5CF6]", "bg-[#FF5E84]", "bg-[#F59E0B]", "bg-[#10B981]", "bg-[#3B82F6]"][
            idx % 5
          ],
      }));
    }
    return [];
  }, [subjectProgressQuery.data]);

  // Display Classes
  const displayClasses = useMemo(() => {
    if (dashboardClassesQuery.data && dashboardClassesQuery.data.length > 0) {
      return dashboardClassesQuery.data;
    }
    if (localClasses.length > 0) {
      return localClasses.map((cls) => ({
        id: cls.id,
        name: cls.name,
        academic_year: "Năm học 2024 - 2025",
        member_count: cls.studentCount || 18,
        status: "Đang học",
      }));
    }
    return [];
  }, [dashboardClassesQuery.data, localClasses]);

  // Recommended Exams Data
  const recommendedExamsData = recommendedExamsQuery.data ?? [];

  // Recent Activities Data
  const recentActivitiesData = recentActivitiesQuery.data ?? [];

  return (
    <div className="space-y-5 pb-6">
      {/* Row 1: Metrics & Tiếp tục học */}
      <section className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-12">
        {/* Card 1: Tiếp tục học */}
        <div className="flex flex-col justify-between rounded-[8px] border border-[#CBD5E1] bg-white p-4 shadow-xs lg:col-span-4">
          {inProgressData ? (
            <>
              <div>
                <h2 className="text-xs font-bold text-[#1E293B]">Tiếp tục học</h2>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-[#EEF2FF] text-[#6366F1]">
                    <BookOpen className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="line-clamp-1 text-xs font-bold text-[#1E293B]">
                        {inProgressData.title}
                      </h3>
                      <ChevronRight className="size-4 shrink-0 text-[#94A3B8]" />
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#64748B]">
                      {inProgressData.subject_name || "Môn học"}
                      {inProgressData.chapter_name
                        ? ` • ${inProgressData.chapter_name}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#FFE4E6]">
                    <div
                      className="h-full rounded-full bg-[#FF5E84] transition-all duration-500"
                      style={{
                        width: `${inProgressData.progress_percentage ?? 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#64748B]">
                      Bạn đã làm {inProgressData.completed_questions ?? 0}/
                      {inProgressData.total_questions ?? 0} câu
                    </span>
                    <span className="font-bold text-[#FF5E84]">
                      {inProgressData.progress_percentage ?? 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 flex justify-end pt-2">
                <Link
                  href={`/student/exam/${inProgressData.exam_id}`}
                  className="rounded-[6px] bg-[#FFF0F3] px-3.5 py-1.5 text-xs font-bold text-[#FF5E84] transition-all hover:bg-[#FFE4E6]"
                >
                  Tiếp tục
                </Link>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-xs font-bold text-[#1E293B]">Tiếp tục học</h2>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-[#EEF2FF] text-[#6366F1]">
                    <BookOpen className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-[#1E293B]">
                      Chưa có bài thi đang thực hiện
                    </h3>
                    <p className="mt-1 text-[11px] text-[#64748B]">
                      Hãy chọn đề thi mới để bắt đầu ôn luyện kiến thức!
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/student/exams"
                  className="rounded-[6px] bg-[#EEF2FF] px-3.5 py-1.5 text-xs font-bold text-[#5B45F6] transition-all hover:bg-[#E0E7FF]"
                >
                  Khám phá đề thi
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Card 2: Đề thi cần làm */}
        <div className="flex flex-col justify-between rounded-[8px] border border-[#CBD5E1] bg-white p-4 shadow-xs lg:col-span-2">
          <div className="flex size-9 items-center justify-center rounded-[6px] bg-[#EEF2FF] text-[#6366F1]">
            <ClipboardList className="size-4.5" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-[#64748B]">Đề thi cần làm</p>
            <p className="mt-1 text-2xl font-extrabold text-[#1E293B]">
              {metricsData?.pending_exams_count ?? 0}
            </p>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-[#6366F1]">
            {(metricsData?.pending_exams_count ?? 0) === 0
              ? "Không có đề cần làm"
              : metricsData?.pending_exams_diff || "Cập nhật hôm nay"}
          </p>
        </div>

        {/* Card 3: Điểm trung bình */}
        <div className="flex flex-col justify-between rounded-[8px] border border-[#CBD5E1] bg-white p-4 shadow-xs lg:col-span-2">
          <div className="flex size-9 items-center justify-center rounded-[6px] bg-[#FFF8EC] text-[#F59E0B]">
            <Award className="size-4.5" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-[#64748B]">Điểm trung bình</p>
            <p className="mt-1 text-2xl font-extrabold text-[#1E293B]">
              {metricsData?.average_score ?? 0}
            </p>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-emerald-600">
            {(metricsData?.average_score ?? 0) === 0
              ? "Chưa có kết quả"
              : metricsData?.score_diff || "Chưa có kết quả"}
          </p>
        </div>

        {/* Card 4: Thời gian học tuần này */}
        <div className="flex flex-col justify-between rounded-[8px] border border-[#CBD5E1] bg-white p-4 shadow-xs lg:col-span-2">
          <div className="flex size-9 items-center justify-center rounded-[6px] bg-[#ECFDF5] text-[#10B981]">
            <Clock className="size-4.5" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-[#64748B]">
              Thời gian học tuần này
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[#1E293B]">
              {metricsData?.study_time_display || "0m"}
            </p>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-emerald-600">
            {metricsData?.study_time_display === "0m" || !metricsData?.study_time_display
              ? "Chưa có phút học"
              : metricsData?.study_time_diff || "Chưa có phút học"}
          </p>
        </div>

        {/* Card 5: Chuỗi ngày học */}
        <div className="flex flex-col justify-between rounded-[8px] border border-[#CBD5E1] bg-white p-4 shadow-xs lg:col-span-2">
          <div className="flex size-9 items-center justify-center rounded-[6px] bg-[#FFF0F3] text-[#FF5E84]">
            <Flame className="size-4.5 fill-current" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-[#64748B]">Chuỗi ngày học</p>
            <p className="mt-1 text-2xl font-extrabold text-[#1E293B]">
              {metricsData?.streak_days ?? 0}
            </p>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-[#FF5E84]">
            {(metricsData?.streak_days ?? 0) === 0
              ? "0 ngày liên tiếp"
              : metricsData?.streak_text || "Ngày liên tiếp"}
          </p>
        </div>
      </section>

      {/* Row 2: Biểu đồ & Tiến độ theo môn */}
      <section className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        {/* Left Chart: Hoạt động học tập 7 ngày */}
        <div className="flex flex-col justify-between rounded-[8px] border border-[#CBD5E1] bg-white p-4 shadow-xs sm:p-5 lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-bold text-[#1E293B]">
                Hoạt động học tập 7 ngày
              </h2>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="size-2 rounded-full bg-[#6366F1]" />
                  Số bài đã làm
                </span>
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="size-2 rounded-full bg-[#C7D2FE]" />
                  Phút học
                </span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="relative mt-6 pt-6 pb-2">
              <div className="flex h-44 items-end justify-between gap-2 px-2">
                {chartData.map((item, idx) => {
                  const testsCount = item.tests_completed ?? 0;
                  const minutesCount = item.study_minutes ?? 0;
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={item.day || idx}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="relative flex flex-1 cursor-pointer flex-col items-center gap-1.5 h-full justify-end"
                    >
                      {/* Show tooltip ONLY when hovered OR when data > 0 */}
                      {isHovered && (testsCount > 0 || minutesCount > 0) && (
                        <div className="absolute -top-10 z-10 rounded-[6px] bg-[#1E293B] px-2.5 py-1.5 text-center text-[10px] text-white shadow-md">
                          <p className="font-bold">{testsCount} bài</p>
                          <p className="opacity-90">{minutesCount} phút</p>
                        </div>
                      )}
                      <div className="flex w-full items-end justify-center gap-1">
                        <div
                          className={cn(
                            "w-2.5 rounded-t-md transition-all duration-300",
                            testsCount > 0 ? "bg-[#6366F1]" : "bg-[#CBD5E1]",
                          )}
                          style={{
                            height: `${Math.max(testsCount * 18, 4)}px`,
                          }}
                        />
                        <div
                          className={cn(
                            "w-2.5 rounded-t-md transition-all duration-300",
                            minutesCount > 0 ? "bg-[#A5B4FC]" : "bg-[#E2E8F0]",
                          )}
                          style={{
                            height: `${Math.max(minutesCount * 1.8, 4)}px`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-[#64748B]">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-[#F1F5F9] pt-3 text-[11px] text-[#64748B]">
            ⭐ {comparisonNote}
          </div>
        </div>

        {/* Right Box: Tiến độ theo môn */}
        <div className="flex flex-col justify-between rounded-[8px] border border-[#CBD5E1] bg-white p-4 shadow-xs sm:p-5 lg:col-span-5">
          <div>
            <h2 className="text-xs font-bold text-[#1E293B]">Tiến độ theo môn</h2>
            {subjectProgressData.length > 0 ? (
              <div className="mt-4 space-y-3.5">
                {subjectProgressData.map((subject, idx) => {
                  const progValue = subject.progress ?? 0;
                  return (
                    <div key={subject.name || idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#1E293B]">{subject.name}</span>
                        <span className="text-[#64748B]">{progValue}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            subject.color || "bg-[#8B5CF6]",
                          )}
                          style={{ width: `${progValue}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-[#94A3B8]">
                Chưa có dữ liệu tiến độ môn học.
                <p className="mt-1 text-[11px] text-[#CBD5E1]">
                  Hãy hoàn thành bài thi để xem thống kê tiến độ theo môn!
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-2">
            <Link
              href="/student/exams"
              className="block w-full rounded-[6px] bg-[#F8FAFC] py-2 text-center text-xs font-bold text-[#475569] border border-[#CBD5E1] transition-colors hover:bg-[#F1F5F9]"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </section>

      {/* Row 3: Bottom 3 Columns */}
      <section className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        {/* Column 1: Lớp học của tôi */}
        <div className="flex flex-col justify-between rounded-[8px] border border-[#CBD5E1] bg-white p-4 shadow-xs">
          <div>
            {/* Class Join Form */}
            <form
              onSubmit={(e) => void handleJoinClass(e)}
              className="mb-4 rounded-[6px] border border-[#EEF2FF] bg-[#F8FAFC] p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <DoorOpen className="size-4 text-[#6366F1]" />
                <span className="text-xs font-bold text-[#1E293B]">
                  Tham gia lớp học mới bằng mã
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã lớp..."
                  maxLength={30}
                  className="h-8 min-w-0 flex-1 rounded-[6px] border border-[#CBD5E1] bg-white px-2.5 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#6366F1]"
                />
                <button
                  type="submit"
                  disabled={isJoining}
                  className="h-8 rounded-[6px] bg-[#5B45F6] px-3 text-xs font-bold text-white transition-all hover:bg-[#4B34E5] disabled:opacity-60"
                >
                  {isJoining ? "..." : "Tham gia"}
                </button>
              </div>
              {joinMessage ? (
                <p
                  className={
                    joinMessage.type === "success"
                      ? "text-[11px] text-emerald-600 font-semibold"
                      : "text-[11px] text-rose-600 font-semibold"
                  }
                >
                  {joinMessage.text}
                </p>
              ) : null}
            </form>

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-[#1E293B]">
                Lớp học của tôi{" "}
                <span className="text-[#6366F1]">
                  ({displayClasses.length})
                </span>
              </h2>
              <Link
                href="/student/classes"
                className="text-xs font-semibold text-[#6366F1] hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            {displayClasses.length > 0 ? (
              <div className="space-y-2.5">
                {displayClasses.slice(0, 3).map((cls, idx) => (
                  <div
                    key={cls.id || idx}
                    className="flex items-center justify-between rounded-[6px] border border-[#F1F5F9] bg-[#F8FAFC] p-3 transition-colors hover:border-[#CBD5E1]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-[6px]",
                          idx === 0
                            ? "bg-[#EEF2FF] text-[#6366F1]"
                            : idx === 1
                              ? "bg-[#FFF8EC] text-[#F59E0B]"
                              : "bg-[#ECFDF5] text-[#10B981]",
                        )}
                      >
                        <BookOpen className="size-4.5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[#1E293B]">
                          {cls.name}
                        </h3>
                        <p className="text-[11px] text-[#64748B]">
                          {cls.academic_year || "Năm học 2024 - 2025"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span
                          className={cn(
                            "inline-block rounded-[4px] px-2 py-0.5 text-[10px] font-bold",
                            cls.status === "Tạm dừng"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600",
                          )}
                        >
                          {cls.status || "Đang học"}
                        </span>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">
                          {cls.member_count || 0} thành viên
                        </p>
                      </div>
                      <MoreVertical className="size-4 text-[#94A3B8] cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#94A3B8]">
                Bạn chưa tham gia lớp học nào.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Đề thi đề xuất cho bạn */}
        <div className="flex flex-col justify-between rounded-[8px] border border-[#CBD5E1] bg-white p-4 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-[#1E293B]">
                Đề thi đề xuất cho bạn
              </h2>
              <Link
                href="/student/exams"
                className="text-xs font-semibold text-[#6366F1] hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            {recommendedExamsData.length > 0 ? (
              <div className="space-y-2.5">
                {recommendedExamsData.map((exam, idx) => (
                  <div
                    key={exam.id || idx}
                    className="flex items-center justify-between rounded-[6px] border border-[#F1F5F9] bg-[#F8FAFC] p-3 transition-colors hover:border-[#CBD5E1]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-[6px]",
                          idx === 0
                            ? "bg-[#FFF0F3] text-[#FF5E84]"
                            : idx === 1
                              ? "bg-[#FFF8EC] text-[#F59E0B]"
                              : "bg-[#ECFDF5] text-[#10B981]",
                        )}
                      >
                        <FileText className="size-4.5" />
                      </div>
                      <div>
                        <h3 className="line-clamp-1 text-xs font-bold text-[#1E293B]">
                          {exam.title}
                        </h3>
                        <p className="text-[11px] text-[#64748B]">
                          {exam.subject_name} • {exam.question_count} câu •{" "}
                          {exam.difficulty}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/student/exams`}
                      className="shrink-0 rounded-[6px] border border-[#CBD5E1] bg-white px-3 py-1 text-xs font-bold text-[#1E293B] transition-colors hover:bg-[#EEF2FF] hover:text-[#6366F1]"
                    >
                      Làm thử
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#94A3B8]">
                Chưa có đề thi đề xuất.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Hoạt động gần đây */}
        <div className="flex flex-col justify-between rounded-[8px] border border-[#CBD5E1] bg-white p-4 shadow-xs">
          <div>
            <h2 className="text-xs font-bold text-[#1E293B] mb-3">
              Hoạt động gần đây
            </h2>

            {recentActivitiesData.length > 0 ? (
              <div className="space-y-3">
                {recentActivitiesData.map((act, idx) => {
                  const iconClass =
                    act.action_type === "exam_submit"
                      ? "bg-[#EEF2FF] text-[#6366F1]"
                      : act.action_type === "class_join"
                        ? "bg-[#FFF8EC] text-[#F59E0B]"
                        : act.action_type === "document_open"
                          ? "bg-[#ECFDF5] text-[#10B981]"
                          : "bg-[#FFF0F3] text-[#FF5E84]";

                  const IconComp =
                    act.action_type === "exam_submit"
                      ? ClipboardList
                      : act.action_type === "class_join"
                        ? UserCheck
                        : act.action_type === "document_open"
                          ? FileText
                          : Star;

                  return (
                    <div key={act.id || idx} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-[6px] mt-0.5",
                          iconClass,
                        )}
                      >
                        <IconComp className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-medium leading-tight text-[#1E293B]">
                          {act.title}
                        </p>
                        <p className="mt-1 text-[10px] text-[#94A3B8]">
                          {act.time_ago}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#94A3B8]">
                Chưa có hoạt động nào gần đây.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
