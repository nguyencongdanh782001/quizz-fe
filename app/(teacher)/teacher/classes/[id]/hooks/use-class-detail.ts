"use client";

import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { APP_MESSAGES } from "@/lib/app-messages";
import {
  deleteTeacherClassroom,
  getTeacherClassById,
  getTeacherClassDocuments,
  getTeacherClassExams,
  getTeacherClassStudents,
  removeTeacherClassStudent,
  updateTeacherClassroom,
} from "@/lib/teacher-classes";
import type { ApiError, TeacherUpdateClassRequest } from "@/lib/api/types";
import type { ClassStudent, ClassInfo } from "@/types/class.types";
import { teacherClassDetailQueryKeys } from "../query-keys";

export type TeacherClassTab = "students" | "exams" | "documents";
export type RemoveStudentResult =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };
export type UpdateClassroomResult =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };
export type DeleteClassroomResult =
  | {
      status: "success";
      message: string;
      redirectToList?: boolean;
    }
  | {
      status: "error";
      message: string;
      redirectToList?: boolean;
    };

const CLASS_ERROR_MESSAGE = "Không thể tải thông tin lớp học. Vui lòng thử lại.";
const STUDENTS_ERROR_MESSAGE = APP_MESSAGES.LOAD_STUDENTS_FAILED;
const EXAMS_ERROR_MESSAGE = APP_MESSAGES.LOAD_EXAMS_FAILED;
const DOCUMENTS_ERROR_MESSAGE = APP_MESSAGES.LOAD_DOCUMENTS_FAILED;

export function useClassDetail(classId: string) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TeacherClassTab>("students");
  const [isDeletingClassroom, setIsDeletingClassroom] = useState(false);
  const [isUpdatingClassroom, setIsUpdatingClassroom] = useState(false);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(
    null,
  );
  const classDetailQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.detail(classId),
    queryFn: async () => getTeacherClassById(classId),
  });
  const studentsQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.students(classId),
    queryFn: async () => getTeacherClassStudents(classId),
  });
  const examsQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.exams(classId),
    queryFn: async () => getTeacherClassExams(classId),
    enabled: activeTab === "exams",
  });
  const documentsQuery = useQuery({
    queryKey: teacherClassDetailQueryKeys.documents(classId),
    queryFn: async () => getTeacherClassDocuments(classId),
    enabled: activeTab === "documents",
  });
  const removeStudentMutation = useMutation({
    mutationFn: async ({ studentId }: { studentId: string }) =>
      removeTeacherClassStudent(classId, studentId),
    onSuccess: (_message, variables) => {
      queryClient.setQueryData<ClassStudent[] | undefined>(
        teacherClassDetailQueryKeys.students(classId),
        (current) =>
          current?.filter((student) => student.id !== variables.studentId),
      );
      queryClient.setQueryData<ClassInfo | null | undefined>(
        teacherClassDetailQueryKeys.detail(classId),
        (current) =>
          current
            ? {
                ...current,
                studentCount: Math.max((current.studentCount ?? 0) - 1, 0),
              }
            : current,
      );

      void queryClient.invalidateQueries({
        queryKey: teacherClassDetailQueryKeys.detail(classId),
      });
      void queryClient.invalidateQueries({
        queryKey: teacherClassDetailQueryKeys.students(classId),
      });
    },
  });
  const updateClassroomMutation = useMutation({
    mutationFn: async (payload: TeacherUpdateClassRequest) =>
      updateTeacherClassroom(classId, payload),
    onSuccess: ({ classroom }) => {
      queryClient.setQueryData(
        teacherClassDetailQueryKeys.detail(classId),
        classroom,
      );

      void queryClient.invalidateQueries({
        queryKey: teacherClassDetailQueryKeys.detail(classId),
      });
    },
  });
  const deleteClassroomMutation = useMutation({
    mutationFn: async () => deleteTeacherClassroom(classId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["teacher-classrooms"],
      });
      queryClient.removeQueries({
        queryKey: teacherClassDetailQueryKeys.detail(classId),
      });
      queryClient.removeQueries({
        queryKey: teacherClassDetailQueryKeys.students(classId),
      });
      queryClient.removeQueries({
        queryKey: teacherClassDetailQueryKeys.exams(classId),
      });
      queryClient.removeQueries({
        queryKey: teacherClassDetailQueryKeys.documents(classId),
      });
    },
  });

  const cls = classDetailQuery.data ?? null;
  const students = studentsQuery.data ?? [];
  const exams = examsQuery.data ?? [];
  const documents = documentsQuery.data ?? [];

  async function retryClassDetail() {
    await Promise.all([classDetailQuery.refetch(), studentsQuery.refetch()]);
  }

  async function retryActiveTab() {
    switch (activeTab) {
      case "students":
        await studentsQuery.refetch();
        return;
      case "exams":
        await examsQuery.refetch();
        return;
      case "documents":
        await documentsQuery.refetch();
        return;
    }
  }

  async function handleRemoveStudent(
    student: ClassStudent,
  ): Promise<RemoveStudentResult> {
    setRemovingStudentId(student.id);

    try {
      await removeStudentMutation.mutateAsync({
        studentId: student.id,
      });

      return {
        status: "success",
        message: APP_MESSAGES.REMOVE_STUDENT_SUCCESS,
      };
    } catch (error) {
      console.error(
        `Failed to remove student ${student.id} from class ${classId}`,
        error,
      );

      return {
        status: "error",
        message: getApiErrorMessage(error, APP_MESSAGES.REMOVE_STUDENT_FAILED),
      };
    } finally {
      setRemovingStudentId(null);
    }
  }

  async function handleUpdateClassroom(
    payload: TeacherUpdateClassRequest,
  ): Promise<UpdateClassroomResult> {
    setIsUpdatingClassroom(true);

    try {
      await updateClassroomMutation.mutateAsync(payload);

      return {
        status: "success",
        message: APP_MESSAGES.UPDATE_CLASS_SUCCESS,
      };
    } catch (error) {
      console.error(`Failed to update class ${classId}`, error);

      return {
        status: "error",
        message: getApiErrorMessage(error, APP_MESSAGES.UPDATE_CLASS_FAILED),
      };
    } finally {
      setIsUpdatingClassroom(false);
    }
  }

  async function handleDeleteClassroom(): Promise<DeleteClassroomResult> {
    setIsDeletingClassroom(true);

    try {
      await deleteClassroomMutation.mutateAsync();

      return {
        status: "success",
        message: APP_MESSAGES.DELETE_CLASS_SUCCESS,
      };
    } catch (error) {
      console.error(`Failed to delete class ${classId}`, error);

      const apiError = error as ApiError;
      const message = getApiErrorMessage(error, APP_MESSAGES.DELETE_CLASS_FAILED);
      const shouldRedirectToList = apiError.status === 404;

      return {
        status: "error",
        message,
        redirectToList: shouldRedirectToList,
      };
    } finally {
      setIsDeletingClassroom(false);
    }
  }

  const isLoadingInitialData =
    classDetailQuery.isPending ||
    (studentsQuery.isPending && studentsQuery.data === undefined);
  const isLoadingStudents =
    studentsQuery.isPending && studentsQuery.data === undefined;
  const isLoadingExams =
    activeTab === "exams" &&
    examsQuery.isPending &&
    examsQuery.data === undefined;
  const isLoadingDocuments =
    activeTab === "documents" &&
    documentsQuery.isPending &&
    documentsQuery.data === undefined;

  const classError =
    classDetailQuery.isError && classDetailQuery.data === undefined
      ? getApiErrorMessage(classDetailQuery.error, CLASS_ERROR_MESSAGE)
      : null;
  const studentsError =
    studentsQuery.isError && studentsQuery.data === undefined
      ? getApiErrorMessage(studentsQuery.error, STUDENTS_ERROR_MESSAGE)
      : null;
  const examsError =
    examsQuery.isError && examsQuery.data === undefined
      ? getApiErrorMessage(examsQuery.error, EXAMS_ERROR_MESSAGE)
      : null;
  const documentsError =
    documentsQuery.isError && documentsQuery.data === undefined
      ? getApiErrorMessage(documentsQuery.error, DOCUMENTS_ERROR_MESSAGE)
      : null;

  const counts = {
    students: studentsQuery.data ? students.length : cls?.studentCount ?? 0,
    exams: examsQuery.data ? exams.length : cls?.examCount ?? 0,
    documents: documentsQuery.data ? documents.length : cls?.documentCount ?? 0,
  };

  return {
    cls,
    activeTab,
    setActiveTab,
    students,
    exams,
    documents,
    counts,
    isLoadingInitialData,
    isLoadingStudents,
    isLoadingExams,
    isLoadingDocuments,
    classError,
    studentsError,
    examsError,
    documentsError,
    isDeletingClassroom,
    isUpdatingClassroom,
    removingStudentId,
    retryClassDetail,
    retryActiveTab,
    handleDeleteClassroom,
    handleRemoveStudent,
    handleUpdateClassroom,
  };
}
