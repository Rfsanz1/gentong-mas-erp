'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type TrialBalanceItem = {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
};

type TrialBalance = {
  asOf: string;
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

const TYPE_ORDER = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
const TYPE_LABELS: Record<string, string> = {
  ASSET: 'Aset', LIABILITY: 'Kewajiban', EQUITY: 'Ekuitas', REVENUE: 'Pendapatan', EXPENSE: 'Beban',
};

export default function TrialBalancePage() {
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));

  const tbQuery = useQuery<TrialBalance>({
    queryKey: ['trial-balance', asOf],
    queryFn: () => apiGet<TrialBalance>('/api/finance/trial-balance', { params: { asOf } }),
    retry: false,
  });

  const data = tbQuery.data;
  const grouped = data
    ? TYPE_ORDER.reduce((acc, type) => {
        acc[type] = (data.items ?? []).filter((i) => i.accountType === type);
        return acc;
      }, {} as Record<string, TrialBalanceItem[]>)
    : {};

  const isBalanced = data && Math.abs(data.totalDebit - data.totalCredit) < 1;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Trial Balance</h1>
          <p className="text-sm text-slate-500 mt-1">Neraca saldo per tanggal tertentu.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Per tanggal</label>
          <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
        </div>
      </div>

      {tbQuery.isLoading ? <LoadingState message="Memuat trial balance..." /> :
        !data || data.items.length === 0 ? <EmptyState message="Tidak ada data." /> : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            {data && (
              <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium ${
                isBalanced ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {isBalanced ? '✓ Neraca seimbang' : '⚠ Neraca tidak seimbang — periksa jurnal yang belum diposting'}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b-2 border-slate-200">
                  <th className="pb-3 text-left font-medium text-slate-500">Kode</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Nama Akun</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Debit</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Kredit</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Saldo</th>
                </tr></thead>
                <tbody>
                  {TYPE_ORDER.map((type) => {
                    const items = grouped[type] ?? [];
                    if (items.length === 0) return null;
                    const subtotalD = items.reduce((s, i) => s + i.debit, 0);
                    const subtotalC = items.reduce((s, i) => s + i.credit, 0);
                    const subtotalB = items.reduce((s, i) => s + i.balance, 0);
                    return (
                      <>
                        <tr key={`header-${type}`} className="border-t border-slate-100 bg-slate-50">
                          <td colSpan={5} className="py-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{TYPE_LABELS[type]}</td>
                        </tr>
                        {items.map((item) => (
                          <tr key={item.accountId} className="hover:bg-slate-50 border-t border-slate-50">
                            <td className="py-2.5 font-mono text-xs text-slate-400">{item.accountCode}</td>
                            <td className="py-2.5 text-slate-800">{item.accountName}</td>
                            <td className="py-2.5 text-right text-slate-600">{item.debit ? fmt(item.debit) : ''}</td>
                            <td className="py-2.5 text-right text-slate-600">{item.credit ? fmt(item.credit) : ''}</td>
                            <td className={`py-2.5 text-right font-medium ${item.balance < 0 ? 'text-red-600' : 'text-slate-900'}`}>{fmt(item.balance)}</td>
                          </tr>
                        ))}
                        <tr key={`sub-${type}`} className="border-t border-slate-200 bg-slate-50/50">
                          <td colSpan={2} className="py-2 text-sm font-semibold text-slate-700">Subtotal {TYPE_LABELS[type]}</td>
                          <td className="py-2 text-right font-semibold text-slate-700">{fmt(subtotalD)}</td>
                          <td className="py-2 text-right font-semibold text-slate-700">{fmt(subtotalC)}</td>
                          <td className="py-2 text-right font-semibold text-slate-700">{fmt(subtotalB)}</td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
                <tfoot><tr className="border-t-2 border-slate-300">
                  <td colSpan={2} className="py-3 font-bold text-slate-900">TOTAL</td>
                  <td className="py-3 text-right font-bold text-slate-900">{fmt(data.totalDebit)}</td>
                  <td className="py-3 text-right font-bold text-slate-900">{fmt(data.totalCredit)}</td>
                  <td className="py-3 text-right font-bold text-violet-700">{fmt(data.totalDebit - data.totalCredit)}</td>
                </tr></tfoot>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
