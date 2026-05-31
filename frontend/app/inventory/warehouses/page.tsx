'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost, apiPut } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type Warehouse = {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  active: boolean;
  _count?: { stocks: number };
};

export default function WarehousesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '' });

  const warehousesQuery = useQuery<Warehouse[]>({
    queryKey: ['warehouses-detail'],
    queryFn: () => apiGet<Warehouse[]>('/api/inventory/warehouses'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: object) =>
      editId
        ? apiPut<Warehouse>(`/api/inventory/warehouses/${editId}`, data)
        : apiPost<Warehouse>('/api/inventory/warehouses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses-detail'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', code: '', address: '', phone: '' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiPut(`/api/inventory/warehouses/${id}`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses-detail'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  const warehouses = warehousesQuery.data ?? [];

  function startEdit(wh: Warehouse) {
    setEditId(wh.id);
    setForm({ name: wh.name, code: wh.code ?? '', address: wh.address ?? '', phone: wh.phone ?? '' });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({
      name: form.name,
      code: form.code || undefined,
      address: form.address || undefined,
      phone: form.phone || undefined,
      active: true,
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manajemen Gudang</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola lokasi dan detail setiap gudang.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', code: '', address: '', phone: '' }); }}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition"
        >
          {showForm ? 'Batal' : '+ Tambah Gudang'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">{editId ? 'Edit Gudang' : 'Gudang Baru'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Gudang <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                placeholder="Cth: Gudang Utama"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kode Gudang</label>
              <input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="Cth: GDG-01"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
              <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="021-5551234"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
              <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Jl. ..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saveMutation.isPending}
              className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition">
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Gudang'}
            </button>
          </div>
        </form>
      )}

      {warehousesQuery.isLoading ? (
        <LoadingState message="Memuat data gudang..." />
      ) : warehouses.length === 0 ? (
        <EmptyState message="Belum ada gudang terdaftar." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {warehouses.map((wh) => (
            <div key={wh.id} className={`rounded-3xl border bg-white p-6 shadow-sm ${wh.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{wh.name}</h3>
                  {wh.code && <p className="text-xs font-mono text-emerald-600 mt-0.5">{wh.code}</p>}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${wh.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {wh.active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              {wh.address && <p className="mt-3 text-sm text-slate-500">{wh.address}</p>}
              {wh.phone && <p className="mt-1 text-sm text-slate-400">{wh.phone}</p>}
              {wh._count && (
                <p className="mt-3 text-xs text-slate-400">{wh._count.stocks} produk tersimpan</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => startEdit(wh)}
                  className="flex-1 rounded-2xl border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleMutation.mutate({ id: wh.id, active: !wh.active })}
                  className={`flex-1 rounded-2xl py-2 text-xs font-medium transition ${
                    wh.active
                      ? 'border border-red-200 text-red-600 hover:bg-red-50'
                      : 'border border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {wh.active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
