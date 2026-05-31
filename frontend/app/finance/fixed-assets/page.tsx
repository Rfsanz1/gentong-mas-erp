'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type FixedAsset = {
  id: string;
  code: string;
  name: string;
  category: string;
  acquisitionDate: string;
  acquisitionCost: number;
  usefulLife: number;
  depreciationMethod: string;
  bookValue: number;
  accumulatedDepreciation: number;
  status: string;
  location?: string;
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DISPOSED: 'bg-red-100 text-red-700',
  MAINTENANCE: 'bg-amber-100 text-amber-700',
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function FixedAssetsPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', code: '', category: 'Kendaraan', acquisitionDate: new Date().toISOString().slice(0, 10),
    acquisitionCost: '', usefulLife: '5', depreciationMethod: 'STRAIGHT_LINE', location: '',
  });

  const assetsQuery = useQuery<FixedAsset[]>({
    queryKey: ['fixed-assets'],
    queryFn: () => apiGet<FixedAsset[]>('/api/finance/fixed-assets'),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost<FixedAsset>('/api/finance/fixed-assets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      setShowForm(false);
    },
  });

  const assets = (assetsQuery.data ?? []).filter((a) =>
    !search.trim() || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search)
  );

  const totalBookValue = assets.reduce((s, a) => s + (a.bookValue ?? 0), 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ ...form, acquisitionCost: parseFloat(form.acquisitionCost) || 0, usefulLife: parseInt(form.usefulLife) || 5 });
  }

  const ASSET_CATEGORIES = ['Tanah', 'Bangunan', 'Kendaraan', 'Mesin', 'Peralatan', 'Inventaris Kantor', 'Komputer & IT', 'Lain-lain'];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Aset Tetap</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola aset tetap dan penyusutannya.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition">
          {showForm ? 'Batal' : '+ Aset Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-teal-200 bg-teal-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Aset Baru</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kode Aset</label>
              <input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="AST-001" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Aset <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                placeholder="Toyota Avanza 2024" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400">
                {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Perolehan</label>
              <input type="date" value={form.acquisitionDate} onChange={(e) => setForm((f) => ({ ...f, acquisitionDate: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Harga Perolehan (Rp) <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.acquisitionCost} onChange={(e) => setForm((f) => ({ ...f, acquisitionCost: e.target.value }))} required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Umur Ekonomis (tahun)</label>
              <input type="number" min="1" value={form.usefulLife} onChange={(e) => setForm((f) => ({ ...f, usefulLife: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Penyusutan</label>
              <select value={form.depreciationMethod} onChange={(e) => setForm((f) => ({ ...f, depreciationMethod: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400">
                <option value="STRAIGHT_LINE">Garis Lurus</option>
                <option value="DECLINING_BALANCE">Saldo Menurun</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
              <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Kantor Pusat" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createMutation.isPending}
              className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Aset'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <input type="text" placeholder="Cari aset..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400 max-w-sm flex-1" />
          {assets.length > 0 && (
            <span className="text-sm text-slate-500">Nilai Buku Total: <strong className="text-teal-700">{fmt(totalBookValue)}</strong></span>
          )}
        </div>

        {assetsQuery.isLoading ? <LoadingState message="Memuat aset tetap..." /> :
          assets.length === 0 ? <EmptyState message="Belum ada aset tetap." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Kode</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Nama</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Kategori</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Harga Perolehan</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Akum. Penyusutan</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Nilai Buku</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {assets.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono text-xs text-slate-400">{a.code}</td>
                      <td className="py-2.5 font-medium text-slate-900">{a.name}</td>
                      <td className="py-2.5 text-slate-500">{a.category}</td>
                      <td className="py-2.5 text-right text-slate-600">{fmt(a.acquisitionCost)}</td>
                      <td className="py-2.5 text-right text-red-500">{fmt(a.accumulatedDepreciation)}</td>
                      <td className="py-2.5 text-right font-semibold text-teal-700">{fmt(a.bookValue)}</td>
                      <td className="py-2.5 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[a.status] ?? 'bg-slate-100 text-slate-500'}`}>{a.status}</span>
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
