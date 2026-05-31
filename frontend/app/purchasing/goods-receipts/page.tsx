'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { getGoodsReceipts, confirmGoodsReceipt, type GoodsReceipt } from '@/lib/purchasing';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function GoodsReceiptsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const grQuery = useQuery({
    queryKey: ['goods-receipts', status, page],
    queryFn: () => getGoodsReceipts({ status: status || undefined, page, limit: 20 }),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmGoodsReceipt(id, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goods-receipts'] }),
  });

  const items: GoodsReceipt[] = grQuery.data?.data ?? [];
  const totalPages = grQuery.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Penerimaan Barang</h1>
        <p className="text-sm text-slate-500 mt-1">Catat dan konfirmasi barang yang diterima dari supplier.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {['', 'DRAFT', 'CONFIRMED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s === '' ? 'Semua' : s === 'DRAFT' ? 'Draft' : s === 'CONFIRMED' ? 'Dikonfirmasi' : 'Dibatalkan'}
            </button>
          ))}
        </div>

        {grQuery.isLoading ? (
          <LoadingState message="Memuat data penerimaan..." />
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada data penerimaan barang." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">No. GR</th>
                  <th className="pb-3 text-left font-medium text-slate-500">No. PO</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Supplier</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((gr) => (
                  <tr key={gr.id} className="hover:bg-slate-50">
                    <td className="py-3 font-medium text-sky-700">{gr.noGr}</td>
                    <td className="py-3 text-slate-700">{gr.purchaseOrder?.noPo ?? '-'}</td>
                    <td className="py-3 text-slate-700">{gr.purchaseOrder?.supplier?.name ?? '-'}</td>
                    <td className="py-3 text-slate-500">{new Date(gr.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 text-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[gr.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {gr.status === 'CONFIRMED' ? 'Dikonfirmasi' : gr.status === 'DRAFT' ? 'Draft' : gr.status}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {gr.status === 'DRAFT' && (
                        <button
                          onClick={() => confirmMutation.mutate(gr.id)}
                          disabled={confirmMutation.isPending}
                          className="rounded-xl bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition disabled:opacity-50"
                        >
                          Konfirmasi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-40">← Sebelumnya</button>
            <span className="text-sm text-slate-500">Hal. {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-40">Berikutnya →</button>
          </div>
        )}
      </div>
    </div>
  );
}
