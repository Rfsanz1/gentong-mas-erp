

import { ReactNode, useState } from 'react';
import { useLocation } from 'wouter';


import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck, DollarSign,
  UserCheck, BarChart2, Settings, Bell, ShieldCheck, Store,
  ChevronRight, Zap, Search, Menu, X, LogOut, User, Monitor,
  FileText, Warehouse, ClipboardList, CreditCard, BookOpen, Building2, MapPin,
  Factory, Wrench, Car, UserPlus, ShoppingBag, RefreshCw, Globe,
  Bot, TrendingUp, Brain, Sparkles, LineChart, FlaskConical, MessageSquare,
  AlertCircle, FileBarChart, Activity, Cpu, Megaphone, Radio,
  Receipt, BanknoteIcon, Scale, PiggyBank, BookmarkCheck, BarChart3,
  HardHat, GraduationCap, HeartPulse, CalendarCheck, ClipboardCheck,
  Layers, GitBranch, Hash, HardDrive, Link2, Mail, Smartphone,
  Fuel, Navigation, Target, Percent, Tag, Clock,
  LayoutGrid, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';

interface NavChild {
  href: string;
  label: string;
}

interface NavItem {
  href?: string;
  label: string;
  icon: React.ElementType;
  children?: NavChild[];
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'UTAMA',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/notifications', label: 'Notifikasi', icon: Bell },
    ],
  },
  {
    label: 'PENJUALAN & CRM',
    items: [
      {
        label: 'Penjualan', icon: ShoppingCart,
        children: [
          { href: '/sales/quotations', label: 'Quotation' },
          { href: '/sales/orders', label: 'Sales Orders' },
          { href: '/sales/pricelists', label: 'Price List' },
          { href: '/sales/teams', label: 'Sales Team' },
          { href: '/sales/targets', label: 'Sales Target' },
          { href: '/sales/commission', label: 'Komisi Sales' },
        ],
      },
      {
        label: 'CRM', icon: Users,
        children: [
          { href: '/crm/leads', label: 'Leads' },
          { href: '/crm/pipeline', label: 'Pipeline Kanban' },
          { href: '/crm/opportunities', label: 'Opportunity' },
          { href: '/crm/activities', label: 'Aktivitas' },
          { href: '/crm/followup', label: 'Follow-up' },
        ],
      },
      {
        label: 'Invoice', icon: FileText,
        children: [
          { href: '/invoice/list', label: 'Invoice' },
          { href: '/invoice/down-payment', label: 'Down Payment' },
          { href: '/invoice/recurring', label: 'Recurring Invoice' },
          { href: '/invoice/payments', label: 'Pembayaran' },
          { href: '/invoice/aging', label: 'Aging Report' },
          { href: '/invoice/credit-notes', label: 'Kredit Nota' },
        ],
      },
      { href: '/pos/orders', label: 'Point of Sale', icon: Monitor },
      { href: '/customers', label: 'Pelanggan', icon: Users },
    ],
  },
  {
    label: 'OPERASIONAL',
    items: [
      {
        label: 'Inventory', icon: Package,
        children: [
          { href: '/inventory/products', label: 'Produk' },
          { href: '/inventory/lots', label: 'Lot & Serial Number' },
          { href: '/inventory/transfers', label: 'Transfer Stok' },
          { href: '/inventory/stock-movements', label: 'Mutasi Stok' },
          { href: '/inventory/stock-opnames', label: 'Stock Opname' },
          { href: '/inventory/warehouses', label: 'Multi Gudang' },
          { href: '/inventory/reorder-rules', label: 'Reorder Rules' },
        ],
      },
      {
        label: 'Pembelian', icon: Truck,
        children: [
          { href: '/purchasing/rfq', label: 'RFQ' },
          { href: '/purchasing/purchase-orders', label: 'Purchase Orders' },
          { href: '/purchasing/goods-receipts', label: 'Penerimaan Barang' },
          { href: '/purchasing/price-comparison', label: 'Perbandingan Harga' },
          { href: '/purchasing/approval-matrix', label: 'Approval Matrix' },
          { href: '/purchasing/suppliers', label: 'Supplier' },
        ],
      },
      {
        label: 'Manufaktur', icon: Factory,
        children: [
          { href: '/manufacturing/bom', label: 'Bill of Materials' },
          { href: '/manufacturing/orders', label: 'Work Order' },
          { href: '/manufacturing/mrp', label: 'MRP' },
          { href: '/manufacturing/work-centers', label: 'Work Center' },
          { href: '/manufacturing/scrap', label: 'Scrap' },
          { href: '/manufacturing/production-cost', label: 'Biaya Produksi' },
        ],
      },
      {
        label: 'Servis', icon: Wrench,
        children: [
          { href: '/service/work-orders', label: 'Work Order Servis' },
          { href: '/service/estimates', label: 'Estimasi Biaya' },
          { href: '/service/history', label: 'Riwayat Servis' },
          { href: '/service/warranties', label: 'Garansi Jasa' },
        ],
      },
      {
        label: 'Armada', icon: Car,
        children: [
          { href: '/fleet/vehicles', label: 'Kendaraan' },
          { href: '/fleet/documents', label: 'Dokumen Kendaraan' },
          { href: '/fleet/reminders', label: 'Reminder STNK/KIR' },
          { href: '/fleet/fuel-tracking', label: 'Tracking BBM' },
          { href: '/fleet/assignments', label: 'Penugasan Driver' },
        ],
      },
      {
        label: 'Marketplace', icon: ShoppingBag,
        children: [
          { href: '/marketplace/price-sync', label: 'Sinkronisasi Harga' },
          { href: '/marketplace/stock-reservation', label: 'Reservasi Stok' },
          { href: '/marketplace/returns', label: 'Retur' },
          { href: '/marketplace/commissions', label: 'Komisi Platform' },
          { href: '/marketplace/sync-logs', label: 'Sync Logs' },
        ],
      },
    ],
  },
  {
    label: 'KEUANGAN',
    items: [
      {
        label: 'Akuntansi', icon: DollarSign,
        children: [
          { href: '/finance/journal-entries', label: 'Jurnal Entry' },
          { href: '/finance/bank-reconciliation', label: 'Rekonsiliasi Bank' },
          { href: '/finance/coa', label: 'Chart of Accounts' },
          { href: '/finance/bank-accounts', label: 'Bank & Kas' },
          { href: '/finance/fixed-assets', label: 'Aset Tetap' },
          { href: '/finance/budget', label: 'Budget' },
          { href: '/finance/aged-receivable', label: 'Piutang Aging' },
          { href: '/finance/aged-payable', label: 'Hutang Aging' },
          { href: '/finance/tax-config', label: 'Konfigurasi Pajak' },
          { href: '/finance/currencies', label: 'Multi Mata Uang' },
        ],
      },
      {
        label: 'Laporan Keuangan', icon: BarChart2,
        children: [
          { href: '/finance/reports?type=pl', label: 'Laba & Rugi' },
          { href: '/finance/reports?type=bs', label: 'Neraca' },
          { href: '/finance/reports?type=cf', label: 'Cash Flow' },
          { href: '/finance/reports?type=tb', label: 'Trial Balance' },
          { href: '/finance/reports?type=gl', label: 'Buku Besar' },
        ],
      },
    ],
  },
  {
    label: 'SDM & PAYROLL',
    items: [
      {
        label: 'HR & Karyawan', icon: UserCheck,
        children: [
          { href: '/hr/employees', label: 'Data Karyawan' },
          { href: '/hr/organization', label: 'Struktur Organisasi' },
          { href: '/hr/attendances', label: 'Absensi' },
          { href: '/hr/leaves', label: 'Cuti & Izin' },
          { href: '/hr/training', label: 'Training' },
          { href: '/hr/certifications', label: 'Sertifikasi' },
          { href: '/hr/loans', label: 'Pinjaman Karyawan' },
          { href: '/hr/bpjs', label: 'BPJS' },
          { href: '/hr/appraisals', label: 'Penilaian KPI' },
        ],
      },
      {
        label: 'Payroll', icon: DollarSign,
        children: [
          { href: '/hr/payrolls/components', label: 'Komponen Gaji' },
          { href: '/hr/payrolls/batch', label: 'Slip Gaji Massal' },
          { href: '/hr/payrolls/bpjs-calc', label: 'Kalkulator BPJS' },
          { href: '/hr/payrolls/pph21-calc', label: 'Kalkulator PPh21' },
          { href: '/hr/payrolls/history', label: 'Riwayat Gaji' },
          { href: '/hr/payrolls/bank-export', label: 'Export Payroll' },
        ],
      },
      {
        label: 'Rekrutmen', icon: UserPlus,
        children: [
          { href: '/recruitment/positions', label: 'Lowongan' },
          { href: '/recruitment/applications', label: 'Pelamar' },
          { href: '/recruitment/scoring', label: 'Scoring Pelamar' },
          { href: '/recruitment/onboarding', label: 'Onboarding' },
          { href: '/recruitment/contract-generator', label: 'Generator Kontrak' },
        ],
      },
    ],
  },
  {
    label: 'LAPORAN',
    items: [
      {
        label: 'Semua Laporan', icon: BarChart2,
        children: [
          { href: '/reports/sales', label: 'Lap. Penjualan' },
          { href: '/reports/finance', label: 'Lap. Keuangan' },
          { href: '/reports/inventory', label: 'Lap. Inventaris' },
          { href: '/reports/hr', label: 'Lap. SDM' },
          { href: '/reports/payroll', label: 'Lap. Payroll' },
          { href: '/reports/manufacturing', label: 'Lap. Manufaktur' },
        ],
      },
    ],
  },
  {
    label: 'AI CENTER',
    items: [
      { label: 'AI Dashboard', icon: Brain, href: '/ai' },
      {
        label: 'AI Features', icon: Sparkles,
        children: [
          { href: '/ai/chatbot', label: 'AI Chat Assistant' },
          { href: '/ai/forecast', label: 'AI Forecast' },
          { href: '/ai/recommendation', label: 'AI Rekomendasi' },
          { href: '/ai/automation', label: 'AI Automation' },
          { href: '/ai/report-generator', label: 'AI Report Generator' },
          { href: '/ai/sales-prediction', label: 'AI Sales Prediction' },
          { href: '/ai/inventory-prediction', label: 'AI Inventory Prediction' },
          { href: '/ai/financial-analysis', label: 'AI Financial Analysis' },
          { href: '/ai/hr-assistant', label: 'AI HR Assistant' },
          { href: '/ai/marketplace-assistant', label: 'AI Marketplace' },
          { href: '/ai/notifications', label: 'AI Notification' },
          { href: '/ai/logs', label: 'AI Logs' },
        ],
      },
    ],
  },
  {
    label: 'MONITORING APPS',
    items: [
      {
        href: '/monitoring',
        label: 'Overview Semua App',
        icon: LayoutGrid,
      },
      {
        label: 'Detail per App',
        icon: Monitor,
        children: [
          { href: '/monitoring/sales',  label: 'Sales App' },
          { href: '/monitoring/gudang', label: 'Gudang App' },
          { href: '/monitoring/pos',    label: 'POS App' },
          { href: '/monitoring/driver', label: 'Driver App' },
        ],
      },
    ],
  },
  {
    label: 'SISTEM',
    items: [
      {
        label: 'Pengaturan', icon: Settings,
        children: [
          { href: '/settings', label: 'Pengaturan Umum' },
          { href: '/settings/users', label: 'User Management' },
          { href: '/settings/roles', label: 'Role & Permission' },
          { href: '/settings/companies', label: 'Multi Perusahaan' },
          { href: '/settings/email-gateway', label: 'Email Gateway' },
          { href: '/settings/wa-gateway', label: 'WA Gateway' },
          { href: '/settings/document-numbers', label: 'Format Nomor Dok' },
          { href: '/settings/backup', label: 'Backup & Restore' },
          { href: '/settings/api-integration', label: 'API Integration' },
          { href: '/settings/audit-log', label: 'Audit Log' },
        ],
      },
      { href: '/access', label: 'Users & Roles', icon: ShieldCheck },
      { href: '/kledo', label: 'Integrasi Kledo', icon: Building2 },
    ],
  },
];

// ── Color tokens (login page palette) ──────────────────────────────────────
const C = {
  primary:      '#5B52D1',
  primaryLight: '#8B80F9',
  primaryBg:    'rgba(91,82,209,0.08)',
  primaryBorder:'rgba(91,82,209,0.15)',
  activeBg:     'rgba(91,82,209,0.10)',
  hoverBg:      'rgba(91,82,209,0.06)',
  border:       '#EDE9FE',
  borderLight:  '#F3F0FF',
  sidebarBg:    '#FFFFFF',
  pageBg:       '#F5F3FF',
  topbarBg:     '#FFFFFF',
  textDark:     '#1E1B4B',
  textMid:      '#6B7280',
  textLight:    '#9CA3AF',
  navDot:       '#C4B5FD',
  danger:       '#EF4444',
  childBorder:  '#DDD6FE',
};

function NavItemComponent({ item }: { item: NavItem }) {
  const [pathname] = useLocation();
  const isChildActive = item.children?.some((c) => pathname.startsWith(c.href.split('?')[0])) ?? false;
  const [open, setOpen] = useState(isChildActive);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors"
          style={{
            backgroundColor: open ? C.activeBg : 'transparent',
            color: open ? C.primary : C.textMid,
          }}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {item.badge && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white mr-1" style={{ backgroundColor: C.danger }}>
              {item.badge}
            </span>
          )}
          <ChevronRight
            className="h-3.5 w-3.5 transition-transform duration-200 flex-shrink-0"
            style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', color: open ? C.primary : C.textLight }}
          />
        </button>

        <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: open ? '800px' : '0px' }}>
          <div className="ml-4 mt-0.5 pl-3 pb-1 space-y-0.5" style={{ borderLeft: `2px solid ${C.childBorder}` }}>
            {item.children.map((child) => {
              const hrefPath = child.href.split('?')[0];
              const active = pathname === hrefPath || (pathname.startsWith(hrefPath + '/') && hrefPath !== '/');
              return (
                <a
                  key={child.href}
                  href={child.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors"
                  style={{
                    backgroundColor: active ? C.activeBg : 'transparent',
                    color: active ? C.primary : C.textMid,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: active ? C.primary : C.navDot }}
                  />
                  {child.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const active = pathname === item.href;
  return (
    <a href={item.href!}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors"
      style={{
        backgroundColor: active ? C.activeBg : 'transparent',
        color: active ? C.primary : C.textMid,
        fontWeight: active ? 600 : 400,
      }}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: active ? C.primary : C.textMid }} />
      <span>{item.label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: C.primary }} />}
    </a>
  );
}

interface OdooLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function OdooLayout({ children, title, subtitle }: OdooLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [appLauncher, setAppLauncher] = useState(false);

  const APP_LAUNCHER_ITEMS = [
    { label: 'Sales App',   url: 'http://localhost:3002', color: '#0891B2', icon: ShoppingCart },
    { label: 'Gudang App',  url: 'http://localhost:3003', color: '#D97706', icon: Package },
    { label: 'POS App',     url: 'http://localhost:3004', color: '#E64A19', icon: Monitor },
    { label: 'Driver App',  url: 'http://localhost:3005', color: '#1D4ED8', icon: Truck },
  ];
  const { user, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [, navigate] = useLocation();
  const unreadCount = notifications.length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.pageBg }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full flex flex-col overflow-hidden transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '260px', backgroundColor: C.sidebarBg, borderRight: `1px solid ${C.border}` }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold text-base flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`, boxShadow: `0 4px 12px ${C.primaryBorder}` }}
          >
            G
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight" style={{ color: C.textDark }}>Gentong Mas</h2>
            <p className="text-[11px]" style={{ color: C.textLight }}>ERP System v2.0</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)} style={{ color: C.textLight }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest" style={{ color: C.primaryLight }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItemComponent key={item.label} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User panel */}
        <div className="px-3 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors"
              style={{ backgroundColor: C.hoverBg, border: `1px solid ${C.border}` }}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})` }}
              >
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-xs font-semibold truncate" style={{ color: C.textDark }}>{user?.name ?? 'Admin'}</p>
                <p className="text-[10px] truncate" style={{ color: C.textLight }}>{(user as any)?.role ?? (user?.roles?.[0] ?? 'Super Admin')}</p>
              </div>
              <ChevronRight
                className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200"
                style={{ color: C.textLight, transform: userDropdown ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>

            {userDropdown && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl overflow-hidden shadow-xl"
                style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, boxShadow: `0 8px 32px rgba(91,82,209,0.15)` }}
              >
                <a href="/settings/users"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: C.textDark }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => setUserDropdown(false)}
                >
                  <User className="h-4 w-4" style={{ color: C.textLight }} /> Profil Saya
                </a>
                <a href="/settings"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: C.textDark }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => setUserDropdown(false)}
                >
                  <Settings className="h-4 w-4" style={{ color: C.textLight }} /> Pengaturan
                </a>
                <div style={{ borderTop: `1px solid ${C.border}` }} />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: C.danger }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="lg:pl-[260px] min-h-screen">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3"
          style={{
            backgroundColor: C.topbarBg,
            borderBottom: `1px solid ${C.border}`,
            boxShadow: '0 1px 8px rgba(91,82,209,0.06)',
          }}
        >
          <button className="lg:hidden p-1.5 rounded-xl transition-colors" style={{ color: C.textMid }} onClick={() => setSidebarOpen(true)}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Menu className="h-5 w-5" />
          </button>

          {(title || subtitle) && (
            <div className="hidden sm:block">
              {title && <h1 className="text-sm font-bold" style={{ color: C.textDark }}>{title}</h1>}
              {subtitle && <p className="text-xs" style={{ color: C.textLight }}>{subtitle}</p>}
            </div>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-1.5">
            <a href="/notifications"
              className="relative p-2 rounded-xl transition-colors"
              style={{ color: C.textMid }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: C.danger }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </a>
            <a href="/ai/chatbot"
              className="p-2 rounded-xl transition-colors"
              style={{ color: C.primary }}
              title="AI Assistant"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Brain className="h-5 w-5" />
            </a>
            <a href="/settings"
              className="p-2 rounded-xl transition-colors"
              style={{ color: C.textMid }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Settings className="h-5 w-5" />
            </a>

            {/* App Launcher */}
            <div className="relative">
              <button
                onClick={() => setAppLauncher(!appLauncher)}
                className="p-2 rounded-xl transition-colors"
                title="Buka App Lain"
                style={{ color: appLauncher ? C.primary : C.textMid, backgroundColor: appLauncher ? C.activeBg : 'transparent' }}
                onMouseEnter={e => { if (!appLauncher) e.currentTarget.style.backgroundColor = C.hoverBg; }}
                onMouseLeave={e => { if (!appLauncher) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>

              {appLauncher && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAppLauncher(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ width: 240, backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(91,82,209,0.18)' }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <p className="text-xs font-bold tracking-widest" style={{ color: C.primaryLight }}>APP LAUNCHER</p>
                    </div>
                    <div className="p-2 grid grid-cols-2 gap-2">
                      {APP_LAUNCHER_ITEMS.map((app) => {
                        const Icon = app.icon;
                        return (
                          <a
                            key={app.label}
                            href={app.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setAppLauncher(false)}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-center"
                            style={{ border: `1.5px solid ${C.border}` }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = app.color; e.currentTarget.style.backgroundColor = `${app.color}08`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${app.color}15` }}>
                              <Icon className="h-4.5 w-4.5" style={{ color: app.color, width: 18, height: 18 }} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold leading-tight" style={{ color: C.textDark }}>{app.label}</p>
                              <ExternalLink className="h-2.5 w-2.5 inline mt-0.5" style={{ color: C.textLight }} />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                    <div className="px-3 pb-3">
                      <a href="/monitoring"
                        onClick={() => setAppLauncher(false)}
                        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold transition-colors"
                        style={{ backgroundColor: C.activeBg, color: C.primary }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.primaryBg)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.activeBg)}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" /> Command Center
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default OdooLayout;
