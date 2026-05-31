'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useRoleGuard } from '@/lib/withRole';

const HR_ITEMS = [
  { label: 'Karyawan', href: '/hr/employees' },
  { label: 'Organisasi', href: '/hr/organization' },
  { label: 'Kehadiran', href: '/hr/attendances' },
  { label: 'Cuti & Izin', href: '/hr/leaves' },
  { label: 'Pelatihan', href: '/hr/training' },
  { label: 'Pinjaman', href: '/hr/loans' },
  { label: 'BPJS', href: '/hr/bpjs' },
  { label: 'Penilaian Kinerja', href: '/hr/appraisals' },
  { label: 'Pengaturan HR', href: '/hr/settings' },
];

const PAYROLL_ITEMS = [
  { label: 'Dashboard Penggajian', href: '/hr/payrolls' },
  { label: 'Periode Penggajian', href: '/hr/payrolls/periods' },
  { label: 'Slip Gaji', href: '/hr/payrolls/slips' },
  { label: 'Proses Batch', href: '/hr/payrolls/batch' },
  { label: 'Komponen Gaji', href: '/hr/payrolls/components' },
  { label: 'Kalkulator BPJS', href: '/hr/payrolls/bpjs-calc' },
  { label: 'Kalkulator PPh 21', href: '/hr/payrolls/pph21-calc' },
  { label: 'Riwayat Penggajian', href: '/hr/payrolls/history' },
  { label: 'Export Bank', href: '/hr/payrolls/bank-export' },
  { label: 'Laporan Payroll', href: '/hr/payrolls/reports' },
];

export default function HRLayout({ children }: { children: ReactNode }) {
  useRoleGuard(['admin', 'owner', 'super admin', 'hr']);

  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/hr/payrolls') return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <header className="bg-rose-700 text-rose-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-rose-200">Human Resources</p>
            <h1 className="text-2xl font-semibold">Gentong Mas HR & Payroll</h1>
          </div>
          <p className="text-sm text-rose-200">Karyawan, kehadiran, penggajian, dan manajemen SDM.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 self-start">
          <div className="rounded-3xl border border-rose-200 bg-rose-100 p-5 shadow-sm">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-rose-400">SDM / HR</p>
            <nav className="space-y-1">
              {HR_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item.href) ? 'bg-rose-700 text-white' : 'text-rose-900 hover:bg-rose-200'
                  }`}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-orange-400">Penggajian</p>
            <nav className="space-y-1">
              {PAYROLL_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item.href) ? 'bg-orange-600 text-white' : 'text-orange-900 hover:bg-orange-100'
                  }`}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main className="space-y-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
