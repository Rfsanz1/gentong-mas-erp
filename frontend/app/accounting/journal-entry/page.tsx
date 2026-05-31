'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type JournalLine = { accountId: string; description: string; debit: number; credit: number };
type Journal = {
  id: string; number: string; date: string; description: string;
  status: string; totalDebit: number; totalCredit: number;
  lines?: JournalLine[];
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  POSTED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

function emptyLine(): JournalLine { return { accountId: '', description: '', debit: 0, credit: 0 }; }

export default function JournalEntryPage() {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([emptyLine(), emptyLine()]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const journalsQuery = useQuery<{ data: Journal[]; totalPages: number }>({
    queryKey: ['journals', status, page],
    queryFn: () => apiGet<{ data: Journal[]; totalPages: number }>('/api/finance/journals', {
      params: { status: status || undefined, page, limit: 20 },
    }),
    retry: false,
  });

  const accountsQuery = useQuery<{ data: { id: string; code: string; name: string }[] }>({
    queryKey: ['coa-flat'],
    queryFn: () => apiGet<{ data: { id: string; code: string; name: string }[] }>('/api/finance/accounts'),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost<Journal>('/api/finance/journals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      setShowForm(false); setDescription(''); setLines([emptyLine(), emptyLine()]);
    },
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/api/finance/journals/${id}/post`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journals'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/api/finance/journals/${id}/cancel`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journals'] }),
  });

  const accounts = accountsQuery.data?.data ?? [];
  const journals = journalsQuery.data?.data ?? [];
  const totalPages = journalsQuery.data?.totalPages ?? 1;

  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  function updateLine(idx: number, field: keyof JournalLine, value: string) {
    setLines((prev) => {
      const next = [...prev];
      const l = { ...next[idx] };
      if (field === 'accountId' || field === 'description') (l as any)[field] = value;
      else (l as any)[field] = parseFloat(value) || 0;
      next[idx] = l;
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ date, description, lines: lines.filter((l) => l.accountId) });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Journal Entry</h1>
          <p className="text-sm text-slate-500 mt-1">Buat dan kelola jurnal akuntansi.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition">
          {showForm ? 'Batal' : '+ Jurnal Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-slate-900">Jurnal Baru</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required
                placeholder="Keterangan jurnal..." className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200">
                <th className="pb-2 text-left font-medium text-slate-500">Akun</th>
                <th className="pb-2 text-left font-medium text-slate-500">Keterangan</th>
                <th className="pb-2 text-right font-medium text-slate-500 w-36">Debit</th>
                <th className="pb-2 text-right font-medium text-slate-500 w-36">Kredit</th>
                <th className="pb-2 w-8"></th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-2">
                      <select value={line.accountId} onChange={(e) => updateLine(idx, 'accountId', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400">
                        <option value="">— Pilih Akun —</option>
                        {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input type="text" value={line.description} onChange={(e) => updateLine(idx, 'description', e.target.value)}
                        placeholder="Keterangan..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400" />
                    </td>
                    <td className="py-2 px-2">
                      <input type="number" min="0" value={line.debit || ''} onChange={(e) => updateLine(idx, 'debit', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-right outline-none focus:border-violet-400" />
                    </td>
                    <td className="py-2 pl-2">
                      <input type="number" min="0" value={line.credit || ''} onChange={(e) => updateLine(idx, 'credit', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-right outline-none focus:border-violet-400" />
                    </td>
                    <td className="py-2 pl-1">
                      {lines.length > 2 && (
                        <button type="button" onClick={() => setLines((l) => l.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td colSpan={2} className="py-2 font-semibold text-slate-700">Total</td>
                  <td className="py-2 text-right font-bold text-slate-900">{fmt(totalDebit)}</td>
                  <td className="py-2 text-right font-bold text-slate-900">{fmt(totalCredit)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
            <p className="text-sm text-red-600">⚠ Debit dan kredit harus seimbang.</p>
          )}
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setLines((l) => [...l, emptyLine()])}
              className="rounded-2xl bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-200 transition">
              + Tambah Baris
            </button>
            <button type="submit" disabled={!isBalanced || createMutation.isPending}
              className="rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Jurnal'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {['', 'DRAFT', 'POSTED', 'CANCELLED'].map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}>
              {s === '' ? 'Semua' : s}
            </button>
          ))}
        </div>
        {journalsQuery.isLoading ? <LoadingState message="Memuat jurnal..." /> :
          journals.length === 0 ? <EmptyState message="Belum ada jurnal." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">No. Jurnal</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Deskripsi</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Debit</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {journals.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono text-xs text-violet-700">{j.number}</td>
                      <td className="py-3 text-slate-500">{new Date(j.date).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 text-slate-700 max-w-xs truncate">{j.description}</td>
                      <td className="py-3 text-right font-medium text-slate-900">{fmt(j.totalDebit)}</td>
                      <td className="py-3 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[j.status] ?? 'bg-slate-100 text-slate-600'}`}>{j.status}</span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {j.status === 'DRAFT' && (
                            <button onClick={() => postMutation.mutate(j.id)}
                              className="rounded-xl bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition">Post</button>
                          )}
                          {j.status === 'DRAFT' && (
                            <button onClick={() => cancelMutation.mutate(j.id)}
                              className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition">Batal</button>
                          )}
                        </div>
                      </td>
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
    </div>
  );
}
