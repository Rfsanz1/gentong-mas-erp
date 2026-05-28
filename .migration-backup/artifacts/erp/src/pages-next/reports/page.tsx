
import { useEffect } from 'react';
import { useLocation } from 'wouter';

import { useAuthStore } from '@/store/useAuthStore';
import AppShell from '@/layout/AppShell';
import { REPORTS_CONFIG, REPORTS_NAV } from '@/nav-configs';
import { BarChart3, TrendingUp, FileText, DollarSign, Users, Package, Truck, UserCheck } from 'lucide-react';

const REPORT_CARDS = [
  { href: '/reports/sales',      icon: TrendingUp, label: 'Lap. Penjualan',  desc: 'Revenue, order, performa sales per periode',    color: '#00ACC1', bg: 'rgba(0,172,193,.1)' },
  { href: '/reports/inventory',  icon: Package,    label: 'Lap. Inventaris', desc: 'Stok masuk/keluar, nilai inventory, perputaran', color: '#F57C00', bg: 'rgba(245,124,0,.1)' },
  { href: '/reports/finance',    icon: DollarSign, label: 'Lap. Keuangan',   desc: 'Neraca, laba rugi, arus kas bulanan',           color: '#388E3C', bg: 'rgba(56,142,60,.1)' },
  { href: '/reports/customers',  icon: Users,      label: 'Lap. Pelanggan',  desc: 'Analisis pelanggan, repeat order, CRM',         color: '#8E24AA', bg: 'rgba(142,36,170,.1)' },
  { href: '/reports/purchasing', icon: Truck,      label: 'Lap. Pembelian',  desc: 'PO, penerimaan barang, analisis supplier',       color: '#5D4037', bg: 'rgba(93,64,55,.1)' },
  { href: '/reports/hr',         icon: UserCheck,  label: 'Lap. SDM',        desc: 'Absensi, gaji, dan kinerja karyawan',           color: '#C2185B', bg: 'rgba(194,24,91,.1)' },
];

export default function ReportsPage() {
  const { token } = useAuthStore();
  const [, navigate] = useLocation();
  useEffect(() => { if (!token) navigate('/login'); }, [token]);
  if (!token) return null;

  return (
    <AppShell {...REPORTS_CONFIG} navItems={REPORTS_NAV} activeHref="/reports">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E1B4B' }}>Laporan & Analitik</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Pilih laporan yang ingin Anda lihat</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {REPORT_CARDS.map((r) => (
            <a key={r.href} href={r.href} className="bg-white rounded-2xl p-5 transition"
              style={{ border: '1.5px solid #EDE8F5', boxShadow: '0 1px 4px rgba(47,43,61,.06)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.boxShadow = `0 4px 12px rgba(47,43,61,.1)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EDE8F5'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(47,43,61,.06)'; }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ backgroundColor: r.bg }}>
                <r.icon className="h-5 w-5" style={{ color: r.color }} />
              </div>
              <p className="text-sm font-bold" style={{ color: '#1E1B4B' }}>{r.label}</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{r.desc}</p>
            </a>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid #EDE8F5', boxShadow: '0 1px 4px rgba(47,43,61,.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4" style={{ color: '#9CA3AF' }} />
            <h3 className="text-sm font-bold" style={{ color: '#1E1B4B' }}>Info Laporan</h3>
          </div>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Pilih laporan di atas untuk melihat analitik detail. Semua laporan dapat diekspor ke format Excel (.xlsx) atau PDF.</p>
        </div>
      </div>
    </AppShell>
  );
}
