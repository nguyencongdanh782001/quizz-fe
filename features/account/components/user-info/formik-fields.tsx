import type { ChangeEvent } from "react";
import { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { DatePicker } from "@/components/common/form/date-picker";
import { InputField } from "@/components/common/form/input-field";
import { SelectField } from "@/components/common/form/select-field";
import { cn } from "@/lib/utils";

interface BaseFormikFieldProps
  extends Omit<
    React.ComponentProps<typeof InputField>,
    "error" | "name" | "value" | "onChange"
  > {
  name: string;
  onValueChange?: () => void;
}

export function FormikInputField({
  name,
  onValueChange,
  id,
  ...props
}: BaseFormikFieldProps) {
  const [field, meta, helpers] = useField<string>(name);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(event.target.value);
    onValueChange?.();
  };

  return (
    <InputField
      {...props}
      {...field}
      id={id ?? name}
      value={field.value ?? ""}
      onChange={handleChange}
      error={meta.touched ? meta.error : undefined}
    />
  );
}

export function FormikPasswordField({
  name,
  onValueChange,
  id,
  className,
  ...props
}: BaseFormikFieldProps) {
  const [field, meta, helpers] = useField<string>(name);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(event.target.value);
    onValueChange?.();
  };

  return (
    <div className={cn("relative", className)}>
      <InputField
        {...props}
        {...field}
        id={id ?? name}
        value={field.value ?? ""}
        type={showPassword ? "text" : "password"}
        onChange={handleChange}
        error={meta.touched ? meta.error : undefined}
        className="pr-11"
      />
      <button
        type="button"
        onClick={() => setShowPassword((current) => !current)}
        aria-label={
          showPassword ? `Ẩn ${props.label ?? name}` : `Hiện ${props.label ?? name}`
        }
        className="absolute right-3 top-8 flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

interface FormikSelectFieldProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onValueChange?: () => void;
}

export function FormikSelectField({
  name,
  label,
  options,
  placeholder,
  required,
  disabled,
  onValueChange,
}: FormikSelectFieldProps) {
  const [field, meta, helpers] = useField<string>(name);

  return (
    <SelectField
      name={name}
      label={label}
      options={options}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      value={field.value ?? ""}
      onValueChange={(value) => {
        helpers.setValue(value);
        helpers.setTouched(true);
        onValueChange?.();
      }}
      onBlur={() => {
        helpers.setTouched(true);
      }}
      error={meta.touched ? meta.error : undefined}
    />
  );
}

interface FormikDatePickerFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  onValueChange?: () => void;
}

export function FormikDatePickerField({
  name,
  label,
  placeholder,
  helperText,
  required,
  disabled,
  onValueChange,
}: FormikDatePickerFieldProps) {
  const [field, meta, helpers] = useField<string>(name);

  return (
    <DatePicker
      id={name}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      required={required}
      disabled={disabled}
      value={field.value ?? ""}
      onChange={(value) => {
        helpers.setValue(value);
        helpers.setTouched(true);
        onValueChange?.();
      }}
      onBlur={() => {
        helpers.setTouched(true);
      }}
      error={meta.touched ? meta.error : undefined}
    />
  );
}
