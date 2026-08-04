"use client";

export interface TeacherClassesFlashToast {
  message: string;
  variant: "error" | "success";
}

const TEACHER_CLASSES_FLASH_TOAST_KEY = "teacher-classes-flash-toast";

export function readTeacherClassesFlashToast(): TeacherClassesFlashToast | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.sessionStorage.getItem(
    TEACHER_CLASSES_FLASH_TOAST_KEY,
  );

  if (!storedValue) {
    return null;
  }

  window.sessionStorage.removeItem(TEACHER_CLASSES_FLASH_TOAST_KEY);

  try {
    const parsed = JSON.parse(storedValue) as Partial<TeacherClassesFlashToast>;

    if (
      typeof parsed.message === "string" &&
      (parsed.variant === "success" || parsed.variant === "error")
    ) {
      return {
        message: parsed.message,
        variant: parsed.variant,
      };
    }
  } catch (error) {
    console.error("Failed to parse teacher classes flash toast", error);
  }

  return null;
}

export function setTeacherClassesFlashToast(
  toast: TeacherClassesFlashToast,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    TEACHER_CLASSES_FLASH_TOAST_KEY,
    JSON.stringify(toast),
  );
}
