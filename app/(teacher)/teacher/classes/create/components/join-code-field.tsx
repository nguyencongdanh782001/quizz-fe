"use client";

import { useField, useFormikContext } from "formik";
import { ClassJoinCodeInput } from "../../components/class-join-code-input";
import type { CreateClassFormValues } from "./create-class-form";

export function JoinCodeField() {
  const [field, meta, helpers] = useField("join_code");
  const { setStatus } = useFormikContext<CreateClassFormValues>();

  return (
    <ClassJoinCodeInput
      id="join_code"
      label="Mã vào lớp"
      name={field.name}
      placeholder="Ví dụ: CVAN-10A1"
      required
      value={field.value}
      error={meta.touched ? meta.error : undefined}
      onChange={(value, source) => {
        setStatus(undefined);
        void helpers.setValue(value);

        if (source === "random") {
          void helpers.setTouched(true);
        }
      }}
    />
  );
}
