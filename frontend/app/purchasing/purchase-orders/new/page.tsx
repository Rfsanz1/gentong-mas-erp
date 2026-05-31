'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createPurchaseOrder, type CreatePurchaseOrderDto } from '@/lib/purchasing';
import { getSuppliers } from '@/lib/suppliers';

type LineItem = { nama: string; qty: number; hargaBeli: number; subtotal: number };

function emptyLine(): LineItem {
  return { nama: '', qty: 1, hargaBeli: 0, subtotal: 0 };
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [tanggalKirim, setTanggalKirim] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<LineItem[]>([emptyLine()]);
  const [error, setError] = useState('');

  const suppliersQuery = useQuery({
    queryKey: ['suppliers-all'],
    queryFn: () => getSuppliers({ limit: 200 }),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreatePurchaseOrderDto) => createPurchaseOrder(dto),
    onSuccess: () => router.push('/purchasing/purchase-orders'),
    onError: (e: any) => setError(e?.message ?? 'Gagal menyimpan PO.'),
  });

  function updateItem(idx: number, field: keyof LineItem, raw: string) {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[idx] };
      if (field === 'nama') {
        item.nama = raw;
      } else {
        const num = parseFloat(raw) || 0;
        (item as any)[field] = num;
      }
      item.subtotal = item.qty * item.hargaBeli;
      next[idx] = item;
      return next;
    });
  }

  const grandTotal = items.reduce((s, i) => s + i.subtotal, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId) { setError('Pilih supplier terlebih dahulu.'); return; }
    if (items.some((i) => !i.nama.trim())) { setError('Nama item tidak boleh kosong.'); return; }
    setError('');
    createMutation.mutate({
      supplierId,
      tanggal,
      tanggalKirim: tanggalKirim || undefined,
      note: note || undefined,
      items: items.map((i) => ({ nama: i.nama, qty: i.qty, hargaBeli: i.hargaBeli, subtotal: i.subtotal })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Buat Purchase Order</h1>
          <p className="text-sm text-slate-500 mt-1">Isi detail PO baru untuk pengadaan barang.</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm hover:bg-slate-50 transition"
        >
          ← Kembali
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Informasi PO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier <span className="text-red-500">*</span></label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
              required
            >
              <option value="">-- Pilih Supplier --</option>
              {(suppliersQuery.data?.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal PO <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estimasi Tanggal Kirim</label>
            <input
              type="date"
              value={tanggalKirim}
              onChange={(e) => setTanggalKirim(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Keterangan tambahan..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Item Pembelian</h2>
          <button
            type="button"
            onClick={() => setItems((p) => [...p, emptyLine()])}
            className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100 transition"
          >
            + Tambah Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-2 text-left font-medium text-slate-500">Nama Barang</th>
                <th className="pb-2 text-center font-medium text-slate-500 w-24">Qty</th>
                <th className="pb-2 text-right font-medium text-slate-500 w-40">Harga Beli</th>
                <th className="pb-2 text-right font-medium text-slate-500 w-40">Subtotal</th>
                <th className="pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 pr-3">
                    <input
                      type="text"
                      value={item.nama}
                      onChange={(e) => updateItem(idx, 'nama', e.target.value)}
                      placeholder="Nama barang..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-center outline-none focus:border-sky-400"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min="0"
                      value={item.hargaBeli}
                      onChange={(e) => updateItem(idx, 'hargaBeli', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-right outline-none focus:border-sky-400"
                    />
                  </td>
                  <td className="py-2 pl-2 text-right font-medium text-slate-700">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.subtotal)}
                  </td>
                  <td className="py-2 pl-2">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-600 text-lg leading-none"
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <div className="text-right">
            <p className="text-sm text-slate-500">Grand Total</p>
            <p className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(grandTotal)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-medium hover:bg-slate-50 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50 transition"
        >
          {createMutation.isPending ? 'Menyimpan...' : 'Simpan PO'}
        </button>
      </div>
    </form>
  );
}
