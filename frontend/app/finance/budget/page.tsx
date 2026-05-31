'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type Budget = {
  id: string;
  name: string;
  period: string;
  year: number;
  month?: number;
  totalAllocated: number;
  totalSpent: number;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  APPROVED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-slate-200 text-slate-500',
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function BudgetPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', period: 'MONTHLY', year: new Date().getFullYear(), month: new Date().getMonth() + 1, totalAllocated: '' });

  const budgetsQuery = useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: () => apiGet<Budget[]>('/api/finance/budgets'),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost<Budget>('/api/finance/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setShowForm(false);
      setForm({ name: '', period: 'MONTHLY', year: new Date().getFullYear(), month: new Date().getMonth() + 1, totalAllocated: '' });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/api/finance/budgets/${id}/approve`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });

  const budgets = Array.isArray(budgetsQuery.data) ? budgetsQuery.data : [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ ...form, totalAllocated: parseFloat(form.totalAllocated) || 0 });
  }

  const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Anggaran (Budget)</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola anggaran bulanan atau tahunan.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition">
          {showForm ? 'Batal' : '+ Anggaran Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-teal-200 bg-teal-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Anggaran Baru</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Anggaran <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                placeholder="Anggaran Operasional Q1 2026" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Periode</label>
              <select value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400">
                <option value="MONTHLY">Bulanan</option>
                <option value="QUARTERLY">Kuartalan</option>
                <option value="ANNUAL">Tahunan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label>
              <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            {form.period === 'MONTHLY' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bulan</label>
                <select value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: parseInt(e.target.value) }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400">
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Anggaran (Rp) <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.totalAllocated} onChange={(e) => setForm((f) => ({ ...f, totalAllocated: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createMutation.isPending}
              className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Anggaran'}
            </button>
          </div>
        </form>
      )}

      {budgetsQuery.isLoading ? <LoadingState message="Memuat anggaran..." /> :
        budgets.length === 0 ? <EmptyState message="Belum ada anggaran." /> : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {budgets.map((b) => {
              const pct = b.totalAllocated > 0 ? Math.min(100, Math.round((b.totalSpent / b.totalAllocated) * 100)) : 0;
              return (
                <div key={b.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{b.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{b.period} · {b.year}{b.month ? ` / ${MONTHS[b.month - 1]}` : ''}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-slate-100 text-slate-500'}`}>{b.status}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Terpakai: {fmt(b.totalSpent)}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-teal-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Total: {fmt(b.totalAllocated)}</p>
                  </div>
                  {b.status === 'DRAFT' && (
                    <button onClick={() => approveMutation.mutate(b.id)}
                      className="w-full rounded-2xl border border-green-200 py-2 text-xs font-medium text-green-700 hover:bg-green-50 transition">
                      Approve
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
