'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { OdooLayout } from '../../components/layout/OdooLayout';
import { dashboardService, salesService, type DashboardSummary, type RecentOrder } from '../../lib/services';
import {
  TrendingUp, TrendingDown, ShoppingCart, Package, DollarSign,
  Users, FileText, AlertTriangle, CheckCircle, Clock, BarChart2,
  ArrowUpRight, Activity, Zap, RefreshCw,
  ShoppingBag, Truck, Brain, Target, Star, Wifi, WifiOff,
} from 'lucide-react';

const formatRp = (val: number) => {
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)} M`;
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)} Jt`;
  if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)} rb`;
  return `Rp ${val}`;
};

const extractName = (val: any): string => {
  if (!val) return '–';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.name ?? val.nama ?? val.email ?? '–';
  return String(val);
};

const QUICK_ACTIONS = [
  { label: 'Buat Quotation', href: '/sales/quotations', icon: FileText, color: '#3B82F6' },
  { label: 'Terima Pembayaran', href: '/invoice/payments', icon: DollarSign, color: '#22C55E' },
  { label: 'Transfer Stok', href: '/inventory/transfers', icon: Package, color: '#8B5CF6' },
  { label: 'Buat Purchase Order', href: '/purchasing/purchase-orders', icon: Truck, color: '#F59E0B' },
  { label: 'AI Assistant', href: '/ai/chatbot', icon: Brain, color: '#5B52D1' },
  { label: 'Laporan Harian', href: '/reports/sales', icon: BarChart2, color: '#14B8A6' },
];

const TOP_PRODUCTS = [
  { name: 'Semen Portland 50kg', sold: 840, revenue: 'Rp 42 M', pct: 85 },
  { name: 'Bata Merah (ikat)', sold: 520, revenue: 'Rp 18,2 M', pct: 65 },
  { name: 'Pipa PVC 4 inch', sold: 380, revenue: 'Rp 9,5 M', pct: 48 },
  { name: 'Cat Tembok Dulux 5L', sold: 290, revenue: 'Rp 7,8 M', pct: 38 },
  { name: 'Besi Beton 10mm', sold: 210, revenue: 'Rp 6,3 M', pct: 28 },
];

function MiniBarChart({ data }: { data: { month: string; revenue: number; order: number }[] }) {
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-0.5 items-end" style={{ height: '72px' }}>
            <div
              className="flex-1 rounded-t transition-all"
              style={{ height: `${(d.revenue / maxRev) * 100}%`, backgroundColor: '#5B52D1', opacity: i === data.length - 1 ? 1 : 0.55 }}
            />
            <div
              className="flex-1 rounded-t transition-all"
              style={{ height: `${(d.order / maxRev) * 100}%`, backgroundColor: '#EDE9FE' }}
            />
          </div>
          <span className="text-[9px]" style={{ color: '#9CA3AF' }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 animate-pulse" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE9FE' }}>
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-xl bg-gray-100" />
        <div className="h-4 w-12 rounded bg-gray-100" />
      </div>
      <div className="space-y-1.5">
        <div className="h-5 w-20 rounded bg-gray-100" />
        <div className="h-3 w-28 rounded bg-gray-100" />
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Dikonfirmasi: '#22C55E', confirmed: '#22C55E',
  Menunggu: '#F59E0B', pending: '#F59E0B',
  Terkirim: '#3B82F6', shipped: '#3B82F6',
  Draft: '#6B7280', draft: '#6B7280',
  done: '#14B8A6', cancelled: '#EF4444',
};

export default function DashboardPage() {
  const { token, user, loadProfile } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState([
    { month: 'Jan', revenue: 62, order: 48 },
    { month: 'Feb', revenue: 58, order: 44 },
    { month: 'Mar', revenue: 75, order: 62 },
    { month: 'Apr', revenue: 82, order: 71 },
    { month: 'Mei', revenue: 95, order: 84 },
    { month: 'Jun', revenue: 88, order: 78 },
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, ordersRes] = await Promise.all([
        dashboardService.getSummary(),
        salesService.getOrders({ limit: 5 }).catch(() => null),
      ]);
      setSummary(dash);
      if (dash.recent_orders?.length) setRecentOrders(dash.recent_orders);
      else if (ordersRes?.data?.length) setRecentOrders(ordersRes.data);
      if (dash.monthly_revenue?.length) {
        setChartData(dash.monthly_revenue.map((m) => ({
          month: m.month,
          revenue: m.revenue / 1_000_000,
          order: m.orders,
        })));
      }
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    loadProfile().catch(() => {});
    setMounted(true);
    fetchData();
  }, [token]);

  if (!mounted || !token) return null;

  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Admin';

  const kpiCards = summary
    ? [
        {
          label: 'Revenue Hari Ini', value: formatRp(summary.revenue_today ?? 0),
          change: `${(summary.revenue_growth ?? 0) >= 0 ? '+' : ''}${(summary.revenue_growth ?? 0).toFixed(1)}%`,
          up: (summary.revenue_growth ?? 0) >= 0, icon: DollarSign, color: '#22C55E', bg: '#F0FDF4',
        },
        {
          label: 'Total Order', value: String(summary.total_orders ?? 0),
          change: `${(summary.order_growth ?? 0) >= 0 ? '+' : ''}${(summary.order_growth ?? 0).toFixed(1)}%`,
          up: (summary.order_growth ?? 0) >= 0, icon: ShoppingCart, color: '#3B82F6', bg: '#EFF6FF',
        },
        {
          label: 'Invoice Outstanding', value: formatRp(summary.invoice_outstanding ?? 0),
          change: 'Belum lunas', up: false, icon: FileText, color: '#F59E0B', bg: '#FFFBEB',
        },
        {
          label: 'Pelanggan Aktif', value: String(summary.active_customers ?? 0),
          change: 'Total aktif', up: true, icon: Users, color: '#8B5CF6', bg: '#F5F3FF',
        },
        {
          label: 'Stok Rendah', value: `${summary.low_stock_count ?? 0} Item`,
          change: 'Perlu restock', up: false, icon: Package, color: '#EF4444', bg: '#FEF2F2',
        },
        {
          label: 'PO Pending', value: String(summary.pending_po ?? 0),
          change: 'Menunggu', up: true, icon: Truck, color: '#14B8A6', bg: '#F0FDFA',
        },
      ]
    : null;

  const mockKpi = [
    { label: 'Revenue Hari Ini', value: 'Rp 4,2 M', change: '+12.5%', up: true, icon: DollarSign, color: '#22C55E', bg: '#F0FDF4' },
    { label: 'Total Order', value: '547', change: '+8.3%', up: true, icon: ShoppingCart, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Invoice Outstanding', value: 'Rp 18,7 M', change: '-5.2%', up: false, icon: FileText, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Pelanggan Aktif', value: '1,284', change: '+3.1%', up: true, icon: Users, color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Stok Rendah', value: '23 Item', change: '+4 baru', up: false, icon: Package, color: '#EF4444', bg: '#FEF2F2' },
    { label: 'PO Pending', value: '12', change: '+2 hari ini', up: true, icon: Truck, color: '#14B8A6', bg: '#F0FDFA' },
  ];

  const kpi = kpiCards ?? mockKpi;

  const mockOrders = [
    { id: 'SO-2026-1842', customer: 'PT Sinar Jaya', amount: 4500000, status: 'Dikonfirmasi', date: '26 Mei 2026' },
    { id: 'SO-2026-1841', customer: 'CV Maju Bersama', amount: 1250000, status: 'Menunggu', date: '26 Mei 2026' },
    { id: 'SO-2026-1840', customer: 'UD Berkah Jaya', amount: 8750000, status: 'Terkirim', date: '25 Mei 2026' },
    { id: 'SO-2026-1839', customer: 'PT Indah Lestari', amount: 2100000, status: 'Dikonfirmasi', date: '25 Mei 2026' },
    { id: 'SO-2026-1838', customer: 'Toko Sejahtera', amount: 675000, status: 'Draft', date: '24 Mei 2026' },
  ];
  const orders = recentOrders.length > 0 ? recentOrders : mockOrders;

  const mockAlerts = [
    { message: 'Stok Semen Portland hampir habis (5 sak tersisa)', type: 'danger' as const, href: '/inventory/products' },
    { message: '7 invoice jatuh tempo dalam 3 hari ke depan', type: 'warning' as const, href: '/invoice/aging' },
    { message: 'Approval PO-2026-0048 menunggu persetujuan', type: 'info' as const, href: '/purchasing/approval-matrix' },
  ];
  const alerts = summary?.alerts ?? mockAlerts;

  return (
    <OdooLayout title="Dashboard" subtitle="Ringkasan bisnis real-time">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1E1B4B' }}>
              Selamat datang, {displayName} 👋
            </h1>
            <p className="text-sm mt-0.5 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {apiOnline !== null && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                  backgroundColor: apiOnline ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
                  color: apiOnline ? '#22C55E' : '#EF4444',
                }}>
                  {apiOnline ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                  {apiOnline ? 'API Online' : 'Mode Demo'}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition hover:bg-gray-100 disabled:opacity-60"
            style={{ border: '1.5px solid #EDE9FE', color: '#6B7280' }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Memuat...' : `Refresh · ${lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : kpi.map((k, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 flex flex-col gap-3"
                  style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE9FE', boxShadow: '0 1px 4px rgba(91,82,209,0.05)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: k.bg }}>
                      <k.icon className="h-4 w-4" style={{ color: k.color }} />
                    </div>
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: k.up ? '#22C55E' : '#EF4444' }}>
                      {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {k.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-bold leading-tight" style={{ color: '#1E1B4B' }}>{k.value}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>{k.label}</p>
                  </div>
                </div>
              ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart + Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE9FE', boxShadow: '0 1px 4px rgba(91,82,209,0.05)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: '#1E1B4B' }}>Tren Revenue & Order</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>6 bulan terakhir</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: '#6B7280' }}>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm inline-block" style={{ backgroundColor: '#5B52D1' }} /> Revenue</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm inline-block" style={{ backgroundColor: '#EDE9FE' }} /> Order</span>
                </div>
              </div>
              <MiniBarChart data={chartData} />
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F5F3FF' }}>
                  <p className="text-base font-bold" style={{ color: '#1E1B4B' }}>
                    {summary ? formatRp(summary.revenue_today * 30) : 'Rp 460 M'}
                  </p>
                  <p className="text-[10px]" style={{ color: '#9CA3AF' }}>Total Revenue YTD</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F5F3FF' }}>
                  <p className="text-base font-bold" style={{ color: '#1E1B4B' }}>
                    {summary ? (summary.total_orders ?? 0).toLocaleString('id') : '3,821'}
                  </p>
                  <p className="text-[10px]" style={{ color: '#9CA3AF' }}>Total Order YTD</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F5F3FF' }}>
                  <p className="text-base font-bold" style={{ color: '#22C55E' }}>
                    {summary ? `${(summary.revenue_growth ?? 0) >= 0 ? '+' : ''}${(summary.revenue_growth ?? 0).toFixed(1)}%` : '+18.4%'}
                  </p>
                  <p className="text-[10px]" style={{ color: '#9CA3AF' }}>Growth vs Tahun Lalu</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="rounded-2xl" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE9FE', boxShadow: '0 1px 4px rgba(91,82,209,0.05)' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EDE9FE' }}>
                <h3 className="font-bold text-sm" style={{ color: '#1E1B4B' }}>Order Terbaru</h3>
                <Link href="/sales/orders" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#5B52D1' }}>
                  Lihat Semua <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="divide-y" style={{ borderColor: '#EDE9FE' }}>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center px-5 py-3 gap-3 animate-pulse">
                        <div className="flex-1 space-y-1.5"><div className="h-3 w-24 rounded bg-gray-100" /><div className="h-2.5 w-32 rounded bg-gray-100" /></div>
                        <div className="h-3 w-16 rounded bg-gray-100" />
                        <div className="h-5 w-20 rounded-full bg-gray-100" />
                      </div>
                    ))
                  : orders.map((o, i) => {
                      const statusLabel = o.status;
                      const statusColor = STATUS_COLORS[statusLabel] ?? '#6B7280';
                      const amountDisplay = typeof o.amount === 'number' ? formatRp(o.amount) : String(o.amount);
                      return (
                        <div key={i} className="flex items-center px-5 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold" style={{ color: '#1E1B4B' }}>{(o as any).order_number ?? o.id}</p>
                            <p className="text-[11px] mt-0.5 truncate" style={{ color: '#9CA3AF' }}>{extractName((o as any).customer ?? (o as any).namaCustomer)}</p>
                          </div>
                          <div className="text-right mr-4">
                            <p className="text-xs font-semibold" style={{ color: '#1E1B4B' }}>{amountDisplay}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>{o.date}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0" style={{ backgroundColor: statusColor + '15', color: statusColor }}>
                            {statusLabel}
                          </span>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="rounded-2xl" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE9FE', boxShadow: '0 1px 4px rgba(91,82,209,0.05)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #EDE9FE' }}>
                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#1E1B4B' }}>
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Perhatian
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 rounded-xl animate-pulse bg-gray-100" />)
                  : alerts.map((a, i) => (
                      <Link
                        key={i}
                        href={a.href ?? '#'}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                        style={{
                          backgroundColor: a.type === 'danger' ? 'rgba(239,68,68,.05)' : a.type === 'warning' ? 'rgba(245,158,11,.05)' : 'rgba(59,130,246,.05)',
                          border: `1px solid ${a.type === 'danger' ? 'rgba(239,68,68,.15)' : a.type === 'warning' ? 'rgba(245,158,11,.15)' : 'rgba(59,130,246,.15)'}`,
                        }}
                      >
                        <div className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: a.type === 'danger' ? '#EF4444' : a.type === 'warning' ? '#F59E0B' : '#3B82F6' }} />
                        <p className="text-xs leading-relaxed" style={{ color: '#1E1B4B' }}>{a.message ?? (a as any).msg}</p>
                      </Link>
                    ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE9FE', boxShadow: '0 1px 4px rgba(91,82,209,0.05)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #EDE9FE' }}>
                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#1E1B4B' }}>
                  <Zap className="h-4 w-4" style={{ color: '#5B52D1' }} /> Aksi Cepat
                </h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((q, i) => (
                  <Link
                    key={i}
                    href={q.href}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl text-center hover:bg-gray-50 transition-colors"
                    style={{ border: '1.5px solid #EDE9FE' }}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: q.color + '15' }}>
                      <q.icon className="h-4 w-4" style={{ color: q.color }} />
                    </div>
                    <p className="text-[10px] font-semibold leading-snug" style={{ color: '#1E1B4B' }}>{q.label}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="rounded-2xl" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE9FE', boxShadow: '0 1px 4px rgba(91,82,209,0.05)' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EDE9FE' }}>
                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#1E1B4B' }}>
                  <Star className="h-4 w-4 text-amber-400" /> Produk Terlaris
                </h3>
                <Link href="/reports/sales?type=product" className="text-xs font-semibold" style={{ color: '#5B52D1' }}>Semua</Link>
              </div>
              <div className="p-4 space-y-3">
                {TOP_PRODUCTS.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium truncate max-w-[160px]" style={{ color: '#1E1B4B' }}>{p.name}</p>
                      <p className="text-[10px] font-semibold" style={{ color: '#5B52D1' }}>{p.revenue}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: '#EDE9FE' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${p.pct}%`, backgroundColor: '#5B52D1' }} />
                      </div>
                      <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{p.sold} terjual</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl" style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE9FE', boxShadow: '0 1px 4px rgba(91,82,209,0.05)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EDE9FE' }}>
            <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#1E1B4B' }}>
              <Activity className="h-4 w-4" style={{ color: '#5B52D1' }} /> Aktivitas Terkini
            </h3>
            <Link href="/settings/audit-log" className="text-xs font-semibold" style={{ color: '#5B52D1' }}>Lihat Audit Log</Link>
          </div>
          <div className="px-5 py-4">
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px" style={{ backgroundColor: '#EDE9FE' }} />
              <div className="space-y-4">
                {[
                  { action: 'Sales Order SO-2026-1842 dibuat', user: 'Budi Santoso', time: '5 menit lalu', color: '#22C55E' },
                  { action: 'Invoice INV-2026-0842 dibayar (Rp 4.500.000)', user: 'Finance Team', time: '18 menit lalu', color: '#3B82F6' },
                  { action: 'Transfer stok TRF-001 divalidasi', user: 'Warehouse Staff', time: '32 menit lalu', color: '#8B5CF6' },
                  { action: 'Purchase Order PO-2026-0048 disetujui', user: 'Manager Pembelian', time: '1 jam lalu', color: '#F59E0B' },
                  { action: 'Karyawan baru Andi Wijaya ditambahkan', user: 'HR Admin', time: '2 jam lalu', color: '#14B8A6' },
                  { action: 'Backup database otomatis berhasil', user: 'Sistem', time: '3 jam lalu', color: '#6B7280' },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-4 pl-6 relative">
                    <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-white" style={{ backgroundColor: a.color, boxShadow: `0 0 0 1px ${a.color}` }} />
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: '#1E1B4B' }}>{a.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold" style={{ color: '#5B52D1' }}>{a.user}</span>
                        <span className="text-[10px]" style={{ color: '#9CA3AF' }}>· {a.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </OdooLayout>
  );
}
