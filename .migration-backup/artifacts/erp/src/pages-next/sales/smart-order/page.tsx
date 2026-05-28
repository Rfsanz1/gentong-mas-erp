
import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';

import { useAuthStore } from '@/store/useAuthStore';
import AppShell from '@/layout/AppShell';
import { SALES_CONFIG, SALES_NAV } from '@/nav-configs';
import { api } from '@/api';
import {
  Zap, Mic, MicOff, ClipboardPaste, FileSpreadsheet,
  Search, ChevronDown, AlertTriangle, CheckCircle2,
  ShoppingCart, Trash2, Save, Send, RotateCcw,
  Sparkles, Package, X, ChevronRight, Info,
} from 'lucide-react';

const COLOR = '#00ACC1';
const BG = 'rgba(0,172,193,.08)';

interface Product {
  id: number;
  nama: string;
  sku?: string;
  harga?: number;
  satuan?: string;
  stok?: number;
  pajak?: number;
}

interface ParsedLine {
  raw: string;
  productName: string;
  qty: number;
  unit: string;
}

interface OrderItem {
  id: string;
  raw: string;
  productName: string;
  qty: number;
  unit: string;
  selectedProduct: Product | null;
  candidates: Product[];
  showDropdown: boolean;
  harga: number;
  total: number;
  stokWarning: boolean;
  resolved: boolean;
}

interface Recommendation {
  name: string;
  reason: string;
}

const UNIT_ALIASES: Record<string, string> = {
  sak: 'Sak', karung: 'Sak', bag: 'Sak',
  truk: 'Truk', truck: 'Truk',
  batang: 'Batang', btg: 'Batang',
  pcs: 'Pcs', buah: 'Pcs', bh: 'Pcs',
  kg: 'Kg', kilogram: 'Kg',
  liter: 'Liter', ltr: 'Liter', lt: 'Liter',
  meter: 'Meter', mtr: 'Meter', m: 'Meter',
  roll: 'Roll', gulung: 'Roll',
  dus: 'Dus', box: 'Dus', kotak: 'Dus',
  lembar: 'Lembar', lbr: 'Lembar',
  set: 'Set',
  unit: 'Unit',
};

const RECOMMENDATION_MAP: Record<string, string[]> = {
  'semen': ['pasir', 'bata ringan', 'kerikil', 'besi', 'kawat'],
  'pasir': ['semen', 'batu split', 'kerikil'],
  'bata': ['semen', 'pasir', 'mortar'],
  'besi': ['kawat bendrat', 'semen', 'pasir'],
  'cat': ['kuas', 'rol cat', 'thinner', 'plamir'],
  'pipa': ['fitting pipa', 'lem pipa', 'sok', 'elbow'],
  'keramik': ['nat keramik', 'semen', 'pasir'],
  'kayu': ['paku', 'ampelas', 'cat kayu'],
  'baja ringan': ['sekrup', 'gypsum', 'rangka'],
};

function parseLine(line: string): ParsedLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const patterns = [
    /^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(.+)$/,
    /^(.+?)\s+(\d+(?:[.,]\d+)?)$/,
    /^(\d+(?:[.,]\d+)?)\s+(.+?)\s+(.+)$/,
    /^(\d+(?:[.,]\d+)?)\s+(.+)$/,
  ];

  for (const pat of patterns) {
    const m = trimmed.match(pat);
    if (m) {
      let productName = '', qty = 0, unit = 'Pcs';
      if (pat === patterns[0]) {
        productName = m[1].trim();
        qty = parseFloat(m[2].replace(',', '.'));
        const rawUnit = m[3].trim().toLowerCase();
        unit = UNIT_ALIASES[rawUnit] || m[3].trim();
      } else if (pat === patterns[1]) {
        productName = m[1].trim();
        qty = parseFloat(m[2].replace(',', '.'));
      } else if (pat === patterns[2]) {
        qty = parseFloat(m[1].replace(',', '.'));
        productName = m[2].trim();
        const rawUnit = m[3].trim().toLowerCase();
        unit = UNIT_ALIASES[rawUnit] || m[3].trim();
      } else {
        qty = parseFloat(m[1].replace(',', '.'));
        productName = m[2].trim();
      }
      if (qty > 0 && productName.length > 0) {
        return { raw: trimmed, productName, qty, unit };
      }
    }
  }
  return null;
}

function fuzzyMatch(query: string, products: Product[]): Product[] {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);
  return products
    .map(p => {
      const name = p.nama?.toLowerCase() || '';
      const sku = p.sku?.toLowerCase() || '';
      let score = 0;
      if (name === q || sku === q) score += 100;
      if (name.startsWith(q)) score += 50;
      if (name.includes(q)) score += 30;
      for (const w of words) {
        if (name.includes(w)) score += 10;
      }
      return { p, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.p)
    .slice(0, 5);
}

function getRecommendations(items: OrderItem[]): Recommendation[] {
  const bought = items
    .filter(i => i.selectedProduct)
    .map(i => i.productName.toLowerCase());
  const recs: Recommendation[] = [];
  for (const b of bought) {
    for (const [key, suggestions] of Object.entries(RECOMMENDATION_MAP)) {
      if (b.includes(key)) {
        for (const s of suggestions) {
          if (!bought.some(b2 => b2.includes(s)) && !recs.some(r => r.name === s)) {
            recs.push({ name: s, reason: `Biasanya dibeli bersama ${key}` });
          }
        }
      }
    }
  }
  return recs.slice(0, 3);
}

export default function SmartOrderPage() {
  const { token } = useAuthStore();
  const [, navigate] = useLocation();

  const [inputText, setInputText] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!token) navigate('/login'); }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoadingProducts(true);
    api.get('/inventory/products', { params: { limit: 500 } })
      .then(r => {
        const raw = r.data;
        const list: Product[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        setAllProducts(list);
      })
      .catch(() => setAllProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [token]);

  const parseAndMatch = useCallback(() => {
    if (!inputText.trim()) return;
    setProcessing(true);
    const lines = inputText.split('\n').filter(l => l.trim());
    const newItems: OrderItem[] = [];
    for (const line of lines) {
      const parsed = parseLine(line);
      if (!parsed) continue;
      const candidates = fuzzyMatch(parsed.productName, allProducts);
      const selected = candidates.length === 1 ? candidates[0] : null;
      const harga = selected?.harga ?? 0;
      const stok = selected?.stok ?? 999;
      newItems.push({
        id: Math.random().toString(36).slice(2),
        raw: parsed.raw,
        productName: parsed.productName,
        qty: parsed.qty,
        unit: selected?.satuan || parsed.unit,
        selectedProduct: selected,
        candidates,
        showDropdown: false,
        harga,
        total: harga * parsed.qty,
        stokWarning: stok < parsed.qty,
        resolved: candidates.length === 1,
      });
    }
    setItems(newItems);
    setProcessing(false);
  }, [inputText, allProducts]);

  const selectProduct = (itemId: string, product: Product) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        selectedProduct: product,
        harga: product.harga ?? item.harga,
        unit: product.satuan || item.unit,
        total: (product.harga ?? item.harga) * item.qty,
        stokWarning: (product.stok ?? 999) < item.qty,
        showDropdown: false,
        resolved: true,
      };
    }));
  };

  const updateQty = (itemId: string, qty: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        qty,
        total: item.harga * qty,
        stokWarning: (item.selectedProduct?.stok ?? 999) < qty,
      };
    }));
  };

  const updatePrice = (itemId: string, harga: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return { ...item, harga, total: harga * item.qty };
    }));
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const toggleDropdown = (itemId: string) => {
    setItems(prev => prev.map(i => ({
      ...i,
      showDropdown: i.id === itemId ? !i.showDropdown : false,
    })));
  };

  const grandTotal = items.reduce((s, i) => s + i.total, 0);
  const recommendations = getRecommendations(items);

  const handleVoice = () => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Browser tidak mendukung voice input. Gunakan Chrome.'); return; }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'id-ID';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('\n');
      setInputText(prev => (prev ? prev + '\n' : '') + transcript);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !/^(mas|bos|pak|bu|besok|tolong|kirim|minta)/i.test(l))
        .join('\n');
      setInputText(prev => (prev ? prev + '\n' : '') + cleaned);
    } catch { alert('Izinkan akses clipboard di browser.'); }
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean).slice(1);
      const parsed = lines.map(l => {
        const cols = l.split(/[,;\t]/);
        if (cols.length >= 2) return `${cols[0].trim()} ${cols[1].trim()}${cols[2] ? ' ' + cols[2].trim() : ''}`;
        return l;
      }).join('\n');
      setInputText(prev => (prev ? prev + '\n' : '') + parsed);
      setImportLoading(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveDraft = async () => {
    if (!customerName.trim()) { alert('Isi nama customer terlebih dahulu.'); return; }
    if (items.length === 0) { alert('Belum ada item yang diparse.'); return; }
    setSaving(true);
    try {
      await api.post('/sales/orders', {
        namaCustomer: customerName,
        status: 'draft',
        notes,
        totalHarga: grandTotal,
        items: items.filter(i => i.selectedProduct).map(i => ({
          productId: i.selectedProduct!.id,
          productName: i.selectedProduct!.nama,
          qty: i.qty,
          unit: i.unit,
          harga: i.harga,
          total: i.total,
        })),
      });
      setSavedMsg('Draft berhasil disimpan!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch { setSavedMsg('Gagal menyimpan draft.'); setTimeout(() => setSavedMsg(''), 3000); }
    finally { setSaving(false); }
  };

  const handleCreateOrder = async () => {
    if (!customerName.trim()) { alert('Isi nama customer terlebih dahulu.'); return; }
    const unresolved = items.filter(i => !i.selectedProduct);
    if (unresolved.length > 0) { alert(`${unresolved.length} produk belum dipilih. Pilih produk terlebih dahulu.`); return; }
    setSaving(true);
    try {
      await api.post('/sales/orders', {
        namaCustomer: customerName,
        status: 'confirmed',
        notes,
        totalHarga: grandTotal,
        items: items.map(i => ({
          productId: i.selectedProduct!.id,
          productName: i.selectedProduct!.nama,
          qty: i.qty,
          unit: i.unit,
          harga: i.harga,
          total: i.total,
        })),
      });
      setSavedMsg('Sales Order berhasil dibuat!');
      setTimeout(() => { setSavedMsg(''); navigate('/sales/orders'); }, 2000);
    } catch { setSavedMsg('Gagal membuat order.'); setTimeout(() => setSavedMsg(''), 3000); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setInputText('');
    setItems([]);
    setCustomerName('');
    setNotes('');
  };

  if (!token) return null;

  const unresolvedCount = items.filter(i => !i.resolved).length;
  const warningCount = items.filter(i => i.stokWarning).length;

  return (
    <AppShell {...SALES_CONFIG} navItems={SALES_NAV} activeHref="/sales/smart-order">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: BG }}>
              <Zap className="h-5 w-5" style={{ color: COLOR }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#1E1B4B' }}>Smart Order Input</h1>
              <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
                Ketik pesanan seperti chat — sistem otomatis membuat draft order
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loadingProducts && (
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: BG, color: COLOR }}>
                Memuat produk...
              </span>
            )}
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F5F2FB', color: '#8F89A5' }}>
              {allProducts.length} produk tersedia
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT: Input Panel */}
          <div className="lg:col-span-2 space-y-4">

            {/* Customer Name */}
            <div className="bg-white rounded-2xl p-4 space-y-3" style={{ border: '1.5px solid #EDE8F5' }}>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Nama Customer</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                placeholder="Nama pelanggan atau proyek..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            {/* Text Input Area */}
            <div className="bg-white rounded-2xl p-4 space-y-3" style={{ border: '1.5px solid #EDE8F5' }}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Input Pesanan</label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleVoice}
                    title="Voice Input"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
                    style={{
                      border: `1px solid ${isListening ? '#EA5455' : '#EDE8F5'}`,
                      color: isListening ? '#EA5455' : '#8F89A5',
                      backgroundColor: isListening ? 'rgba(234,84,85,.08)' : 'transparent',
                    }}
                  >
                    {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    {isListening ? 'Stop' : 'Voice'}
                  </button>
                  <button
                    onClick={handlePaste}
                    title="Paste dari clipboard"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                    style={{ border: '1px solid #EDE8F5', color: '#8F89A5' }}
                  >
                    <ClipboardPaste className="h-3.5 w-3.5" /> WhatsApp
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Import Excel"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                    style={{ border: '1px solid #EDE8F5', color: '#8F89A5' }}
                  >
                    {importLoading ? '...' : <><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</>}
                  </button>
                  <input ref={fileInputRef} type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={handleExcelImport} />
                </div>
              </div>

              {isListening && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(234,84,85,.08)', color: '#EA5455' }}>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Sedang mendengarkan... Bicara sekarang
                </div>
              )}

              <textarea
                className="w-full rounded-xl px-4 py-3 text-sm resize-none font-mono"
                style={{
                  border: '1.5px solid #EDE8F5',
                  color: '#1E1B4B',
                  outline: 'none',
                  minHeight: '220px',
                  lineHeight: '1.7',
                  backgroundColor: '#FDFCFF',
                }}
                placeholder={`Ketik pesanan satu baris per item:\n\nsemen 50 sak\npasir 2 truk\nbata ringan 100\npipa 3 batang\nbesi 10mm 20\n\nAtau paste dari WhatsApp.`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={parseAndMatch}
                  disabled={!inputText.trim() || processing || loadingProducts}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                  style={{ backgroundColor: COLOR }}
                >
                  {processing ? (
                    <span>Memproses...</span>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Baca &amp; Parse Pesanan</>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-2.5 rounded-xl text-sm"
                  style={{ border: '1px solid #EDE8F5', color: '#9CA3AF' }}
                  title="Reset"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs p-3 rounded-lg" style={{ backgroundColor: '#F9F8FC', color: '#9CA3AF' }}>
                <p className="font-semibold mb-1" style={{ color: '#8F89A5' }}>Format yang didukung:</p>
                <p>• <code>semen 50 sak</code> &nbsp;→ produk + qty + satuan</p>
                <p>• <code>pasir 2</code> &nbsp;→ produk + qty</p>
                <p>• <code>50 semen</code> &nbsp;→ qty + produk</p>
              </div>
            </div>

            {/* Notes */}
            {items.length > 0 && (
              <div className="bg-white rounded-2xl p-4 space-y-2" style={{ border: '1.5px solid #EDE8F5' }}>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Catatan</label>
                <textarea
                  className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                  style={{ border: '1px solid #EDE8F5', color: '#1E1B4B', outline: 'none', minHeight: '70px' }}
                  placeholder="Catatan tambahan untuk order ini..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            )}

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-2xl p-4 space-y-3" style={{ border: '1.5px solid #EDE8F5' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: '#7C3AED' }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7C3AED' }}>Rekomendasi AI</span>
                </div>
                <div className="space-y-2">
                  {recommendations.map((r) => (
                    <div
                      key={r.name}
                      className="flex items-start gap-2 p-2 rounded-lg"
                      style={{ backgroundColor: 'rgba(124,58,237,.06)' }}
                    >
                      <Package className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: '#7C3AED' }} />
                      <div>
                        <p className="text-xs font-semibold capitalize" style={{ color: '#1E1B4B' }}>{r.name}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{r.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Draft Order Table */}
          <div className="lg:col-span-3 space-y-4">

            {items.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center text-center" style={{ border: '1.5px solid #EDE8F5', minHeight: '400px' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: BG }}>
                  <ShoppingCart className="h-8 w-8" style={{ color: COLOR }} />
                </div>
                <h3 className="font-semibold text-base mb-1" style={{ color: '#1E1B4B' }}>Draft Order Kosong</h3>
                <p className="text-sm max-w-xs" style={{ color: '#9CA3AF' }}>
                  Ketik pesanan di sebelah kiri, lalu klik <strong>"Baca &amp; Parse Pesanan"</strong> untuk membuat draft otomatis.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl" style={{ border: '1.5px solid #EDE8F5' }}>
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #EDE8F5' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                      {items.length} Item
                    </span>
                    {unresolvedCount > 0 && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(255,152,0,.1)', color: '#FF9800' }}>
                        <Search className="h-3 w-3" />
                        {unresolvedCount} belum dipilih
                      </span>
                    )}
                    {warningCount > 0 && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(234,84,85,.1)', color: '#EA5455' }}>
                        <AlertTriangle className="h-3 w-3" />
                        {warningCount} stok kurang
                      </span>
                    )}
                    {unresolvedCount === 0 && warningCount === 0 && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(76,175,80,.1)', color: '#4CAF50' }}>
                        <CheckCircle2 className="h-3 w-3" />
                        Siap dibuat order
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold" style={{ color: COLOR }}>
                    Total: {grandTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                  </p>
                </div>

                {/* Items */}
                <div className="divide-y" style={{ borderColor: '#F5F2FB' }}>
                  {items.map((item, idx) => (
                    <div key={item.id} className="p-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: BG, color: COLOR }}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Product selector */}
                            <div className="relative flex-1 min-w-[160px]">
                              <button
                                onClick={() => toggleDropdown(item.id)}
                                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left"
                                style={{
                                  border: `1.5px solid ${item.resolved ? '#4CAF50' : '#FF9800'}`,
                                  backgroundColor: item.resolved ? 'rgba(76,175,80,.04)' : 'rgba(255,152,0,.04)',
                                  color: '#1E1B4B',
                                }}
                              >
                                <span className="truncate">
                                  {item.selectedProduct?.nama || (
                                    <span style={{ color: '#FF9800' }}>
                                      {item.candidates.length > 0 ? `${item.candidates.length} produk ditemukan` : `"${item.productName}" — tidak ditemukan`}
                                    </span>
                                  )}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#9CA3AF' }} />
                              </button>
                              {item.showDropdown && item.candidates.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg z-20 overflow-hidden" style={{ border: '1.5px solid #EDE8F5' }}>
                                  {item.candidates.map(p => (
                                    <button
                                      key={p.id}
                                      onClick={() => selectProduct(item.id, p)}
                                      className="w-full flex items-start gap-2 px-3 py-2.5 text-left text-xs hover:bg-gray-50 transition"
                                    >
                                      <Package className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: COLOR }} />
                                      <div>
                                        <p className="font-medium" style={{ color: '#1E1B4B' }}>{p.nama}</p>
                                        <p style={{ color: '#9CA3AF' }}>
                                          {p.sku ? `SKU: ${p.sku} · ` : ''}
                                          {p.satuan || '–'} · Stok: {p.stok ?? '–'} · {p.harga ? p.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : '–'}
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                  {item.candidates.length === 0 && (
                                    <p className="px-3 py-2.5 text-xs" style={{ color: '#9CA3AF' }}>Tidak ada produk cocok</p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Qty */}
                            <input
                              type="number"
                              min="0"
                              value={item.qty}
                              onChange={e => updateQty(item.id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2.5 py-2 rounded-lg text-sm text-center"
                              style={{ border: '1.5px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                            />

                            {/* Unit */}
                            <span className="px-2.5 py-2 rounded-lg text-xs text-center min-w-[50px]" style={{ backgroundColor: '#F5F2FB', color: '#8F89A5' }}>
                              {item.unit}
                            </span>

                            {/* Price */}
                            <input
                              type="number"
                              min="0"
                              value={item.harga}
                              onChange={e => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                              className="w-28 px-2.5 py-2 rounded-lg text-sm"
                              style={{ border: '1.5px solid #EDE8F5', color: '#1E1B4B', outline: 'none' }}
                              placeholder="Harga"
                            />

                            {/* Total */}
                            <span className="text-sm font-semibold min-w-[90px] text-right" style={{ color: '#1E1B4B' }}>
                              {item.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                            </span>

                            <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg transition hover:opacity-70">
                              <X className="h-3.5 w-3.5" style={{ color: '#9CA3AF' }} />
                            </button>
                          </div>

                          {/* Stock warning */}
                          {item.stokWarning && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#EA5455' }} />
                              <span className="text-xs" style={{ color: '#EA5455' }}>
                                Stok tersedia hanya {item.selectedProduct?.stok ?? 0} {item.unit}.
                              </span>
                              <button className="text-xs underline ml-1" style={{ color: '#EA5455' }}>
                                Buat Purchase Request
                              </button>
                            </div>
                          )}

                          {/* Product info chips */}
                          {item.selectedProduct && (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {item.selectedProduct.sku && (
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5F2FB', color: '#8F89A5' }}>
                                  SKU: {item.selectedProduct.sku}
                                </span>
                              )}
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5F2FB', color: '#8F89A5' }}>
                                Stok: {item.selectedProduct.stok ?? '–'}
                              </span>
                              {item.selectedProduct.pajak != null && item.selectedProduct.pajak > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5F2FB', color: '#8F89A5' }}>
                                  PPN {item.selectedProduct.pajak}%
                                </span>
                              )}
                              <CheckCircle2 className="h-3 w-3" style={{ color: '#4CAF50' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer total */}
                <div className="px-5 py-4" style={{ borderTop: '1.5px solid #EDE8F5', backgroundColor: '#FDFCFF' }}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>Total {items.length} item</p>
                      <p className="text-xl font-bold" style={{ color: '#1E1B4B' }}>
                        {grandTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                        style={{ border: `1.5px solid ${COLOR}`, color: COLOR, backgroundColor: 'transparent' }}
                      >
                        <Save className="h-4 w-4" />
                        Simpan Draft
                      </button>
                      <button
                        onClick={handleCreateOrder}
                        disabled={saving || unresolvedCount > 0}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
                        style={{ backgroundColor: COLOR }}
                      >
                        <Send className="h-4 w-4" />
                        Buat Sales Order
                      </button>
                    </div>
                  </div>

                  {savedMsg && (
                    <div
                      className="mt-3 px-4 py-2.5 rounded-xl text-sm font-medium text-center"
                      style={{
                        backgroundColor: savedMsg.includes('berhasil') ? 'rgba(76,175,80,.1)' : 'rgba(234,84,85,.1)',
                        color: savedMsg.includes('berhasil') ? '#4CAF50' : '#EA5455',
                      }}
                    >
                      {savedMsg}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Help card */}
            {items.length === 0 && (
              <div className="bg-white rounded-2xl p-5 space-y-4" style={{ border: '1.5px solid #EDE8F5' }}>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" style={{ color: COLOR }} />
                  <span className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>Cara Pakai Smart Order Input</span>
                </div>
                <div className="space-y-3">
                  {[
                    { step: '1', title: 'Ketik atau paste pesanan', desc: 'Tulis produk dan qty seperti chat. Satu baris satu item.' },
                    { step: '2', title: 'Klik "Baca & Parse Pesanan"', desc: 'Sistem otomatis memisahkan nama produk, qty, dan satuan.' },
                    { step: '3', title: 'Sistem cari produk otomatis', desc: 'Jika cocok 1 produk: langsung pilih. Jika banyak: pilih dari dropdown.' },
                    { step: '4', title: 'Klik "Buat Sales Order"', desc: 'Order langsung dibuat tanpa perlu input manual satu per satu.' },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: BG, color: COLOR }}>
                        {s.step}
                      </span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1E1B4B' }}>{s.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
