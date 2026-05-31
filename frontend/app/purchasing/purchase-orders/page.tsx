'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { usePermission } from '@/hooks/usePermission';
import {
  getPurchaseOrders,
  approvePurchaseOrder,
  cancelPurchaseOrder,
  type PurchaseOrder,
} from '@/lib/purchasing';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  APPROVED: 'bg-green-100 text-green-700',
  RECEIVED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function fmt(v: string | number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v));
}

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { hasAnyRole } = usePermission();
  const canManage = hasAnyRole(['admin', 'owner', 'super admin']);

  const poQuery = useQuery({
    queryKey: ['purchase-orders', search, status, page],
    queryFn: () => getPurchaseOrders({ search: search.trim() || undefined, status: status || undefined, page, limit: 20 }),
  });

  const approveMutation = useMutation({
    mutationFn: approvePurchaseOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelPurchaseOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });

  const items: PurchaseOrder[] = poQuery.data?.data ?? [];
  const totalPages = poQuery.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Purchase Order</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar semua purchase order pengadaan barang.</p>
        </div>
        {canManage && (
          <Link
            href="/purchasing/purchase-orders/new"
            className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-500 transition"
          >
            + Buat PO
          </Link>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Cari no. PO atau supplier..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
          >
            <option value="">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">Disetujui</option>
            <option value="RECEIVED">Diterima</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>

        {poQuery.isLoading ? (
          <LoadingState message="Memuat purchase order..." />
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada purchase order." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">No. PO</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Supplier</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Total</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  {canManage && <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="py-3 font-medium text-sky-700">
                      <Link href={`/purchasing/purchase-orders/${po.id}`}>{po.noPo}</Link>
                    </td>
                    <td className="py-3 text-slate-700">{po.supplier?.name ?? '-'}</td>
                    <td className="py-3 text-slate-500">{new Date(po.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 text-right font-medium text-slate-900">{fmt(po.totalHarga)}</td>
                    <td className="py-3 text-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[po.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {po.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {po.status === 'DRAFT' && (
                            <button
                              onClick={() => approveMutation.mutate(po.id)}
                              className="rounded-xl bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition"
                            >
                              Approve
                            </button>
                          )}
                          {(po.status === 'DRAFT' || po.status === 'APPROVED') && (
                            <button
                              onClick={() => cancelMutation.mutate(po.id)}
                              className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
                            >
                              Batalkan
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-40"
            >
              ← Sebelumnya
            </button>
            <span className="text-sm text-slate-500">Hal. {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-40"
            >
              Berikutnya →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
