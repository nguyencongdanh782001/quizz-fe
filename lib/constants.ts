export const APP_NAME = "Scholar Clarity";
export const APP_DESCRIPTION = "Cổng Giải Đề Trực Tuyến";

// Route paths
export const ROUTES = {
  HOME: "/",
  EXAMS: "/exams",
  CLASSES: "/classes",
  HISTORY: "/history",
  DOCUMENTS: "/documents",
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    ROLE: "/auth/role",
  },
  TEACHER: {
    HOME: "/teacher",
    CLASSES: "/teacher/classes",
    EXAMS: "/teacher/exams",
    DOCUMENTS: "/teacher/documents",
  },
} as const;

// Grade levels
export const GRADE_LEVELS = [10, 11, 12] as const;
export type GradeLevel = (typeof GRADE_LEVELS)[number];

// Exam duration options (minutes)
export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const;

// Question types
export const QUESTION_TYPES = {
  SINGLE: "single",
  MULTIPLE: "multiple",
} as const;
export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];
