'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type PayrollPeriod = {
  id: string;
  name: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  payDate: string;
  status: string;
  employeeCount: number;
  totalNet: number;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function PayrollPeriodsPage() {
  const [showForm, setShowForm] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), startDate: '', endDate: '', payDate: '' });

  const query = useQuery<PayrollPeriod[]>({
    queryKey: ['payroll-periods'],
    queryFn: () => apiGet<PayrollPeriod[]>('/api/hr/payrolls/periods'),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost('/api/hr/payrolls/periods', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payroll-periods'] }); setShowForm(false); },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/api/hr/payrolls/periods/${id}/approve`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll-periods'] }),
  });

  const periods = query.data ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Periode Penggajian</h1>
          <p className="text-sm text-slate-500 mt-1">Buat dan kelola periode gaji bulanan.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-500 transition">
          {showForm ? 'Batal' : '+ Periode Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
          className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Periode Baru</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bulan</label>
              <select value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: parseInt(e.target.value) }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label>
              <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Bayar</label>
              <input type="date" value={form.payDate} onChange={(e) => setForm((f) => ({ ...f, payDate: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createMutation.isPending} className="rounded-2xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Buat Periode'}
            </button>
          </div>
        </form>
      )}

      {query.isLoading ? <LoadingState message="Memuat periode..." /> :
        periods.length === 0 ? <EmptyState message="Belum ada periode penggajian." /> : (
          <div className="space-y-3">
            {periods.map((p) => (
              <div key={p.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{MONTHS[(p.month ?? 1) - 1]} {p.year}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.startDate ? new Date(p.startDate).toLocaleDateString('id-ID') : '-'} –{' '}
                    {p.endDate ? new Date(p.endDate).toLocaleDateString('id-ID') : '-'}
                    {p.payDate ? ` · Bayar: ${new Date(p.payDate).toLocaleDateString('id-ID')}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-slate-500">{p.employeeCount} karyawan</span>
                  <span className="font-semibold text-orange-700">{fmt(p.totalNet)}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[p.status] ?? 'bg-slate-100 text-slate-600'}`}>{p.status}</span>
                  {p.status === 'PROCESSING' && (
                    <button onClick={() => approveMutation.mutate(p.id)} className="rounded-xl bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition">Approve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
