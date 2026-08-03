import { client } from "@/lib/api/client";

export interface StudentInProgressItem {
  attempt_id: string | number;
  exam_id: string | number;
  title: string;
  subject_name?: string;
  chapter_name?: string;
  completed_questions: number;
  total_questions: number;
  progress_percentage: number;
}

export interface StudentDashboardMetrics {
  pending_exams_count: number;
  pending_exams_diff: string;
  average_score: number;
  score_diff: string;
  study_time_seconds?: number;
  study_time_display: string;
  study_time_diff: string;
  streak_days: number;
  streak_text?: string;
}

export interface StudentDailyActivity {
  day: string;
  date?: string;
  tests_completed: number;
  study_minutes: number;
  is_highlight?: boolean;
}

export interface StudentActivityChartData {
  daily_activities: StudentDailyActivity[];
  comparison_note?: string;
}

export interface StudentSubjectProgress {
  subject_id?: string | number;
  name: string;
  progress: number;
  color?: string;
}

export interface StudentDashboardClass {
  id: string | number;
  name: string;
  academic_year?: string;
  member_count?: number;
  status?: string;
}

export interface StudentRecommendedExam {
  id: string | number;
  title: string;
  subject_name: string;
  question_count: number;
  difficulty: string;
}

export interface StudentRecentActivity {
  id: string | number;
  action_type: string;
  title: string;
  time_ago: string;
  created_at?: string;
}

export async function getStudentInProgress(): Promise<StudentInProgressItem | null> {
  try {
    const res = await client.get<StudentInProgressItem | null>(
      "/student/dashboard/in-progress",
    );
    return res.data;
  } catch {
    return null;
  }
}

export async function getStudentDashboardMetrics(): Promise<StudentDashboardMetrics | null> {
  try {
    const res = await client.get<StudentDashboardMetrics>(
      "/student/dashboard/metrics",
    );
    return res.data;
  } catch {
    return null;
  }
}

export async function getStudentActivityChart(
  startDate?: string,
): Promise<StudentActivityChartData | null> {
  try {
    const res = await client.get<StudentActivityChartData>(
      "/student/dashboard/activity-chart",
      {
        params: startDate ? { start_date: startDate } : undefined,
      },
    );
    return res.data;
  } catch {
    return null;
  }
}

export async function getStudentSubjectProgress(): Promise<StudentSubjectProgress[]> {
  try {
    const res = await client.get<StudentSubjectProgress[]>(
      "/student/dashboard/subject-progress",
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function getStudentDashboardClasses(
  limit = 6,
): Promise<StudentDashboardClass[]> {
  try {
    const res = await client.get<StudentDashboardClass[]>(
      "/student/dashboard/classes",
      {
        params: { limit },
      },
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function getStudentRecommendedExams(
  limit = 3,
): Promise<StudentRecommendedExam[]> {
  try {
    const res = await client.get<StudentRecommendedExam[]>(
      "/student/dashboard/recommended-exams",
      {
        params: { limit },
      },
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function getStudentRecentActivities(
  limit = 5,
): Promise<StudentRecentActivity[]> {
  try {
    const res = await client.get<StudentRecentActivity[]>(
      "/student/dashboard/recent-activities",
      {
        params: { limit },
      },
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}
