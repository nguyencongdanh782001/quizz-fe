"use client";

import { useField, useFormikContext } from "formik";
import { InputField } from "@/components/forms/field-components";
import type { CreateClassFormValues } from "./create-class-form";

export function ClassNameField() {
  const [field, meta, helpers] = useField("name");
  const { setStatus } = useFormikContext<CreateClassFormValues>();

  return (
    <InputField
      label="Tên lớp"
      placeholder="Ví dụ: Lớp 10A1 — THPT Chu Văn An"
      required
      error={meta.touched ? meta.error : undefined}
      {...field}
      onChange={(event) => {
        setStatus(undefined);
        helpers.setValue(event.target.value);
      }}
    />
  );
}
