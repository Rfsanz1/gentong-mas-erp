'use client';

import { useAuthStore } from '@/store/auth.store';

export default function GudangPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-8 shadow-sm border border-amber-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-amber-700">Gudang Dashboard</p>
            <h1 className="text-3xl font-semibold text-amber-950">Selamat datang, {user?.name ?? user?.email ?? 'Tim Gudang'}!</h1>
          </div>
          <div className="rounded-3xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
            Role: {user?.role ?? 'Gudang'}
          </div>
        </div>
        <p className="mt-4 text-amber-700">Kelola stok, penerimaan, pengiriman, dan riwayat barang di gudang.</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900">Status Stok</h2>
          <p className="mt-2 text-sm text-amber-700">Lihat snapshot persediaan terkini.</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900">Proses Masuk</h2>
          <p className="mt-2 text-sm text-amber-700">Pantau barang masuk dan penerimaan.</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-900">Riwayat</h2>
          <p className="mt-2 text-sm text-amber-700">Lihat aktivitas pergudangan dan mutasi stok.</p>
        </div>
      </div>
    </div>
  );
}
