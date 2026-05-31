'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type BankAccount = {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  balance: number;
  active: boolean;
};

type BankTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  balance: number;
  reference?: string;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function BankAccountsPage() {
  const [selectedId, setSelectedId] = useState('');
  const [page, setPage] = useState(1);

  const accountsQuery = useQuery<BankAccount[]>({
    queryKey: ['bank-accounts'],
    queryFn: () => apiGet<BankAccount[]>('/api/finance/bank-accounts'),
    retry: false,
  });

  const txQuery = useQuery<{ data: BankTransaction[]; totalPages: number }>({
    queryKey: ['bank-transactions', selectedId, page],
    queryFn: () => apiGet<{ data: BankTransaction[]; totalPages: number }>('/api/finance/bank-transactions', {
      params: { bankAccountId: selectedId || undefined, page, limit: 20 },
    }),
    retry: false,
  });

  const accounts = accountsQuery.data ?? [];
  const transactions = txQuery.data?.data ?? [];
  const totalPages = txQuery.data?.totalPages ?? 1;
  const selected = accounts.find((a) => a.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Rekening Bank</h1>
        <p className="text-sm text-slate-500 mt-1">Saldo dan riwayat transaksi rekening bank perusahaan.</p>
      </div>

      {accountsQuery.isLoading ? <LoadingState message="Memuat rekening..." /> :
        accounts.length === 0 ? <EmptyState message="Belum ada rekening bank terdaftar." /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((acc) => (
              <button key={acc.id} onClick={() => { setSelectedId(acc.id === selectedId ? '' : acc.id); setPage(1); }}
                className={`rounded-3xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md ${
                  acc.id === selectedId ? 'border-teal-400 ring-2 ring-teal-100' : 'border-slate-200'
                }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{acc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{acc.bankName}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${acc.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {acc.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="font-mono text-sm text-slate-400 mt-2">{acc.accountNumber}</p>
                <p className="text-xl font-bold text-teal-700 mt-3">{fmt(acc.balance)}</p>
              </button>
            ))}
          </div>
        )}

      {(selectedId || true) && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">
            {selected ? `Transaksi — ${selected.name}` : 'Semua Transaksi'}
          </h2>
          {txQuery.isLoading ? <LoadingState message="Memuat transaksi..." /> :
            transactions.length === 0 ? <EmptyState message="Belum ada transaksi." /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100">
                    <th className="pb-3 text-left font-medium text-slate-500">Tanggal</th>
                    <th className="pb-3 text-left font-medium text-slate-500">Keterangan</th>
                    <th className="pb-3 text-left font-medium text-slate-500">Referensi</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Debit</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Kredit</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Saldo</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-2.5 text-slate-500 text-xs">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                        <td className="py-2.5 text-slate-700">{tx.description}</td>
                        <td className="py-2.5 font-mono text-xs text-slate-400">{tx.reference ?? '-'}</td>
                        <td className="py-2.5 text-right text-slate-600">{tx.type === 'DEBIT' ? fmt(tx.amount) : ''}</td>
                        <td className="py-2.5 text-right text-teal-700 font-medium">{tx.type === 'CREDIT' ? fmt(tx.amount) : ''}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-900">{fmt(tx.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-40">← Sebelumnya</button>
              <span className="text-sm text-slate-500">Hal. {page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-40">Berikutnya →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
