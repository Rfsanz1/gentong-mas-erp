// frontend/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  owner: 'bg-indigo-100 text-indigo-700',
  'super admin': 'bg-red-100 text-red-700',
  sales: 'bg-blue-100 text-blue-700',
  gudang: 'bg-green-100 text-green-700',
  kasir: 'bg-yellow-100 text-yellow-700',
  driver: 'bg-orange-100 text-orange-700',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, clearAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await api.get('/api/auth/me'); // sanity check — optional
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  if (!user) return null;

  const roleColor =
    ROLE_BADGE[user.role?.toLowerCase()] ?? 'bg-gray-100 text-gray-700';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Gentong Mas ERP</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user.name ?? user.email}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor}`}>
            {user.role}
          </span>
          <button
            onClick={() => void handleLogout()}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Keluar
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Selamat datang, {user.name ?? user.email}!
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Autentikasi berhasil. Anda login sebagai <strong>{user.role}</strong>.
              </p>

              {user.permissions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Permissions ({user.permissions.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.permissions.slice(0, 12).map((p) => (
                      <span
                        key={p}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {p}
                      </span>
                    ))}
                    {user.permissions.length > 12 && (
                      <span className="text-xs text-gray-400">
                        +{user.permissions.length - 12} lainnya
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
