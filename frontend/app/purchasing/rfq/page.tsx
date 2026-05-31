'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type RFQ = {
  id: string;
  noRfq: string;
  supplier?: { id: string; name: string } | null;
  tanggal: string;
  deadline?: string | null;
  status: string;
  note?: string | null;
  createdAt: string;
};

type RFQListResponse = {
  data: RFQ[];
  total: number;
  page: number;
  totalPages: number;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SENT: 'bg-blue-100 text-blue-700',
  RECEIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function RFQPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const rfqQuery = useQuery<RFQListResponse>({
    queryKey: ['rfq', status, page],
    queryFn: () => apiGet<RFQListResponse>('/api/purchasing/rfq', { params: { status: status || undefined, page, limit: 20 } }),
    retry: false,
  });

  const items = rfqQuery.data?.data ?? [];
  const totalPages = rfqQuery.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Request for Quotation (RFQ)</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar permintaan penawaran harga dari supplier.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-500 transition">
          + Buat RFQ
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {['', 'DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s === '' ? 'Semua' : s}
            </button>
          ))}
        </div>

        {rfqQuery.isLoading ? (
          <LoadingState message="Memuat RFQ..." />
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada RFQ." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">No. RFQ</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Supplier</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Deadline</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-slate-50">
                    <td className="py-3 font-medium text-sky-700">{rfq.noRfq}</td>
                    <td className="py-3 text-slate-700">{rfq.supplier?.name ?? '-'}</td>
                    <td className="py-3 text-slate-500">{new Date(rfq.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 text-slate-500">{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="py-3 text-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[rfq.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {rfq.status}
                      </span>
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
