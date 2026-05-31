'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useRoleGuard } from '@/lib/withRole';

const ITEMS = [
  { label: 'Rekening Bank', href: '/finance/bank-accounts' },
  { label: 'Rekonsiliasi Bank', href: '/finance/bank-reconciliation' },
  { label: 'Pengeluaran', href: '/finance/expenses' },
  { label: 'Anggaran', href: '/finance/budget' },
  { label: 'Aset Tetap', href: '/finance/fixed-assets' },
  { label: 'Piutang (AR Aging)', href: '/finance/aged-receivable' },
  { label: 'Hutang (AP Aging)', href: '/finance/aged-payable' },
  { label: 'Jurnal Keuangan', href: '/finance/journal-entries' },
  { label: 'Konfigurasi Pajak', href: '/finance/tax-config' },
  { label: '← Akuntansi', href: '/accounting/chart-of-accounts' },
];

export default function FinanceLayout({ children }: { children: ReactNode }) {
  useRoleGuard(['admin', 'owner', 'super admin']);

  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-teal-50">
      <header className="bg-teal-700 text-teal-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-teal-200">Finance</p>
            <h1 className="text-2xl font-semibold">Gentong Mas Finance</h1>
          </div>
          <p className="text-sm text-teal-200">Kas, bank, anggaran, aset tetap, dan piutang/hutang.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-teal-200 bg-teal-100 p-5 shadow-sm self-start">
          <nav className="space-y-1">
            {ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-teal-700 text-white' : 'text-teal-900 hover:bg-teal-200'
                  }`}>
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
