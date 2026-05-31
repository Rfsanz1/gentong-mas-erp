'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type Account = {
  id: string;
  code: string;
  name: string;
  type: string;
  parentId?: string | null;
  balance?: number;
  active: boolean;
  children?: Account[];
};

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'bg-blue-100 text-blue-700',
  LIABILITY: 'bg-red-100 text-red-700',
  EQUITY: 'bg-purple-100 text-purple-700',
  REVENUE: 'bg-green-100 text-green-700',
  EXPENSE: 'bg-amber-100 text-amber-700',
};

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

function AccountRow({ acc, depth = 0, onEdit }: { acc: Account; depth?: number; onEdit: (a: Account) => void }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = acc.children && acc.children.length > 0;
  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="py-2.5">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
            {hasChildren ? (
              <button onClick={() => setOpen(!open)} className="text-slate-400 w-4 text-xs">{open ? '▾' : '▸'}</button>
            ) : <span className="w-4" />}
            <span className="font-mono text-xs text-slate-400">{acc.code}</span>
            <span className={`font-medium text-slate-900 ${depth === 0 ? 'font-semibold' : ''}`}>{acc.name}</span>
          </div>
        </td>
        <td className="py-2.5 text-center">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_COLORS[acc.type] ?? 'bg-slate-100 text-slate-600'}`}>
            {acc.type}
          </span>
        </td>
        <td className="py-2.5 text-right font-medium text-slate-800">{acc.balance != null ? fmt(acc.balance) : '-'}</td>
        <td className="py-2.5 text-center">
          <span className={`rounded-full px-2 py-0.5 text-xs ${acc.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
            {acc.active ? 'Aktif' : 'Nonaktif'}
          </span>
        </td>
        <td className="py-2.5 text-center">
          <button onClick={() => onEdit(acc)} className="rounded-xl bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100 transition">Edit</button>
        </td>
      </tr>
      {open && hasChildren && acc.children!.map((child) => (
        <AccountRow key={child.id} acc={child} depth={depth + 1} onEdit={onEdit} />
      ))}
    </>
  );
}

export default function ChartOfAccountsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editAcc, setEditAcc] = useState<Account | null>(null);
  const [form, setForm] = useState({ code: '', name: '', type: 'ASSET', parentId: '' });
  const [search, setSearch] = useState('');

  const treeQuery = useQuery<Account[]>({
    queryKey: ['coa-tree'],
    queryFn: () => apiGet<Account[]>('/api/finance/accounts/tree'),
    retry: false,
  });

  const flatQuery = useQuery<{ data: Account[] }>({
    queryKey: ['coa-flat'],
    queryFn: () => apiGet<{ data: Account[] }>('/api/finance/accounts'),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (data: object) =>
      editAcc
        ? apiPut<Account>(`/api/finance/accounts/${editAcc.id}`, data)
        : apiPost<Account>('/api/finance/accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coa-tree'] });
      queryClient.invalidateQueries({ queryKey: ['coa-flat'] });
      setShowForm(false); setEditAcc(null);
      setForm({ code: '', name: '', type: 'ASSET', parentId: '' });
    },
  });

  function startEdit(acc: Account) {
    setEditAcc(acc);
    setForm({ code: acc.code, name: acc.name, type: acc.type, parentId: acc.parentId ?? '' });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({ ...form, parentId: form.parentId || null });
  }

  const flatAccounts = flatQuery.data?.data ?? [];
  const tree = treeQuery.data ?? [];
  const filtered = search.trim()
    ? flatAccounts.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search))
    : null;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Chart of Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar akun dalam hierarki buku besar.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditAcc(null); setForm({ code: '', name: '', type: 'ASSET', parentId: '' }); }}
          className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition">
          {showForm ? 'Batal' : '+ Akun Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">{editAcc ? 'Edit Akun' : 'Akun Baru'}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kode Akun <span className="text-red-500">*</span></label>
              <input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required
                placeholder="1-1001" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Akun <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                placeholder="Kas dan Setara Kas" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400">
                {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Akun Induk</label>
              <select value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400">
                <option value="">— Tidak Ada (Akun Utama) —</option>
                {flatAccounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saveMutation.isPending}
              className="rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition">
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <input type="text" placeholder="Cari kode atau nama akun..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />

        {treeQuery.isLoading ? <LoadingState message="Memuat chart of accounts..." /> :
          filtered ? (
            filtered.length === 0 ? <EmptyState message="Akun tidak ditemukan." /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100">
                    <th className="pb-3 text-left font-medium text-slate-500">Akun</th>
                    <th className="pb-3 text-center font-medium text-slate-500">Tipe</th>
                    <th className="pb-3 text-right font-medium text-slate-500">Saldo</th>
                    <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                    <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((acc) => <AccountRow key={acc.id} acc={acc} onEdit={startEdit} />)}
                  </tbody>
                </table>
              </div>
            )
          ) : tree.length === 0 ? <EmptyState message="Belum ada akun." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">Akun</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Tipe</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Saldo</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {tree.map((acc) => <AccountRow key={acc.id} acc={acc} onEdit={startEdit} />)}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
