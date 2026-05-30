// frontend/app/(auth)/select-tenant/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import api, { unwrap } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { AuthUser } from '@/store/auth.store';
import type { AxiosError } from 'axios';

interface Company {
  id: string;
  name: string;
  logoUrl: string | null;
}

function SelectTenantForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load userId and companies from sessionStorage (set by login page)
  useEffect(() => {
    const uid = sessionStorage.getItem('userId') ?? '';
    const raw = sessionStorage.getItem('companies') ?? '[]';
    setUserId(uid);
    try {
      setCompanies(JSON.parse(raw) as Company[]);
    } catch {
      setCompanies([]);
    }
  }, []);

  const handleSelect = async (companyId: string) => {
    setSelectedId(companyId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{
        accessToken: string;
        refreshToken?: string;
        user: AuthUser;
      }>('/api/auth/select-tenant', { userId, companyId });
      const result = unwrap(response.data) as {
        accessToken: string;
        refreshToken?: string;
        user: AuthUser;
      };

      // Clean up session storage
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('companies');

      setAuth({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        companyId,
      });

      router.push('/dashboard');
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setError(e.response?.data?.message ?? 'Could not select company. Please try again.');
      setSelectedId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate initials avatar for companies without a logo
  const getInitials = (name: string): string =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  const avatarColors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500',
    'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-blue-100 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Select your company</h1>
          <p className="text-sm text-gray-500 mt-1">
            You have access to {companies.length} compan{companies.length === 1 ? 'y' : 'ies'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {companies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No companies found.</p>
              <button
                onClick={() => router.push('/login')}
                className="mt-4 text-brand-600 hover:text-brand-700 text-sm font-medium"
              >
                Back to login
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {companies.map((company, idx) => {
                const isSelected = selectedId === company.id;
                const color = avatarColors[idx % avatarColors.length];

                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => void handleSelect(company.id)}
                    disabled={isLoading}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2
                      text-left transition-all duration-150 group
                      ${isSelected
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {/* Logo or initials avatar */}
                    <div className="flex-shrink-0">
                      {company.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={company.logoUrl}
                          alt={`${company.name} logo`}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                          <span className="text-white font-bold text-base">
                            {getInitials(company.name)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Company name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {company.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Click to sign in</p>
                    </div>

                    {/* Loading spinner or chevron */}
                    <div className="flex-shrink-0">
                      {isSelected && isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-brand-600" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400 group-hover:text-brand-500 transition-colors"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SelectTenantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <SelectTenantForm />
    </Suspense>
  );
}
