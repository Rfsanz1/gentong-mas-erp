'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type PayrollPeriod = { id: string; month: number; year: number; status: string; totalNet: number; employeeCount: number };
type BankRow = { employeeId: string; name: string; bankName: string; accountNumber: string; amount: number };

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function BankExportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [bankFormat, setBankFormat] = useState('BCA');
  const [preview, setPreview] = useState<BankRow[]>([]);

  const periodsQuery = useQuery<PayrollPeriod[]>({
    queryKey: ['payroll-periods'],
    queryFn: () => apiGet<PayrollPeriod[]>('/api/hr/payrolls/periods'),
    retry: false,
  });

  const previewMutation = useMutation({
    mutationFn: (data: object) => apiPost<BankRow[]>('/api/hr/payrolls/bank-export/preview', data),
    onSuccess: (data) => setPreview(data ?? []),
  });

  const exportMutation = useMutation({
    mutationFn: (data: object) => apiPost<{ downloadUrl: string; filename: string }>('/api/hr/payrolls/bank-export', data),
    onSuccess: (data) => {
      if (data?.downloadUrl) window.open(data.downloadUrl, '_blank');
      else alert('File export siap diunduh. Hubungi admin untuk akses file.');
    },
  });

  const periods = periodsQuery.data ?? [];
  const readyPeriods = periods.filter((p) => p.status === 'APPROVED' || p.status === 'PAID');
  const selectedPrd = periods.find((p) => p.id === selectedPeriod);

  const BANK_FORMATS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'Danamon', 'CIMB Niaga'];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Export Transfer Bank</h1>
        <p className="text-sm text-slate-500 mt-1">Generate file transfer gaji untuk diunggah ke internet banking.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Periode</label>
            {periodsQuery.isLoading ? <LoadingState message="Memuat..." /> :
              readyPeriods.length === 0 ? <EmptyState message="Tidak ada periode yang siap dieksport (status APPROVED/PAID)." /> : (
                <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400">
                  <option value="">— Pilih Periode —</option>
                  {readyPeriods.map((p) => <option key={p.id} value={p.id}>{MONTHS[(p.month ?? 1) - 1]} {p.year} — {fmt(p.totalNet)}</option>)}
                </select>
              )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Format Bank</label>
            <select value={bankFormat} onChange={(e) => setBankFormat(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400">
              {BANK_FORMATS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {selectedPeriod && selectedPrd && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-wrap gap-6 text-sm">
            <div><p className="text-xs text-slate-500">Karyawan</p><p className="font-semibold">{selectedPrd.employeeCount} orang</p></div>
            <div><p className="text-xs text-slate-500">Total Transfer</p><p className="font-semibold text-orange-700">{fmt(selectedPrd.totalNet)}</p></div>
            <div><p className="text-xs text-slate-500">Status</p><p className="font-semibold">{selectedPrd.status}</p></div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => previewMutation.mutate({ periodId: selectedPeriod, bankFormat })}
            disabled={!selectedPeriod || previewMutation.isPending}
            className="rounded-2xl bg-slate-700 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-600 disabled:opacity-40 transition">
            {previewMutation.isPending ? 'Memuat preview...' : '👁 Preview Data'}
          </button>
          <button
            onClick={() => exportMutation.mutate({ periodId: selectedPeriod, bankFormat })}
            disabled={!selectedPeriod || exportMutation.isPending}
            className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-40 transition">
            {exportMutation.isPending ? 'Mengexport...' : '⬇ Export File'}
          </button>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-4">Preview Data Transfer ({preview.length} baris)</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              <th className="pb-3 text-left font-medium text-slate-500">Nama</th>
              <th className="pb-3 text-left font-medium text-slate-500">Bank</th>
              <th className="pb-3 text-left font-medium text-slate-500">No. Rekening</th>
              <th className="pb-3 text-right font-medium text-slate-500">Nominal</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {preview.map((row) => (
                <tr key={row.employeeId} className="hover:bg-slate-50">
                  <td className="py-2.5 font-medium text-slate-900">{row.name}</td>
                  <td className="py-2.5 text-slate-500">{row.bankName}</td>
                  <td className="py-2.5 font-mono text-xs text-slate-500">{row.accountNumber}</td>
                  <td className="py-2.5 text-right font-semibold text-orange-700">{fmt(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
