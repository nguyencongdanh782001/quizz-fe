'use client';

import { Formik, Form, FormikHelpers } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginSchema } from '../schemas/login.schema';
import { useAuth } from '@/hooks/useAuth';
import { SoftInput } from '@/components/common/SoftInput';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    values: LoginFormValues,
    helpers: FormikHelpers<LoginFormValues>
  ) => {
    try {
      await login(values.email, values.password);
      router.push('/auth/role');
    } catch {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting, getFieldProps }) => (
        <Form className="space-y-5">
          <h2 className="font-display text-2xl font-bold text-on-surface text-center">
            Đăng nhập
          </h2>

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
              placeholder="••••••••"
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

          <div className="text-right">
            <Link href="/auth/forgot" className="text-sm text-primary hover:underline">
              Quên mật khẩu?
            </Link>
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
            Đăng nhập
          </button>

          <p className="text-center text-sm text-on-surface-variant">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
