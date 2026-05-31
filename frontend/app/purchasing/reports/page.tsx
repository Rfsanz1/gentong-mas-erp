'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type PurchasingReportItem = {
  supplierId: string;
  supplierName: string;
  totalPO: number;
  totalNilai: number;
  totalDiterima: number;
};

type PurchasingReport = {
  period: string;
  items: PurchasingReportItem[];
  grandTotal: number;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
}

export default function PurchasingReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(now.getFullYear()));

  const reportQuery = useQuery<PurchasingReport>({
    queryKey: ['purchasing-report', month, year],
    queryFn: () => apiGet<PurchasingReport>('/api/purchasing/reports', { params: { month, year } }),
    retry: false,
  });

  const report = reportQuery.data;

  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));
  const months = [
    ['01','Januari'],['02','Februari'],['03','Maret'],['04','April'],
    ['05','Mei'],['06','Juni'],['07','Juli'],['08','Agustus'],
    ['09','September'],['10','Oktober'],['11','November'],['12','Desember'],
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Laporan Purchasing</h1>
        <p className="text-sm text-slate-500 mt-1">Ringkasan pembelian dan pengeluaran per periode.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
          >
            {months.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {reportQuery.isLoading ? (
          <LoadingState message="Memuat laporan..." />
        ) : !report || report.items.length === 0 ? (
          <EmptyState message="Tidak ada data untuk periode ini." />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Total PO</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{report.items.reduce((s, i) => s + i.totalPO, 0)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Total Nilai Pembelian</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(report.grandTotal)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Supplier Aktif</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{report.items.length}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left font-medium text-slate-500">Supplier</th>
                    <th className="pb-3 text-center font-medium text-slate-500">Total PO</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Nilai Pembelian</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Nilai Diterima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {report.items.map((item) => (
                    <tr key={item.supplierId} className="hover:bg-slate-50">
                      <td className="py-3 font-medium text-slate-900">{item.supplierName}</td>
                      <td className="py-3 text-center text-slate-700">{item.totalPO}</td>
                      <td className="py-3 text-right text-slate-700">{fmt(item.totalNilai)}</td>
                      <td className="py-3 text-right text-slate-700">{fmt(item.totalDiterima)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200">
                    <td className="py-3 font-semibold text-slate-900">Total</td>
                    <td className="py-3 text-center font-semibold">{report.items.reduce((s, i) => s + i.totalPO, 0)}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">{fmt(report.grandTotal)}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">{fmt(report.items.reduce((s, i) => s + i.totalDiterima, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
