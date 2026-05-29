"use client";

import { useFormikContext } from "formik";
import { ClipboardList } from "lucide-react";
import { CheckboxField } from "@/components/common/form/checkbox-field";
import { InputField } from "@/components/common/form/input-field";
import { TextareaField } from "@/components/common/form/textarea-field";
import {
  EXAM_FLOW_MESSAGES,
  getExamClassroomLabel,
  getExamScopeLabel,
} from "@/components/exams/exam-flow-messages";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUploadField } from "./image-upload-field";
import type { TeacherExamFormValues } from "./types";

function getFieldError(
  error: unknown,
  touched: unknown,
  submitCount: number,
): string | undefined {
  return (submitCount > 0 || Boolean(touched)) && typeof error === "string"
    ? error
    : undefined;
}

export function ExamInfoStep() {
  const { values, errors, touched, setFieldValue, submitCount } =
    useFormikContext<TeacherExamFormValues>();

  return (
    <Card className="rounded-[32px] border-0 bg-surface-container-lowest shadow-[0_24px_70px_-46px_rgba(7,30,39,0.24)]">
      <CardHeader className="border-b border-outline/10 pb-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-display text-2xl text-on-surface">
              Bước 1. Thông tin đề thi
            </CardTitle>
            <CardDescription className="mt-2 max-w-3xl text-sm leading-relaxed">
              Nhập thông tin cơ bản của đề thi trước khi thêm câu hỏi và đáp án.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <InputField
          label={EXAM_FLOW_MESSAGES.labels.title}
          required
          value={values.title}
          onChange={(event) => void setFieldValue("title", event.target.value)}
          error={getFieldError(errors.title, touched.title, submitCount)}
          placeholder={EXAM_FLOW_MESSAGES.placeholders.title}
        />

        <TextareaField
          label={EXAM_FLOW_MESSAGES.labels.description}
          value={values.description}
          onChange={(event) =>
            void setFieldValue("description", event.target.value)
          }
          error={getFieldError(
            errors.description,
            touched.description,
            submitCount,
          )}
          placeholder={EXAM_FLOW_MESSAGES.placeholders.description}
          rows={5}
        />

        <div className="grid gap-5">
          <ImageUploadField
            id="exam-image-upload"
            label={EXAM_FLOW_MESSAGES.labels.image}
            value={values.image_url}
            onChange={(url) => void setFieldValue("image_url", url)}
            error={getFieldError(
              errors.image_url,
              touched.image_url,
              submitCount,
            )}
            helperText="Bạn có thể để trống nếu đề thi không sử dụng ảnh minh họa."
          />

          <InputField
            label={EXAM_FLOW_MESSAGES.labels.duration}
            required
            type="number"
            min={1}
            value={values.duration_minutes}
            onChange={(event) =>
              void setFieldValue("duration_minutes", Number(event.target.value))
            }
            error={getFieldError(
              errors.duration_minutes,
              touched.duration_minutes,
              submitCount,
            )}
            placeholder="45"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <InputField
            label={EXAM_FLOW_MESSAGES.labels.scope}
            value={getExamScopeLabel(values.scope)}
            disabled
            readOnly
          />
          <InputField
            label={EXAM_FLOW_MESSAGES.labels.classroom}
            value={getExamClassroomLabel(values.classroom_id)}
            disabled
            readOnly
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <CheckboxField
            label={EXAM_FLOW_MESSAGES.labels.published}
            description="Bật để đề thi được xuất bản ngay sau khi lưu."
            checked={values.is_published}
            onCheckedChange={(checked) =>
              void setFieldValue("is_published", checked)
            }
          />
          <CheckboxField
            label={EXAM_FLOW_MESSAGES.labels.activeStatus}
            description="Bật để đề thi sẵn sàng sử dụng ngay sau khi lưu."
            checked={values.is_active}
            onCheckedChange={(checked) =>
              void setFieldValue("is_active", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
