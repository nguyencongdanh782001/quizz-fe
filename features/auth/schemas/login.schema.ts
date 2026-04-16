import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: Yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});
