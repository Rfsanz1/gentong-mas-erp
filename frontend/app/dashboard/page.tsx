'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { unwrap } from '@/lib/api';
import { useAuthStore, resolveRedirect } from '@/store/auth.store';

type RecentOrder = {
  id: string;
  order_number?: string;
  customer?: string;
  namaCustomer?: string;
  amount?: number | string;
  status?: string;
  date?: string;
};

type DashboardSummary = {
  revenue_today?: number;
  revenue_growth?: number;
  total_orders?: number;
  invoice_outstanding?: number;
  active_customers?: number;
  low_stock_count?: number;
  pending_po?: number;
  recent_orders?: RecentOrder[];
  monthly_revenue?: Array<{ month: string; revenue: number; orders: number }>;
  alerts?: Array<{ message: string; type: 'danger' | 'warning' | 'info'; href?: string }>;
};

const STATUS_COLORS: Record<string, string> = {
  Dikonfirmasi: '#22C55E',
  confirmed: '#22C55E',
  Menunggu: '#F59E0B',
  pending: '#F59E0B',
  Terkirim: '#3B82F6',
  shipped: '#3B82F6',
  Draft: '#6B7280',
  draft: '#6B7280',
  done: '#14B8A6',
  cancelled: '#EF4444',
};

function formatRp(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
  if (value >= 1_000) return `Rp ${Math.round(value / 1_000)} rb`;
  return `Rp ${value}`;
}

function extractName(value: any): string {
  if (!value) return '–';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value.name ?? value.nama ?? value.email ?? '–';
  return String(value);
}

function MiniBarChart({ data }: { data: { month: string; revenue: number; order: number }[] }) {
  const maxRev = Math.max(...data.map((item) => item.revenue), 1);

  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-0.5 items-end" style={{ height: '72px' }}>
            <div
              className="flex-1 rounded-t transition-all"
              style={{
                height: `${(item.revenue / maxRev) * 100}%`,
                backgroundColor: '#5B52D1',
                opacity: idx === data.length - 1 ? 1 : 0.55,
              }}
            />
            <div
              className="flex-1 rounded-t transition-all"
              style={{
                height: `${(item.order / maxRev) * 100}%`,
                backgroundColor: '#EDE9FE',
              }}
            />
          </div>
          <span className="text-[9px] text-slate-500">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
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
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, ordersRes] = await Promise.all([
        api.get('/api/dashboard/summary'),
        api.get('/api/sales/orders', { params: { limit: 5 } }).catch(() => null),
      ]);

      const dashboardData = unwrap(dashRes.data) as DashboardSummary;
      setSummary(dashboardData);

      if (dashboardData?.recent_orders?.length) {
        setRecentOrders(dashboardData.recent_orders);
      } else if (ordersRes) {
        const orderData = unwrap(ordersRes.data) as RecentOrder[];
        setRecentOrders(orderData ?? []);
      }

      if (dashboardData?.monthly_revenue?.length) {
        setChartData(
          dashboardData.monthly_revenue.map((item) => ({
            month: item.month,
            revenue: item.revenue / 1_000_000,
            order: item.orders,
          })),
        );
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
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const role = user?.role?.toLowerCase() ?? '';
    if (!['admin', 'owner', 'super admin'].includes(role)) {
      router.replace(resolveRedirect(role));
      return;
    }

    fetchData();
  }, [isAuthenticated, router, user, fetchData]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) return null;

  const displayName = user.name ?? user.email.split('@')[0] ?? 'Admin';
  const kpi = summary
    ? [
        {
          label: 'Revenue Hari Ini',
          value: summary.revenue_today ? formatRp(summary.revenue_today) : 'Rp 0',
          change: `${summary.revenue_growth && summary.revenue_growth >= 0 ? '+' : ''}${summary.revenue_growth?.toFixed(1) ?? '0.0'}%`,
          color: '#22C55E',
        },
        {
          label: 'Total Order',
          value: `${summary.total_orders ?? 0}`,
          change: `${summary.total_orders && summary.total_orders > 0 ? '+' : ''}${summary.total_orders ?? 0}`,
          color: '#3B82F6',
        },
        {
          label: 'Invoice Outstanding',
          value: summary.invoice_outstanding ? formatRp(summary.invoice_outstanding) : 'Rp 0',
          change: 'Belum lunas',
          color: '#F59E0B',
        },
        {
          label: 'Pelanggan Aktif',
          value: `${summary.active_customers ?? 0}`,
          change: 'Total aktif',
          color: '#8B5CF6',
        },
        {
          label: 'Stok Rendah',
          value: `${summary.low_stock_count ?? 0} Item`,
          change: 'Perlu restock',
          color: '#EF4444',
        },
        {
          label: 'PO Pending',
          value: `${summary.pending_po ?? 0}`,
          change: 'Menunggu',
          color: '#14B8A6',
        },
      ]
    : [
        { label: 'Revenue Hari Ini', value: 'Rp 4,2 M', change: '+12.5%', color: '#22C55E' },
        { label: 'Total Order', value: '547', change: '+8.3%', color: '#3B82F6' },
        { label: 'Invoice Outstanding', value: 'Rp 18,7 M', change: '-5.2%', color: '#F59E0B' },
        { label: 'Pelanggan Aktif', value: '1,284', change: '+3.1%', color: '#8B5CF6' },
        { label: 'Stok Rendah', value: '23 Item', change: '+4 baru', color: '#EF4444' },
        { label: 'PO Pending', value: '12', change: '+2 hari ini', color: '#14B8A6' },
      ];

  const orders = recentOrders.length > 0 ? recentOrders : [
    { id: 'SO-2026-1842', customer: 'PT Sinar Jaya', amount: 4500000, status: 'Dikonfirmasi', date: '26 Mei 2026' },
    { id: 'SO-2026-1841', customer: 'CV Maju Bersama', amount: 1250000, status: 'Menunggu', date: '26 Mei 2026' },
    { id: 'SO-2026-1840', customer: 'UD Berkah Jaya', amount: 8750000, status: 'Terkirim', date: '25 Mei 2026' },
    { id: 'SO-2026-1839', customer: 'PT Indah Lestari', amount: 2100000, status: 'Dikonfirmasi', date: '25 Mei 2026' },
    { id: 'SO-2026-1838', customer: 'Toko Sejahtera', amount: 675000, status: 'Draft', date: '24 Mei 2026' },
  ];

  const alerts = summary?.alerts ?? [
    { message: 'Stok Semen Portland hampir habis (5 sak tersisa)', type: 'danger', href: '/inventory/products' },
    { message: '7 invoice jatuh tempo dalam 3 hari ke depan', type: 'warning', href: '/invoice/aging' },
    { message: 'Approval PO-2026-0048 menunggu persetujuan', type: 'info', href: '/purchasing/approval-matrix' },
  ];

  const quickActions = [
    { label: 'Buat Quotation', href: '/sales/quotations', color: '#3B82F6' },
    { label: 'Terima Pembayaran', href: '/invoice/payments', color: '#22C55E' },
    { label: 'Transfer Stok', href: '/inventory/transfers', color: '#8B5CF6' },
    { label: 'Buat Purchase Order', href: '/purchasing/purchase-orders', color: '#F59E0B' },
    { label: 'AI Assistant', href: '/ai/chatbot', color: '#5B52D1' },
    { label: 'Laporan Harian', href: '/reports/sales', color: '#14B8A6' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
          <h1 className="text-2xl font-semibold text-slate-900">Halo, {displayName}!</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan bisnis dan aktivitas terbaru.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-xs px-3 py-1 rounded-full font-semibold ${user.role.toLowerCase() === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
            {user.role}
          </div>
          <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-slate-900 transition">
            Logout
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpi.map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
                <p className="mt-2 text-xs text-slate-500">{item.change}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Status API</p>
                <p className="text-xs text-slate-500">{apiOnline === null ? 'Memuat...' : apiOnline ? 'Server online' : 'Server tidak dapat dijangkau'}</p>
              </div>
              <button
                onClick={() => void fetchData()}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                Refresh
              </button>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Terakhir refresh: {lastRefresh.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">Tren Revenue & Order</p>
                <p className="text-xs text-slate-500">6 bulan terakhir</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-900" />Revenue</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300" />Order</span>
              </div>
            </div>
            <MiniBarChart data={chartData} />
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Total Revenue YTD</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{summary ? formatRp((summary.revenue_today ?? 0) * 30) : 'Rp 460 M'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Total Order YTD</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{summary ? (summary.total_orders ?? 0).toLocaleString('id-ID') : '3.821'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">Growth vs Tahun Lalu</p>
                <p className="mt-2 text-lg font-semibold text-emerald-600">{summary ? `${summary.revenue_growth && summary.revenue_growth >= 0 ? '+' : ''}${summary.revenue_growth?.toFixed(1) ?? '0.0'}%` : '+18.4%'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Order Terbaru</p>
                  <p className="text-xs text-slate-500">Ringkasan 5 order terakhir</p>
                </div>
                <Link href="/sales/orders" className="text-xs font-semibold text-sky-600">
                  Lihat Semua
                </Link>
              </div>
              <div className="space-y-3">
                {loading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="animate-pulse rounded-3xl bg-slate-50 p-4" />
                    ))
                  : orders.map((order, idx) => {
                      const statusLabel = order.status ?? 'Draft';
                      const statusColor = STATUS_COLORS[statusLabel] ?? '#6B7280';
                      return (
                        <div key={idx} className="rounded-3xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{order.order_number ?? order.id}</p>
                              <p className="text-xs text-slate-500 mt-1 truncate max-w-[220px]">{extractName(order.customer ?? order.namaCustomer)}</p>
                            </div>
                            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>{order.date}</span>
                            <span>{typeof order.amount === 'number' ? formatRp(order.amount) : order.amount}</span>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <p className="text-sm font-semibold text-slate-900">Perhatian</p>
                <span className="text-xs text-slate-500">Info penting</span>
              </div>
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <Link
                    key={idx}
                    href={alert.href ?? '#'}
                    className="block rounded-3xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                    style={{
                      borderColor: alert.type === 'danger' ? '#FEE2E2' : alert.type === 'warning' ? '#FEF3C7' : '#DBEAFE',
                      backgroundColor: alert.type === 'danger' ? '#FEF2F2' : alert.type === 'warning' ? '#FFFBEB' : '#EFF6FF',
                      color: '#1F2937',
                    }}
                  >
                    {alert.message}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <p className="text-sm font-semibold text-slate-900">Aksi Cepat</p>
                <span className="text-xs text-slate-500">Navigasi</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className="rounded-3xl border border-slate-200 p-4 text-center text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                    style={{ borderColor: '#E2E8F0' }}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
