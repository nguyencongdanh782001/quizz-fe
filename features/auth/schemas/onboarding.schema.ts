import * as Yup from "yup";

export const onboardingSchema = Yup.object({
  role: Yup.string()
    .oneOf(["student", "teacher"], "Vai tro khong hop le")
    .required("Ban can chon vai tro"),
  full_name: Yup.string()
    .trim()
    .min(2, "Ho ten toi thieu 2 ky tu")
    .required("Ho ten la bat buoc"),
  date_of_birth: Yup.string().required("Ngay sinh la bat buoc"),
  gender: Yup.string()
    .oneOf(["male", "female", "other"], "Gioi tinh khong hop le")
    .required("Gioi tinh la bat buoc"),
  school_name: Yup.string().nullable(),
});
