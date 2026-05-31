'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, resolveRedirect } from '@/store/auth.store';
import { usePermission } from '@/hooks/usePermission';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendChart } from '@/components/ui/TrendChart';
import {
  type DashboardRole,
  getDashboardRoleSummary,
  getCustomerSummary,
  getSupplierSummary,
  getInventoryStats,
  getSalesSummary,
  getRecentSales,
  getBankTransactions,
  getARAging,
  getAPAging,
  getRecentStockMovements,
  getPosDashboardData,
  getRecentPosSales,
} from '@/lib/dashboard';

const ROLE_MAP: Record<string, DashboardRole> = {
  admin: 'admin',
  owner: 'admin',
  'super admin': 'admin',
  sales: 'sales',
  'sales manager': 'sales',
  gudang: 'gudang',
  'staff gudang': 'gudang',
  kasir: 'pos',
  driver: 'driver',
};

const roleTitle: Record<DashboardRole, string> = {
  admin: 'Admin Dashboard',
  sales: 'Sales Dashboard',
  gudang: 'Warehouse Dashboard',
  pos: 'POS Dashboard',
  driver: 'Driver Dashboard',
};

const statusColors: Record<string, string> = {
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

function toRoleKey(role?: string) {
  if (!role) return 'admin';
  return ROLE_MAP[role.toLowerCase()] ?? 'admin';
}

function formatCurrency(value: number | undefined | null) {
  const amount = value ?? 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCount(value: number | undefined | null) {
  return (value ?? 0).toLocaleString('id-ID');
}

function pickRecentActivity(order: any) {
  const name = order.customer?.name ?? order.customer ?? order.namaCustomer ?? 'Customer';
  return {
    id: order.id,
    title: order.noFaktur ?? order.id,
    description: String(name),
    value: typeof order.totalHarga === 'number' ? formatCurrency(order.totalHarga) : undefined,
    date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID') : order.date ?? '–',
    status: order.status,
  };
}

function buildDailySeries(items: any[], dateKey: string, valueKey: string, days = 6) {
  const totals = new Map<string, number>();
  items.forEach((item) => {
    const dateValue = item[dateKey];
    if (!dateValue) return;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return;
    const label = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    totals.set(label, (totals.get(label) ?? 0) + Number(item[valueKey] ?? 0));
  });

  return Array.from({ length: days }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    const label = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    return { label, value: totals.get(label) ?? 0 };
  });
}

function buildDailyCountSeries(items: any[], dateKey: string, days = 6) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const dateValue = item[dateKey];
    if (!dateValue) return;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return;
    const label = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return Array.from({ length: days }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    const label = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    return { label, value: counts.get(label) ?? 0 };
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const { roles } = usePermission();

  const roleKey = useMemo(() => toRoleKey(user?.role), [user?.role]);
  const title = roleTitle[roleKey];

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', roleKey],
    queryFn: () => getDashboardRoleSummary(roleKey),
    enabled: !!user,
  });

  const salesSummaryQuery = useQuery({
    queryKey: ['salesSummary'],
    queryFn: () => getSalesSummary(),
    enabled: !!user,
  });

  const customerSummaryQuery = useQuery({
    queryKey: ['customersSummary'],
    queryFn: () => getCustomerSummary(),
    enabled: !!user,
  });

  const supplierSummaryQuery = useQuery({
    queryKey: ['suppliersSummary'],
    queryFn: () => getSupplierSummary(),
    enabled: !!user,
  });

  const inventoryStatsQuery = useQuery({
    queryKey: ['inventoryStats'],
    queryFn: () => getInventoryStats(),
    enabled: !!user,
  });

  const arAgingQuery = useQuery({
    queryKey: ['araAging'],
    queryFn: () => getARAging(),
    enabled: !!user,
  });

  const apAgingQuery = useQuery({
    queryKey: ['apaAging'],
    queryFn: () => getAPAging(),
    enabled: !!user,
  });

  const recentSalesQuery = useQuery({
    queryKey: ['recentSales'],
    queryFn: () => getRecentSales(12),
    enabled: !!user,
  });

  const stockMovementsQuery = useQuery({
    queryKey: ['stockMovements'],
    queryFn: () => getRecentStockMovements(20),
    enabled: !!user,
  });

  const bankTransactionsQuery = useQuery({
    queryKey: ['bankTransactions'],
    queryFn: () => getBankTransactions(5),
    enabled: !!user,
  });

  const posDashboardQuery = useQuery({
    queryKey: ['posDashboard'],
    queryFn: () => getPosDashboardData(),
    enabled: !!user && roleKey === 'pos',
  });

  const posRecentQuery = useQuery({
    queryKey: ['posRecentSales'],
    queryFn: () => getRecentPosSales(8),
    enabled: !!user && roleKey === 'pos',
  });

  const isLoading = [
    dashboardQuery,
    salesSummaryQuery,
    customerSummaryQuery,
    supplierSummaryQuery,
    inventoryStatsQuery,
    arAgingQuery,
    apAgingQuery,
    recentSalesQuery,
    stockMovementsQuery,
    bankTransactionsQuery,
    posDashboardQuery,
  ].some((q) => q.isLoading);

  if (!user) return null;

  const displayName = user.name ?? user.email.split('@')[0] ?? 'User';
  const unreadNotifications = Number(dashboardQuery.data?.unreadNotifications ?? 0);
  const customersTotal = customerSummaryQuery.data?.total ?? 0;
  const supplierTotal = supplierSummaryQuery.data?.total ?? 0;
  const productTotal = inventoryStatsQuery.data?.totalProducts ?? 0;
  const inventoryAlerts = inventoryStatsQuery.data?.lowStock ?? 0;
  const outstandingAR = arAgingQuery.data?.grandTotal?.total ?? 0;
  const outstandingAP = apAgingQuery.data?.grandTotal?.total ?? 0;
  const salesTotal = roleKey === 'pos' ? Number(posDashboardQuery.data?.todaySales ?? 0) : salesSummaryQuery.data?.totalOrders ?? 0;
  const revenueTotal = roleKey === 'pos' ? Number(posDashboardQuery.data?.todayRevenue ?? 0) : salesSummaryQuery.data?.totalRevenue ?? 0;
  const posOpenSessions = Number(posDashboardQuery.data?.openSessions ?? 0);

  const recentActivities = useMemo(() => {
    const items = roleKey === 'pos' ? posRecentQuery.data ?? [] : recentSalesQuery.data ?? [];
    return items.slice(0, 5).map(pickRecentActivity);
  }, [posRecentQuery.data, recentSalesQuery.data, roleKey]);

  const recentTransactions = bankTransactionsQuery.data ?? [];
  const revenueTrend = useMemo(() => buildDailySeries(recentSalesQuery.data ?? [], 'createdAt', 'totalHarga', 6), [recentSalesQuery.data]);
  const salesTrend = useMemo(() => buildDailyCountSeries(recentSalesQuery.data ?? [], 'createdAt', 6), [recentSalesQuery.data]);
  const inventoryTrend = useMemo(() => buildDailySeries(stockMovementsQuery.data ?? [], 'createdAt', 'qty', 6), [stockMovementsQuery.data]);

  const roleSection = useMemo(() => {
    if (roleKey === 'admin') return 'Admin area with full system oversight.';
    if (roleKey === 'sales') return 'Sales metrics, order velocity, and customer momentum.';
    if (roleKey === 'gudang') return 'Warehouse stock status, low-level alerts, and movement trends.';
    if (roleKey === 'pos') return 'Cashier activity, session health, and point-of-sale revenue.';
    if (roleKey === 'driver') return 'Driver alerts and route activity support.';
    return 'ERP dashboard overview.';
  }, [roleKey]);

  const widgets = [
    { title: 'Revenue', value: formatCurrency(revenueTotal), description: roleKey === 'pos' ? 'Penjualan POS hari ini' : 'Omzet total' },
    { title: 'Customers', value: formatCount(customersTotal), description: 'Jumlah pelanggan aktif' },
    { title: 'Suppliers', value: formatCount(supplierTotal), description: 'Jumlah supplier tercatat' },
    { title: 'Products', value: formatCount(productTotal), description: 'Produk tersedia' },
    { title: 'Sales', value: formatCount(salesTotal), description: 'Total pesanan' },
    { title: 'Inventory Alerts', value: formatCount(inventoryAlerts), description: 'Produk stok rendah' },
    { title: 'Outstanding AR', value: formatCurrency(outstandingAR), description: 'Piutang belum lunas' },
    { title: 'Outstanding AP', value: formatCurrency(outstandingAP), description: 'Hutang belum bayar' },
  ];

  const activitiesEmpty = !recentActivities.length;
  const transactionsEmpty = !recentTransactions.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Halo, {displayName}</h1>
            <p className="mt-1 text-sm text-slate-500">{roleSection}</p>
          </div>

                  <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              Role: {user.role}
            </div>
            {roleKey === 'pos' ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                Open sessions: {formatCount(posOpenSessions)}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <PageHeader title={title} description={roleSection} />

        {isLoading ? (
          <LoadingState label="Memuat dashboard…" />
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {widgets.map((widget) => (
                  <StatCard key={widget.title} title={widget.title} value={widget.value} description={widget.description} />
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Unread Notifications</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{formatCount(unreadNotifications)}</p>
                  <p className="mt-2 text-sm text-slate-500">Notifikasi belum dibaca</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Roles</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                  {roles.length ? (
                    roles.map((role) => (
                      <span key={role} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">No roles assigned</span>
                  )}
                </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <TrendChart title="Revenue Trend" subtitle="7 hari terakhir" data={revenueTrend} valueLabel="Pendapatan" />
              <TrendChart title="Sales Trend" subtitle="7 hari terakhir" data={salesTrend} valueLabel="Order" />
              <TrendChart title="Inventory Trend" subtitle="7 hari terakhir" data={inventoryTrend} valueLabel="Qty" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Recent Activities</p>
                    <p className="text-xs text-slate-500">Aktivitas terbaru dari penjualan dan inventori</p>
                  </div>
                  <Link href="/dashboard" className="text-xs font-semibold text-sky-600">
                    Refresh
                  </Link>
                </div>

                {activitiesEmpty ? (
                  <EmptyState title="No recent activity" description="Belum ada aktivitas terbaru untuk ditampilkan." />
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="rounded-3xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
                          </div>
                          <div className="text-right text-xs text-slate-500">{activity.date}</div>
                        </div>
                        {activity.value ? <p className="mt-3 text-sm font-semibold text-slate-900">{activity.value}</p> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <p className="text-sm font-semibold text-slate-900">Recent Transactions</p>
                  <p className="text-xs text-slate-500">5 transaksi terakhir</p>
                </div>
                {transactionsEmpty ? (
                  <EmptyState title="No transactions" description="Transaksi terbaru belum tersedia." />
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="rounded-3xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{transaction.type ?? 'Transaction'}</p>
                            <p className="text-xs text-slate-500 mt-1">{transaction.description ?? 'No description'}</p>
                          </div>
                          <div className="text-right text-sm font-semibold text-slate-900">{formatCurrency(transaction.amount)}</div>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">{transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('id-ID') : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
