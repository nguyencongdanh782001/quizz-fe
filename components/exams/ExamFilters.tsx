"use client";

import type { FormikProps } from "formik";
import { ArrowDownAZ, ArrowUpAZ, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeacherExamFilterFormValues } from "@/types/exam";
import {
  EXAM_ACTIVE_OPTIONS,
  EXAM_PUBLISHED_OPTIONS,
  EXAM_SORT_OPTIONS,
} from "./exam-utils";

interface ExamFiltersProps {
  formik: FormikProps<TeacherExamFilterFormValues>;
  hasActiveFilters: boolean;
  isSearchDebouncing: boolean;
  resultCount: number;
  totalCount: number;
  onReset: () => void;
}

export function ExamFilters({
  formik,
  hasActiveFilters,
  isSearchDebouncing,
  resultCount,
  totalCount,
  onReset,
}: ExamFiltersProps) {
  const activeFilterCount = [
    formik.values.search.trim(),
    formik.values.published !== "all",
    formik.values.active !== "all",
    formik.values.sort_by !== "updated_at",
    formik.values.sort_order !== "desc",
  ].filter(Boolean).length;

  return (
    <div className="sticky top-4 z-20">
      <form
        onSubmit={formik.handleSubmit}
        className="rounded-[28px] border border-outline/10 bg-surface-container-lowest/95 p-4 shadow-[0_22px_70px_-46px_rgba(7,30,39,0.28)] backdrop-blur-xl sm:p-5"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Bộ lọc bài thi
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Hiển thị {resultCount} / {totalCount} bài thi
                </span>
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {activeFilterCount} bộ lọc đang bật
                  </span>
                ) : null}
                {isSearchDebouncing ? (
                  <span className="rounded-full bg-secondary/12 px-2.5 py-1 text-xs font-semibold text-secondary">
                    Đang tìm kiếm...
                  </span>
                ) : null}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onReset}
              className="h-11 rounded-2xl px-4 text-muted-foreground hover:text-on-surface"
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="mr-2 size-4" />
              Đặt lại
            </Button>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.72fr))_auto]">
            <div className="min-w-0">
              <Label
                htmlFor="teacher-exam-search"
                className="mb-2 block text-xs font-medium text-on-surface-variant"
              >
                Tìm kiếm theo tiêu đề
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="teacher-exam-search"
                  name="search"
                  value={formik.values.search}
                  onChange={formik.handleChange}
                  placeholder="Nhập tiêu đề bài thi..."
                  className="h-12 rounded-2xl border-outline/15 bg-surface pl-10 pr-4 shadow-none"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-xs font-medium text-on-surface-variant">
                Xuất bản
              </Label>
              <Select
                value={formik.values.published}
                onValueChange={(value) => {
                  void formik.setFieldValue("published", value);
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl border-outline/15 bg-surface shadow-none">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {EXAM_PUBLISHED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-xs font-medium text-on-surface-variant">
                Hoạt động
              </Label>
              <Select
                value={formik.values.active}
                onValueChange={(value) => {
                  void formik.setFieldValue("active", value);
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl border-outline/15 bg-surface shadow-none">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {EXAM_ACTIVE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-xs font-medium text-on-surface-variant">
                Sắp xếp theo
              </Label>
              <Select
                value={formik.values.sort_by}
                onValueChange={(value) => {
                  void formik.setFieldValue("sort_by", value);
                }}
              >
                <SelectTrigger className="h-12 rounded-2xl border-outline/15 bg-surface shadow-none">
                  <SelectValue placeholder="Chọn tiêu chí" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {EXAM_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-xs font-medium text-on-surface-variant">
                Thứ tự
              </Label>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  void formik.setFieldValue(
                    "sort_order",
                    formik.values.sort_order === "asc" ? "desc" : "asc",
                  );
                }}
                className="h-12 w-full rounded-2xl border-outline/15 bg-surface px-4 shadow-none"
              >
                {formik.values.sort_order === "asc" ? (
                  <ArrowUpAZ className="mr-2 size-4" />
                ) : (
                  <ArrowDownAZ className="mr-2 size-4" />
                )}
                {formik.values.sort_order === "asc" ? "Tăng dần" : "Giảm dần"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
