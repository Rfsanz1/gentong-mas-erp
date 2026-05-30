'use client';

import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

export default function SalesPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Sales Dashboard</p>
            <h1 className="text-3xl font-semibold text-slate-900">Halo, {user?.name ?? user?.email ?? 'Tim Sales'}!</h1>
          </div>
          <div className="rounded-3xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Role: {user?.role ?? 'Sales'}
          </div>
        </div>
        <p className="mt-4 text-slate-600">Akses cepat ke peluang, pelanggan, dan aktivitas penjualan Anda.</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link href="/sales" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-slate-900">Leads</h2>
          <p className="mt-2 text-sm text-slate-600">Pantau prospek dan status follow up.</p>
        </Link>
        <Link href="/sales" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-slate-900">Pelanggan</h2>
          <p className="mt-2 text-sm text-slate-600">Kelola data pelanggan dan kontak.</p>
        </Link>
        <Link href="/dashboard" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-slate-900">Kembali ke ERP</h2>
          <p className="mt-2 text-sm text-slate-600">Beralih ke dashboard utama.</p>
        </Link>
      </div>
    </div>
  );
}
