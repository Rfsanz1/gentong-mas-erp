'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useRoleGuard } from '@/lib/withRole';

const ITEMS = [
  { label: 'Chart of Accounts', href: '/accounting/chart-of-accounts' },
  { label: 'Journal Entry', href: '/accounting/journal-entry' },
  { label: 'General Ledger', href: '/accounting/general-ledger' },
  { label: 'Trial Balance', href: '/accounting/trial-balance' },
  { label: 'Laporan Keuangan', href: '/accounting/reports' },
  { label: '← Finance', href: '/finance' },
];

export default function AccountingLayout({ children }: { children: ReactNode }) {
  useRoleGuard(['admin', 'owner', 'super admin']);

  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-violet-50">
      <header className="bg-violet-700 text-violet-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-200">Akuntansi</p>
            <h1 className="text-2xl font-semibold">Gentong Mas Accounting</h1>
          </div>
          <p className="text-sm text-violet-200">Buku besar, jurnal, dan laporan keuangan.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-violet-200 bg-violet-100 p-5 shadow-sm self-start">
          <nav className="space-y-1">
            {ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-violet-700 text-white' : 'text-violet-900 hover:bg-violet-200'
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
