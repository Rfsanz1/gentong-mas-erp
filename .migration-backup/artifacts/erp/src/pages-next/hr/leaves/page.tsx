

import { useState, useEffect } from 'react';
import ModernLayout from '@/layout/ModernLayout';
import api from '@/api';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-slate-600 text-slate-200' },
  confirmed: { label: 'Menunggu', color: 'bg-yellow-600/30 text-yellow-300' },
  validated: { label: 'Disetujui', color: 'bg-emerald-600/30 text-emerald-300' },
  refused: { label: 'Ditolak', color: 'bg-red-600/30 text-red-300' },
};

type Tab = 'requests' | 'types' | 'allocations';

export default function LeavesPage() {
  const [tab, setTab] = useState<Tab>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', leaveTypeId: '', dateFrom: '', dateTo: '', numberOfDays: '', reason: '' });
  const [typeForm, setTypeForm] = useState({ name: '', requiresApproval: true, maxDays: '' });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [reqRes, typeRes, allocRes, statsRes] = await Promise.all([
        api.get('/leave/requests'),
        api.get('/leave/types'),
        api.get('/leave/allocations'),
        api.get('/leave/stats'),
      ]);
      setRequests(reqRes.data.data ?? []);
      setLeaveTypes(typeRes.data ?? []);
      setAllocations(allocRes.data ?? []);
      setStats(statsRes.data);
    } catch { } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/leave/requests', { ...form, numberOfDays: parseFloat(form.numberOfDays) });
      setShowForm(false);
      setForm({ employeeId: '', leaveTypeId: '', dateFrom: '', dateTo: '', numberOfDays: '', reason: '' });
      fetchAll();
    } catch { }
  }

  async function handleTypeSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/leave/types', { ...typeForm, maxDays: typeForm.maxDays ? parseInt(typeForm.maxDays) : null });
      setShowTypeForm(false);
      setTypeForm({ name: '', requiresApproval: true, maxDays: '' });
      fetchAll();
    } catch { }
  }

  async function approveRequest(id: string) { await api.post(`/leave/requests/${id}/approve`); fetchAll(); }
  async function refuseRequest(id: string) { await api.post(`/leave/requests/${id}/refuse`); fetchAll(); }

  return (
    <ModernLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Cuti & Izin</h1>
            <p className="text-slate-400 text-sm mt-1">Kelola pengajuan cuti karyawan</p>
          </div>
          <div className="flex gap-2">
            {tab === 'requests' && <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Ajukan Cuti</button>}
            {tab === 'types' && <button onClick={() => setShowTypeForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Jenis Cuti</button>}
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700"><p className="text-slate-400 text-sm">Total Pengajuan</p><p className="text-2xl font-bold text-white mt-1">{stats.total}</p></div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700"><p className="text-slate-400 text-sm">Menunggu</p><p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p></div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700"><p className="text-slate-400 text-sm">Disetujui</p><p className="text-2xl font-bold text-emerald-400 mt-1">{stats.approved}</p></div>
          </div>
        )}

        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit border border-slate-700">
          {([['requests', 'Pengajuan'], ['types', 'Jenis Cuti'], ['allocations', 'Alokasi']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400">Memuat data...</div>
        ) : (
          <>
            {tab === 'requests' && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left p-4">Karyawan</th><th className="text-left p-4">Jenis Cuti</th>
                    <th className="text-left p-4">Tanggal</th><th className="text-left p-4">Hari</th>
                    <th className="text-left p-4">Status</th><th className="text-left p-4">Aksi</th>
                  </tr></thead>
                  <tbody>
                    {requests.map(r => {
                      const st = STATUS_MAP[r.status] ?? STATUS_MAP.draft;
                      return (
                        <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="p-4 text-white">{r.employee?.name ?? r.employeeId}</td>
                          <td className="p-4 text-slate-300">{r.leaveType?.name ?? '—'}</td>
                          <td className="p-4 text-slate-400 text-xs">{new Date(r.dateFrom).toLocaleDateString('id-ID')} – {new Date(r.dateTo).toLocaleDateString('id-ID')}</td>
                          <td className="p-4 text-white">{Number(r.numberOfDays)} hari</td>
                          <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span></td>
                          <td className="p-4">
                            {(r.status === 'draft' || r.status === 'confirmed') && (
                              <div className="flex gap-2">
                                <button onClick={() => approveRequest(r.id)} className="text-xs bg-emerald-600/30 text-emerald-300 px-2 py-1 rounded hover:bg-emerald-600/50">✓ Setuju</button>
                                <button onClick={() => refuseRequest(r.id)} className="text-xs bg-red-600/30 text-red-300 px-2 py-1 rounded hover:bg-red-600/50">✗ Tolak</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {requests.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada pengajuan cuti</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'types' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {leaveTypes.map(t => (
                  <div key={t.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <p className="text-white font-semibold">{t.name}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-slate-400">Perlu Persetujuan</span><span className="text-white">{t.requiresApproval ? 'Ya' : 'Tidak'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Maks. Hari</span><span className="text-white">{t.maxDays ?? 'Tidak terbatas'}</span></div>
                    </div>
                  </div>
                ))}
                {leaveTypes.length === 0 && <p className="text-slate-500 text-center py-10 col-span-3">Belum ada jenis cuti. Klik "+ Jenis Cuti" untuk menambah.</p>}
              </div>
            )}

            {tab === 'allocations' && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left p-4">Karyawan</th><th className="text-left p-4">Jenis Cuti</th>
                    <th className="text-left p-4">Tahun</th><th className="text-left p-4">Jatah (Hari)</th><th className="text-left p-4">Status</th>
                  </tr></thead>
                  <tbody>
                    {allocations.map(a => (
                      <tr key={a.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-4 text-white">{a.employee?.name ?? a.employeeId}</td>
                        <td className="p-4 text-slate-300">{a.leaveType?.name ?? '—'}</td>
                        <td className="p-4 text-slate-400">{a.year}</td>
                        <td className="p-4 text-white font-medium">{Number(a.numberOfDays)}</td>
                        <td className="p-4"><span className="text-xs bg-emerald-600/30 text-emerald-300 px-2 py-0.5 rounded-full">{a.status}</span></td>
                      </tr>
                    ))}
                    {allocations.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Belum ada alokasi cuti</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700">
              <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-white font-semibold">Ajukan Cuti</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                <div><label className="text-slate-400 text-xs mb-1 block">ID Karyawan *</label><input required value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Jenis Cuti *</label>
                  <select required value={form.leaveTypeId} onChange={e => setForm(f => ({ ...f, leaveTypeId: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="">-- Pilih Jenis --</option>
                    {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-slate-400 text-xs mb-1 block">Dari *</label><input required type="date" value={form.dateFrom} onChange={e => setForm(f => ({ ...f, dateFrom: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                  <div><label className="text-slate-400 text-xs mb-1 block">Sampai *</label><input required type="date" value={form.dateTo} onChange={e => setForm(f => ({ ...f, dateTo: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                </div>
                <div><label className="text-slate-400 text-xs mb-1 block">Jumlah Hari *</label><input required type="number" min="0.5" step="0.5" value={form.numberOfDays} onChange={e => setForm(f => ({ ...f, numberOfDays: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Alasan</label><textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={2} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none" /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg text-sm">Batal</button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Ajukan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTypeForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-700">
              <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-white font-semibold">Tambah Jenis Cuti</h2>
                <button onClick={() => setShowTypeForm(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleTypeSubmit} className="p-5 space-y-3">
                <div><label className="text-slate-400 text-xs mb-1 block">Nama *</label><input required value={typeForm.name} onChange={e => setTypeForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Cuti Tahunan" /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Maks. Hari (kosong = tidak terbatas)</label><input type="number" value={typeForm.maxDays} onChange={e => setTypeForm(f => ({ ...f, maxDays: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={typeForm.requiresApproval} onChange={e => setTypeForm(f => ({ ...f, requiresApproval: e.target.checked }))} className="rounded" />
                  <span className="text-slate-300 text-sm">Perlu persetujuan atasan</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowTypeForm(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg text-sm">Batal</button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
