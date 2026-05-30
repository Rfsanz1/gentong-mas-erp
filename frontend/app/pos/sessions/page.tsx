'use client';

import Link from 'next/link';

export default function PosSessionsPage() {
  return (
    <div className="space-y-6 text-slate-100">
      <div className="rounded-3xl bg-slate-900/90 p-8 shadow-xl border border-slate-700">
        <h1 className="text-2xl font-semibold">Sesi Kasir</h1>
        <p className="mt-3 text-slate-300">Lihat sesi kasir yang sedang aktif dan status meja/transaksi.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link href="/pos/sessions/products" className="rounded-3xl bg-slate-800/90 p-6 shadow-md border border-slate-700 hover:border-slate-500 transition">
          <h2 className="text-lg font-semibold text-white">Produk POS</h2>
          <p className="mt-2 text-slate-400">Buka katalog produk untuk transaksi kasir.</p>
        </Link>
      </div>
    </div>
  );
}
