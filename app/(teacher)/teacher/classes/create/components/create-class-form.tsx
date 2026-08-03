"use client";

import { Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { createTeacherClass } from "@/lib/teacher-classes";
import { APP_MESSAGES } from "@/lib/app-messages";
import type { ClassInfo } from "@/types/class.types";
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

interface CreateClassFormProps {
  onCancel?: () => void;
  onSuccess?: (classroom: ClassInfo) => void;
}

export function CreateClassForm({
  onCancel,
  onSuccess,
}: CreateClassFormProps = {}) {
  const router = useRouter();

  async function handleSubmit(
    values: CreateClassFormValues,
    helpers: FormikHelpers<CreateClassFormValues>,
  ) {
    helpers.setStatus(undefined);

    try {
      const classroom = await createTeacherClass(values);
      helpers.resetForm();

      if (onSuccess) {
        onSuccess(classroom);
        return;
      }

      router.push("/teacher/classes");
    } catch (error) {
      console.error("Failed to create class", error);
      helpers.setSubmitting(false);
      helpers.setStatus({
        submitError: APP_MESSAGES.CREATE_CLASS_FAILED,
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
          <Form className="max-w-xl space-y-4 pt-4">
            <ClassNameField />
            <DescriptionField />
            <JoinCodeField />

            {formStatus?.submitError && (
              <div className="rounded-[8px] border border-red-200/60 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">
                      {APP_MESSAGES.CREATE_CLASS_FAILED}
                    </p>
                    <p className="mt-1">{formStatus.submitError}</p>
                  </div>
                </div>
              </div>
            )}

            <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
          </Form>
        );
      }}
    </Formik>
  );
}
