'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost, apiPut } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type ApprovalRule = {
  id: string;
  minAmount: number;
  maxAmount?: number | null;
  approverRole: string;
  level: number;
  active: boolean;
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
}

export default function ApprovalMatrixPage() {
  const [showForm, setShowForm] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [approverRole, setApproverRole] = useState('admin');
  const [level, setLevel] = useState('1');

  const rulesQuery = useQuery<ApprovalRule[]>({
    queryKey: ['approval-matrix'],
    queryFn: () => apiGet<ApprovalRule[]>('/api/purchasing/approval-matrix'),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost<ApprovalRule>('/api/purchasing/approval-matrix', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-matrix'] });
      setShowForm(false);
      setMinAmount(''); setMaxAmount(''); setLevel('1');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiPut<ApprovalRule>(`/api/purchasing/approval-matrix/${id}`, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-matrix'] }),
  });

  const rules = rulesQuery.data ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      minAmount: parseFloat(minAmount) || 0,
      maxAmount: maxAmount ? parseFloat(maxAmount) : null,
      approverRole,
      level: parseInt(level) || 1,
      active: true,
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Approval Matrix</h1>
          <p className="text-sm text-slate-500 mt-1">Atur otorisasi dan batas nilai untuk persetujuan Purchase Order.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-500 transition"
        >
          {showForm ? 'Batal' : '+ Tambah Aturan'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-sky-200 bg-sky-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Aturan Baru</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min. Nilai (Rp)</label>
              <input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} required min="0"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maks. Nilai (Rp)</label>
              <input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} min="0" placeholder="Tanpa batas"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role Approver</label>
              <select value={approverRole} onChange={(e) => setApproverRole(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400">
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="super admin">Super Admin</option>
                <option value="sales manager">Sales Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
              <input type="number" value={level} onChange={(e) => setLevel(e.target.value)} min="1" max="10"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createMutation.isPending}
              className="rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        {rulesQuery.isLoading ? (
          <LoadingState message="Memuat approval matrix..." />
        ) : rules.length === 0 ? (
          <EmptyState message="Belum ada aturan approval yang ditetapkan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-center font-medium text-slate-500">Level</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Min. Nilai</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Maks. Nilai</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Role Approver</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rules.sort((a, b) => a.level - b.level).map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50">
                    <td className="py-3 text-center font-semibold text-slate-900">{rule.level}</td>
                    <td className="py-3 text-right text-slate-700">{fmt(rule.minAmount)}</td>
                    <td className="py-3 text-right text-slate-700">{rule.maxAmount ? fmt(rule.maxAmount) : '∞'}</td>
                    <td className="py-3 text-slate-700 capitalize">{rule.approverRole}</td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => toggleMutation.mutate({ id: rule.id, active: !rule.active })}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          rule.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {rule.active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
