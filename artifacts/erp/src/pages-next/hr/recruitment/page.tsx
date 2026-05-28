

import { useState, useEffect } from 'react';
import ModernLayout from '@/layout/ModernLayout';
import api from '@/api';

const APP_STAGES = [
  { key: 'new', label: 'Baru', color: 'bg-slate-600 text-slate-200' },
  { key: 'screening', label: 'Screening', color: 'bg-blue-600/30 text-blue-300' },
  { key: 'interview', label: 'Interview', color: 'bg-violet-600/30 text-violet-300' },
  { key: 'offer', label: 'Penawaran', color: 'bg-yellow-600/30 text-yellow-300' },
  { key: 'hired', label: 'Diterima', color: 'bg-emerald-600/30 text-emerald-300' },
  { key: 'refused', label: 'Ditolak', color: 'bg-red-600/30 text-red-300' },
];

export default function RecruitmentPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<'positions' | 'applications'>('positions');
  const [loading, setLoading] = useState(true);
  const [showPosForm, setShowPosForm] = useState(false);
  const [showAppForm, setShowAppForm] = useState(false);
  const [posForm, setPosForm] = useState({ name: '', departmentId: '', expectedEmployees: '1' });
  const [appForm, setAppForm] = useState({ jobId: '', applicantName: '', email: '', phone: '', notes: '' });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [posRes, appRes, statsRes] = await Promise.all([
        api.get('/recruitment/positions'),
        api.get('/recruitment/applications'),
        api.get('/recruitment/stats'),
      ]);
      setPositions(posRes.data ?? []);
      setApplications(appRes.data.data ?? []);
      setStats(statsRes.data);
    } catch { } finally { setLoading(false); }
  }

  async function handleCreatePos(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/recruitment/positions', { ...posForm, expectedEmployees: parseInt(posForm.expectedEmployees) });
      setShowPosForm(false);
      setPosForm({ name: '', departmentId: '', expectedEmployees: '1' });
      fetchAll();
    } catch { }
  }

  async function handleCreateApp(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/recruitment/applications', appForm);
      setShowAppForm(false);
      setAppForm({ jobId: '', applicantName: '', email: '', phone: '', notes: '' });
      fetchAll();
    } catch { }
  }

  async function advanceStage(id: string, stage: string) {
    await api.post(`/recruitment/applications/${id}/advance`, { stage });
    fetchAll();
  }

  return (
    <ModernLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Rekrutmen</h1>
            <p className="text-slate-400 text-sm mt-1">Kelola lowongan & lamaran kerja</p>
          </div>
          <div className="flex gap-2">
            {tab === 'positions' && <button onClick={() => setShowPosForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Lowongan</button>}
            {tab === 'applications' && <button onClick={() => setShowAppForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Lamaran</button>}
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700"><p className="text-slate-400 text-sm">Total Lowongan</p><p className="text-2xl font-bold text-white mt-1">{stats.totalPositions}</p></div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700"><p className="text-slate-400 text-sm">Buka</p><p className="text-2xl font-bold text-emerald-400 mt-1">{stats.openPositions}</p></div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700"><p className="text-slate-400 text-sm">Total Lamaran</p><p className="text-2xl font-bold text-blue-400 mt-1">{stats.totalApps}</p></div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700"><p className="text-slate-400 text-sm">Diterima</p><p className="text-2xl font-bold text-violet-400 mt-1">{stats.stageCount?.find((s: any) => s.stage === 'hired')?._count ?? 0}</p></div>
          </div>
        )}

        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit border border-slate-700">
          {([['positions', 'Lowongan'], ['applications', 'Lamaran']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400">Memuat data...</div>
        ) : tab === 'positions' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map(p => (
              <div key={p.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-semibold">{p.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'open' ? 'bg-emerald-600/30 text-emerald-300' : 'bg-slate-600 text-slate-400'}`}>{p.status === 'open' ? 'Buka' : 'Tutup'}</span>
                </div>
                {p.departmentId && <p className="text-slate-400 text-sm">{p.departmentId}</p>}
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Target: <span className="text-white">{p.expectedEmployees} orang</span></span>
                  <span className="text-slate-400">{p._count?.applications ?? 0} lamaran</span>
                </div>
              </div>
            ))}
            {positions.length === 0 && <p className="text-slate-500 text-center py-10 col-span-3">Belum ada lowongan</p>}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left p-4">Pelamar</th><th className="text-left p-4">Posisi</th>
                <th className="text-left p-4 hidden md:table-cell">Kontak</th><th className="text-left p-4">Stage</th><th className="text-left p-4">Aksi</th>
              </tr></thead>
              <tbody>
                {applications.map(a => {
                  const stage = APP_STAGES.find(s => s.key === a.stage);
                  return (
                    <tr key={a.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-4 text-white font-medium">{a.applicantName}</td>
                      <td className="p-4 text-slate-300">{a.job?.name ?? '—'}</td>
                      <td className="p-4 text-slate-400 hidden md:table-cell text-xs">{a.email ?? '—'}<br />{a.phone ?? ''}</td>
                      <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded-full ${stage?.color ?? ''}`}>{stage?.label ?? a.stage}</span></td>
                      <td className="p-4">
                        <select value={a.stage} onChange={e => advanceStage(a.id, e.target.value)} className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white">
                          {APP_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {applications.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Belum ada lamaran</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {showPosForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-700">
              <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-white font-semibold">Tambah Lowongan</h2>
                <button onClick={() => setShowPosForm(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleCreatePos} className="p-5 space-y-3">
                <div><label className="text-slate-400 text-xs mb-1 block">Posisi / Jabatan *</label><input required value={posForm.name} onChange={e => setPosForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Departemen</label><input value={posForm.departmentId} onChange={e => setPosForm(f => ({ ...f, departmentId: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Target Karyawan</label><input type="number" min="1" value={posForm.expectedEmployees} onChange={e => setPosForm(f => ({ ...f, expectedEmployees: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowPosForm(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg text-sm">Batal</button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAppForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700">
              <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-white font-semibold">Input Lamaran</h2>
                <button onClick={() => setShowAppForm(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleCreateApp} className="p-5 space-y-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Posisi *</label>
                  <select required value={appForm.jobId} onChange={e => setAppForm(f => ({ ...f, jobId: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="">-- Pilih Posisi --</option>
                    {positions.filter(p => p.status === 'open').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div><label className="text-slate-400 text-xs mb-1 block">Nama Pelamar *</label><input required value={appForm.applicantName} onChange={e => setAppForm(f => ({ ...f, applicantName: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-slate-400 text-xs mb-1 block">Email</label><input type="email" value={appForm.email} onChange={e => setAppForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                  <div><label className="text-slate-400 text-xs mb-1 block">No. HP</label><input value={appForm.phone} onChange={e => setAppForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" /></div>
                </div>
                <div><label className="text-slate-400 text-xs mb-1 block">Catatan</label><textarea value={appForm.notes} onChange={e => setAppForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none" /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAppForm(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg text-sm">Batal</button>
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
