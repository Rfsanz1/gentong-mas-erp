'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type LedgerEntry = {
  id: string;
  date: string;
  journalNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: 'DEBIT' | 'CREDIT';
};

type LedgerData = {
  account: { id: string; code: string; name: string; type: string };
  openingBalance: number;
  closingBalance: number;
  entries: LedgerEntry[];
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function GeneralLedgerPage() {
  const now = new Date();
  const [accountId, setAccountId] = useState('');
  const [dateFrom, setDateFrom] = useState(`${now.getFullYear()}-01-01`);
  const [dateTo, setDateTo] = useState(now.toISOString().slice(0, 10));

  const accountsQuery = useQuery<{ data: { id: string; code: string; name: string }[] }>({
    queryKey: ['coa-flat'],
    queryFn: () => apiGet<{ data: { id: string; code: string; name: string }[] }>('/api/finance/accounts'),
    retry: false,
  });

  const ledgerQuery = useQuery<LedgerData>({
    queryKey: ['general-ledger', accountId, dateFrom, dateTo],
    queryFn: () => apiGet<LedgerData>(`/api/finance/ledger/${accountId}`, { params: { dateFrom, dateTo } }),
    enabled: !!accountId,
    retry: false,
  });

  const accounts = accountsQuery.data?.data ?? [];
  const data = ledgerQuery.data;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">General Ledger</h1>
        <p className="text-sm text-slate-500 mt-1">Riwayat transaksi per akun buku besar.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3">
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}
            className="flex-1 min-w-[220px] rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400">
            <option value="">— Pilih Akun —</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
        </div>

        {!accountId ? (
          <EmptyState message="Pilih akun untuk melihat buku besar." />
        ) : ledgerQuery.isLoading ? (
          <LoadingState message="Memuat buku besar..." />
        ) : !data ? (
          <EmptyState message="Tidak ada data untuk akun ini." />
        ) : (
          <>
            <div className="flex flex-wrap gap-4 rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="text-xs text-slate-500">Akun</p>
                <p className="font-semibold text-slate-900">{data.account.code} — {data.account.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Saldo Awal</p>
                <p className="font-semibold text-slate-900">{fmt(data.openingBalance)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Saldo Akhir</p>
                <p className="font-semibold text-violet-700">{fmt(data.closingBalance)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="pb-3 text-left font-medium text-slate-500">No. Jurnal</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Deskripsi</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Debit</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Kredit</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Saldo</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {data.entries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-2.5 text-slate-500 text-xs">{new Date(e.date).toLocaleDateString('id-ID')}</td>
                      <td className="py-2.5 font-mono text-xs text-violet-600">{e.journalNumber}</td>
                      <td className="py-2.5 text-slate-700 max-w-xs truncate">{e.description}</td>
                      <td className="py-2.5 text-right text-slate-700">{e.debit ? fmt(e.debit) : ''}</td>
                      <td className="py-2.5 text-right text-slate-700">{e.credit ? fmt(e.credit) : ''}</td>
                      <td className="py-2.5 text-right font-medium text-slate-900">{fmt(e.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
