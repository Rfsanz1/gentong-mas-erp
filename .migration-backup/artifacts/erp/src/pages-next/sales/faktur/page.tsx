
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import { useAuthStore } from '@/store/useAuthStore';
import AppShell from '@/layout/AppShell';
import { SALES_CONFIG, SALES_NAV } from '@/nav-configs';
import { api } from '@/api';
import { FileText, Search, RefreshCw } from 'lucide-react';

const extractName = (val: any): string => {
  if (!val) return '–';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.name ?? val.nama ?? val.email ?? '–';
  return String(val);
};

export default function FakturPage() {
  const { token } = useAuthStore();
  const [, navigate] = useLocation();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { if (!token) navigate('/login'); }, [token]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/sales/faktur', { params: { search, page, limit: 20 } });
      setData(r.data.data ?? []);
      setTotal(r.data.total ?? 0);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { if (token) load(); }, [search, page, token]);

  if (!token) return null;

  return (
    <AppShell {...SALES_CONFIG} navItems={SALES_NAV} activeHref="/sales/faktur">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1E1B4B' }}>Invoice Penjualan</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Daftar faktur dari Kledo ERP</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl" style={{ border: '1.5px solid #EDE8F5', boxShadow: '0 1px 4px rgba(47,43,61,.06)' }}>
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid #EDE8F5' }}>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#B0AAB9' }} />
              <input className="w-full rounded-lg pl-9 pr-4 py-2 text-sm" style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }} placeholder="Cari faktur..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <button onClick={load} className="p-2 rounded-lg" style={{ border: '1px solid #EDE8F5', color: '#9CA3AF' }}>
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #EDE8F5' }}>
                  {['No. Faktur', 'Customer', 'Total', 'Status', 'Tanggal'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: '#9CA3AF' }}>Memuat data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: '#9CA3AF' }}>Belum ada faktur</td></tr>
                ) : data.map((f, i) => (
                  <tr key={i} style={{ borderBottom: i < data.length - 1 ? '1px solid #F5F2FB' : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FDFCFF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <td className="px-6 py-3.5 text-sm font-semibold" style={{ color: '#00ACC1' }}>{f.number || f.id}</td>
                    <td className="px-6 py-3.5 text-sm" style={{ color: '#1E1B4B' }}>{extractName(f.customer)}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold" style={{ color: '#1E1B4B' }}>{Number(f.total || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(165,163,174,.12)', color: '#9CA3AF' }}>{f.status || '–'}</span>
                    </td>
                    <td className="px-6 py-3.5 text-xs" style={{ color: '#9CA3AF' }}>{f.date ? new Date(f.date).toLocaleDateString('id-ID') : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: '1px solid #EDE8F5' }}>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Total: {total}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg text-xs disabled:opacity-40" style={{ border: '1px solid #EDE8F5', color: '#1E1B4B' }}>← Prev</button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg text-xs disabled:opacity-40" style={{ border: '1px solid #EDE8F5', color: '#1E1B4B' }}>Next →</button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
