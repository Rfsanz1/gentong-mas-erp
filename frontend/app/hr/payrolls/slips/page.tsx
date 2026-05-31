'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type PaySlip = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  period: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bpjs: number;
  tax: number;
  netSalary: number;
  status: string;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function PaySlipsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PaySlip | null>(null);

  const query = useQuery<PaySlip[]>({
    queryKey: ['payslips', month, year],
    queryFn: () => apiGet<PaySlip[]>('/api/hr/payrolls/slips', { params: { month, year } }),
    retry: false,
  });

  const slips = (query.data ?? []).filter((s) =>
    !search || s.employeeName.toLowerCase().includes(search.toLowerCase()) || s.employeeNumber.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Slip Gaji</h1>
        <p className="text-sm text-slate-500 mt-1">Lihat dan cetak slip gaji per karyawan.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400">
          {[2026, 2025, 2024].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <input type="text" placeholder="Cari nama atau NIK..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          {query.isLoading ? <LoadingState message="Memuat slip gaji..." /> :
            slips.length === 0 ? <EmptyState message="Tidak ada slip gaji untuk periode ini." /> :
              slips.map((slip) => (
                <button key={slip.id} onClick={() => setSelected(slip)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all hover:shadow-sm ${selected?.id === slip.id ? 'border-orange-300 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{slip.employeeName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{slip.employeeNumber} · {slip.period}</p>
                    </div>
                    <p className="font-bold text-orange-700">{fmt(slip.netSalary)}</p>
                  </div>
                </button>
              ))}
        </div>

        {selected && (
          <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Slip Gaji — {selected.employeeName}</h2>
              <button onClick={() => window.print()} className="rounded-2xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-500 transition">Cetak</button>
            </div>
            <p className="text-sm text-slate-500">{selected.period} · {selected.employeeNumber}</p>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Gaji Pokok', value: selected.basicSalary, color: '' },
                { label: 'Tunjangan', value: selected.allowances, color: 'text-green-700' },
                { label: '— BPJS (karyawan)', value: -selected.bpjs, color: 'text-red-500' },
                { label: '— PPh 21', value: -selected.tax, color: 'text-red-500' },
                { label: '— Potongan lain', value: -(selected.deductions - selected.bpjs - selected.tax), color: 'text-red-500' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-600">{row.label}</span>
                  <span className={`font-medium ${row.color}`}>{fmt(row.value)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-base font-bold">
                <span className="text-slate-900">Gaji Bersih</span>
                <span className="text-orange-700">{fmt(selected.netSalary)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
