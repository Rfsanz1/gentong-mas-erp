import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  LayoutDashboard, ShoppingCart, Monitor, Package, Truck, ShoppingBag, Landmark,
  Users, Building2, BarChart2, Settings, Search, Bell, LogOut, TrendingUp,
  TrendingDown, AlertTriangle, CheckCircle2, Clock, Zap, ChevronRight, Plus,
  ArrowUpRight, RefreshCw, Store, UserCheck, FileText, CreditCard, Tag,
  Boxes, MapPin, Activity, Circle, X, Menu,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const COLORS = {
  primary: '#5B52D1',
  primaryLight: '#8B80F9',
  primaryBg: '#EDE9FE',
  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  info: '#3B82F6',
  infoBg: '#DBEAFE',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textMid: '#475569',
  textMuted: '#94A3B8',
};

const salesData = [
  { day: 'Sen', actual: 12400000, target: 15000000 },
  { day: 'Sel', actual: 18700000, target: 15000000 },
  { day: 'Rab', actual: 14200000, target: 15000000 },
  { day: 'Kam', actual: 21500000, target: 18000000 },
  { day: 'Jum', actual: 19800000, target: 18000000 },
  { day: 'Sab', actual: 28400000, target: 22000000 },
  { day: 'Min', actual: 16900000, target: 18000000 },
];

const weeklyData = [
  { week: 'W1', value: 84000000 },
  { week: 'W2', value: 97000000 },
  { week: 'W3', value: 112000000 },
  { week: 'W4', value: 131900000 },
];

const activities = [
  { time: '14:30', icon: ShoppingCart, color: COLORS.primary, text: 'Sales membuat SO-2026-0142', badge: 'Sales' },
  { time: '14:29', icon: Package, color: COLORS.warning, text: 'Gudang melakukan picking order #PK-089', badge: 'Gudang' },
  { time: '14:25', icon: Truck, color: COLORS.info, text: 'Driver Budi menerima tugas pengiriman', badge: 'Driver' },
  { time: '14:20', icon: Boxes, color: COLORS.success, text: 'Barang masuk dari Supplier ABC — 45 item', badge: 'Purchasing' },
  { time: '14:18', icon: Store, color: COLORS.primary, text: 'Transaksi POS berhasil — Rp 1.250.000', badge: 'POS' },
  { time: '14:15', icon: ShoppingBag, color: '#F97316', text: 'Order Shopee #SHP-2026-881 berhasil sinkron', badge: 'Marketplace' },
  { time: '14:10', icon: CreditCard, color: COLORS.success, text: 'Invoice INV-2026-0211 dibayar lunas', badge: 'Finance' },
  { time: '14:05', icon: UserCheck, color: COLORS.textMid, text: 'Customer baru terdaftar: Toko Bintang Jaya', badge: 'CRM' },
];

const kpiData = [
  {
    label: 'Penjualan Hari Ini', value: 'Rp 48,7 Jt', change: '+12.4%', up: true,
    icon: TrendingUp, color: COLORS.primary, bg: COLORS.primaryBg,
    spark: [40, 55, 47, 62, 58, 71, 65, 78],
  },
  {
    label: 'Order Aktif', value: '127', change: '+8', up: true,
    icon: ShoppingCart, color: COLORS.info, bg: COLORS.infoBg,
    spark: [80, 95, 88, 102, 115, 108, 122, 127],
  },
  {
    label: 'Pengiriman Berjalan', value: '34', change: '-2', up: false,
    icon: Truck, color: COLORS.warning, bg: COLORS.warningBg,
    spark: [42, 38, 45, 40, 36, 38, 36, 34],
  },
  {
    label: 'Stok Kritis', value: '8 Produk', change: '+3', up: false,
    icon: AlertTriangle, color: COLORS.danger, bg: COLORS.dangerBg,
    spark: [2, 3, 4, 5, 5, 6, 5, 8],
  },
  {
    label: 'Transaksi POS', value: '203', change: '+18.2%', up: true,
    icon: Store, color: COLORS.success, bg: COLORS.successBg,
    spark: [120, 148, 160, 155, 172, 168, 190, 203],
  },
  {
    label: 'Marketplace Orders', value: '89', change: '+31%', up: true,
    icon: ShoppingBag, color: '#F97316', bg: '#FFF7ED',
    spark: [40, 52, 58, 61, 70, 75, 82, 89],
  },
];

const modules = [
  { icon: ShoppingCart, label: 'Sales', desc: 'Order & Quotation', count: 127, href: '/sales', color: COLORS.primary },
  { icon: Store, label: 'POS', desc: 'Point of Sale', count: 203, href: '/pos', color: '#10B981' },
  { icon: Package, label: 'Gudang', desc: 'Warehouse Ops', count: 45, href: '/gudang', color: '#F59E0B' },
  { icon: Truck, label: 'Driver', desc: 'Pengiriman', count: 34, href: '/driver', color: '#3B82F6' },
  { icon: ShoppingBag, label: 'Purchasing', desc: 'Pembelian', count: 18, href: '/purchasing', color: '#8B5CF6' },
  { icon: Monitor, label: 'Marketplace', desc: 'Toko Online', count: 89, href: '/marketplace', color: '#F97316' },
  { icon: Landmark, label: 'Finance', desc: 'Keuangan', count: 12, href: '/finance', color: '#06B6D4' },
  { icon: Users, label: 'CRM', desc: 'Pelanggan', count: 7, href: '/crm', color: '#EC4899' },
  { icon: UserCheck, label: 'Customer', desc: 'Data Pelanggan', count: 1204, href: '/customers', color: '#14B8A6' },
  { icon: Building2, label: 'Supplier', desc: 'Data Supplier', count: 86, href: '/purchasing/suppliers', color: '#64748B' },
  { icon: BarChart2, label: 'Reports', desc: 'Laporan & Analitik', count: 0, href: '/reports', color: '#7C3AED' },
  { icon: Settings, label: 'Settings', desc: 'Konfigurasi', count: 0, href: '/settings', color: '#475569' },
];

const alerts = [
  { level: 'red', icon: AlertTriangle, text: '8 produk stok kritis — segera reorder', time: '5 mnt lalu' },
  { level: 'red', icon: Clock, text: '3 pengiriman terlambat lebih dari 2 jam', time: '12 mnt lalu' },
  { level: 'red', icon: ShoppingCart, text: '2 order melewati batas waktu konfirmasi', time: '18 mnt lalu' },
  { level: 'yellow', icon: FileText, text: '5 PO menunggu approval manager', time: '1 jam lalu' },
  { level: 'yellow', icon: RefreshCw, text: 'Sinkronisasi Tokopedia pending 30 menit', time: '31 mnt lalu' },
  { level: 'green', icon: CheckCircle2, text: 'Backup database selesai pukul 14:00', time: '28 mnt lalu' },
  { level: 'green', icon: CheckCircle2, text: 'Sinkronisasi Shopee berhasil — 89 order', time: '15 mnt lalu' },
];

const quickActions = [
  { icon: Plus, label: 'Buat Sales Order', href: '/sales/orders', color: COLORS.primary },
  { icon: ShoppingBag, label: 'Buat Purchase Order', href: '/purchasing/purchase-orders', color: '#8B5CF6' },
  { icon: Boxes, label: 'Input Barang Masuk', href: '/gudang', color: '#F59E0B' },
  { icon: Truck, label: 'Buat Pengiriman', href: '/delivery', color: '#3B82F6' },
  { icon: Store, label: 'Buka POS', href: '/pos/cashier', color: '#10B981' },
  { icon: Tag, label: 'Tambah Produk', href: '/inventory/products', color: '#F97316' },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', active: true },
  { icon: ShoppingCart, label: 'Sales', href: '/sales' },
  { icon: Store, label: 'POS', href: '/pos' },
  { icon: Package, label: 'Gudang', href: '/gudang' },
  { icon: Truck, label: 'Driver', href: '/driver' },
  { icon: ShoppingBag, label: 'Purchasing', href: '/purchasing' },
  { icon: Monitor, label: 'Marketplace', href: '/marketplace' },
  { icon: Users, label: 'CRM', href: '/crm' },
  { icon: Landmark, label: 'Finance', href: '/finance' },
  { icon: BarChart2, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

function SparkLine({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32, pts = data.length;
  const points = data
    .map((v, i) => `${(i / (pts - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
    </svg>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}Jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export default function RootPage() {
  const { token, user, loadProfile, logout } = useAuthStore();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const init = async () => {
      if (!user) {
        await loadProfile().catch(() => { logout(); navigate('/login'); });
      }
      setLoading(false);
      setTimeout(() => setMounted(true), 60);
    };
    init();
  }, [token, user, loadProfile, logout, navigate]);

  if (!token || loading) return null;

  const userName = user?.name?.split(' ')[0] ?? 'Pengguna';
  const userInitial = (user?.name ?? user?.email ?? 'U')[0].toUpperCase();
  const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ backgroundColor: COLORS.bg, opacity: mounted ? 1 : 0, transition: 'opacity 0.3s ease' }}
    >
      {/* SIDEBAR */}
      <aside
        className="flex-shrink-0 flex flex-col transition-all duration-300 z-20"
        style={{
          width: sidebarOpen ? 220 : 64,
          backgroundColor: '#0F172A',
          borderRight: 'none',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` }}
          >G</div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">Gentong Mas</p>
              <p className="text-[10px] text-slate-400">Enterprise ERP</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {sidebarItems.map(({ icon: Icon, label, href, active }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-150 group"
              style={{
                backgroundColor: active ? `${COLORS.primary}22` : 'transparent',
                color: active ? COLORS.primaryLight : '#94A3B8',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#E2E8F0'; }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
            >
              <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
              {sidebarOpen && <span className="truncate">{label}</span>}
              {sidebarOpen && active && <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS.primaryLight }} />}
            </a>
          ))}
        </nav>

        {/* User bottom */}
        <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` }}
            >{userInitial}</div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name ?? user?.email}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.roles?.[0] ?? 'User'}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex-shrink-0 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Keluar"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header
          className="flex-shrink-0 flex items-center gap-4 px-6 py-3"
          style={{ backgroundColor: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, height: 60 }}
        >
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 max-w-sm cursor-text"
            style={{ backgroundColor: COLORS.bg, border: `1.5px solid ${COLORS.border}` }}
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4 flex-shrink-0" style={{ color: COLORS.textMuted }} />
            <span className="text-sm" style={{ color: COLORS.textMuted }}>Cari modul, produk, order…</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS.border, color: COLORS.textMuted }}>⌘K</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Date/time */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold" style={{ color: COLORS.text }}>{timeStr}</span>
              <span className="text-[10px]" style={{ color: COLORS.textMuted }}>{dateStr}</span>
            </div>

            {/* Status */}
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{ backgroundColor: COLORS.successBg, color: COLORS.success }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: COLORS.success }} />
              Online
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="h-5 w-5" style={{ color: COLORS.textMid }} />
              <span
                className="absolute top-1 right-1 h-2 w-2 rounded-full border-2 border-white"
                style={{ backgroundColor: COLORS.danger }}
              />
            </button>

            {/* Avatar */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` }}
            >{userInitial}</div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: COLORS.bg }}>
          <div className="px-6 py-6 space-y-6 max-w-[1600px] mx-auto">

            {/* Welcome */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold" style={{ color: COLORS.text }}>
                  Selamat datang, <span style={{ color: COLORS.primary }}>{userName}</span> 👋
                </h1>
                <p className="text-sm mt-0.5" style={{ color: COLORS.textMuted }}>
                  Berikut ringkasan operasional Gentong Mas hari ini.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {quickActions.slice(0, 3).map(({ icon: Icon, label, href, color }) => (
                  <a
                    key={href}
                    href={href}
                    className="hidden lg:flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="whitespace-nowrap">{label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* ── SECTION 1: KPI CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {kpiData.map(({ label, value, change, up, icon: Icon, color, bg, spark }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: bg }}>
                      <Icon className="h-4.5 w-4.5" style={{ color, width: 18, height: 18 }} />
                    </div>
                    <span
                      className="flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: up ? COLORS.successBg : COLORS.dangerBg,
                        color: up ? COLORS.success : COLORS.danger,
                      }}
                    >
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {change}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold leading-tight" style={{ color: COLORS.text }}>{value}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: COLORS.textMuted }}>{label}</p>
                  </div>
                  <SparkLine data={spark} color={color} />
                </div>
              ))}
            </div>

            {/* ── SECTION 2: BUSINESS MONITORING ── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              {/* Sales Chart */}
              <div
                className="xl:col-span-3 rounded-2xl p-5"
                style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold" style={{ color: COLORS.text }}>Sales Performance</h2>
                    <p className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>Target vs Realisasi 7 hari terakhir</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5" style={{ color: COLORS.textMuted }}>
                      <span className="h-2 w-4 rounded-full inline-block" style={{ backgroundColor: COLORS.primary }} /> Realisasi
                    </span>
                    <span className="flex items-center gap-1.5" style={{ color: COLORS.textMuted }}>
                      <span className="h-2 w-4 rounded inline-block" style={{ backgroundColor: COLORS.border, border: `1px dashed ${COLORS.textMuted}` }} /> Target
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: COLORS.textMuted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: COLORS.textMuted }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                    <Tooltip
                      formatter={(v: any) => [`Rp ${(v / 1_000_000).toFixed(1)} Jt`, '']}
                      contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Area type="monotone" dataKey="target" stroke={COLORS.textMuted} strokeDasharray="4 3" strokeWidth={1.5} fill="none" dot={false} />
                    <Area type="monotone" dataKey="actual" stroke={COLORS.primary} strokeWidth={2.5} fill="url(#gradActual)" dot={{ r: 3, fill: COLORS.primary }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Weekly summary */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {weeklyData.map(({ week, value }) => (
                    <div key={week} className="text-center">
                      <div className="h-1.5 rounded-full mb-1.5" style={{ backgroundColor: COLORS.primaryBg }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${(value / 131900000) * 100}%`, backgroundColor: COLORS.primary }} />
                      </div>
                      <p className="text-[11px] font-semibold" style={{ color: COLORS.text }}>Rp {fmt(value)}</p>
                      <p className="text-[10px]" style={{ color: COLORS.textMuted }}>{week}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div
                className="xl:col-span-2 rounded-2xl p-5 flex flex-col"
                style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold" style={{ color: COLORS.text }}>Live Activity</h2>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: COLORS.success }}>
                    <Activity className="h-3 w-3" />
                    Real-time
                  </span>
                </div>
                <div className="flex-1 space-y-0 overflow-y-auto" style={{ maxHeight: 280 }}>
                  {activities.map(({ time, icon: Icon, color, text, badge }, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5" style={{ borderBottom: i < activities.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                      <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}18` }}>
                        <Icon className="h-3.5 w-3.5" style={{ color, width: 14, height: 14 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] leading-snug" style={{ color: COLORS.text }}>{text}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px]" style={{ color: COLORS.textMuted }}>{time}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}18`, color }}>{badge}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SECTION 3: APP HUB ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold" style={{ color: COLORS.text }}>App Hub</h2>
                <span className="text-xs" style={{ color: COLORS.textMuted }}>12 modul aktif</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                {modules.map(({ icon: Icon, label, desc, count, href, color }) => (
                  <a
                    key={href}
                    href={href}
                    className="group rounded-2xl p-4 flex flex-col gap-2.5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <Icon className="h-5 w-5" style={{ color, width: 20, height: 20 }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: COLORS.text }}>{label}</p>
                      <p className="text-[11px]" style={{ color: COLORS.textMuted }}>{desc}</p>
                    </div>
                    {count > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium" style={{ color: COLORS.textMuted }}>
                          {count} aktivitas
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
                      </div>
                    )}
                    {count === 0 && (
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity self-end" style={{ color }} />
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* ── SECTION 4: OPERATION CENTER ── */}
            <div>
              <h2 className="text-sm font-bold mb-4" style={{ color: COLORS.text }}>Operation Center</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Warehouse */}
                <div className="rounded-2xl p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.warning}18` }}>
                      <Package className="h-4 w-4" style={{ color: COLORS.warning }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: COLORS.text }}>Warehouse</span>
                  </div>
                  {[
                    { label: 'Barang Masuk', value: '45 item', color: COLORS.success },
                    { label: 'Barang Keluar', value: '127 item', color: COLORS.primary },
                    { label: 'Transfer', value: '8 item', color: COLORS.warning },
                    { label: 'Stock Opname', value: '3 aktif', color: COLORS.info },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <span className="text-[13px]" style={{ color: COLORS.textMid }}>{label}</span>
                      <span className="text-[13px] font-semibold" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery */}
                <div className="rounded-2xl p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.info}18` }}>
                      <Truck className="h-4 w-4" style={{ color: COLORS.info }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: COLORS.text }}>Delivery</span>
                  </div>
                  {[
                    { label: 'Driver Aktif', value: '12 driver', color: COLORS.success },
                    { label: 'Pengiriman Berjalan', value: '34 order', color: COLORS.primary },
                    { label: 'Terkirim Hari Ini', value: '86 order', color: COLORS.success },
                    { label: 'Keterlambatan', value: '3 order', color: COLORS.danger },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <span className="text-[13px]" style={{ color: COLORS.textMid }}>{label}</span>
                      <span className="text-[13px] font-semibold" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* POS */}
                <div className="rounded-2xl p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.success}18` }}>
                      <Store className="h-4 w-4" style={{ color: COLORS.success }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: COLORS.text }}>POS</span>
                  </div>
                  {[
                    { label: 'Kasir Aktif', value: '3 kasir', color: COLORS.success },
                    { label: 'Transaksi Hari Ini', value: '203 txn', color: COLORS.primary },
                    { label: 'Omset POS', value: 'Rp 14,2 Jt', color: COLORS.success },
                    { label: 'Retur', value: '2 item', color: COLORS.warning },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <span className="text-[13px]" style={{ color: COLORS.textMid }}>{label}</span>
                      <span className="text-[13px] font-semibold" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SECTION 5 + 6: ALERTS + QUICK ACTIONS ── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              {/* Alert Center */}
              <div
                className="xl:col-span-3 rounded-2xl p-5"
                style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold" style={{ color: COLORS.text }}>Alert Center</h2>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: COLORS.dangerBg, color: COLORS.danger }}
                  >
                    3 kritis
                  </span>
                </div>
                <div className="space-y-2">
                  {alerts.map(({ level, icon: Icon, text, time }, i) => {
                    const cfg = {
                      red: { bg: COLORS.dangerBg, color: COLORS.danger, dot: '#FCA5A5' },
                      yellow: { bg: COLORS.warningBg, color: COLORS.warning, dot: '#FCD34D' },
                      green: { bg: COLORS.successBg, color: COLORS.success, dot: '#6EE7B7' },
                    }[level] ?? { bg: COLORS.bg, color: COLORS.textMid, dot: COLORS.border };
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ backgroundColor: cfg.bg }}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" style={{ color: cfg.color, width: 16, height: 16 }} />
                        <span className="flex-1 text-[12px] font-medium" style={{ color: COLORS.text }}>{text}</span>
                        <span className="flex-shrink-0 text-[11px]" style={{ color: COLORS.textMuted }}>{time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div
                className="xl:col-span-2 rounded-2xl p-5"
                style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <h2 className="text-sm font-bold mb-4" style={{ color: COLORS.text }}>Quick Actions</h2>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map(({ icon: Icon, label, href, color }) => (
                    <a
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-[12px] font-medium transition-all hover:opacity-80 hover:scale-[1.02]"
                      style={{ backgroundColor: `${color}14`, color }}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" style={{ width: 16, height: 16 }} />
                      <span className="leading-snug">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Spacer bottom */}
            <div className="h-2" />
          </div>
        </main>
      </div>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ backgroundColor: COLORS.card, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <Search className="h-4 w-4 flex-shrink-0" style={{ color: COLORS.textMuted }} />
              <input
                autoFocus
                placeholder="Cari modul, produk, order..."
                className="flex-1 outline-none text-sm bg-transparent"
                style={{ color: COLORS.text }}
              />
              <button onClick={() => setSearchOpen(false)}>
                <X className="h-4 w-4" style={{ color: COLORS.textMuted }} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs mb-3 font-medium" style={{ color: COLORS.textMuted }}>Akses Cepat</p>
              <div className="grid grid-cols-3 gap-2">
                {modules.slice(0, 6).map(({ icon: Icon, label, href, color }) => (
                  <a
                    key={href}
                    href={href}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                    style={{ color: COLORS.text }}
                    onClick={() => setSearchOpen(false)}
                  >
                    <Icon className="h-4 w-4" style={{ color, width: 16, height: 16 }} />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
