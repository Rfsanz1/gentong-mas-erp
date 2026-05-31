'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type PriceComparisonItem = {
  productName: string;
  suppliers: Array<{
    supplierId: string;
    supplierName: string;
    hargaBeli: number;
    lastOrderDate?: string | null;
  }>;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
}

export default function PriceComparisonPage() {
  const [search, setSearch] = useState('');

  const query = useQuery<PriceComparisonItem[]>({
    queryKey: ['price-comparison', search],
    queryFn: () => apiGet<PriceComparisonItem[]>('/api/purchasing/price-comparison', { params: { search: search.trim() || undefined } }),
    retry: false,
  });

  const items = query.data ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Perbandingan Harga</h1>
        <p className="text-sm text-slate-500 mt-1">Bandingkan harga barang dari berbagai supplier.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <input
          type="text"
          placeholder="Cari nama barang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 max-w-md"
        />

        {query.isLoading ? (
          <LoadingState message="Memuat perbandingan harga..." />
        ) : items.length === 0 ? (
          <EmptyState message="Tidak ada data perbandingan harga." />
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const minPrice = Math.min(...item.suppliers.map((s) => s.hargaBeli));
              return (
                <div key={item.productName} className="rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-semibold text-slate-900 mb-3">{item.productName}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {item.suppliers.map((s) => (
                      <div
                        key={s.supplierId}
                        className={`rounded-2xl border p-4 ${s.hargaBeli === minPrice ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}
                      >
                        <p className="text-sm font-medium text-slate-900">{s.supplierName}</p>
                        <p className={`text-lg font-bold mt-1 ${s.hargaBeli === minPrice ? 'text-green-700' : 'text-slate-700'}`}>
                          {fmt(s.hargaBeli)}
                        </p>
                        {s.lastOrderDate && (
                          <p className="text-xs text-slate-400 mt-1">
                            Terakhir order: {new Date(s.lastOrderDate).toLocaleDateString('id-ID')}
                          </p>
                        )}
                        {s.hargaBeli === minPrice && (
                          <span className="inline-block mt-2 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-medium text-white">
                            Termurah
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
