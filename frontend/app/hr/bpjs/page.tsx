'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type BpjsRecord = {
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  bpjsKesBase: number;
  bpjsTkBase: number;
  kesehatanEmployee: number;
  kesehatanEmployer: number;
  jhtEmployee: number;
  jhtEmployer: number;
  jpEmployee: number;
  jpEmployer: number;
  jkmEmployer: number;
  jkkEmployer: number;
  totalEmployee: number;
  totalEmployer: number;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

const BPJS_KES_RATE = { employee: 0.01, employer: 0.04 };
const JHT_RATE = { employee: 0.02, employer: 0.037 };
const JP_RATE = { employee: 0.01, employer: 0.02 };
const JKM_RATE = 0.003;
const JKK_RATE = 0.0024;

export default function BpjsPage() {
  const now = new Date();
  const query = useQuery<{ data: BpjsRecord[]; period: string }>({
    queryKey: ['bpjs-summary'],
    queryFn: () => apiGet<{ data: BpjsRecord[]; period: string }>('/api/hr/bpjs'),
    retry: false,
  });

  const records = query.data?.data ?? [];
  const totalEmp = records.reduce((s, r) => s + r.totalEmployee, 0);
  const totalEmr = records.reduce((s, r) => s + r.totalEmployer, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Iuran BPJS</h1>
        <p className="text-sm text-slate-500 mt-1">Rekap iuran BPJS Kesehatan dan Ketenagakerjaan per karyawan.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'BPJS Kes (Karyawan)', rate: `${BPJS_KES_RATE.employee * 100}%`, color: 'text-blue-700' },
          { label: 'BPJS Kes (Perusahaan)', rate: `${BPJS_KES_RATE.employer * 100}%`, color: 'text-blue-700' },
          { label: 'JHT (Karyawan)', rate: `${JHT_RATE.employee * 100}%`, color: 'text-green-700' },
          { label: 'JHT (Perusahaan)', rate: `${JHT_RATE.employer * 100}%`, color: 'text-green-700' },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.rate}</p>
          </div>
        ))}
      </div>

      {records.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Total Potongan Karyawan</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{fmt(totalEmp)}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Total Beban Perusahaan</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(totalEmr)}</p>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {query.isLoading ? <LoadingState message="Memuat data BPJS..." /> :
          records.length === 0 ? <EmptyState message="Belum ada data BPJS. Proses penggajian terlebih dahulu." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Karyawan</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Gaji Pokok</th>
                  <th className="pb-3 text-right font-medium text-slate-500">BPJS Kes</th>
                  <th className="pb-3 text-right font-medium text-slate-500">JHT</th>
                  <th className="pb-3 text-right font-medium text-slate-500">JP</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Total (Kar)</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Total (Per)</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map((r) => (
                    <tr key={r.employeeId} className="hover:bg-slate-50">
                      <td className="py-2.5 font-medium text-slate-900">{r.employeeName}</td>
                      <td className="py-2.5 text-right text-slate-600">{fmt(r.basicSalary)}</td>
                      <td className="py-2.5 text-right text-slate-600">{fmt(r.kesehatanEmployee)}</td>
                      <td className="py-2.5 text-right text-slate-600">{fmt(r.jhtEmployee)}</td>
                      <td className="py-2.5 text-right text-slate-600">{fmt(r.jpEmployee)}</td>
                      <td className="py-2.5 text-right font-semibold text-rose-700">{fmt(r.totalEmployee)}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-800">{fmt(r.totalEmployer)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={5} className="py-3 font-bold text-slate-900">TOTAL</td>
                  <td className="py-3 text-right font-bold text-rose-700">{fmt(totalEmp)}</td>
                  <td className="py-3 text-right font-bold text-slate-900">{fmt(totalEmr)}</td>
                </tr></tfoot>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
