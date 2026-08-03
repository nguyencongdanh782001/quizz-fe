"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SaveAIExamFormState } from "./types";

interface AISavePanelProps {
  approvedCount: number;
  canSave: boolean;
  draftCount: number;
  isSaving: boolean;
  onSave: () => void;
  onValuesChange: (values: SaveAIExamFormState) => void;
  values: SaveAIExamFormState;
}

export function AISavePanel({
  approvedCount,
  canSave,
  draftCount,
  isSaving,
  onSave,
  onValuesChange,
  values,
}: AISavePanelProps) {
  function updateValues(patch: Partial<SaveAIExamFormState>) {
    onValuesChange({
      ...values,
      ...patch,
    });
  }

  return (
    <Card
      size="sm"
      className="min-h-[410px] rounded-[10px] border border-[#DDE2EB] bg-surface-container-lowest shadow-[0_1px_3px_rgba(30,41,59,0.08)]"
    >
      <CardHeader>
        <CardTitle className="font-display text-xl text-on-surface">
          Lưu đề AI
        </CardTitle>
        <CardDescription className="mt-1.5 text-sm leading-relaxed">
          Chỉ các câu đã duyệt sẽ được dùng khi lưu sang đề thi.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-outline/10 bg-surface p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Đã duyệt
            </p>
            <p className="mt-1.5 text-lg font-semibold text-on-surface">
              {approvedCount}/{draftCount}
            </p>
          </div>
          <div className="rounded-xl border border-outline/10 bg-surface p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Thời lượng
            </p>
            <p className="mt-1.5 text-lg font-semibold text-on-surface">
              {values.duration_minutes} phút
            </p>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-on-surface">
            Tên đề thi
          </span>
          <Input
            value={values.title}
            onChange={(event) => updateValues({ title: event.target.value })}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-on-surface">Mô tả</span>
          <Textarea
            value={values.description}
            onChange={(event) =>
              updateValues({ description: event.target.value })
            }
            className="min-h-20"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="space-y-2">
            <span className="text-sm font-medium text-on-surface">
              Thời lượng
            </span>
            <Input
              type="number"
              min={1}
              max={300}
              value={values.duration_minutes}
              onChange={(event) =>
                updateValues({
                  duration_minutes: Number(event.target.value) || 45,
                })
              }
            />
          </label>

          <label className="flex h-11 items-center gap-3 rounded-xl border border-outline/10 bg-surface px-3 text-sm font-medium text-on-surface">
            <Checkbox
              checked={values.is_published}
              onCheckedChange={(checked) =>
                updateValues({ is_published: Boolean(checked) })
              }
            />
            Xuất bản ngay
          </label>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            disabled={!canSave || isSaving}
            onClick={onSave}
            className="h-10 min-w-36 rounded-[6px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-4 text-xs font-semibold text-white shadow-sm hover:opacity-95 sm:min-w-40"
          >
            <Save className="size-4" />
            {isSaving ? "Đang lưu..." : "Lưu đề thi"}
          </Button>
        </div>

        {!canSave ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Cần có ít nhất một câu đã duyệt, quá trình tạo đề hoàn tất và tên
            đề thi hợp lệ trước khi lưu.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
