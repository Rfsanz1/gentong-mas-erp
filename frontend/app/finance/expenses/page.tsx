'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type Expense = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paidBy: string;
  status: string;
  reference?: string;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PAID: 'bg-teal-100 text-teal-700',
};

const EXPENSE_CATEGORIES = ['Operasional', 'Transportasi', 'Akomodasi', 'Makan & Minum', 'ATK', 'Utilitas', 'Pemasaran', 'Lain-lain'];

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), category: 'Operasional', description: '', amount: '', paidBy: '' });

  const expensesQuery = useQuery<{ data: Expense[]; totalPages: number }>({
    queryKey: ['expenses', status, page],
    queryFn: () => apiGet<{ data: Expense[]; totalPages: number }>('/api/finance/expenses', {
      params: { status: status || undefined, page, limit: 20 },
    }),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost<Expense>('/api/finance/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowForm(false);
      setForm({ date: new Date().toISOString().slice(0, 10), category: 'Operasional', description: '', amount: '', paidBy: '' });
    },
  });

  const expenses = expensesQuery.data?.data ?? [];
  const totalPages = expensesQuery.data?.totalPages ?? 1;
  const totalAmount = expenses.reduce((s, e) => s + (e.amount ?? 0), 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ ...form, amount: parseFloat(form.amount) || 0, status: 'DRAFT' });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pengeluaran (Expenses)</h1>
          <p className="text-sm text-slate-500 mt-1">Catat dan kelola pengeluaran operasional.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition">
          {showForm ? 'Batal' : '+ Pengeluaran Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-teal-200 bg-teal-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Pengeluaran Baru</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400">
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (Rp) <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi <span className="text-red-500">*</span></label>
              <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required
                placeholder="Keterangan pengeluaran..." className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dibayar Oleh</label>
              <input type="text" value={form.paidBy} onChange={(e) => setForm((f) => ({ ...f, paidBy: e.target.value }))}
                placeholder="Nama karyawan..." className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createMutation.isPending}
              className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            {['', 'DRAFT', 'SUBMITTED', 'APPROVED', 'PAID', 'REJECTED'].map((s) => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}>
                {s === '' ? 'Semua' : s}
              </button>
            ))}
          </div>
          {expenses.length > 0 && (
            <span className="text-sm text-slate-500">Total: <strong className="text-teal-700">{fmt(totalAmount)}</strong></span>
          )}
        </div>

        {expensesQuery.isLoading ? <LoadingState message="Memuat pengeluaran..." /> :
          expenses.length === 0 ? <EmptyState message="Belum ada pengeluaran." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Kategori</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Deskripsi</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Dibayar Oleh</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Jumlah</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-2.5 text-slate-500 text-xs">{new Date(e.date).toLocaleDateString('id-ID')}</td>
                      <td className="py-2.5"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{e.category}</span></td>
                      <td className="py-2.5 text-slate-700 max-w-xs truncate">{e.description}</td>
                      <td className="py-2.5 text-slate-500">{e.paidBy || '-'}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-900">{fmt(e.amount)}</td>
                      <td className="py-2.5 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[e.status] ?? 'bg-slate-100 text-slate-600'}`}>{e.status}</span>
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
