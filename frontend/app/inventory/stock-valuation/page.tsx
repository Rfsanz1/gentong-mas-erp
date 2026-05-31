'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type ValuationStats = {
  totalProducts: number;
  totalQty: number;
  totalValue: number;
  avgCostPerUnit: number;
};

type StockValuationItem = {
  productId: string;
  productName: string;
  sku?: string;
  categoryName?: string;
  warehouseName?: string;
  qty: number;
  unitCost: number;
  totalValue: number;
  method: string;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
}

export default function StockValuationPage() {
  const [warehouseId, setWarehouseId] = useState('');
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');

  const warehousesQuery = useQuery<{ id: string; name: string }[]>({
    queryKey: ['warehouses'],
    queryFn: () => apiGet<{ id: string; name: string }[]>('/api/inventory/warehouses'),
  });

  const statsQuery = useQuery<ValuationStats>({
    queryKey: ['valuation-stats'],
    queryFn: () => apiGet<ValuationStats>('/api/inventory/valuation/stats'),
    retry: false,
  });

  const valuationQuery = useQuery<StockValuationItem[]>({
    queryKey: ['stock-valuation', date, warehouseId],
    queryFn: () => apiGet<StockValuationItem[]>('/api/inventory/valuation/stock', {
      params: {
        date: date || undefined,
        warehouseId: warehouseId || undefined,
      },
    }),
    retry: false,
  });

  const raw = valuationQuery.data ?? [];
  const items = search.trim()
    ? raw.filter((i) => i.productName.toLowerCase().includes(search.toLowerCase()) || (i.sku ?? '').toLowerCase().includes(search.toLowerCase()))
    : raw;

  const grandTotal = items.reduce((s, i) => s + (i.totalValue ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Valuasi Stok</h1>
        <p className="text-sm text-slate-500 mt-1">Nilai persediaan berdasarkan metode FIFO atau Average Cost.</p>
      </div>

      {statsQuery.data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Produk', value: statsQuery.data.totalProducts.toLocaleString('id-ID') },
            { label: 'Total Qty', value: statsQuery.data.totalQty.toLocaleString('id-ID') },
            { label: 'Total Nilai Stok', value: fmt(statsQuery.data.totalValue) },
            { label: 'Rata-rata Biaya/Unit', value: fmt(statsQuery.data.avgCostPerUnit) },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Cari produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
          >
            <option value="">Semua Gudang</option>
            {(warehousesQuery.data ?? []).map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        {valuationQuery.isLoading ? (
          <LoadingState message="Memuat valuasi stok..." />
        ) : items.length === 0 ? (
          <EmptyState message="Tidak ada data valuasi stok." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left font-medium text-slate-500">Produk</th>
                    <th className="pb-3 text-left font-medium text-slate-500">SKU</th>
                    <th className="pb-3 text-left font-medium text-slate-500">Kategori</th>
                    <th className="pb-3 text-left font-medium text-slate-500">Gudang</th>
                    <th className="pb-3 text-center font-medium text-slate-500">Metode</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Qty</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Harga/Unit</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Total Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item) => (
                    <tr key={`${item.productId}-${item.warehouseName}`} className="hover:bg-slate-50">
                      <td className="py-3 font-medium text-slate-900">{item.productName}</td>
                      <td className="py-3 font-mono text-xs text-slate-400">{item.sku ?? '-'}</td>
                      <td className="py-3 text-slate-500">{item.categoryName ?? '-'}</td>
                      <td className="py-3 text-slate-500">{item.warehouseName ?? 'Semua'}</td>
                      <td className="py-3 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.method === 'FIFO' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.method}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-700">{item.qty.toLocaleString('id-ID')}</td>
                      <td className="py-3 text-right text-slate-600">{fmt(item.unitCost ?? 0)}</td>
                      <td className="py-3 text-right font-semibold text-slate-900">{fmt(item.totalValue ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200">
                    <td colSpan={7} className="py-3 font-semibold text-slate-900">Total Nilai Stok</td>
                    <td className="py-3 text-right text-lg font-bold text-emerald-700">{fmt(grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
