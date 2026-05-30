// frontend/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api, { unwrap } from '@/lib/api';
import { useAuthStore, resolveRedirect } from '@/store/auth.store';
import type { AxiosError } from 'axios';
import clsx from 'clsx';

const loginSchema = z.object({
  email: z.string().email('Masukkan email yang valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
  is2FAEnabled?: boolean;
}

interface Company {
  id: string;
  name: string;
  logoUrl: string | null;
}

interface LoginResult {
  // Normal success
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: LoginUser;
  appRedirect?: string;
  // Intermediate states
  requiresOtp?: boolean;
  requiresTenantSelection?: boolean;
  userId?: string;
  companies?: Company[];
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await api.post<LoginResult>('/api/auth/login', values);
      const result = unwrap(response.data) as LoginResult;

      // Step 1 → OTP required
      if (result.requiresOtp && result.userId) {
        router.push(`/otp?userId=${result.userId}`);
        return;
      }

      // Step 2 → Tenant selection required
      if (result.requiresTenantSelection && result.userId && result.companies) {
        sessionStorage.setItem('userId', result.userId);
        sessionStorage.setItem('companies', JSON.stringify(result.companies));
        router.push('/select-tenant');
        return;
      }

      // Step 3 → Full token issued immediately
      const accessToken = result.accessToken ?? result.token;
      if (accessToken && result.user) {
        setAuth({
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            roles: result.user.roles,
            permissions: result.user.permissions,
            is2FAEnabled: result.user.is2FAEnabled,
          },
          accessToken,
          refreshToken: result.refreshToken,
        });
        router.push(resolveRedirect(result.user.role));
      } else {
        setServerError('Login gagal. Silakan coba lagi.');
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const raw = error.response?.data?.message;
      setServerError(typeof raw === 'string' ? raw : 'Login gagal. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-blue-100 px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gentong Mas ERP</h1>
          <p className="text-sm text-gray-500 mt-1">Masuk ke akun Anda</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@erp.com"
                {...register('email')}
                className={clsx('input-field', errors.email && 'input-error')}
              />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className={clsx('input-field', errors.password && 'input-error')}
              />
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Masuk…
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-3">atau</span>
            </div>
          </div>

          {/* Google OAuth button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5
                       border-2 border-gray-200 rounded-xl text-sm font-medium
                       text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300
                       transition-all duration-150"
          >
            {/* Google logo */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Masuk dengan Google
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Gentong Mas. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
