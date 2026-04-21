"use client";

import { useEffect } from "react";

interface FormikAutofillSyncProps<TFieldName extends string> {
  fields: readonly TFieldName[];
  setFieldValue: (
    field: TFieldName,
    value: string,
    shouldValidate?: boolean,
  ) => void | Promise<unknown>;
}

export function FormikAutofillSync<TFieldName extends string>({
  fields,
  setFieldValue,
}: FormikAutofillSyncProps<TFieldName>) {
  useEffect(() => {
    const syncAutofilledValues = () => {
      fields.forEach((field) => {
        const input = document.querySelector<HTMLInputElement>(
          `input[name="${field}"]`,
        );

        if (input?.value) {
          void setFieldValue(field, input.value, false);
        }
      });
    };

    const timers = [0, 150, 500].map((delay) =>
      window.setTimeout(syncAutofilledValues, delay),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [fields, setFieldValue]);

  return null;
}
