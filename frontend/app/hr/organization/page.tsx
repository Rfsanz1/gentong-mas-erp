'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost, apiPut } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type Department = { id: string; name: string; code?: string; headId?: string; headName?: string; employeeCount: number; parentId?: string | null };
type Position = { id: string; name: string; department: string; level: string; employeeCount: number };

export default function OrganizationPage() {
  const [tab, setTab] = useState<'departments' | 'positions'>('departments');
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [showPosForm, setShowPosForm] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [posForm, setPosForm] = useState({ name: '', department: '', level: 'STAFF' });

  const deptQuery = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: () => apiGet<Department[]>('/api/hr/departments'),
    retry: false,
  });

  const posQuery = useQuery<Position[]>({
    queryKey: ['positions'],
    queryFn: () => apiGet<Position[]>('/api/hr/positions'),
    retry: false,
  });

  const createDept = useMutation({
    mutationFn: (data: object) => apiPost<Department>('/api/hr/departments', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setShowDeptForm(false); setDeptForm({ name: '', code: '' }); },
  });

  const createPos = useMutation({
    mutationFn: (data: object) => apiPost<Position>('/api/hr/positions', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['positions'] }); setShowPosForm(false); setPosForm({ name: '', department: '', level: 'STAFF' }); },
  });

  const departments = deptQuery.data ?? [];
  const positions = posQuery.data ?? [];

  const LEVELS = ['DIRECTOR', 'MANAGER', 'SUPERVISOR', 'STAFF', 'INTERN'];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Struktur Organisasi</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola departemen, jabatan, dan hierarki organisasi.</p>
      </div>

      <div className="flex gap-2">
        {(['departments', 'positions'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${tab === t ? 'bg-rose-700 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            {t === 'departments' ? 'Departemen' : 'Jabatan'}
          </button>
        ))}
      </div>

      {tab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowDeptForm(!showDeptForm)} className="rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 transition">
              {showDeptForm ? 'Batal' : '+ Departemen Baru'}
            </button>
          </div>
          {showDeptForm && (
            <form onSubmit={(e) => { e.preventDefault(); createDept.mutate(deptForm); }} className="rounded-3xl border border-rose-200 bg-rose-50 p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kode</label>
                  <input type="text" value={deptForm.code} onChange={(e) => setDeptForm((f) => ({ ...f, code: e.target.value }))} placeholder="OPS"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Departemen <span className="text-red-500">*</span></label>
                  <input type="text" value={deptForm.name} onChange={(e) => setDeptForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Operasional"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={createDept.isPending} className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition">
                  {createDept.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}
          {deptQuery.isLoading ? <LoadingState message="Memuat departemen..." /> :
            departments.length === 0 ? <EmptyState message="Belum ada departemen." /> : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((d) => (
                  <div key={d.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{d.name}</p>
                        {d.code && <p className="text-xs font-mono text-slate-400 mt-0.5">{d.code}</p>}
                      </div>
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">{d.employeeCount} org</span>
                    </div>
                    {d.headName && <p className="text-xs text-slate-500 mt-2">Kepala: {d.headName}</p>}
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      {tab === 'positions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowPosForm(!showPosForm)} className="rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 transition">
              {showPosForm ? 'Batal' : '+ Jabatan Baru'}
            </button>
          </div>
          {showPosForm && (
            <form onSubmit={(e) => { e.preventDefault(); createPos.mutate(posForm); }} className="rounded-3xl border border-rose-200 bg-rose-50 p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Jabatan <span className="text-red-500">*</span></label>
                  <input type="text" value={posForm.name} onChange={(e) => setPosForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Staff Gudang"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departemen</label>
                  <select value={posForm.department} onChange={(e) => setPosForm((f) => ({ ...f, department: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
                    <option value="">— Pilih —</option>
                    {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                  <select value={posForm.level} onChange={(e) => setPosForm((f) => ({ ...f, level: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={createPos.isPending} className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition">
                  {createPos.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}
          {posQuery.isLoading ? <LoadingState message="Memuat jabatan..." /> :
            positions.length === 0 ? <EmptyState message="Belum ada jabatan." /> : (
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100">
                    <th className="pb-3 text-left font-medium text-slate-500">Jabatan</th>
                    <th className="pb-3 text-left font-medium text-slate-500">Departemen</th>
                    <th className="pb-3 text-center font-medium text-slate-500">Level</th>
                    <th className="pb-3 text-center font-medium text-slate-500">Jumlah</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {positions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 font-medium text-slate-900">{p.name}</td>
                        <td className="py-3 text-slate-500">{p.department || '-'}</td>
                        <td className="py-3 text-center"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{p.level}</span></td>
                        <td className="py-3 text-center text-slate-700">{p.employeeCount}</td>
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
