"use client";

import { useQuery } from "@tanstack/react-query";
import { getTeacherClasses } from "@/lib/teacher-classes";

const TEACHER_CLASSROOMS_QUERY_KEY = ["teacher-classrooms"] as const;

export function useTeacherClassrooms() {
  return useQuery({
    queryKey: TEACHER_CLASSROOMS_QUERY_KEY,
    queryFn: async () => getTeacherClasses(),
  });
}
