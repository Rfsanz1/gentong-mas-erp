'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useRoleGuard } from '@/lib/withRole';

const ITEMS = [
  { label: 'Overview', href: '/purchasing' },
  { label: 'RFQ', href: '/purchasing/rfq' },
  { label: 'Purchase Order', href: '/purchasing/purchase-orders' },
  { label: 'Penerimaan Barang', href: '/purchasing/goods-receipts' },
  { label: 'Perbandingan Harga', href: '/purchasing/price-comparison' },
  { label: 'Approval Matrix', href: '/purchasing/approval-matrix' },
  { label: 'Supplier', href: '/suppliers' },
  { label: 'Laporan', href: '/purchasing/reports' },
  { label: 'Pengaturan', href: '/purchasing/settings' },
];

export default function PurchasingLayout({ children }: { children: ReactNode }) {
  useRoleGuard(['admin', 'owner', 'super admin']);

  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-sky-50">
      <header className="bg-sky-700 text-sky-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-200">Purchasing</p>
            <h1 className="text-2xl font-semibold">Gentong Mas Purchasing</h1>
          </div>
          <p className="text-sm text-sky-200">Kelola pembelian, persetujuan, dan penerimaan barang.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-sky-200 bg-sky-100 p-6 shadow-sm self-start">
          <nav className="space-y-1">
            {ITEMS.map((item) => {
              const isActive = item.href === '/purchasing'
                ? pathname === '/purchasing'
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-700 text-white'
                      : 'text-sky-900 hover:bg-sky-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
