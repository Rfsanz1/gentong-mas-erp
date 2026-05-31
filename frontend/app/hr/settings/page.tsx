'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPut } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';

type HRSettings = {
  workingHoursPerDay: number;
  workingDaysPerWeek: number;
  defaultLeaveQuota: number;
  overtimeMultiplier: number;
  lateToleranceMinutes: number;
  bpjsKesEmployee: number;
  bpjsKesEmployer: number;
  jhtEmployee: number;
  jhtEmployer: number;
  jpEmployee: number;
  jpEmployer: number;
  jkmEmployer: number;
  jkkEmployer: number;
  currency: string;
  payrollCutoffDay: number;
};

export default function HRSettingsPage() {
  const [saved, setSaved] = useState(false);

  const query = useQuery<HRSettings>({
    queryKey: ['hr-settings'],
    queryFn: () => apiGet<HRSettings>('/api/hr/settings'),
    retry: false,
  });

  const [form, setForm] = useState<Partial<HRSettings>>({});

  const data = query.data;
  const merged: Partial<HRSettings> = { ...data, ...form };

  function f(key: keyof HRSettings) {
    return merged[key] ?? '';
  }

  function update(key: keyof HRSettings, val: string | number) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  const saveMutation = useMutation({
    mutationFn: (d: object) => apiPut('/api/hr/settings', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(merged);
  }

  const BPJS_FIELDS: [keyof HRSettings, string][] = [
    ['bpjsKesEmployee', 'BPJS Kesehatan — Karyawan (%)'],
    ['bpjsKesEmployer', 'BPJS Kesehatan — Perusahaan (%)'],
    ['jhtEmployee', 'JHT — Karyawan (%)'],
    ['jhtEmployer', 'JHT — Perusahaan (%)'],
    ['jpEmployee', 'JP — Karyawan (%)'],
    ['jpEmployer', 'JP — Perusahaan (%)'],
    ['jkmEmployer', 'JKM — Perusahaan (%)'],
    ['jkkEmployer', 'JKK — Perusahaan (%)'],
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Pengaturan HR</h1>
        <p className="text-sm text-slate-500 mt-1">Konfigurasi jam kerja, cuti default, dan tarif BPJS.</p>
      </div>

      {query.isLoading ? <LoadingState message="Memuat pengaturan..." /> : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">Jam & Hari Kerja</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['workingHoursPerDay', 'Jam Kerja/Hari'],
                ['workingDaysPerWeek', 'Hari Kerja/Minggu'],
                ['defaultLeaveQuota', 'Kuota Cuti Tahunan (hari)'],
                ['lateToleranceMinutes', 'Toleransi Terlambat (menit)'],
                ['overtimeMultiplier', 'Multiplier Lembur'],
                ['payrollCutoffDay', 'Tanggal Cutoff Penggajian'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input type="number" step="0.01" value={f(key as keyof HRSettings) as string}
                    onChange={(e) => update(key as keyof HRSettings, e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">Tarif BPJS</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BPJS_FIELDS.map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input type="number" step="0.001" min="0" max="100" value={f(key) as string}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 justify-end">
            {saved && <span className="text-sm text-green-600 font-medium">✓ Tersimpan</span>}
            <button type="submit" disabled={saveMutation.isPending}
              className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition">
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
