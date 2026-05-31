'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type PayrollPeriod = { id: string; name: string; month: number; year: number; status: string };
type BatchResult = { processed: number; errors: number; totalNet: number; details: { employeeId: string; name: string; net: number; error?: string }[] };

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function BatchPayrollPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [result, setResult] = useState<BatchResult | null>(null);

  const periodsQuery = useQuery<PayrollPeriod[]>({
    queryKey: ['payroll-periods'],
    queryFn: () => apiGet<PayrollPeriod[]>('/api/hr/payrolls/periods'),
    retry: false,
  });

  const processMutation = useMutation({
    mutationFn: (periodId: string) => apiPost<BatchResult>(`/api/hr/payrolls/batch`, { periodId }),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['payroll-periods'] });
    },
  });

  const periods = (periodsQuery.data ?? []).filter((p) => p.status === 'DRAFT');

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Proses Penggajian Batch</h1>
        <p className="text-sm text-slate-500 mt-1">Hitung gaji seluruh karyawan aktif untuk satu periode.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Periode Penggajian</label>
          {periodsQuery.isLoading ? <LoadingState message="Memuat periode..." /> :
            periods.length === 0 ? <EmptyState message="Tidak ada periode DRAFT. Buat periode baru di menu Periode Penggajian." /> : (
              <div className="space-y-2">
                {periods.map((p) => (
                  <label key={p.id} className={`flex items-center gap-3 rounded-2xl border-2 p-4 cursor-pointer transition ${selectedPeriod === p.id ? 'border-orange-400 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <input type="radio" name="period" value={p.id} checked={selectedPeriod === p.id} onChange={(e) => setSelectedPeriod(e.target.value)} className="accent-orange-600" />
                    <span className="font-medium text-slate-900">{MONTHS[(p.month ?? 1) - 1]} {p.year}</span>
                    <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{p.status}</span>
                  </label>
                ))}
              </div>
            )}
        </div>

        {selectedPeriod && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            ⚠ Proses ini akan menghitung ulang gaji semua karyawan aktif. Pastikan data kehadiran dan komponen gaji sudah benar sebelum melanjutkan.
          </div>
        )}

        <button
          onClick={() => processMutation.mutate(selectedPeriod)}
          disabled={!selectedPeriod || processMutation.isPending}
          className="w-full rounded-2xl bg-orange-600 py-4 text-sm font-bold text-white hover:bg-orange-500 disabled:opacity-40 transition">
          {processMutation.isPending ? '⚙️ Memproses...' : '▶ Mulai Proses Penggajian Batch'}
        </button>
      </div>

      {result && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Hasil Proses</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs text-slate-500">Berhasil diproses</p>
              <p className="text-2xl font-bold text-green-700">{result.processed}</p>
            </div>
            {result.errors > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-xs text-slate-500">Error</p>
                <p className="text-2xl font-bold text-red-700">{result.errors}</p>
              </div>
            )}
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-xs text-slate-500">Total Gaji Bersih</p>
              <p className="text-lg font-bold text-orange-700">{fmt(result.totalNet)}</p>
            </div>
          </div>
          {result.details && result.details.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Karyawan</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Gaji Bersih</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Keterangan</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {result.details.map((d) => (
                    <tr key={d.employeeId} className="hover:bg-slate-50">
                      <td className="py-2.5 font-medium text-slate-900">{d.name}</td>
                      <td className={`py-2.5 text-right font-semibold ${d.error ? 'text-red-500' : 'text-orange-700'}`}>{d.error ? '-' : fmt(d.net)}</td>
                      <td className="py-2.5 text-sm text-red-500">{d.error ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
