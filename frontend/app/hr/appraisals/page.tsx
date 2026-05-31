'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type Appraisal = {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  overallScore: number;
  grade: string;
  status: string;
  reviewedBy?: string;
};

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-red-100 text-red-600',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  REVIEWED: 'bg-green-100 text-green-700',
};

export default function AppraisalsPage() {
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState(`${new Date().getFullYear()}`);
  const [form, setForm] = useState({ employeeId: '', period: '', scores: { kpi: 0, attitude: 0, teamwork: 0, punctuality: 0 }, notes: '' });

  const query = useQuery<Appraisal[]>({
    queryKey: ['appraisals', period],
    queryFn: () => apiGet<Appraisal[]>('/api/hr/appraisals', { params: { period } }),
    retry: false,
  });

  const empQuery = useQuery<{ data: { id: string; name: string }[] }>({
    queryKey: ['employees-simple'],
    queryFn: () => apiGet<{ data: { id: string; name: string }[] }>('/api/hr/employees', { params: { status: 'ACTIVE', limit: 200 } }),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost('/api/hr/appraisals', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appraisals'] }); setShowForm(false); },
  });

  const appraisals = query.data ?? [];
  const employees = empQuery.data?.data ?? [];

  const avgScore = appraisals.length > 0 ? (appraisals.reduce((s, a) => s + a.overallScore, 0) / appraisals.length).toFixed(1) : '-';
  const overallScore = Object.values(form.scores).reduce((s, v) => s + Number(v), 0) / Object.values(form.scores).length;

  const SCORE_LABELS: Record<string, string> = { kpi: 'KPI', attitude: 'Sikap & Perilaku', teamwork: 'Kerjasama Tim', punctuality: 'Kedisiplinan' };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Penilaian Kinerja</h1>
          <p className="text-sm text-slate-500 mt-1">Evaluasi kinerja tahunan per karyawan.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
            {[2026, 2025, 2024].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-500 transition">
            {showForm ? 'Batal' : '+ Penilaian Baru'}
          </button>
        </div>
      </div>

      {appraisals.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-500">Rata-rata Nilai</p>
            <p className="text-3xl font-bold text-rose-700">{avgScore}</p>
          </div>
          <div className="flex gap-3">
            {Object.entries(GRADE_COLORS).map(([g, cls]) => (
              <div key={g} className="text-center">
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${cls}`}>{g}</span>
                <p className="text-xs text-slate-400 mt-1">{appraisals.filter((a) => a.grade === g).length}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, overallScore }); }}
          className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Penilaian Baru</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Karyawan <span className="text-red-500">*</span></label>
              <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
                <option value="">— Pilih —</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Periode</label>
              <input type="text" value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} placeholder="2026"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            {Object.entries(SCORE_LABELS).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label} (0–100)</label>
                <input type="number" min="0" max="100" value={(form.scores as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, scores: { ...f.scores, [key]: parseInt(e.target.value) || 0 } }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
              <input type="text" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            {overallScore > 0 && (
              <div className="sm:col-span-2 rounded-2xl bg-white border border-slate-200 p-3 text-sm">
                Rata-rata nilai: <strong className="text-rose-700">{overallScore.toFixed(1)}</strong>
                {' → Grade: '}
                <strong className="text-rose-700">{overallScore >= 90 ? 'A' : overallScore >= 75 ? 'B' : overallScore >= 60 ? 'C' : 'D'}</strong>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createMutation.isPending} className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {query.isLoading ? <LoadingState message="Memuat penilaian..." /> :
          appraisals.length === 0 ? <EmptyState message="Belum ada penilaian kinerja untuk periode ini." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Karyawan</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Periode</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Nilai</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Grade</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Reviewer</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {appraisals.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-medium text-slate-900">{a.employeeName}</td>
                      <td className="py-2.5 text-center text-slate-500">{a.period}</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">{a.overallScore?.toFixed(1)}</td>
                      <td className="py-2.5 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${GRADE_COLORS[a.grade] ?? 'bg-slate-100 text-slate-500'}`}>{a.grade}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[a.status] ?? 'bg-slate-100 text-slate-500'}`}>{a.status}</span>
                      </td>
                      <td className="py-2.5 text-slate-500">{a.reviewedBy ?? '-'}</td>
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
