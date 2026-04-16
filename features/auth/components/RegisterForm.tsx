'use client';

import { Formik, Form, FormikHelpers } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerSchema } from '../schemas/register.schema';
import { useAuth } from '@/hooks/useAuth';
import { SoftInput } from '@/components/common/SoftInput';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher';
}

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    values: RegisterFormValues,
    helpers: FormikHelpers<RegisterFormValues>
  ) => {
    try {
      await register(values);
      router.push('/auth/role');
    } catch {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ name: '', email: '', password: '', confirmPassword: '', role: 'student' }}
      validationSchema={registerSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting, getFieldProps, setFieldValue }) => (
        <Form className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-on-surface text-center">
            Tạo tài khoản
          </h2>

          <SoftInput
            label="Họ và tên"
            placeholder="Nguyễn Văn Minh"
            error={touched.name ? errors.name : undefined}
            {...getFieldProps('name')}
          />

          <SoftInput
            label="Email"
            type="email"
            placeholder="nguyen.van.minh@email.com"
            error={touched.email ? errors.email : undefined}
            {...getFieldProps('email')}
          />

          <div className="relative">
            <SoftInput
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tối thiểu 6 ký tự"
              error={touched.password ? errors.password : undefined}
              {...getFieldProps('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-on-surface-variant hover:text-on-surface"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <SoftInput
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Nhập lại mật khẩu"
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            {...getFieldProps('confirmPassword')}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface">Vai trò</label>
            <div className="grid grid-cols-2 gap-3">
              {(['student', 'teacher'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFieldValue('role', r)}
                  className={cn(
                    'px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200',
                    'flex items-center justify-center gap-2',
                    'bg-surface-container-lowest border-outline/15',
                    getFieldProps('role').value === r
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-outline/15 hover:border-primary/50'
                  )}
                >
                  <span>{r === 'student' ? 'Học sinh' : 'Giáo viên'}</span>
                </button>
              ))}
            </div>
            {touched.role && errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-base',
              'bg-primary text-white',
              'hover:bg-primary-container hover:text-on-primary-container',
              'transition-all duration-200',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Đăng ký
          </button>

          <p className="text-center text-sm text-on-surface-variant">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
