'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type PayrollReport = {
  period: string;
  byDepartment: { department: string; employeeCount: number; totalGross: number; totalNet: number }[];
  byComponent: { component: string; type: string; total: number }[];
  summary: { totalGross: number; totalDeductions: number; totalNet: number; totalBpjs: number; totalTax: number };
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function PayrollReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [view, setView] = useState<'department' | 'component'>('department');

  const query = useQuery<PayrollReport>({
    queryKey: ['payroll-report', month, year],
    queryFn: () => apiGet<PayrollReport>('/api/hr/payrolls/reports', { params: { month, year } }),
    retry: false,
  });

  const report = query.data;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Laporan Payroll</h1>
          <p className="text-sm text-slate-500 mt-1">Rekap dan analisis penggajian per periode.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400">
            {[2026, 2025, 2024].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {query.isLoading ? <LoadingState message="Memuat laporan..." /> :
        !report ? <EmptyState message="Tidak ada data untuk periode ini." /> : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: 'Gaji Kotor', value: report.summary.totalGross, color: 'text-slate-900' },
                { label: 'BPJS Karyawan', value: report.summary.totalBpjs, color: 'text-blue-700' },
                { label: 'PPh 21', value: report.summary.totalTax, color: 'text-amber-700' },
                { label: 'Total Potongan', value: report.summary.totalDeductions, color: 'text-red-700' },
                { label: 'Gaji Bersih', value: report.summary.totalNet, color: 'text-orange-700' },
              ].map((s) => (
                <div key={s.label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={`text-base font-bold mt-1 ${s.color}`}>{fmt(s.value)}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {(['department', 'component'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${view === v ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  {v === 'department' ? 'Per Departemen' : 'Per Komponen'}
                </button>
              ))}
            </div>

            {view === 'department' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
                {(report.byDepartment ?? []).length === 0 ? <EmptyState message="Tidak ada data per departemen." /> : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-100">
                      <th className="pb-3 text-left font-medium text-slate-500">Departemen</th>
                      <th className="pb-3 text-center font-medium text-slate-500">Karyawan</th>
                      <th className="pb-3 text-right font-medium text-slate-500">Gaji Kotor</th>
                      <th className="pb-3 text-right font-medium text-slate-500">Gaji Bersih</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {report.byDepartment.map((d) => (
                        <tr key={d.department} className="hover:bg-slate-50">
                          <td className="py-2.5 font-medium text-slate-900">{d.department || 'Tidak ada departemen'}</td>
                          <td className="py-2.5 text-center text-slate-600">{d.employeeCount}</td>
                          <td className="py-2.5 text-right text-slate-600">{fmt(d.totalGross)}</td>
                          <td className="py-2.5 text-right font-semibold text-orange-700">{fmt(d.totalNet)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {view === 'component' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
                {(report.byComponent ?? []).length === 0 ? <EmptyState message="Tidak ada data per komponen." /> : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-100">
                      <th className="pb-3 text-left font-medium text-slate-500">Komponen</th>
                      <th className="pb-3 text-center font-medium text-slate-500">Tipe</th>
                      <th className="pb-3 text-right font-medium text-slate-500">Total</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {report.byComponent.map((c) => (
                        <tr key={c.component} className="hover:bg-slate-50">
                          <td className="py-2.5 font-medium text-slate-900">{c.component}</td>
                          <td className="py-2.5 text-center">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.type === 'ALLOWANCE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {c.type === 'ALLOWANCE' ? 'Tunjangan' : 'Potongan'}
                            </span>
                          </td>
                          <td className={`py-2.5 text-right font-semibold ${c.type === 'ALLOWANCE' ? 'text-green-700' : 'text-red-700'}`}>{fmt(c.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
    </div>
  );
}
