'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type BankAccount = { id: string; name: string; bankName: string; accountNumber: string; balance: number };
type ReconciliationItem = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  reconciled: boolean;
  reference?: string;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.abs(v ?? 0));
}

export default function BankReconciliationPage() {
  const [accountId, setAccountId] = useState('');
  const [statementBalance, setStatementBalance] = useState('');
  const [statementDate, setStatementDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const accountsQuery = useQuery<BankAccount[]>({
    queryKey: ['bank-accounts'],
    queryFn: () => apiGet<BankAccount[]>('/api/finance/bank-accounts'),
    retry: false,
  });

  const itemsQuery = useQuery<ReconciliationItem[]>({
    queryKey: ['reconciliation-items', accountId, statementDate],
    queryFn: () => apiGet<ReconciliationItem[]>('/api/finance/bank-reconciliation', {
      params: { bankAccountId: accountId, asOf: statementDate },
    }),
    enabled: !!accountId,
    retry: false,
  });

  const reconcileMutation = useMutation({
    mutationFn: (data: object) => apiPost('/api/finance/bank-reconciliation', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-items'] });
      setSelectedIds(new Set());
    },
  });

  const accounts = accountsQuery.data ?? [];
  const items = itemsQuery.data ?? [];
  const unreconciled = items.filter((i) => !i.reconciled);
  const selectedItems = items.filter((i) => selectedIds.has(i.id));
  const selectedTotal = selectedItems.reduce((s, i) => s + (i.type === 'CREDIT' ? i.amount : -i.amount), 0);
  const systemBalance = accounts.find((a) => a.id === accountId)?.balance ?? 0;
  const difference = parseFloat(statementBalance || '0') - systemBalance;

  function toggleAll() {
    if (selectedIds.size === unreconciled.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(unreconciled.map((i) => i.id)));
  }

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleReconcile() {
    reconcileMutation.mutate({
      bankAccountId: accountId,
      statementBalance: parseFloat(statementBalance),
      statementDate,
      itemIds: Array.from(selectedIds),
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Rekonsiliasi Bank</h1>
        <p className="text-sm text-slate-500 mt-1">Cocokkan saldo sistem dengan rekening koran bank.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rekening Bank</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400">
              <option value="">— Pilih Rekening —</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.bankName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Rekening Koran</label>
            <input type="number" value={statementBalance} onChange={(e) => setStatementBalance(e.target.value)}
              placeholder="0" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Rekening Koran</label>
            <input type="date" value={statementDate} onChange={(e) => setStatementDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
          </div>
        </div>

        {accountId && statementBalance && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Saldo Sistem', value: fmt(systemBalance), color: 'text-slate-900' },
              { label: 'Saldo Rekening Koran', value: fmt(parseFloat(statementBalance || '0')), color: 'text-teal-700' },
              { label: 'Selisih', value: fmt(difference), color: difference === 0 ? 'text-green-700' : 'text-red-700' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {accountId && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Transaksi Belum Direkonsiliasi</h2>
            {selectedIds.size > 0 && (
              <button onClick={handleReconcile} disabled={reconcileMutation.isPending}
                className="rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition">
                {reconcileMutation.isPending ? 'Memproses...' : `Rekonsiliasi ${selectedIds.size} item`}
              </button>
            )}
          </div>

          {itemsQuery.isLoading ? <LoadingState message="Memuat transaksi..." /> :
            unreconciled.length === 0 ? <EmptyState message="Semua transaksi sudah direkonsiliasi." /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100">
                    <th className="pb-3 text-left font-medium text-slate-500 w-8">
                      <input type="checkbox" checked={selectedIds.size === unreconciled.length && unreconciled.length > 0}
                        onChange={toggleAll} className="rounded" />
                    </th>
                    <th className="pb-3 text-left font-medium text-slate-500">Tanggal</th>
                    <th className="pb-3 text-left font-medium text-slate-500">Keterangan</th>
                    <th className="pb-3 text-left font-medium text-slate-500">Referensi</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Debit</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Kredit</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {unreconciled.map((item) => (
                      <tr key={item.id} onClick={() => toggle(item.id)} className={`cursor-pointer hover:bg-slate-50 ${selectedIds.has(item.id) ? 'bg-teal-50' : ''}`}>
                        <td className="py-2.5">
                          <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggle(item.id)} className="rounded" />
                        </td>
                        <td className="py-2.5 text-slate-500 text-xs">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                        <td className="py-2.5 text-slate-700">{item.description}</td>
                        <td className="py-2.5 font-mono text-xs text-slate-400">{item.reference ?? '-'}</td>
                        <td className="py-2.5 text-right text-slate-600">{item.type === 'DEBIT' ? fmt(item.amount) : ''}</td>
                        <td className="py-2.5 text-right text-teal-700 font-medium">{item.type === 'CREDIT' ? fmt(item.amount) : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
