"use client";

import { Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { createTeacherClass } from "@/lib/teacher-classes";
import { ClassNameField } from "./class-name-field";
import { DescriptionField } from "./description-field";
import { JoinCodeField } from "./join-code-field";
import { FormActions } from "./form-actions";

export interface CreateClassFormValues {
  name: string;
  description: string;
  join_code: string;
}

interface CreateClassFormStatus {
  submitError?: string;
}

const initialValues: CreateClassFormValues = {
  name: "",
  description: "",
  join_code: "",
};

const createClassSchema = Yup.object({
  name: Yup.string()
    .transform((value) => value?.trim() ?? "")
    .required("Tên lớp không được để trống"),
  description: Yup.string(),
  join_code: Yup.string()
    .transform((value) => value?.trim() ?? "")
    .required("Mã vào lớp không được để trống"),
});

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Không thể tạo lớp học. Vui lòng thử lại.";
}

export function CreateClassForm() {
  const router = useRouter();

  async function handleSubmit(
    values: CreateClassFormValues,
    helpers: FormikHelpers<CreateClassFormValues>,
  ) {
    helpers.setStatus(undefined);

    try {
      await createTeacherClass(values);
      router.push("/teacher/classes");
    } catch (error) {
      helpers.setSubmitting(false);
      helpers.setStatus({
        submitError: getErrorMessage(error),
      } satisfies CreateClassFormStatus);
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={createClassSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, status }) => {
        const formStatus = status as CreateClassFormStatus | undefined;

        return (
          <Form className="space-y-5 pt-6">
            <ClassNameField />
            <DescriptionField />
            <JoinCodeField />

            {formStatus?.submitError && (
              <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Không thể tạo lớp học</p>
                    <p className="mt-1">{formStatus.submitError}</p>
                  </div>
                </div>
              </div>
            )}

            <FormActions isSubmitting={isSubmitting} />
          </Form>
        );
      }}
    </Formik>
  );
}
