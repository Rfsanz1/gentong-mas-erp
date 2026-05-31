'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type Training = {
  id: string;
  title: string;
  category: string;
  instructor: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  participantCount: number;
  budget?: number;
};

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  ONGOING: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function TrainingPage() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ title: '', category: 'Technical', instructor: '', startDate: '', endDate: '', location: '', budget: '' });

  const query = useQuery<Training[]>({
    queryKey: ['trainings', statusFilter],
    queryFn: () => apiGet<Training[]>('/api/hr/trainings', { params: { status: statusFilter || undefined } }),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost('/api/hr/trainings', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trainings'] }); setShowForm(false); },
  });

  const trainings = query.data ?? [];

  const CATEGORIES = ['Technical', 'Leadership', 'Safety', 'Compliance', 'Soft Skills', 'Product', 'Sales'];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pelatihan & Training</h1>
          <p className="text-sm text-slate-500 mt-1">Jadwal dan rekap pelatihan karyawan.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-500 transition">
          {showForm ? 'Batal' : '+ Training Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, budget: parseFloat(form.budget) || 0 }); }}
          className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Training Baru</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Judul Training <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instruktur</label>
              <input type="text" value={form.instructor} onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
              <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Anggaran (Rp)</label>
              <input type="number" min="0" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createMutation.isPending} className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {['', 'PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {s === '' ? 'Semua' : s}
            </button>
          ))}
        </div>
        {query.isLoading ? <LoadingState message="Memuat training..." /> :
          trainings.length === 0 ? <EmptyState message="Belum ada jadwal training." /> : (
            <div className="grid gap-4 sm:grid-cols-2">
              {trainings.map((t) => (
                <div key={t.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{t.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t.category} · {t.instructor}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[t.status] ?? 'bg-slate-100'}`}>{t.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>📅 {new Date(t.startDate).toLocaleDateString('id-ID')} – {new Date(t.endDate).toLocaleDateString('id-ID')}</span>
                    <span>📍 {t.location || '-'}</span>
                    <span>👥 {t.participantCount} peserta</span>
                  </div>
                  {t.budget ? <p className="text-xs text-slate-400">Anggaran: <span className="font-medium text-slate-700">{fmt(t.budget)}</span></p> : null}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
