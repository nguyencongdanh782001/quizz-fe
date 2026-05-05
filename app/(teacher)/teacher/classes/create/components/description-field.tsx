"use client";

import { useField, useFormikContext } from "formik";
import { TextAreaField } from "@/components/forms/field-components";
import type { CreateClassFormValues } from "./create-class-form";

export function DescriptionField() {
  const [field, meta, helpers] = useField("description");
  const { setStatus } = useFormikContext<CreateClassFormValues>();

  return (
    <TextAreaField
      label="Mô tả"
      placeholder="Mô tả ngắn gọn về lớp học..."
      rows={5}
      error={meta.touched ? meta.error : undefined}
      {...field}
      onChange={(event) => {
        setStatus(undefined);
        helpers.setValue(event.target.value);
      }}
    />
  );
}
