'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type TaxConfig = {
  id: string;
  name: string;
  code: string;
  type: string;
  rate: number;
  description?: string;
  active: boolean;
};

const TAX_TYPES = ['PPN', 'PPh21', 'PPh23', 'PPh4a2', 'PPh25', 'Lainnya'];

export default function TaxConfigPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', type: 'PPN', rate: '', description: '' });

  const taxQuery = useQuery<TaxConfig[]>({
    queryKey: ['tax-configs'],
    queryFn: () => apiGet<TaxConfig[]>('/api/tax'),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (data: object) =>
      editId
        ? apiPut<TaxConfig>(`/api/tax/${editId}`, data)
        : apiPost<TaxConfig>('/api/tax', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-configs'] });
      setShowForm(false); setEditId(null);
      setForm({ name: '', code: '', type: 'PPN', rate: '', description: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/tax/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tax-configs'] }),
  });

  const taxes = taxQuery.data ?? [];

  function startEdit(t: TaxConfig) {
    setEditId(t.id); setShowForm(true);
    setForm({ name: t.name, code: t.code, type: t.type, rate: String(t.rate), description: t.description ?? '' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({ ...form, rate: parseFloat(form.rate) || 0, active: true });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Konfigurasi Pajak</h1>
          <p className="text-sm text-slate-500 mt-1">Atur jenis pajak dan tarif yang berlaku.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', code: '', type: 'PPN', rate: '', description: '' }); }}
          className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition">
          {showForm ? 'Batal' : '+ Pajak Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-teal-200 bg-teal-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">{editId ? 'Edit Pajak' : 'Pajak Baru'}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kode <span className="text-red-500">*</span></label>
              <input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required
                placeholder="PPN-11" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                placeholder="PPN 11%" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400">
                {TAX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tarif (%) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" min="0" max="100" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))} required
                placeholder="11" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
              <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Keterangan pajak..." className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saveMutation.isPending}
              className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition">
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      {taxQuery.isLoading ? <LoadingState message="Memuat konfigurasi pajak..." /> :
        taxes.length === 0 ? <EmptyState message="Belum ada konfigurasi pajak." /> : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Kode</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Nama</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Jenis</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Tarif</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Deskripsi</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {taxes.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono text-xs text-teal-600">{t.code}</td>
                      <td className="py-3 font-medium text-slate-900">{t.name}</td>
                      <td className="py-3 text-center"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{t.type}</span></td>
                      <td className="py-3 text-right font-bold text-teal-700">{t.rate}%</td>
                      <td className="py-3 text-slate-500 text-xs max-w-xs truncate">{t.description ?? '-'}</td>
                      <td className="py-3 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${t.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          {t.active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => startEdit(t)} className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition">Edit</button>
                          <button onClick={() => deleteMutation.mutate(t.id)} className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
