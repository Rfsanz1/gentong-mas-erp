'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import Link from 'next/link';

type PayrollStats = {
  totalEmployees: number;
  lastPeriod: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  pendingApprovals: number;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function PayrollsPage() {
  const query = useQuery<PayrollStats>({
    queryKey: ['payroll-stats'],
    queryFn: () => apiGet<PayrollStats>('/api/hr/payrolls/stats'),
    retry: false,
  });

  const stats = query.data;

  const QUICK_LINKS = [
    { href: '/hr/payrolls/periods', label: 'Periode Penggajian', desc: 'Buat dan kelola periode gaji', icon: '📅' },
    { href: '/hr/payrolls/batch', label: 'Proses Batch', desc: 'Hitung gaji massal satu periode', icon: '⚙️' },
    { href: '/hr/payrolls/slips', label: 'Slip Gaji', desc: 'Lihat dan cetak slip per karyawan', icon: '🧾' },
    { href: '/hr/payrolls/components', label: 'Komponen Gaji', desc: 'Atur tunjangan dan potongan', icon: '🧩' },
    { href: '/hr/payrolls/bpjs-calc', label: 'Kalkulator BPJS', desc: 'Simulasi iuran BPJS', icon: '🏥' },
    { href: '/hr/payrolls/pph21-calc', label: 'Kalkulator PPh 21', desc: 'Simulasi pajak penghasilan', icon: '📊' },
    { href: '/hr/payrolls/bank-export', label: 'Export Bank', desc: 'Generate file transfer bank', icon: '🏦' },
    { href: '/hr/payrolls/reports', label: 'Laporan Payroll', desc: 'Rekap dan analisis penggajian', icon: '📈' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard Penggajian</h1>
        <p className="text-sm text-slate-500 mt-1">Ringkasan status penggajian terkini.</p>
      </div>

      {query.isLoading ? <LoadingState message="Memuat data penggajian..." /> : stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Total Karyawan Aktif', value: stats.totalEmployees, unit: 'orang', color: 'text-slate-900' },
            { label: 'Periode Terakhir', value: stats.lastPeriod, unit: '', color: 'text-orange-700', isText: true },
            { label: 'Pending Approval', value: stats.pendingApprovals, unit: 'proses', color: stats.pendingApprovals > 0 ? 'text-amber-700' : 'text-slate-900' },
            { label: 'Total Gaji Kotor', value: fmt(stats.totalGross), unit: '', color: 'text-slate-900', isText: true },
            { label: 'Total Potongan', value: fmt(stats.totalDeductions), unit: '', color: 'text-red-600', isText: true },
            { label: 'Total Gaji Bersih', value: fmt(stats.totalNet), unit: '', color: 'text-orange-700', isText: true },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>
                {s.isText ? s.value : `${s.value} ${s.unit}`}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
            <span className="text-3xl">{link.icon}</span>
            <p className="font-semibold text-slate-900 mt-3 group-hover:text-orange-700 transition">{link.label}</p>
            <p className="text-xs text-slate-400 mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
