'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type SalaryComponent = {
  id: string;
  name: string;
  code: string;
  type: 'ALLOWANCE' | 'DEDUCTION';
  calculationType: 'FIXED' | 'PERCENTAGE' | 'FORMULA';
  value: number;
  taxable: boolean;
  active: boolean;
  description?: string;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function SalaryComponentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ALLOWANCE' | 'DEDUCTION'>('ALL');
  const [form, setForm] = useState({ name: '', code: '', type: 'ALLOWANCE', calculationType: 'FIXED', value: '', taxable: false, description: '' });

  const query = useQuery<SalaryComponent[]>({
    queryKey: ['salary-components'],
    queryFn: () => apiGet<SalaryComponent[]>('/api/hr/payrolls/components'),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (data: object) =>
      editId ? apiPut<SalaryComponent>(`/api/hr/payrolls/components/${editId}`, data)
             : apiPost<SalaryComponent>('/api/hr/payrolls/components', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-components'] });
      setShowForm(false); setEditId(null);
      setForm({ name: '', code: '', type: 'ALLOWANCE', calculationType: 'FIXED', value: '', taxable: false, description: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/hr/payrolls/components/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salary-components'] }),
  });

  const components = (query.data ?? []).filter((c) => typeFilter === 'ALL' || c.type === typeFilter);

  function startEdit(c: SalaryComponent) {
    setEditId(c.id);
    setForm({ name: c.name, code: c.code, type: c.type, calculationType: c.calculationType, value: String(c.value), taxable: c.taxable, description: c.description ?? '' });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Komponen Gaji</h1>
          <p className="text-sm text-slate-500 mt-1">Atur tunjangan dan potongan gaji karyawan.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', code: '', type: 'ALLOWANCE', calculationType: 'FIXED', value: '', taxable: false, description: '' }); }}
          className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-500 transition">
          {showForm ? 'Batal' : '+ Komponen Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ ...form, value: parseFloat(form.value) || 0 }); }}
          className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">{editId ? 'Edit Komponen' : 'Komponen Baru'}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kode</label>
              <input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="TRANSPORT" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Komponen <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                placeholder="Tunjangan Transportasi" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400">
                <option value="ALLOWANCE">Tunjangan</option>
                <option value="DEDUCTION">Potongan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cara Hitung</label>
              <select value={form.calculationType} onChange={(e) => setForm((f) => ({ ...f, calculationType: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400">
                <option value="FIXED">Nominal Tetap</option>
                <option value="PERCENTAGE">Persentase Gaji</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{form.calculationType === 'PERCENTAGE' ? 'Persentase (%)' : 'Nominal (Rp)'}</label>
              <input type="number" min="0" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="taxable" checked={form.taxable} onChange={(e) => setForm((f) => ({ ...f, taxable: e.target.checked }))} className="rounded" />
              <label htmlFor="taxable" className="text-sm text-slate-700">Kena Pajak (PPh 21)</label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
              <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saveMutation.isPending} className="rounded-2xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50 transition">
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex gap-2">
          {(['ALL', 'ALLOWANCE', 'DEDUCTION'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${typeFilter === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {t === 'ALL' ? 'Semua' : t === 'ALLOWANCE' ? 'Tunjangan' : 'Potongan'}
            </button>
          ))}
        </div>
        {query.isLoading ? <LoadingState message="Memuat komponen..." /> :
          components.length === 0 ? <EmptyState message="Belum ada komponen gaji." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Kode</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Nama</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Tipe</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Cara Hitung</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Nilai</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Pajak</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {components.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono text-xs text-orange-600">{c.code}</td>
                      <td className="py-3 font-medium text-slate-900">{c.name}</td>
                      <td className="py-3 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.type === 'ALLOWANCE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {c.type === 'ALLOWANCE' ? 'Tunjangan' : 'Potongan'}
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-500 text-xs">{c.calculationType}</td>
                      <td className="py-3 text-right font-semibold text-slate-900">
                        {c.calculationType === 'PERCENTAGE' ? `${c.value}%` : fmt(c.value)}
                      </td>
                      <td className="py-3 text-center">{c.taxable ? <span className="text-xs text-amber-700 font-medium">Ya</span> : <span className="text-xs text-slate-400">Tidak</span>}</td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => startEdit(c)} className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition">Edit</button>
                          <button onClick={() => deleteMutation.mutate(c.id)} className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition">Hapus</button>
                        </div>
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
