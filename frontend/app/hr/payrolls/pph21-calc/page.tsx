'use client';

import { useState } from 'react';

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

const PTKP: Record<string, number> = {
  TK0: 54000000,
  TK1: 58500000,
  TK2: 63000000,
  TK3: 67500000,
  K0: 58500000,
  K1: 63000000,
  K2: 67500000,
  K3: 72000000,
};

function calcPph21(pki: number): number {
  let tax = 0;
  const brackets = [
    { limit: 60000000, rate: 0.05 },
    { limit: 250000000, rate: 0.15 },
    { limit: 500000000, rate: 0.25 },
    { limit: 5000000000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 },
  ];
  let remaining = pki;
  let prev = 0;
  for (const b of brackets) {
    const layer = Math.min(remaining, b.limit - prev);
    if (layer <= 0) break;
    tax += layer * b.rate;
    remaining -= layer;
    prev = b.limit;
    if (remaining <= 0) break;
  }
  return Math.round(tax);
}

export default function Pph21CalcPage() {
  const [grossMonthly, setGrossMonthly] = useState('');
  const [ptkpCode, setPtkpCode] = useState('TK0');
  const [employeeType, setEmployeeType] = useState('TETAP');

  const gross = parseFloat(grossMonthly.replace(/\D/g, '')) || 0;
  const grossAnnual = gross * 12;
  const jabatanDeduction = Math.min(grossAnnual * 0.05, 6000000);
  const ptkp = PTKP[ptkpCode] ?? 54000000;
  const pki = Math.max(0, grossAnnual - jabatanDeduction - ptkp);
  const annualTax = calcPph21(pki);
  const monthlyTax = Math.round(annualTax / 12);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Kalkulator PPh 21</h1>
        <p className="text-sm text-slate-500 mt-1">Simulasi perhitungan pajak penghasilan pasal 21.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gaji Bruto/Bulan (Rp)</label>
            <input type="text" value={grossMonthly} onChange={(e) => setGrossMonthly(e.target.value)} placeholder="10.000.000"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status PTKP</label>
            <select value={ptkpCode} onChange={(e) => setPtkpCode(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
              {Object.entries(PTKP).map(([code, val]) => (
                <option key={code} value={code}>{code} — {fmt(val)}/tahun</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Pegawai</label>
            <select value={employeeType} onChange={(e) => setEmployeeType(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
              <option value="TETAP">Pegawai Tetap</option>
              <option value="TIDAK_TETAP">Pegawai Tidak Tetap</option>
            </select>
          </div>
        </div>

        {gross > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-50">
                {[
                  { label: 'Penghasilan Bruto (setahun)', value: grossAnnual },
                  { label: 'Biaya Jabatan (maks Rp 6 jt)', value: -jabatanDeduction },
                  { label: 'Penghasilan Neto', value: grossAnnual - jabatanDeduction, bold: true },
                  { label: `PTKP (${ptkpCode})`, value: -ptkp },
                  { label: 'Penghasilan Kena Pajak (PKI)', value: pki, bold: true },
                  { label: 'PPh 21 Setahun', value: annualTax, highlight: true },
                  { label: 'PPh 21 Sebulan', value: monthlyTax, highlight: true, bold: true },
                ].map((row) => (
                  <tr key={row.label} className={row.highlight ? 'bg-orange-50' : 'hover:bg-slate-50'}>
                    <td className={`py-3 ${row.bold ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{row.label}</td>
                    <td className={`py-3 text-right ${row.highlight ? 'font-bold text-orange-700 text-base' : row.bold ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                      {row.value < 0 ? `(${fmt(-row.value)})` : fmt(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 space-y-1">
          <p>• Tarif PPh 21: 5% s/d Rp 60 jt | 15% s/d Rp 250 jt | 25% s/d Rp 500 jt | 30% s/d Rp 5 M | 35% di atas Rp 5 M</p>
          <p>• Perhitungan ini adalah estimasi. Angka final dapat berbeda tergantung tunjangan dan potongan aktual.</p>
        </div>
      </div>
    </div>
  );
}
