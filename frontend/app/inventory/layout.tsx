'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useRoleGuard } from '@/lib/withRole';

const ITEMS = [
  { label: 'Lot Stok', href: '/inventory/lots' },
  { label: 'Valuasi Stok', href: '/inventory/stock-valuation' },
  { label: 'Aging Stok', href: '/inventory/stock-aging' },
  { label: 'Reorder Rules', href: '/inventory/reorder-rules' },
  { label: 'Gudang', href: '/inventory/warehouses' },
  { label: '← Kembali ke Gudang', href: '/gudang' },
];

export default function InventoryLayout({ children }: { children: ReactNode }) {
  useRoleGuard(['admin', 'owner', 'super admin', 'gudang', 'staff gudang']);

  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-emerald-50">
      <header className="bg-emerald-700 text-emerald-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Inventory Planning</p>
            <h1 className="text-2xl font-semibold">Gentong Mas Inventory</h1>
          </div>
          <p className="text-sm text-emerald-200">Perencanaan stok, valuasi, dan manajemen gudang.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-emerald-200 bg-emerald-100 p-5 shadow-sm self-start">
          <nav className="space-y-1">
            {ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'text-emerald-900 hover:bg-emerald-200'
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
