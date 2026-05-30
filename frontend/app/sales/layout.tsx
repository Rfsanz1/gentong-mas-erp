'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useRoleGuard } from '@/lib/withRole';

export default function SalesLayout({ children }: { children: ReactNode }) {
  useRoleGuard(['sales', 'sales manager', 'admin', 'owner', 'super admin']);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-700 text-white px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Sales</p>
            <h1 className="text-2xl font-semibold">Gentong Mas Sales</h1>
          </div>
          <p className="text-sm text-blue-100">Akses halaman Sales untuk tim penjualan.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-blue-100 bg-blue-800/95 p-6 text-white shadow-sm">
          <nav className="space-y-3">
            <Link href="/sales" className="block rounded-2xl px-4 py-3 bg-blue-600 hover:bg-blue-500 transition-colors">
              Ringkasan Sales
            </Link>
            <Link href="/sales" className="block rounded-2xl px-4 py-3 hover:bg-blue-700/80 transition-colors">
              Peluang & Pelanggan
            </Link>
            <Link href="/dashboard" className="block rounded-2xl px-4 py-3 hover:bg-blue-700/80 transition-colors">
              Kembali ke Dashboard
            </Link>
          </nav>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
