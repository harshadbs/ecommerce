'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      router.push('/');
    } catch (err: any) {
      const errorKey = err.response?.data?.error || 'errors.generic';
      setError(t(errorKey));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              {t('common.app_name')}
            </Link>
            <h1 className="mt-4 text-2xl font-semibold">{t('auth.login_title')}</h1>
            <p className="mt-2 text-secondary-600">{t('auth.login_subtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">
                {t('labels.email')}
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="input mt-1"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{t('validation.email_invalid')}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                {t('labels.password')}
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="input mt-1"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{t('validation.password_required')}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-secondary-300" />
                <span className="ml-2 text-sm text-secondary-600">{t('labels.remember_me')}</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                {t('auth.forgot_password')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary btn-md w-full"
            >
              {isLoading ? t('common.loading') : t('buttons.sign_in')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary-600">
            {t('auth.dont_have_account')}{' '}
            <Link href="/register" className="text-primary-600 hover:underline font-medium">
              {t('buttons.sign_up')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
