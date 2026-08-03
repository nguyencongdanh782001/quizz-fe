"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getStudentActivityChart,
  getStudentDashboardClasses,
  getStudentDashboardMetrics,
  getStudentInProgress,
  getStudentRecentActivities,
  getStudentRecommendedExams,
  getStudentSubjectProgress,
} from "@/services/student-dashboard.service";

export const studentDashboardQueryKeys = {
  all: ["student-dashboard"] as const,
  inProgress: () => [...studentDashboardQueryKeys.all, "in-progress"] as const,
  metrics: () => [...studentDashboardQueryKeys.all, "metrics"] as const,
  activityChart: (startDate?: string) =>
    [...studentDashboardQueryKeys.all, "activity-chart", startDate] as const,
  subjectProgress: () =>
    [...studentDashboardQueryKeys.all, "subject-progress"] as const,
  classes: (limit: number) =>
    [...studentDashboardQueryKeys.all, "classes", limit] as const,
  recommendedExams: (limit: number) =>
    [...studentDashboardQueryKeys.all, "recommended-exams", limit] as const,
  recentActivities: (limit: number) =>
    [...studentDashboardQueryKeys.all, "recent-activities", limit] as const,
};

export function useStudentInProgress() {
  return useQuery({
    queryKey: studentDashboardQueryKeys.inProgress(),
    queryFn: getStudentInProgress,
    staleTime: 30_000,
  });
}

export function useStudentDashboardMetrics() {
  return useQuery({
    queryKey: studentDashboardQueryKeys.metrics(),
    queryFn: getStudentDashboardMetrics,
    staleTime: 30_000,
  });
}

export function useStudentActivityChart(startDate?: string) {
  return useQuery({
    queryKey: studentDashboardQueryKeys.activityChart(startDate),
    queryFn: () => getStudentActivityChart(startDate),
    staleTime: 60_000,
  });
}

export function useStudentSubjectProgress() {
  return useQuery({
    queryKey: studentDashboardQueryKeys.subjectProgress(),
    queryFn: getStudentSubjectProgress,
    staleTime: 60_000,
  });
}

export function useStudentDashboardClasses(limit = 6) {
  return useQuery({
    queryKey: studentDashboardQueryKeys.classes(limit),
    queryFn: () => getStudentDashboardClasses(limit),
    staleTime: 30_000,
  });
}

export function useStudentRecommendedExams(limit = 3) {
  return useQuery({
    queryKey: studentDashboardQueryKeys.recommendedExams(limit),
    queryFn: () => getStudentRecommendedExams(limit),
    staleTime: 30_000,
  });
}

export function useStudentRecentActivities(limit = 5) {
  return useQuery({
    queryKey: studentDashboardQueryKeys.recentActivities(limit),
    queryFn: () => getStudentRecentActivities(limit),
    staleTime: 30_000,
  });
}
