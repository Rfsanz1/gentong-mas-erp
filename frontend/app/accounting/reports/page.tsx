'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type ReportRow = { name: string; amount: number; indent?: number; bold?: boolean };
type FinancialReport = { title: string; asOf?: string; period?: string; rows: ReportRow[] };

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

type ReportType = 'balance-sheet' | 'income-statement' | 'cash-flow';

export default function FinancialReportsPage() {
  const now = new Date();
  const [reportType, setReportType] = useState<ReportType>('balance-sheet');
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [dateFrom, setDateFrom] = useState(`${now.getFullYear()}-01-01`);
  const [dateTo, setDateTo] = useState(now.toISOString().slice(0, 10));

  const bsQuery = useQuery<FinancialReport>({
    queryKey: ['report-bs', date],
    queryFn: () => apiGet<FinancialReport>('/api/finance/reports/balance-sheet', { params: { date } }),
    enabled: reportType === 'balance-sheet',
    retry: false,
  });

  const isQuery = useQuery<FinancialReport>({
    queryKey: ['report-is', dateFrom, dateTo],
    queryFn: () => apiGet<FinancialReport>('/api/finance/reports/income-statement', { params: { dateFrom, dateTo } }),
    enabled: reportType === 'income-statement',
    retry: false,
  });

  const cfQuery = useQuery<FinancialReport>({
    queryKey: ['report-cf', dateFrom, dateTo],
    queryFn: () => apiGet<FinancialReport>('/api/finance/reports/cash-flow', { params: { dateFrom, dateTo } }),
    enabled: reportType === 'cash-flow',
    retry: false,
  });

  const activeQuery = reportType === 'balance-sheet' ? bsQuery : reportType === 'income-statement' ? isQuery : cfQuery;
  const report = activeQuery.data;

  const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
    { value: 'balance-sheet', label: 'Neraca (Balance Sheet)' },
    { value: 'income-statement', label: 'Laba Rugi (P&L)' },
    { value: 'cash-flow', label: 'Arus Kas (Cash Flow)' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Laporan Keuangan</h1>
        <p className="text-sm text-slate-500 mt-1">Neraca, Laba Rugi, dan Arus Kas.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {REPORT_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setReportType(opt.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                reportType === opt.value ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {reportType === 'balance-sheet' ? (
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Per tanggal</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
            </div>
          ) : (
            <>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
              <span className="self-center text-slate-400">s/d</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
            </>
          )}
        </div>

        {activeQuery.isLoading ? <LoadingState message="Memuat laporan..." /> :
          !report || report.rows.length === 0 ? <EmptyState message="Tidak ada data untuk periode ini." /> : (
            <>
              <h2 className="text-lg font-bold text-slate-900">{report.title}</h2>
              {report.asOf && <p className="text-sm text-slate-500">Per {new Date(report.asOf).toLocaleDateString('id-ID')}</p>}
              {report.period && <p className="text-sm text-slate-500">Periode {report.period}</p>}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-50">
                    {report.rows.map((row, idx) => (
                      <tr key={idx} className={row.bold ? 'bg-slate-50' : 'hover:bg-slate-50/50'}>
                        <td className="py-2.5" style={{ paddingLeft: `${(row.indent ?? 0) * 20 + 4}px` }}>
                          <span className={row.bold ? 'font-semibold text-slate-900' : 'text-slate-700'}>{row.name}</span>
                        </td>
                        <td className={`py-2.5 text-right ${row.bold ? 'font-bold text-slate-900' : 'text-slate-700'} ${row.amount < 0 ? 'text-red-600' : ''}`}>
                          {row.amount !== 0 || row.bold ? fmt(row.amount) : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
      </div>
    </div>
  );
}
