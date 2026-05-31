'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type ReorderRule = {
  id: string;
  productId: string;
  productName: string;
  warehouseId?: string;
  warehouseName?: string;
  minQty: number;
  maxQty: number;
  reorderQty: number;
  leadTimeDays: number;
  active: boolean;
};

export default function ReorderRulesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ productId: '', warehouseId: '', minQty: '', maxQty: '', reorderQty: '', leadTimeDays: '7' });
  const [search, setSearch] = useState('');

  const rulesQuery = useQuery<ReorderRule[]>({
    queryKey: ['reorder-rules'],
    queryFn: () => apiGet<ReorderRule[]>('/api/inventory/reorder-rules'),
    retry: false,
  });

  const warehousesQuery = useQuery<{ id: string; name: string }[]>({
    queryKey: ['warehouses'],
    queryFn: () => apiGet<{ id: string; name: string }[]>('/api/inventory/warehouses'),
  });

  const productsQuery = useQuery<{ id: string; name: string; sku?: string }[]>({
    queryKey: ['products-simple'],
    queryFn: () => apiGet<{ data: { id: string; name: string; sku?: string }[] }>('/api/inventory/products', { params: { limit: 500 } })
      .then((r: any) => r.data ?? r),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (data: object) =>
      editId
        ? apiPut<ReorderRule>(`/api/inventory/reorder-rules/${editId}`, data)
        : apiPost<ReorderRule>('/api/inventory/reorder-rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reorder-rules'] });
      setShowForm(false);
      setEditId(null);
      setForm({ productId: '', warehouseId: '', minQty: '', maxQty: '', reorderQty: '', leadTimeDays: '7' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/inventory/reorder-rules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reorder-rules'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiPut(`/api/inventory/reorder-rules/${id}`, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reorder-rules'] }),
  });

  const rules = (rulesQuery.data ?? []).filter((r) =>
    !search.trim() || r.productName.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(rule: ReorderRule) {
    setEditId(rule.id);
    setForm({
      productId: rule.productId,
      warehouseId: rule.warehouseId ?? '',
      minQty: String(rule.minQty),
      maxQty: String(rule.maxQty),
      reorderQty: String(rule.reorderQty),
      leadTimeDays: String(rule.leadTimeDays),
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({
      productId: form.productId,
      warehouseId: form.warehouseId || null,
      minQty: parseFloat(form.minQty) || 0,
      maxQty: parseFloat(form.maxQty) || 0,
      reorderQty: parseFloat(form.reorderQty) || 0,
      leadTimeDays: parseInt(form.leadTimeDays) || 7,
      active: true,
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reorder Rules</h1>
          <p className="text-sm text-slate-500 mt-1">Atur batas minimum stok dan otomasi pemesanan ulang.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ productId: '', warehouseId: '', minQty: '', maxQty: '', reorderQty: '', leadTimeDays: '7' }); }}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition"
        >
          {showForm ? 'Batal' : '+ Tambah Rule'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">{editId ? 'Edit Rule' : 'Rule Baru'}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Produk <span className="text-red-500">*</span></label>
              <select value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400">
                <option value="">-- Pilih Produk --</option>
                {(Array.isArray(productsQuery.data) ? productsQuery.data : []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gudang</label>
              <select value={form.warehouseId} onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400">
                <option value="">Semua Gudang</option>
                {(warehousesQuery.data ?? []).map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min. Qty <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.minQty} onChange={(e) => setForm((f) => ({ ...f, minQty: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maks. Qty</label>
              <input type="number" min="0" value={form.maxQty} onChange={(e) => setForm((f) => ({ ...f, maxQty: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Qty Reorder <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={form.reorderQty} onChange={(e) => setForm((f) => ({ ...f, reorderQty: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lead Time (hari)</label>
              <input type="number" min="1" value={form.leadTimeDays} onChange={(e) => setForm((f) => ({ ...f, leadTimeDays: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saveMutation.isPending}
              className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition">
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Rule'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
        />

        {rulesQuery.isLoading ? (
          <LoadingState message="Memuat reorder rules..." />
        ) : rules.length === 0 ? (
          <EmptyState message="Belum ada reorder rule. Tambah rule pertama." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Produk</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Gudang</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Min. Qty</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Maks. Qty</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Qty Reorder</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Lead Time</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-900">{rule.productName}</td>
                    <td className="py-3 text-slate-500">{rule.warehouseName ?? 'Semua'}</td>
                    <td className="py-3 text-right text-slate-700">{rule.minQty.toLocaleString('id-ID')}</td>
                    <td className="py-3 text-right text-slate-700">{rule.maxQty.toLocaleString('id-ID')}</td>
                    <td className="py-3 text-right font-medium text-emerald-700">{rule.reorderQty.toLocaleString('id-ID')}</td>
                    <td className="py-3 text-right text-slate-500">{rule.leadTimeDays} hari</td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => toggleMutation.mutate({ id: rule.id, active: !rule.active })}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          rule.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {rule.active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => startEdit(rule)} className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition">Edit</button>
                        <button onClick={() => deleteMutation.mutate(rule.id)} className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition">Hapus</button>
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
