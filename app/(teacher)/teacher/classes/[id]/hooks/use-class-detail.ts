"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getTeacherClassById,
  getTeacherClassDocuments,
  getTeacherClassExams,
  getTeacherClassStudents,
  removeTeacherClassStudent,
} from "@/lib/teacher-classes";
import type { ClassStudent, ClassInfo } from "@/types/class.types";
import type { Document } from "@/types/document.types";
import type { Exam } from "@/types/exam.types";
import { getErrorMessage } from "../utils";

export type TeacherClassTab = "students" | "exams" | "documents";

export function useClassDetail(classId: string) {
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [activeTab, setActiveTab] = useState<TeacherClassTab>("students");
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [classError, setClassError] = useState<string | null>(null);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [studentActionError, setStudentActionError] = useState<string | null>(
    null,
  );
  const [studentActionSuccess, setStudentActionSuccess] = useState<
    string | null
  >(null);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(
    null,
  );
  const [examsError, setExamsError] = useState<string | null>(null);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      setIsLoadingInitialData(true);
      setClassError(null);
      setStudentsError(null);
      setExamsError(null);
      setDocumentsError(null);
      setIsLoadingStudents(true);
      setIsLoadingExams(true);
      setIsLoadingDocuments(true);

      const [classResult, studentsResult, examsResult, documentsResult] =
        await Promise.allSettled([
          getTeacherClassById(classId),
          getTeacherClassStudents(classId),
          getTeacherClassExams(classId),
          getTeacherClassDocuments(classId),
        ]);

      if (!isMounted) {
        return;
      }

      if (classResult.status === "fulfilled") {
        setCls(classResult.value);
      } else {
        console.error(`Failed to fetch teacher class ${classId}`, classResult.reason);
        setCls(null);
        setClassError(
          getErrorMessage(
            classResult.reason,
            "Không thể tải thông tin lớp học. Vui lòng thử lại.",
          ),
        );
      }

      if (studentsResult.status === "fulfilled") {
        setStudents(studentsResult.value);
      } else {
        console.error(
          `Failed to fetch students for class ${classId}`,
          studentsResult.reason,
        );
        setStudents([]);
        setStudentsError(
          getErrorMessage(
            studentsResult.reason,
            "Không thể tải danh sách học sinh. Vui lòng thử lại.",
          ),
        );
      }

      if (examsResult.status === "fulfilled") {
        setExams(examsResult.value);
      } else {
        console.error(`Failed to fetch exams for class ${classId}`, examsResult.reason);
        setExams([]);
        setExamsError(
          getErrorMessage(
            examsResult.reason,
            "Không thể tải danh sách bài thi. Vui lòng thử lại.",
          ),
        );
      }

      if (documentsResult.status === "fulfilled") {
        setDocuments(documentsResult.value);
      } else {
        console.error(
          `Failed to fetch documents for class ${classId}`,
          documentsResult.reason,
        );
        setDocuments([]);
        setDocumentsError(
          getErrorMessage(
            documentsResult.reason,
            "Không thể tải tài liệu của lớp. Vui lòng thử lại.",
          ),
        );
      }

      setIsLoadingStudents(false);
      setIsLoadingExams(false);
      setIsLoadingDocuments(false);
      setIsLoadingInitialData(false);
    }

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [classId, refreshKey]);

  async function retryClassDetail() {
    setRefreshKey((current) => current + 1);
  }

  async function retryActiveTab() {
    switch (activeTab) {
      case "students": {
        setIsLoadingStudents(true);
        setStudentsError(null);

        try {
          const items = await getTeacherClassStudents(classId);
          setStudents(items);
        } catch (error) {
          console.error(`Failed to fetch students for class ${classId}`, error);
          setStudents([]);
          setStudentsError(
            getErrorMessage(
              error,
              "Không thể tải danh sách học sinh. Vui lòng thử lại.",
            ),
          );
        } finally {
          setIsLoadingStudents(false);
        }

        return;
      }

      case "exams": {
        setIsLoadingExams(true);
        setExamsError(null);

        try {
          const items = await getTeacherClassExams(classId);
          setExams(items);
        } catch (error) {
          console.error(`Failed to fetch exams for class ${classId}`, error);
          setExams([]);
          setExamsError(
            getErrorMessage(
              error,
              "Không thể tải danh sách bài thi. Vui lòng thử lại.",
            ),
          );
        } finally {
          setIsLoadingExams(false);
        }

        return;
      }

      case "documents": {
        setIsLoadingDocuments(true);
        setDocumentsError(null);

        try {
          const items = await getTeacherClassDocuments(classId);
          setDocuments(items);
        } catch (error) {
          console.error(`Failed to fetch documents for class ${classId}`, error);
          setDocuments([]);
          setDocumentsError(
            getErrorMessage(
              error,
              "Không thể tải tài liệu của lớp. Vui lòng thử lại.",
            ),
          );
        } finally {
          setIsLoadingDocuments(false);
        }

        return;
      }
    }
  }

  async function handleRemoveStudent(student: ClassStudent) {
    const isConfirmed = window.confirm(
      "Are you sure you want to remove this student from the class?",
    );

    if (!isConfirmed) {
      return;
    }

    setStudentActionError(null);
    setStudentActionSuccess(null);
    setRemovingStudentId(student.id);
    setIsLoadingStudents(true);

    try {
      const message = await removeTeacherClassStudent(classId, student.id);
      const [nextStudents, nextClass] = await Promise.all([
        getTeacherClassStudents(classId),
        getTeacherClassById(classId),
      ]);

      setStudents(nextStudents);
      setCls(nextClass);
      setStudentActionSuccess(message || "Student removed successfully");
    } catch (error) {
      console.error(
        `Failed to remove student ${student.id} from class ${classId}`,
        error,
      );
      setStudentActionError(
        getErrorMessage(
          error,
          "Không thể xóa học sinh khỏi lớp. Vui lòng thử lại.",
        ),
      );
    } finally {
      setIsLoadingStudents(false);
      setRemovingStudentId(null);
    }
  }

  const counts = useMemo(() => {
    return {
      students: isLoadingStudents ? (cls?.studentCount ?? 0) : students.length,
      exams: isLoadingExams ? (cls?.examCount ?? 0) : exams.length,
      documents: isLoadingDocuments ? (cls?.documentCount ?? 0) : documents.length,
    };
  }, [cls, documents.length, exams.length, isLoadingDocuments, isLoadingExams, isLoadingStudents, students.length]);

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
    studentActionError,
    studentActionSuccess,
    removingStudentId,
    retryClassDetail,
    retryActiveTab,
    handleRemoveStudent,
  };
}
