'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type Attendance = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  late?: number;
  overtime?: number;
  note?: string;
};

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-700',
  LATE: 'bg-amber-100 text-amber-700',
  LEAVE: 'bg-blue-100 text-blue-700',
  HOLIDAY: 'bg-slate-100 text-slate-600',
  HALF_DAY: 'bg-purple-100 text-purple-700',
};

export default function AttendancesPage() {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [empSearch, setEmpSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', date: now.toISOString().slice(0, 10), checkIn: '08:00', checkOut: '17:00', status: 'PRESENT', note: '' });

  const query = useQuery<{ data: Attendance[]; summary: Record<string, number> }>({
    queryKey: ['attendances', month, empSearch],
    queryFn: () => apiGet<{ data: Attendance[]; summary: Record<string, number> }>('/api/hr/attendances', {
      params: { month, search: empSearch || undefined },
    }),
    retry: false,
  });

  const empQuery = useQuery<{ data: { id: string; name: string }[] }>({
    queryKey: ['employees-simple'],
    queryFn: () => apiGet<{ data: { id: string; name: string }[] }>('/api/hr/employees', { params: { status: 'ACTIVE', limit: 200 } }),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost('/api/hr/attendances', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['attendances'] }); setShowForm(false); },
  });

  const attendances = query.data?.data ?? [];
  const summary = query.data?.summary ?? {};
  const employees = empQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Kehadiran Karyawan</h1>
          <p className="text-sm text-slate-500 mt-1">Rekap absensi bulanan seluruh karyawan.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-500 transition">
          {showForm ? 'Batal' : '+ Catat Absensi'}
        </button>
      </div>

      {Object.keys(summary).length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(summary).map(([key, val]) => (
            <div key={key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">{key}</p>
              <p className={`text-xl font-bold mt-1 ${STATUS_COLORS[key]?.split(' ')[1] ?? 'text-slate-900'}`}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Catat Absensi Manual</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Karyawan <span className="text-red-500">*</span></label>
              <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
                <option value="">— Pilih Karyawan —</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
                {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {form.status === 'PRESENT' || form.status === 'LATE' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jam Masuk</label>
                  <input type="time" value={form.checkIn} onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jam Keluar</label>
                  <input type="time" value={form.checkOut} onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
                </div>
              </>
            ) : null}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
              <input type="text" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createMutation.isPending}
              className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
          <input type="text" placeholder="Cari nama karyawan..." value={empSearch} onChange={(e) => setEmpSearch(e.target.value)}
            className="flex-1 min-w-[180px] rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
        </div>

        {query.isLoading ? <LoadingState message="Memuat absensi..." /> :
          attendances.length === 0 ? <EmptyState message="Tidak ada data absensi untuk periode ini." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Karyawan</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Masuk</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Keluar</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Terlambat</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Catatan</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {attendances.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-medium text-slate-900">{a.employeeName}</td>
                      <td className="py-2.5 text-slate-500 text-xs">{new Date(a.date).toLocaleDateString('id-ID')}</td>
                      <td className="py-2.5 text-center text-slate-700">{a.checkIn ?? '-'}</td>
                      <td className="py-2.5 text-center text-slate-700">{a.checkOut ?? '-'}</td>
                      <td className="py-2.5 text-center text-amber-700">{a.late ? `${a.late} min` : '-'}</td>
                      <td className="py-2.5 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[a.status] ?? 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                      </td>
                      <td className="py-2.5 text-slate-400 text-xs max-w-xs truncate">{a.note ?? ''}</td>
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
