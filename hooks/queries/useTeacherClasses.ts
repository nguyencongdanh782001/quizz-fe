"use client";

import { useQuery } from "@tanstack/react-query";
import { getTeacherClasses } from "@/lib/teacher-classes";

export const teacherClassQueryKeys = {
  all: ["teacher-classrooms"] as const,
  list: () => teacherClassQueryKeys.all,
} as const;

export function useTeacherClasses() {
  return useQuery({
    queryKey: teacherClassQueryKeys.list(),
    queryFn: async () => getTeacherClasses(),
    staleTime: 60_000,
  });
}
