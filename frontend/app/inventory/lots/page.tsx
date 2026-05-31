'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type StockLot = {
  id: string;
  lotNumber: string;
  productId: string;
  productName: string;
  warehouseId?: string;
  warehouseName?: string;
  qty: number;
  unitCost: number;
  totalValue: number;
  expiryDate?: string | null;
  receivedDate: string;
  method: string;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
}

export default function LotsPage() {
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');

  const lotsQuery = useQuery<StockLot[]>({
    queryKey: ['stock-lots', productId],
    queryFn: () => apiGet<StockLot[]>('/api/inventory/valuation/lots', {
      params: { productId: productId || undefined },
    }),
    retry: false,
  });

  const raw = lotsQuery.data ?? [];
  const items = search.trim()
    ? raw.filter((l) => l.productName.toLowerCase().includes(search.toLowerCase()) || l.lotNumber.toLowerCase().includes(search.toLowerCase()))
    : raw;

  const totalValue = items.reduce((s, l) => s + (l.totalValue ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Lot Stok</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar lot stok berdasarkan metode valuasi (FIFO / Average).</p>
        </div>
        {items.length > 0 && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3 text-right">
            <p className="text-xs text-emerald-600">Total Nilai Lot</p>
            <p className="text-lg font-bold text-emerald-800">{fmt(totalValue)}</p>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Cari produk atau nomor lot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        {lotsQuery.isLoading ? (
          <LoadingState message="Memuat lot stok..." />
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada data lot stok." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">No. Lot</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Produk</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Gudang</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Metode</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Qty</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Harga/Unit</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Total Nilai</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Tgl Masuk</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Expired</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((lot) => (
                  <tr key={lot.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs text-emerald-700">{lot.lotNumber}</td>
                    <td className="py-3 font-medium text-slate-900">{lot.productName}</td>
                    <td className="py-3 text-slate-500">{lot.warehouseName ?? '-'}</td>
                    <td className="py-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        lot.method === 'FIFO' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {lot.method}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-700">{lot.qty.toLocaleString('id-ID')}</td>
                    <td className="py-3 text-right text-slate-700">{fmt(lot.unitCost ?? 0)}</td>
                    <td className="py-3 text-right font-medium text-slate-900">{fmt(lot.totalValue ?? 0)}</td>
                    <td className="py-3 text-slate-500 text-xs">{lot.receivedDate ? new Date(lot.receivedDate).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="py-3 text-xs">
                      {lot.expiryDate ? (
                        <span className={new Date(lot.expiryDate) < new Date() ? 'text-red-600 font-medium' : 'text-slate-500'}>
                          {new Date(lot.expiryDate).toLocaleDateString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
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
