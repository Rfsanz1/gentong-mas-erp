
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';

import { useAuthStore } from '@/store/useAuthStore';
import AppShell from '@/layout/AppShell';
import { SALES_CONFIG, SALES_NAV } from '@/nav-configs';
import { api } from '@/api';
import { ShoppingCart, Plus, Search, RefreshCw, Zap, X, Trash2, ChevronDown } from 'lucide-react';

const COLOR = SALES_CONFIG.appColor;

const extractName = (val: any): string => {
  if (!val) return '–';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.name ?? val.nama ?? val.email ?? '–';
  return String(val);
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',      color: '#FF9800', bg: 'rgba(255,152,0,.1)' },
  confirmed: { label: 'Dikonfirmasi', color: '#2196F3', bg: 'rgba(33,150,243,.1)' },
  delivered: { label: 'Terkirim',     color: '#4CAF50', bg: 'rgba(76,175,80,.1)' },
  cancelled: { label: 'Dibatalkan',   color: '#EA5455', bg: 'rgba(234,84,85,.1)' },
};

interface OrderItem {
  id: number;
  nama: string;
  qty: number;
  harga: number;
  subtotal: number;
}

interface ProductSuggestion {
  id: string;
  name: string;
  sku: string;
  hargaJual: number;
}

const emptyItem = (): OrderItem => ({ id: Date.now(), nama: '', qty: 1, harga: 0, subtotal: 0 });

function CreateOrderModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuthStore();
  const [namaCustomer, setNamaCustomer] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [salesName, setSalesName] = useState(user?.name ?? '');
  const [items, setItems] = useState<OrderItem[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  const totalHarga = items.reduce((sum, it) => sum + it.subtotal, 0);

  const searchProducts = (query: string, itemId: number) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!query || query.length < 2) { setSuggestions([]); return; }
    setActiveItemId(itemId);
    const t = setTimeout(async () => {
      try {
        const res = await api.get('/inventory/products', { params: { search: query, limit: 8 } });
        setSuggestions(res.data?.data ?? res.data ?? []);
      } catch { setSuggestions([]); }
    }, 300);
    setSearchTimeout(t);
  };

  const updateItem = (id: number, field: keyof OrderItem, value: any) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: value };
      if (field === 'qty' || field === 'harga') {
        updated.subtotal = Number(updated.qty) * Number(updated.harga);
      }
      return updated;
    }));
  };

  const selectProduct = (itemId: number, prod: ProductSuggestion) => {
    setItems(prev => prev.map(it => {
      if (it.id !== itemId) return it;
      const harga = Number(prod.hargaJual) || 0;
      return { ...it, nama: prod.name, harga, subtotal: it.qty * harga };
    }));
    setSuggestions([]);
    setActiveItemId(null);
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (id: number) => setItems(prev => prev.filter(it => it.id !== id));

  const handleSubmit = async () => {
    if (!namaCustomer.trim()) { setError('Nama customer wajib diisi.'); return; }
    if (items.some(it => !it.nama.trim())) { setError('Semua item harus memiliki nama produk.'); return; }
    setError('');
    setSaving(true);
    try {
      await api.post('/sales/orders', {
        namaCustomer: namaCustomer.trim(),
        noHp: noHp.trim() || undefined,
        alamat: alamat.trim() || undefined,
        catatan: catatan.trim() || undefined,
        salesName: salesName.trim() || undefined,
        totalHarga,
        status: 'pending',
        items: items.map(({ nama, qty, harga, subtotal }) => ({ nama, qty, harga, subtotal })),
      });
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Gagal menyimpan order.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(47,43,61,.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" style={{ boxShadow: '0 20px 60px rgba(47,43,61,.2)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #EDE8F5' }}>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" style={{ color: COLOR }} />
            <h2 className="text-base font-bold" style={{ color: '#1E1B4B' }}>Buat Order Baru</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition hover:bg-gray-100">
            <X className="h-4 w-4" style={{ color: '#9CA3AF' }} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

          {/* Info Customer */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Info Customer</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#1E1B4B' }}>Nama Customer <span style={{ color: '#EA5455' }}>*</span></label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                  placeholder="cth: PT Maju Jaya"
                  value={namaCustomer}
                  onChange={e => setNamaCustomer(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = COLOR; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE8F5'; }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1E1B4B' }}>No. HP</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                  placeholder="cth: 081234567890"
                  value={noHp}
                  onChange={e => setNoHp(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = COLOR; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE8F5'; }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1E1B4B' }}>Nama Sales</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                  placeholder="Nama sales"
                  value={salesName}
                  onChange={e => setSalesName(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = COLOR; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE8F5'; }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#1E1B4B' }}>Alamat</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                  placeholder="Alamat pengiriman"
                  value={alamat}
                  onChange={e => setAlamat(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = COLOR; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE8F5'; }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#1E1B4B' }}>Catatan</label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                  style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                  placeholder="Catatan tambahan (opsional)"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor = COLOR; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#EDE8F5'; }}
                />
              </div>
            </div>
          </div>

          {/* Item-item Produk */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Produk</p>
              <button onClick={addItem} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition" style={{ color: COLOR, backgroundColor: 'rgba(0,172,193,.08)' }}>
                <Plus className="h-3.5 w-3.5" /> Tambah Item
              </button>
            </div>

            {/* Header tabel */}
            <div className="grid grid-cols-12 gap-2 px-2">
              <div className="col-span-5 text-xs font-medium" style={{ color: '#9CA3AF' }}>Produk</div>
              <div className="col-span-2 text-xs font-medium text-center" style={{ color: '#9CA3AF' }}>Qty</div>
              <div className="col-span-3 text-xs font-medium text-right" style={{ color: '#9CA3AF' }}>Harga</div>
              <div className="col-span-2 text-xs font-medium text-right" style={{ color: '#9CA3AF' }}>Subtotal</div>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  {/* Nama produk dengan autocomplete */}
                  <div className="col-span-5 relative">
                    <input
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                      placeholder="Nama produk"
                      value={item.nama}
                      onChange={e => {
                        updateItem(item.id, 'nama', e.target.value);
                        searchProducts(e.target.value, item.id);
                      }}
                      onFocus={e => { e.target.style.borderColor = COLOR; setActiveItemId(item.id); }}
                      onBlur={e => { e.target.style.borderColor = '#EDE8F5'; setTimeout(() => setSuggestions([]), 200); }}
                    />
                    {activeItemId === item.id && suggestions.length > 0 && (
                      <div ref={suggestRef} className="absolute left-0 right-0 top-full mt-1 z-10 bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #EDE8F5', boxShadow: '0 8px 24px rgba(47,43,61,.12)' }}>
                        {suggestions.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={() => selectProduct(item.id, p)}
                            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition"
                          >
                            <div>
                              <p className="text-xs font-medium" style={{ color: '#1E1B4B' }}>{p.name}</p>
                              <p className="text-xs" style={{ color: '#9CA3AF' }}>{p.sku}</p>
                            </div>
                            <span className="text-xs font-semibold" style={{ color: COLOR }}>
                              {Number(p.hargaJual).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Qty */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-lg px-2 py-2 text-sm text-center"
                      style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                      value={item.qty}
                      onChange={e => updateItem(item.id, 'qty', Number(e.target.value) || 1)}
                      onFocus={e => { e.target.style.borderColor = COLOR; }}
                      onBlur={e => { e.target.style.borderColor = '#EDE8F5'; }}
                    />
                  </div>

                  {/* Harga */}
                  <div className="col-span-3">
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-lg px-2 py-2 text-sm text-right"
                      style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                      value={item.harga}
                      onChange={e => updateItem(item.id, 'harga', Number(e.target.value) || 0)}
                      onFocus={e => { e.target.style.borderColor = COLOR; }}
                      onBlur={e => { e.target.style.borderColor = '#EDE8F5'; }}
                    />
                  </div>

                  {/* Subtotal + hapus */}
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <span className="text-xs font-semibold" style={{ color: '#1E1B4B' }}>
                      {item.subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                    </span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="p-1 rounded hover:bg-red-50 transition ml-1">
                        <Trash2 className="h-3.5 w-3.5" style={{ color: '#EA5455' }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end pt-1">
            <div className="rounded-xl px-5 py-3 text-right" style={{ backgroundColor: 'rgba(0,172,193,.07)', border: '1px solid rgba(0,172,193,.2)' }}>
              <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Total Order</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: COLOR }}>
                {totalHarga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg px-4 py-2.5 text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(234,84,85,.08)', color: '#EA5455', border: '1px solid rgba(234,84,85,.2)' }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid #EDE8F5' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-50" style={{ color: '#1E1B4B', border: '1px solid #EDE8F5' }}>
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: COLOR, boxShadow: '0 4px 12px rgba(0,172,193,.35)' }}
          >
            {saving ? 'Menyimpan...' : 'Simpan Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SalesOrdersPage() {
  const { token } = useAuthStore();
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { if (!token) navigate('/login'); }, [token]);

  const load = async () => {
    setLoading(true);
    try {
      const [oRes, sRes] = await Promise.all([
        api.get('/sales/orders', { params: { search, status, page, limit: 20 } }),
        api.get('/sales/summary'),
      ]);
      setOrders(oRes.data.data ?? []);
      setTotal(oRes.data.total ?? 0);
      setSummary(sRes.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { if (token) load(); }, [search, status, page, token]);

  if (!token) return null;

  return (
    <AppShell {...SALES_CONFIG} navItems={SALES_NAV} activeHref="/sales/orders">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1E1B4B' }}>Order Penjualan</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Kelola semua order dari pelanggan</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/sales/smart-order')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition"
              style={{ borderColor: COLOR, color: COLOR }}
            >
              <Zap className="h-4 w-4" /> Smart Input
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: COLOR, boxShadow: '0 4px 12px rgba(0,172,193,.35)' }}
            >
              <Plus className="h-4 w-4" /> Buat Order
            </button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Order',   value: summary.totalOrders, color: '#00ACC1', bg: 'rgba(0,172,193,.1)' },
              { label: 'Total Revenue', value: Number(summary.totalRevenue || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }), color: '#4CAF50', bg: 'rgba(76,175,80,.1)' },
              { label: 'Pending',       value: summary.pendingOrders, color: '#FF9800', bg: 'rgba(255,152,0,.1)' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5" style={{ border: '1.5px solid #EDE8F5', boxShadow: '0 1px 4px rgba(47,43,61,.06)' }}>
                <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1E1B4B' }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl" style={{ border: '1.5px solid #EDE8F5', boxShadow: '0 1px 4px rgba(47,43,61,.06)' }}>
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid #EDE8F5' }}>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#B0AAB9' }} />
              <input
                className="w-full rounded-lg pl-9 pr-4 py-2 text-sm"
                style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                placeholder="Cari customer..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="delivered">Terkirim</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
            <button onClick={load} className="p-2 rounded-lg transition" style={{ border: '1px solid #EDE8F5', color: '#9CA3AF' }}>
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #EDE8F5' }}>
                  {['ID', 'Customer', 'Sales', 'Total', 'Status', 'Tanggal'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: '#9CA3AF' }}>Memuat data...</td></tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <ShoppingCart className="h-10 w-10 mx-auto mb-3" style={{ color: '#D4D0E1' }} />
                      <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Belum ada order</p>
                      <p className="text-xs mt-1" style={{ color: '#C4C0D0' }}>Klik "Buat Order" untuk mulai</p>
                    </td>
                  </tr>
                ) : orders.map((o, i) => {
                  const st = STATUS_MAP[o.status] ?? { label: o.status, color: '#9CA3AF', bg: 'rgba(165,163,174,.12)' };
                  return (
                    <tr
                      key={o.id}
                      style={{ borderBottom: i < orders.length - 1 ? '1px solid #F5F2FB' : 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FDFCFF'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td className="px-6 py-3.5 text-xs font-mono" style={{ color: '#9CA3AF' }}>#{o.id}</td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-medium" style={{ color: '#1E1B4B' }}>{extractName(o.namaCustomer)}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{o.noHp || '–'}</p>
                      </td>
                      <td className="px-6 py-3.5 text-sm" style={{ color: '#9CA3AF' }}>{o.salesName || '–'}</td>
                      <td className="px-6 py-3.5 text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                        {Number(o.total || o.totalHarga || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs" style={{ color: '#9CA3AF' }}>{new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: '1px solid #EDE8F5' }}>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>Total: {total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg text-xs disabled:opacity-40" style={{ border: '1px solid #EDE8F5', color: '#1E1B4B' }}>← Prev</button>
              <span className="px-3 py-1 text-xs" style={{ color: '#1E1B4B' }}>Hal {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={orders.length < 20} className="px-3 py-1 rounded-lg text-xs disabled:opacity-40" style={{ border: '1px solid #EDE8F5', color: '#1E1B4B' }}>Next →</button>
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); load(); }}
        />
      )}
    </AppShell>
  );
}
