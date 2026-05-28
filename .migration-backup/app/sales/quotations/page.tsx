'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import AppShell from '../../../components/layout/AppShell';
import { SALES_CONFIG, SALES_NAV } from '../../../lib/nav-configs';
import { api } from '../../../lib/api';
import { FileText, Plus, Search, RefreshCw, X, ChevronRight, Send, Check, Trash2 } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',        color: '#9E9E9E', bg: 'rgba(158,158,158,.1)' },
  sent:      { label: 'Terkirim',     color: '#2196F3', bg: 'rgba(33,150,243,.1)' },
  confirmed: { label: 'Dikonfirmasi', color: '#4CAF50', bg: 'rgba(76,175,80,.1)' },
  cancelled: { label: 'Dibatalkan',   color: '#EA5455', bg: 'rgba(234,84,85,.1)' },
};

const C = SALES_CONFIG.appColor;

export default function QuotationsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer: '', payment_term: '', notes: '',
    lines: [{ product: '', qty: 1, price: 0, discount: 0, tax: 11 }],
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { if (!token) router.push('/login'); }, [token]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/sales/orders', { params: { search, status: status || 'quotation', page: 1, limit: 50 } });
      setItems(r.data.data ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { if (token) load(); }, [search, status, token]);

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { product: '', qty: 1, price: 0, discount: 0, tax: 11 }] }));
  const removeLine = (i: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  const updateLine = (i: number, key: string, val: any) => {
    setForm(f => { const lines = [...f.lines]; lines[i] = { ...lines[i], [key]: val }; return { ...f, lines }; });
  };

  const calcLine = (l: any) => l.qty * l.price * (1 - l.discount / 100);
  const subtotal = form.lines.reduce((s, l) => s + calcLine(l), 0);
  const tax = form.lines.reduce((s, l) => s + calcLine(l) * l.tax / 100, 0);
  const total = subtotal + tax;

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/sales/orders', { ...form, type: 'quotation' });
      setMsg('Quotation berhasil dibuat!');
      setShowForm(false);
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Gagal membuat quotation.'); }
    finally { setSaving(false); }
  };

  if (!token) return null;

  return (
    <AppShell {...SALES_CONFIG} navItems={SALES_NAV} activeHref="/sales/quotations">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1E1B4B' }}>Quotation</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Buat dan kelola penawaran harga ke pelanggan</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: C }}>
            <Plus className="h-4 w-4" /> Buat Quotation
          </button>
        </div>

        {msg && <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(76,175,80,.1)', border: '1px solid rgba(76,175,80,.3)', color: '#388E3C' }}>{msg}</div>}

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Quotation', value: items.length, color: C },
            { label: 'Draft', value: items.filter(i => i.status === 'draft').length, color: '#9E9E9E' },
            { label: 'Terkirim', value: items.filter(i => i.status === 'sent').length, color: '#2196F3' },
            { label: 'Dikonfirmasi', value: items.filter(i => i.status === 'confirmed').length, color: '#4CAF50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5" style={{ border: '1.5px solid #EDE8F5', boxShadow: '0 1px 4px rgba(47,43,61,.06)' }}>
              <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl" style={{ border: '1.5px solid #EDE8F5', boxShadow: '0 1px 4px rgba(47,43,61,.06)' }}>
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid #EDE8F5' }}>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#B0AAB9' }} />
              <input className="w-full rounded-lg pl-9 pr-4 py-2 text-sm" style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }} placeholder="Cari pelanggan atau nomor..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="rounded-lg px-3 py-2 text-sm" style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Semua Status</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button onClick={load} className="p-2 rounded-lg" style={{ border: '1px solid #EDE8F5', color: '#9CA3AF' }}>
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: '#9CA3AF' }}>Memuat data...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" style={{ color: C }} />
              <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Belum ada quotation</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-semibold" style={{ color: C }}>+ Buat Quotation Pertama</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #EDE8F5' }}>
                    {['No. Quotation', 'Pelanggan', 'Tanggal', 'Total', 'Payment Term', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#9CA3AF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const s = STATUS_MAP[item.status] ?? STATUS_MAP.draft;
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F5F3FF' }} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-semibold text-xs" style={{ color: C }}>QUO-{String(i + 1).padStart(4, '0')}</td>
                        <td className="px-6 py-3" style={{ color: '#1E1B4B' }}>{item.customerName ?? '-'}</td>
                        <td className="px-6 py-3" style={{ color: '#6B7280' }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'}</td>
                        <td className="px-6 py-3 font-semibold" style={{ color: '#1E1B4B' }}>{Number(item.totalAmount ?? 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</td>
                        <td className="px-6 py-3" style={{ color: '#6B7280' }}>{item.paymentTerm ?? 'Net 30'}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ color: s.color, backgroundColor: s.bg }}>{s.label}</span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100" title="Konfirmasi sebagai SO"><Check className="h-3.5 w-3.5" style={{ color: '#4CAF50' }} /></button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100" title="Kirim ke pelanggan"><Send className="h-3.5 w-3.5" style={{ color: '#2196F3' }} /></button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100" title="Hapus"><Trash2 className="h-3.5 w-3.5" style={{ color: '#EA5455' }} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl w-full max-w-3xl mx-4 overflow-hidden" style={{ maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #EDE8F5' }}>
                <h2 className="font-bold" style={{ color: '#1E1B4B' }}>Buat Quotation Baru</h2>
                <button onClick={() => setShowForm(false)} style={{ color: '#9CA3AF' }}><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E1B4B' }}>Pelanggan *</label>
                    <input className="w-full rounded-lg px-4 py-2.5 text-sm" style={{ border: '1.5px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }} placeholder="Nama pelanggan..." value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} onFocus={e => e.target.style.borderColor = C} onBlur={e => e.target.style.borderColor = '#EDE8F5'} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E1B4B' }}>Payment Term</label>
                    <select className="w-full rounded-lg px-4 py-2.5 text-sm" style={{ border: '1.5px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }} value={form.payment_term} onChange={e => setForm(f => ({ ...f, payment_term: e.target.value }))}>
                      <option value="">Pilih payment term...</option>
                      <option value="cash">Tunai / Cash</option>
                      <option value="net7">Net 7 Hari</option>
                      <option value="net14">Net 14 Hari</option>
                      <option value="net30">Net 30 Hari</option>
                      <option value="net60">Net 60 Hari</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold" style={{ color: '#1E1B4B' }}>Produk & Layanan</label>
                    <button onClick={addLine} className="flex items-center gap-1 text-xs font-semibold" style={{ color: C }}>
                      <Plus className="h-3.5 w-3.5" /> Tambah Baris
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #EDE8F5' }}>
                    <table className="w-full text-xs">
                      <thead style={{ backgroundColor: '#F5F3FF' }}>
                        <tr>
                          {['Produk', 'Qty', 'Harga', 'Diskon (%)', 'Pajak (%)', 'Subtotal', ''].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left font-semibold" style={{ color: '#9CA3AF' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {form.lines.map((line, i) => (
                          <tr key={i} style={{ borderTop: '1px solid #EDE8F5' }}>
                            <td className="px-3 py-2">
                              <input className="w-full rounded px-2 py-1.5 text-xs" style={{ border: '1px solid #EDE8F5', outline: 'none' }} placeholder="Nama produk..." value={line.product} onChange={e => updateLine(i, 'product', e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" className="w-16 rounded px-2 py-1.5 text-xs" style={{ border: '1px solid #EDE8F5', outline: 'none' }} value={line.qty} onChange={e => updateLine(i, 'qty', +e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" className="w-24 rounded px-2 py-1.5 text-xs" style={{ border: '1px solid #EDE8F5', outline: 'none' }} value={line.price} onChange={e => updateLine(i, 'price', +e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" className="w-16 rounded px-2 py-1.5 text-xs" style={{ border: '1px solid #EDE8F5', outline: 'none' }} value={line.discount} onChange={e => updateLine(i, 'discount', +e.target.value)} />
                            </td>
                            <td className="px-3 py-2">
                              <select className="rounded px-2 py-1.5 text-xs" style={{ border: '1px solid #EDE8F5', outline: 'none' }} value={line.tax} onChange={e => updateLine(i, 'tax', +e.target.value)}>
                                <option value={0}>0%</option>
                                <option value={11}>11% PPN</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 font-semibold" style={{ color: '#1E1B4B' }}>
                              {calcLine(line).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-3 py-2">
                              <button onClick={() => removeLine(i)} style={{ color: '#EA5455' }}><X className="h-3.5 w-3.5" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-3 space-y-1 text-xs">
                    <div className="w-56 space-y-1">
                      <div className="flex justify-between" style={{ color: '#6B7280' }}><span>Subtotal</span><span>{subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</span></div>
                      <div className="flex justify-between" style={{ color: '#6B7280' }}><span>PPN</span><span>{tax.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</span></div>
                      <div className="flex justify-between font-bold text-sm pt-1" style={{ color: '#1E1B4B', borderTop: '1px solid #EDE8F5' }}><span>Total</span><span>{total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</span></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E1B4B' }}>Catatan Internal</label>
                  <textarea className="w-full rounded-lg px-4 py-2.5 text-sm resize-none" rows={3} style={{ border: '1.5px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }} placeholder="Catatan untuk tim internal..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>

                <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid #EDE8F5' }}>
                  <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold" style={{ border: '1.5px solid #EDE8F5', color: '#6B7280' }}>Batal</button>
                  <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: C }}>
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {saving ? 'Menyimpan...' : 'Simpan Quotation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
