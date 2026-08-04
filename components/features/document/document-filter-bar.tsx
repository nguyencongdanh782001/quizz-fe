"use client";

import { LoaderCircle, RotateCcw, Search } from "lucide-react";
import { SurfacePanel } from "@/components/shared/surface-panel";
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
import {
  ALL_DOCUMENT_CLASSROOMS_VALUE,
  ALL_DOCUMENT_PUBLISH_STATES_VALUE,
  ALL_DOCUMENT_SCOPES_VALUE,
} from "@/lib/teacher-document-filters";
import type { TeacherDocumentFilterState } from "@/types/document.types";

interface ClassroomOption {
  id: string;
  name: string;
}

interface DocumentFilterBarProps {
  classroomOptions: ClassroomOption[];
  filters: TeacherDocumentFilterState;
  hasActiveFilters: boolean;
  isClassroomOptionsLoading: boolean;
  isRefreshing: boolean;
  isSearchDebouncing: boolean;
  onFiltersChange: (nextFilters: TeacherDocumentFilterState) => void;
  onReset: () => void;
  resultCount: number;
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="teacher-document-search"
        className="text-sm font-medium text-on-surface"
      >
        Tìm kiếm
      </Label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="teacher-document-search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Tìm theo tiêu đề tài liệu..."
          className="h-12 rounded-[6px] border-outline/15 bg-surface-container-lowest pl-10 shadow-none"
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  allValue,
  onValueChange,
  disabled = false,
}: {
  allValue: string;
  disabled?: boolean;
  label: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-on-surface">{label}</Label>
      <Select
        value={value || allValue}
        onValueChange={(nextValue) =>
          onValueChange(nextValue === allValue ? "" : nextValue)
        }
        disabled={disabled}
      >
        <SelectTrigger className="h-12 rounded-[6px] border-outline/15 bg-surface-container-lowest shadow-none">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value={allValue}>{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function DocumentFilterBar({
  classroomOptions,
  filters,
  hasActiveFilters,
  isClassroomOptionsLoading,
  isRefreshing,
  isSearchDebouncing,
  onFiltersChange,
  onReset,
  resultCount,
}: DocumentFilterBarProps) {
  const isClassroomScope = filters.scope === "classroom";

  return (
    <SurfacePanel tone="muted" className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-on-surface">Bộ lọc tài liệu</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{resultCount} tài liệu phù hợp</span>
            {isSearchDebouncing || isRefreshing ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-1 text-primary">
                <LoaderCircle className="size-3 animate-spin" />
                Đang cập nhật
              </span>
            ) : null}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="h-11 rounded-[6px] px-4 text-muted-foreground hover:text-on-surface"
        >
          <RotateCcw className="mr-2 size-4" />
          Đặt lại bộ lọc
        </Button>
      </div>

      <div className="grid gap-4">
        <SearchInput
          value={filters.search}
          onChange={(search) => onFiltersChange({ ...filters, search })}
        />

        <div
          className={
            isClassroomScope
              ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "grid gap-4 md:grid-cols-2"
          }
        >
          <SelectField
            label="Phạm vi"
            value={filters.scope}
            placeholder="Tất cả phạm vi"
            allValue={ALL_DOCUMENT_SCOPES_VALUE}
            options={[
              { value: "system", label: "Hệ thống" },
              { value: "classroom", label: "Lớp học" },
            ]}
            onValueChange={(scope) =>
              onFiltersChange({
                ...filters,
                scope: scope as TeacherDocumentFilterState["scope"],
                classroom_id: scope === "classroom" ? filters.classroom_id : "",
              })
            }
          />

          <SelectField
            label="Trạng thái"
            value={filters.is_published}
            placeholder="Tất cả trạng thái"
            allValue={ALL_DOCUMENT_PUBLISH_STATES_VALUE}
            options={[
              { value: "true", label: "Đã xuất bản" },
              { value: "false", label: "Chưa xuất bản" },
            ]}
            onValueChange={(is_published) =>
              onFiltersChange({
                ...filters,
                is_published:
                  is_published as TeacherDocumentFilterState["is_published"],
              })
            }
          />

          {isClassroomScope ? (
            <div className="space-y-2">
              <SelectField
                label="Lớp học"
                value={filters.classroom_id}
                placeholder="Chọn lớp học"
                allValue={ALL_DOCUMENT_CLASSROOMS_VALUE}
                options={classroomOptions.map((option) => ({
                  value: option.id,
                  label: option.name,
                }))}
                onValueChange={(classroom_id) =>
                  onFiltersChange({
                    ...filters,
                    classroom_id,
                  })
                }
                disabled={
                  isClassroomOptionsLoading || classroomOptions.length === 0
                }
              />
              {classroomOptions.length === 0 && !isClassroomOptionsLoading ? (
                <p className="text-xs text-muted-foreground">
                  Chưa có lớp học để chọn.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </SurfacePanel>
  );
}
