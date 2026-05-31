'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type JournalEntry = {
  id: string;
  number: string;
  date: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  POSTED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function JournalEntriesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const journalsQuery = useQuery<{ data: JournalEntry[]; totalPages: number }>({
    queryKey: ['finance-journals', status, page],
    queryFn: () => apiGet<{ data: JournalEntry[]; totalPages: number }>('/api/finance/journals', {
      params: { status: status || undefined, page, limit: 20 },
    }),
    retry: false,
  });

  const items = (journalsQuery.data?.data ?? []).filter((j) =>
    !search.trim() || j.number.includes(search) || j.description.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = journalsQuery.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Jurnal Keuangan</h1>
          <p className="text-sm text-slate-500 mt-1">Semua entri jurnal — buat jurnal baru di menu Akuntansi.</p>
        </div>
        <Link href="/accounting/journal-entry"
          className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition">
          + Jurnal Baru
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="Cari no. jurnal atau deskripsi..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400" />
          <div className="flex flex-wrap gap-2">
            {['', 'DRAFT', 'POSTED', 'CANCELLED'].map((s) => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}>
                {s === '' ? 'Semua' : s}
              </button>
            ))}
          </div>
        </div>

        {journalsQuery.isLoading ? <LoadingState message="Memuat jurnal..." /> :
          items.length === 0 ? <EmptyState message="Tidak ada jurnal ditemukan." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">No. Jurnal</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Deskripsi</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Debit</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Kredit</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono text-xs text-teal-700">{j.number}</td>
                      <td className="py-2.5 text-slate-500 text-xs">{new Date(j.date).toLocaleDateString('id-ID')}</td>
                      <td className="py-2.5 text-slate-700 max-w-xs truncate">{j.description}</td>
                      <td className="py-2.5 text-right text-slate-700">{fmt(j.totalDebit)}</td>
                      <td className="py-2.5 text-right text-slate-700">{fmt(j.totalCredit)}</td>
                      <td className="py-2.5 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[j.status] ?? 'bg-slate-100 text-slate-600'}`}>{j.status}</span>
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
