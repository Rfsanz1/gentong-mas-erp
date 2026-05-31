'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type ARAgingItem = {
  customerId: string;
  customerName: string;
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  over90: number;
  total: number;
};

type ARAgingReport = {
  asOf: string;
  items: ARAgingItem[];
  totals: { current: number; days1_30: number; days31_60: number; days61_90: number; over90: number; total: number };
};

function fmt(v: number) {
  return v ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v) : '-';
}

export default function AgedReceivablePage() {
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));

  const arQuery = useQuery<ARAgingReport>({
    queryKey: ['ar-aging', asOf],
    queryFn: () => apiGet<ARAgingReport>('/api/finance/ar-aging', { params: { asOf } }),
    retry: false,
  });

  const data = arQuery.data;

  const COLUMNS = [
    { key: 'current', label: 'Belum Jatuh Tempo', color: 'text-green-700' },
    { key: 'days1_30', label: '1–30 Hari', color: 'text-yellow-700' },
    { key: 'days31_60', label: '31–60 Hari', color: 'text-amber-700' },
    { key: 'days61_90', label: '61–90 Hari', color: 'text-orange-700' },
    { key: 'over90', label: '> 90 Hari', color: 'text-red-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Piutang — AR Aging</h1>
          <p className="text-sm text-slate-500 mt-1">Analisis umur piutang pelanggan.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Per tanggal</label>
          <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
        </div>
      </div>

      {data?.totals && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[...COLUMNS, { key: 'total', label: 'Total', color: 'text-slate-900' }].map((col) => (
            <div key={col.key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">{col.label}</p>
              <p className={`text-sm font-bold mt-1 ${col.color}`}>{fmt((data.totals as any)[col.key])}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {arQuery.isLoading ? <LoadingState message="Memuat AR aging..." /> :
          !data || data.items.length === 0 ? <EmptyState message="Tidak ada piutang outstanding." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Pelanggan</th>
                  {COLUMNS.map((c) => <th key={c.key} className="pb-3 text-right font-medium text-slate-500">{c.label}</th>)}
                  <th className="pb-3 text-right font-medium text-slate-500 font-semibold">Total</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {data.items.sort((a, b) => b.total - a.total).map((item) => (
                    <tr key={item.customerId} className="hover:bg-slate-50">
                      <td className="py-2.5 font-medium text-slate-900">{item.customerName}</td>
                      {COLUMNS.map((c) => (
                        <td key={c.key} className={`py-2.5 text-right ${(item as any)[c.key] ? c.color : 'text-slate-300'}`}>
                          {fmt((item as any)[c.key])}
                        </td>
                      ))}
                      <td className="py-2.5 text-right font-bold text-slate-900">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                {data.totals && (
                  <tfoot><tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">TOTAL</td>
                    {COLUMNS.map((c) => (
                      <td key={c.key} className={`py-3 text-right font-bold ${c.color}`}>{fmt((data.totals as any)[c.key])}</td>
                    ))}
                    <td className="py-3 text-right font-bold text-slate-900">{fmt(data.totals.total)}</td>
                  </tr></tfoot>
                )}
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
