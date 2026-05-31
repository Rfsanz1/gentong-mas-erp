'use client';

import { useState } from 'react';

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

const BPJS_RATES = {
  kesEmployee: 0.01,
  kesEmployer: 0.04,
  jhtEmployee: 0.02,
  jhtEmployer: 0.037,
  jpEmployee: 0.01,
  jpEmployer: 0.02,
  jkmEmployer: 0.003,
  jkkEmployer: 0.0024,
};

const KES_MAX_BASE = 12000000;
const JP_MAX_BASE = 9077600;

export default function BpjsCalcPage() {
  const [salary, setSalary] = useState('');
  const [familyCount, setFamilyCount] = useState(0);

  const base = parseFloat(salary.replace(/\D/g, '')) || 0;
  const kesBase = Math.min(base, KES_MAX_BASE);
  const jpBase = Math.min(base, JP_MAX_BASE);

  const calc = {
    kesEmployee: Math.round(kesBase * BPJS_RATES.kesEmployee),
    kesEmployer: Math.round(kesBase * BPJS_RATES.kesEmployer),
    jhtEmployee: Math.round(base * BPJS_RATES.jhtEmployee),
    jhtEmployer: Math.round(base * BPJS_RATES.jhtEmployer),
    jpEmployee: Math.round(jpBase * BPJS_RATES.jpEmployee),
    jpEmployer: Math.round(jpBase * BPJS_RATES.jpEmployer),
    jkmEmployer: Math.round(base * BPJS_RATES.jkmEmployer),
    jkkEmployer: Math.round(base * BPJS_RATES.jkkEmployer),
  };

  const totalEmployee = calc.kesEmployee + calc.jhtEmployee + calc.jpEmployee;
  const totalEmployer = calc.kesEmployer + calc.jhtEmployer + calc.jpEmployer + calc.jkmEmployer + calc.jkkEmployer;

  const rows = [
    { label: 'BPJS Kesehatan', emp: calc.kesEmployee, emr: calc.kesEmployer, note: kesBase < base ? `*maks ${fmt(KES_MAX_BASE)}` : '' },
    { label: 'JHT', emp: calc.jhtEmployee, emr: calc.jhtEmployer, note: '' },
    { label: 'JP (Jaminan Pensiun)', emp: calc.jpEmployee, emr: calc.jpEmployer, note: jpBase < base ? `*maks ${fmt(JP_MAX_BASE)}` : '' },
    { label: 'JKM', emp: 0, emr: calc.jkmEmployer, note: '' },
    { label: 'JKK', emp: 0, emr: calc.jkkEmployer, note: '' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Kalkulator BPJS</h1>
        <p className="text-sm text-slate-500 mt-1">Hitung estimasi iuran BPJS berdasarkan gaji pokok.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gaji Pokok (Rp)</label>
            <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="5.000.000"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Tanggungan (BPJS Kes)</label>
            <input type="number" min="0" max="4" value={familyCount} onChange={(e) => setFamilyCount(parseInt(e.target.value) || 0)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
          </div>
        </div>

        {base > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Jenis Iuran</th>
                  <th className="pb-3 text-right font-medium text-slate-500">% Karyawan</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Karyawan</th>
                  <th className="pb-3 text-right font-medium text-slate-500">% Perusahaan</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Perusahaan</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Ket.</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((r) => (
                    <tr key={r.label} className="hover:bg-slate-50">
                      <td className="py-2.5 font-medium text-slate-900">{r.label}</td>
                      <td className="py-2.5 text-right text-slate-500">{r.emp > 0 ? `${(r.emp / (r.label === 'BPJS Kesehatan' ? kesBase : r.label === 'JP (Jaminan Pensiun)' ? jpBase : base) * 100).toFixed(1)}%` : '-'}</td>
                      <td className="py-2.5 text-right font-medium text-rose-700">{r.emp > 0 ? fmt(r.emp) : '-'}</td>
                      <td className="py-2.5 text-right text-slate-500">{r.emr > 0 ? `${(r.emr / (r.label === 'BPJS Kesehatan' ? kesBase : r.label === 'JP (Jaminan Pensiun)' ? jpBase : base) * 100).toFixed(2)}%` : '-'}</td>
                      <td className="py-2.5 text-right font-medium text-slate-700">{r.emr > 0 ? fmt(r.emr) : '-'}</td>
                      <td className="py-2.5 text-xs text-slate-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={2} className="py-3 font-bold text-slate-900">Total</td>
                  <td className="py-3 text-right font-bold text-rose-700">{fmt(totalEmployee)}</td>
                  <td></td>
                  <td className="py-3 text-right font-bold text-slate-900">{fmt(totalEmployer)}</td>
                  <td></td>
                </tr></tfoot>
              </table>
            </div>
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
              <strong>Potongan dari karyawan:</strong> {fmt(totalEmployee)} · <strong>Beban perusahaan tambahan:</strong> {fmt(totalEmployer)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
