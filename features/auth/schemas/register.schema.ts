import * as Yup from 'yup';

export const registerSchema = Yup.object({
  name: Yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Tối thiểu 2 ký tự'),
  email: Yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: Yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: Yup
    .string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([Yup.ref('password')], 'Mật khẩu không khớp'),
  role: Yup
    .string()
    .oneOf(['student', 'teacher'], 'Vai trò không hợp lệ')
    .required('Vai trò là bắt buộc'),
});
