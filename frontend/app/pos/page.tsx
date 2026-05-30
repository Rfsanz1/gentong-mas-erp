'use client';

import { useAuthStore } from '@/store/auth.store';

export default function PosPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6 rounded-3xl bg-slate-900/90 p-8 shadow-xl border border-slate-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">POS</p>
          <h1 className="text-3xl font-semibold text-white">Selamat datang, {user?.name ?? user?.email ?? 'Kasir'}!</h1>
        </div>
        <div className="rounded-3xl bg-slate-800 px-4 py-2 text-sm text-slate-200">
          Siap melayani transaksi</div>
      </div>
      <p className="text-slate-300">Pilih menu POS untuk memproses pesanan dan sesi kasir.</p>
    </div>
  );
}
