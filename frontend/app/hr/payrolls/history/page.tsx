'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type PayrollHistory = {
  id: string;
  period: string;
  month: number;
  year: number;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  status: string;
  processedAt: string;
  processedBy?: string;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export default function PayrollHistoryPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  const query = useQuery<PayrollHistory[]>({
    queryKey: ['payroll-history', year],
    queryFn: () => apiGet<PayrollHistory[]>('/api/hr/payrolls/history', { params: { year } }),
    retry: false,
  });

  const history = query.data ?? [];
  const totalAnnual = history.filter((h) => h.status === 'PAID').reduce((s, h) => s + h.totalNet, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Riwayat Penggajian</h1>
          <p className="text-sm text-slate-500 mt-1">Rekap pembayaran gaji per periode.</p>
        </div>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400">
          {[2026, 2025, 2024].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {history.length > 0 && (
        <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 flex items-center justify-between">
          <p className="text-sm text-orange-900">Total penggajian dibayarkan tahun {year}</p>
          <p className="text-xl font-bold text-orange-700">{fmt(totalAnnual)}</p>
        </div>
      )}

      {query.isLoading ? <LoadingState message="Memuat riwayat..." /> :
        history.length === 0 ? <EmptyState message="Belum ada riwayat penggajian untuk tahun ini." /> : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                <th className="pb-3 text-left font-medium text-slate-500">Periode</th>
                <th className="pb-3 text-center font-medium text-slate-500">Karyawan</th>
                <th className="pb-3 text-right font-medium text-slate-500">Gaji Kotor</th>
                <th className="pb-3 text-right font-medium text-slate-500">Potongan</th>
                <th className="pb-3 text-right font-medium text-slate-500">Gaji Bersih</th>
                <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                <th className="pb-3 text-left font-medium text-slate-500">Diproses</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-900">{MONTHS[(h.month ?? 1) - 1]} {h.year}</td>
                    <td className="py-3 text-center text-slate-600">{h.employeeCount}</td>
                    <td className="py-3 text-right text-slate-600">{fmt(h.totalGross)}</td>
                    <td className="py-3 text-right text-red-500">{fmt(h.totalDeductions)}</td>
                    <td className="py-3 text-right font-bold text-orange-700">{fmt(h.totalNet)}</td>
                    <td className="py-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${h.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{h.status}</span>
                    </td>
                    <td className="py-3 text-xs text-slate-400">{h.processedAt ? new Date(h.processedAt).toLocaleDateString('id-ID') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
