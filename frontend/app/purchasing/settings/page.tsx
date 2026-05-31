'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPut } from '@/lib/api-service';

type PurchasingSettings = {
  autoApproveBelow?: number | null;
  defaultWarehouseId?: string | null;
  poPrefix: string;
  grPrefix: string;
  rfqPrefix: string;
  requireApproval: boolean;
};

export default function PurchasingSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<PurchasingSettings>({
    autoApproveBelow: null,
    defaultWarehouseId: null,
    poPrefix: 'PO',
    grPrefix: 'GR',
    rfqPrefix: 'RFQ',
    requireApproval: true,
  });

  const settingsQuery = useQuery<PurchasingSettings>({
    queryKey: ['purchasing-settings'],
    queryFn: () => apiGet<PurchasingSettings>('/api/purchasing/settings'),
    retry: false,
    onSuccess: (data: PurchasingSettings) => setForm(data),
  } as any);

  const saveMutation = useMutation({
    mutationFn: (data: PurchasingSettings) => apiPut<PurchasingSettings>('/api/purchasing/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchasing-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(form);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Pengaturan Purchasing</h1>
        <p className="text-sm text-slate-500 mt-1">Konfigurasi modul pengadaan barang.</p>
      </div>

      {saved && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-700">
          Pengaturan berhasil disimpan.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-slate-900">Penomoran Dokumen</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Prefix Purchase Order', key: 'poPrefix' },
              { label: 'Prefix Goods Receipt', key: 'grPrefix' },
              { label: 'Prefix RFQ', key: 'rfqPrefix' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-slate-900">Persetujuan</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, requireApproval: !f.requireApproval }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.requireApproval ? 'bg-sky-600' : 'bg-slate-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                form.requireApproval ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className="text-sm text-slate-700">Wajib approval untuk semua PO</span>
          </div>

          {form.requireApproval && (
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-slate-700 mb-1">Auto-approve di bawah (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.autoApproveBelow ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, autoApproveBelow: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="Kosongkan = tidak ada auto-approve"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50 transition"
          >
            {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
