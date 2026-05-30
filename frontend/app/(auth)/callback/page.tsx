// frontend/app/(auth)/callback/page.tsx
// Handles the redirect after Google OAuth — reads tokens from query params
// and stores them in the auth store, then navigates to the dashboard.
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api, { unwrap } from '@/lib/api';
import type { AxiosError } from 'axios';

interface MeResponse {
  id?: string;
  userId?: string;
  email: string;
  roles: string[];
  permissions: string[];
}

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken') ?? undefined;
    const error = params.get('error');

    if (error || !accessToken) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    // Fetch the user profile using the new token
    api
      .get<MeResponse>('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data }) => {
        const result = unwrap(data) as MeResponse;
        setAuth({
          user: {
            id: result.userId ?? result.id ?? 'unknown',
            email: result.email,
            name: null,
            role: result.roles?.[0] ?? 'user',
            roles: result.roles,
            permissions: result.permissions,
          },
          accessToken,
          refreshToken,
        });
        router.replace('/dashboard');
      })
      .catch((_err: AxiosError) => {
        router.replace('/login?error=oauth_failed');
      });
  }, [params, setAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-blue-100">
      <div className="text-center">
        <svg className="animate-spin h-10 w-10 text-brand-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-gray-600 text-sm">Menyelesaikan login…</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
