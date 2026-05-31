'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  approvedBy?: string;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const LEAVE_TYPES = ['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'EMERGENCY'];

export default function LeavesPage() {
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ employeeId: '', type: 'ANNUAL', startDate: '', endDate: '', reason: '' });

  const query = useQuery<{ data: LeaveRequest[] }>({
    queryKey: ['leaves', status],
    queryFn: () => apiGet<{ data: LeaveRequest[] }>('/api/hr/leaves', { params: { status: status || undefined } }),
    retry: false,
  });

  const empQuery = useQuery<{ data: { id: string; name: string }[] }>({
    queryKey: ['employees-simple'],
    queryFn: () => apiGet<{ data: { id: string; name: string }[] }>('/api/hr/employees', { params: { status: 'ACTIVE', limit: 200 } }),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost('/api/hr/leaves', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaves'] }); setShowForm(false); },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      apiPost(`/api/hr/leaves/${id}/${action}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const leaves = query.data?.data ?? [];
  const employees = empQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cuti & Izin</h1>
          <p className="text-sm text-slate-500 mt-1">Pengajuan dan persetujuan cuti karyawan.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-500 transition">
          {showForm ? 'Batal' : '+ Ajukan Cuti'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Pengajuan Cuti</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Karyawan <span className="text-red-500">*</span></label>
              <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
                <option value="">— Pilih —</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Cuti</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
                {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai <span className="text-red-500">*</span></label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Alasan <span className="text-red-500">*</span></label>
              <input type="text" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createMutation.isPending}
              className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Ajukan'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {s === '' ? 'Semua' : s}
            </button>
          ))}
        </div>

        {query.isLoading ? <LoadingState message="Memuat pengajuan cuti..." /> :
          leaves.length === 0 ? <EmptyState message="Tidak ada pengajuan cuti." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Karyawan</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Jenis</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Mulai</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Selesai</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Hari</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Alasan</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-medium text-slate-900">{l.employeeName}</td>
                      <td className="py-2.5"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{l.type}</span></td>
                      <td className="py-2.5 text-slate-500 text-xs">{new Date(l.startDate).toLocaleDateString('id-ID')}</td>
                      <td className="py-2.5 text-slate-500 text-xs">{new Date(l.endDate).toLocaleDateString('id-ID')}</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">{l.days}</td>
                      <td className="py-2.5 text-slate-500 max-w-xs truncate">{l.reason}</td>
                      <td className="py-2.5 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[l.status] ?? 'bg-slate-100 text-slate-600'}`}>{l.status}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        {l.status === 'PENDING' && (
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => approveMutation.mutate({ id: l.id, action: 'approve' })}
                              className="rounded-xl bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition">Setuju</button>
                            <button onClick={() => approveMutation.mutate({ id: l.id, action: 'reject' })}
                              className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition">Tolak</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
