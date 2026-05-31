'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type Loan = {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  installment: number;
  months: number;
  paidInstallments: number;
  remainingAmount: number;
  status: string;
  startDate: string;
  reason: string;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAID_OFF: 'bg-slate-100 text-slate-600',
  REJECTED: 'bg-red-100 text-red-600',
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function LoansPage() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ employeeId: '', amount: '', months: '12', reason: '' });

  const query = useQuery<Loan[]>({
    queryKey: ['loans', statusFilter],
    queryFn: () => apiGet<Loan[]>('/api/hr/loans', { params: { status: statusFilter || undefined } }),
    retry: false,
  });

  const empQuery = useQuery<{ data: { id: string; name: string }[] }>({
    queryKey: ['employees-simple'],
    queryFn: () => apiGet<{ data: { id: string; name: string }[] }>('/api/hr/employees', { params: { status: 'ACTIVE', limit: 200 } }),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost('/api/hr/loans', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['loans'] }); setShowForm(false); setForm({ employeeId: '', amount: '', months: '12', reason: '' }); },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/api/hr/loans/${id}/approve`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  });

  const loans = query.data ?? [];
  const employees = empQuery.data?.data ?? [];
  const amount = parseFloat(form.amount) || 0;
  const months = parseInt(form.months) || 12;
  const installment = months > 0 ? Math.ceil(amount / months) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pinjaman Karyawan</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola pinjaman dan cicilan dari gaji.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-500 transition">
          {showForm ? 'Batal' : '+ Pinjaman Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, amount, months, installment }); }}
          className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Pengajuan Pinjaman</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Karyawan <span className="text-red-500">*</span></label>
              <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
                <option value="">— Pilih —</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Pinjaman (Rp) <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tenor (bulan)</label>
              <input type="number" min="1" max="60" value={form.months} onChange={(e) => setForm((f) => ({ ...f, months: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Alasan</label>
              <input type="text" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            {amount > 0 && (
              <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-3 text-sm">
                <p className="text-slate-500">Estimasi cicilan/bulan: <strong className="text-rose-700">{fmt(installment)}</strong></p>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createMutation.isPending} className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Ajukan Pinjaman'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {['', 'PENDING', 'APPROVED', 'ACTIVE', 'PAID_OFF', 'REJECTED'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {s === '' ? 'Semua' : s}
            </button>
          ))}
        </div>
        {query.isLoading ? <LoadingState message="Memuat pinjaman..." /> :
          loans.length === 0 ? <EmptyState message="Belum ada pinjaman aktif." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Karyawan</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Jumlah</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Cicilan</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Bulan</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Sisa</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {loans.map((l) => {
                    const pct = l.amount > 0 ? Math.min(100, Math.round(((l.amount - l.remainingAmount) / l.amount) * 100)) : 0;
                    return (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="py-3">
                          <p className="font-medium text-slate-900">{l.employeeName}</p>
                          <p className="text-xs text-slate-400">{l.reason || ''}</p>
                        </td>
                        <td className="py-3 text-right font-medium text-slate-900">{fmt(l.amount)}</td>
                        <td className="py-3 text-right text-slate-600">{fmt(l.installment)}/bln</td>
                        <td className="py-3 text-center text-slate-600">{l.paidInstallments}/{l.months}</td>
                        <td className="py-3 text-right font-semibold text-rose-700">{fmt(l.remainingAmount)}</td>
                        <td className="py-3 text-center">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[l.status] ?? 'bg-slate-100'}`}>{l.status}</span>
                        </td>
                        <td className="py-3 text-center">
                          {l.status === 'PENDING' && (
                            <button onClick={() => approveMutation.mutate(l.id)} className="rounded-xl bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition">Setuju</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
