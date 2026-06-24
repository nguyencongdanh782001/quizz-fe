import * as Yup from "yup";

export const onboardingSchema = Yup.object({
  role: Yup.string()
    .oneOf(["student", "teacher"], "Vai trò không hợp lệ")
    .required("Bạn cần chọn vai trò"),
  date_of_birth: Yup.string().required("Ngày sinh bắt buộc"),
  gender: Yup.string()
    .oneOf(["male", "female", "other"], "Giới tính không lợp lệ")
    .required("Giới tính bắt buộc"),
  school_name: Yup.string().nullable(),
});
