'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiGet, apiPost, apiPut } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type Employee = {
  id: string;
  employeeNumber: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  department: string;
  joinDate: string;
  status: string;
  basicSalary?: number;
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-slate-100 text-slate-500',
  PROBATION: 'bg-yellow-100 text-yellow-700',
  RESIGNED: 'bg-red-100 text-red-600',
};

function fmt(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v ?? 0);
}

export default function EmployeesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [form, setForm] = useState({ name: '', employeeNumber: '', email: '', phone: '', position: '', department: '', joinDate: new Date().toISOString().slice(0, 10), basicSalary: '', status: 'ACTIVE' });

  const query = useQuery<{ data: Employee[]; departments: string[] }>({
    queryKey: ['employees', search, dept, status],
    queryFn: () => apiGet<{ data: Employee[]; departments: string[] }>('/api/hr/employees', {
      params: { search: search || undefined, department: dept || undefined, status: status || undefined },
    }),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (data: object) =>
      editEmp
        ? apiPut<Employee>(`/api/hr/employees/${editEmp.id}`, data)
        : apiPost<Employee>('/api/hr/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowForm(false); setEditEmp(null);
      setForm({ name: '', employeeNumber: '', email: '', phone: '', position: '', department: '', joinDate: new Date().toISOString().slice(0, 10), basicSalary: '', status: 'ACTIVE' });
    },
  });

  function startEdit(emp: Employee) {
    setEditEmp(emp);
    setForm({ name: emp.name, employeeNumber: emp.employeeNumber, email: emp.email ?? '', phone: emp.phone ?? '', position: emp.position, department: emp.department, joinDate: emp.joinDate?.slice(0, 10) ?? '', basicSalary: String(emp.basicSalary ?? ''), status: emp.status });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({ ...form, basicSalary: parseFloat(form.basicSalary) || 0 });
  }

  const employees = query.data?.data ?? [];
  const departments = query.data?.departments ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Data Karyawan</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola informasi seluruh karyawan perusahaan.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditEmp(null); setForm({ name: '', employeeNumber: '', email: '', phone: '', position: '', department: '', joinDate: new Date().toISOString().slice(0, 10), basicSalary: '', status: 'ACTIVE' }); }}
          className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-500 transition">
          {showForm ? 'Batal' : '+ Karyawan Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">{editEmp ? 'Edit Karyawan' : 'Karyawan Baru'}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. Karyawan</label>
              <input type="text" value={form.employeeNumber} onChange={(e) => setForm((f) => ({ ...f, employeeNumber: e.target.value }))}
                placeholder="EMP-001" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                placeholder="John Doe" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon</label>
              <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan <span className="text-red-500">*</span></label>
              <input type="text" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} required
                placeholder="Staff Gudang" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departemen</label>
              <input type="text" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                placeholder="Logistik" className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Masuk</label>
              <input type="date" value={form.joinDate} onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gaji Pokok (Rp)</label>
              <input type="number" min="0" value={form.basicSalary} onChange={(e) => setForm((f) => ({ ...f, basicSalary: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
                <option value="ACTIVE">Aktif</option>
                <option value="PROBATION">Probasi</option>
                <option value="INACTIVE">Nonaktif</option>
                <option value="RESIGNED">Resign</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saveMutation.isPending}
              className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition">
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="Cari nama atau NIK..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400" />
          <select value={dept} onChange={(e) => setDept(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
            <option value="">Semua Departemen</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400">
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="PROBATION">Probasi</option>
            <option value="INACTIVE">Nonaktif</option>
            <option value="RESIGNED">Resign</option>
          </select>
        </div>

        {query.isLoading ? <LoadingState message="Memuat karyawan..." /> :
          employees.length === 0 ? <EmptyState message="Belum ada data karyawan." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="pb-3 text-left font-medium text-slate-500">No.</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Nama</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Jabatan</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Departemen</th>
                  <th className="pb-3 text-left font-medium text-slate-500">Mulai Kerja</th>
                  <th className="pb-3 text-right font-medium text-slate-500">Gaji Pokok</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Status</th>
                  <th className="pb-3 text-center font-medium text-slate-500">Aksi</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono text-xs text-rose-600">{emp.employeeNumber}</td>
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-slate-900">{emp.name}</p>
                          {emp.email && <p className="text-xs text-slate-400">{emp.email}</p>}
                        </div>
                      </td>
                      <td className="py-3 text-slate-600">{emp.position}</td>
                      <td className="py-3 text-slate-500">{emp.department || '-'}</td>
                      <td className="py-3 text-slate-500 text-xs">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="py-3 text-right text-slate-700">{emp.basicSalary ? fmt(emp.basicSalary) : '-'}</td>
                      <td className="py-3 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[emp.status] ?? 'bg-slate-100'}`}>{emp.status}</span>
                      </td>
                      <td className="py-3 text-center">
                        <button onClick={() => startEdit(emp)} className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition">Edit</button>
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
