'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useRoleGuard } from '@/lib/withRole';

export default function PosLayout({ children }: { children: ReactNode }) {
  useRoleGuard(['kasir', 'admin', 'owner', 'super admin']);

  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  const cashierName = user?.name ?? user?.email ?? 'Kasir';

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between gap-4 bg-slate-900 px-6 py-4 shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">POS</p>
          <h1 className="text-xl font-semibold">Point of Sale</h1>
          <p className="text-sm text-slate-400">Kasir: {cashierName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 transition-colors"
        >
          Keluar
        </button>
      </header>

      <main className="px-6 py-6">{children}</main>
    </div>
  );
}
