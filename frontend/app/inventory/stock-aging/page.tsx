'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type AgingBucket = {
  label: string;
  days: number;
  qty: number;
  value: number;
};

type AgingItem = {
  productId: string;
  productName: string;
  sku?: string;
  warehouseName?: string;
  totalQty: number;
  totalValue: number;
  oldestLotDate: string;
  ageDays: number;
  buckets: AgingBucket[];
};

type SlowMovingItem = {
  productId: string;
  productName: string;
  sku?: string;
  warehouseName?: string;
  qty: number;
  value: number;
  lastMovementDate?: string;
  daysSinceLastMove: number;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
}

function ageColor(days: number) {
  if (days >= 180) return 'bg-red-100 text-red-700';
  if (days >= 90) return 'bg-amber-100 text-amber-700';
  if (days >= 30) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

export default function StockAgingPage() {
  const [tab, setTab] = useState<'aging' | 'slow'>('aging');
  const [warehouseId, setWarehouseId] = useState('');
  const [slowDays, setSlowDays] = useState('90');

  const warehousesQuery = useQuery<{ id: string; name: string }[]>({
    queryKey: ['warehouses'],
    queryFn: () => apiGet<{ id: string; name: string }[]>('/api/inventory/warehouses'),
  });

  const agingQuery = useQuery<AgingItem[]>({
    queryKey: ['stock-aging', warehouseId],
    queryFn: () => apiGet<AgingItem[]>('/api/inventory/valuation/aging', {
      params: { warehouseId: warehouseId || undefined },
    }),
    enabled: tab === 'aging',
    retry: false,
  });

  const slowQuery = useQuery<SlowMovingItem[]>({
    queryKey: ['slow-moving', slowDays, warehouseId],
    queryFn: () => apiGet<SlowMovingItem[]>('/api/inventory/valuation/slow-moving', {
      params: { days: slowDays, warehouseId: warehouseId || undefined },
    }),
    enabled: tab === 'slow',
    retry: false,
  });

  const agingItems = agingQuery.data ?? [];
  const slowItems = slowQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Aging Stok</h1>
        <p className="text-sm text-slate-500 mt-1">Identifikasi stok lama dan slow-moving items.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {(['aging', 'slow'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  tab === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t === 'aging' ? 'Aging Stok' : 'Slow Moving'}
              </button>
            ))}
          </div>
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
          {tab === 'slow' && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Tidak bergerak lebih dari</span>
              <input
                type="number"
                min="1"
                value={slowDays}
                onChange={(e) => setSlowDays(e.target.value)}
                className="w-20 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              />
              <span>hari</span>
            </div>
          )}
        </div>

        {tab === 'aging' ? (
          agingQuery.isLoading ? (
            <LoadingState message="Memuat data aging..." />
          ) : agingItems.length === 0 ? (
            <EmptyState message="Tidak ada data aging stok." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left font-medium text-slate-500">Produk</th>
                    <th className="pb-3 text-left font-medium text-slate-500">Gudang</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Total Qty</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Total Nilai</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Umur Lot Tertua</th>
                    <th className="pb-3 text-center font-medium text-slate-500">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {agingItems
                    .sort((a, b) => b.ageDays - a.ageDays)
                    .map((item) => (
                      <tr key={`${item.productId}-${item.warehouseName}`} className="hover:bg-slate-50">
                        <td className="py-3 font-medium text-slate-900">{item.productName}</td>
                        <td className="py-3 text-slate-500">{item.warehouseName ?? '-'}</td>
                        <td className="py-3 text-right text-slate-700">{item.totalQty.toLocaleString('id-ID')}</td>
                        <td className="py-3 text-right font-medium text-slate-900">{fmt(item.totalValue ?? 0)}</td>
                        <td className="py-3 text-right text-slate-600">
                          {item.oldestLotDate ? new Date(item.oldestLotDate).toLocaleDateString('id-ID') : '-'}
                          <span className="ml-2 text-xs text-slate-400">({item.ageDays} hr)</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ageColor(item.ageDays)}`}>
                            {item.ageDays >= 180 ? '> 180 hari' : item.ageDays >= 90 ? '90–180 hari' : item.ageDays >= 30 ? '30–90 hari' : '< 30 hari'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          slowQuery.isLoading ? (
            <LoadingState message="Memuat slow-moving items..." />
          ) : slowItems.length === 0 ? (
            <EmptyState message={`Tidak ada item yang tidak bergerak lebih dari ${slowDays} hari.`} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left font-medium text-slate-500">Produk</th>
                    <th className="pb-3 text-left font-medium text-slate-500">Gudang</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Qty</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Nilai</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Pergerakan Terakhir</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Hari Diam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {slowItems
                    .sort((a, b) => b.daysSinceLastMove - a.daysSinceLastMove)
                    .map((item) => (
                      <tr key={`${item.productId}-${item.warehouseName}`} className="hover:bg-slate-50">
                        <td className="py-3 font-medium text-slate-900">{item.productName}</td>
                        <td className="py-3 text-slate-500">{item.warehouseName ?? '-'}</td>
                        <td className="py-3 text-right text-slate-700">{item.qty.toLocaleString('id-ID')}</td>
                        <td className="py-3 text-right font-medium text-slate-900">{fmt(item.value ?? 0)}</td>
                        <td className="py-3 text-right text-slate-500 text-xs">
                          {item.lastMovementDate ? new Date(item.lastMovementDate).toLocaleDateString('id-ID') : 'Tidak pernah'}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ageColor(item.daysSinceLastMove)}`}>
                            {item.daysSinceLastMove} hari
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
