'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useRoleGuard } from '@/lib/withRole';

const ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Picking Order', href: '/gudang/picking' },
  { label: 'Barang Masuk', href: '/gudang/inbound' },
  { label: 'Barang Keluar', href: '/gudang/outbound' },
  { label: 'Transfer Stok', href: '/gudang/transfer' },
  { label: 'Stock Opname', href: '/gudang/stock-opname' },
  { label: 'Riwayat', href: '/gudang/history' },
  { label: 'Produk', href: '/gudang/products' },
];

export default function GudangLayout({ children }: { children: ReactNode }) {
  useRoleGuard(['gudang', 'staff gudang', 'admin', 'owner', 'super admin']);

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-amber-600 text-amber-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-100">Gudang</p>
            <h1 className="text-2xl font-semibold">Gentong Mas Gudang</h1>
          </div>
          <p className="text-sm text-amber-100">Kelola inventaris, penerimaan, pengiriman, dan stok.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-amber-200 bg-amber-100 p-6 shadow-sm">
          <nav className="space-y-3">
            {ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-amber-900 hover:bg-amber-200 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
