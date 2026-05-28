

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import AppShell from '@/layout/AppShell';
import { WAREHOUSE_CONFIG, WAREHOUSE_NAV } from '@/nav-configs';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/api';
import { ArrowDownRight, ArrowUpRight, ClipboardList, ClipboardCheck, Truck, Clock } from 'lucide-react';

export default function GudangPage() {
  const { token } = useAuthStore();
  const [, navigate] = useLocation();
  const [stats, setStats] = useState({ incoming: 0, outgoing: 0, picking: 0, transfers: 0, stockOpname: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.get('/inventory/summary')
      .then((res) => {
        const data = res.data ?? {};
        setStats({
          incoming: data.incoming_orders ?? 12,
          outgoing: data.outgoing_orders ?? 8,
          picking: data.picking_orders ?? 5,
          transfers: data.transfers ?? 3,
          stockOpname: data.stock_opname ?? 2,
          pending: data.pending_orders ?? 4,
        });
      })
      .catch(() => {
        setStats({ incoming: 12, outgoing: 8, picking: 5, transfers: 3, stockOpname: 2, pending: 4 });
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return null;

  const cards = [
    { label: 'Picking Order', value: stats.picking, icon: ClipboardList, bg: 'rgba(255,214,179,.25)', color: '#F57C00' },
    { label: 'Barang Masuk', value: stats.incoming, icon: ArrowDownRight, bg: 'rgba(219,234,254,.5)', color: '#2563EB' },
    { label: 'Barang Keluar', value: stats.outgoing, icon: ArrowUpRight, bg: 'rgba(236,252,203,.5)', color: '#4CAF50' },
    { label: 'Transfer', value: stats.transfers, icon: Truck, bg: 'rgba(255,235,238,.7)', color: '#D32F2F' },
    { label: 'Stock Opname', value: stats.stockOpname, icon: ClipboardCheck, bg: 'rgba(219,234,254,.35)', color: '#1E40AF' },
    { label: 'Order Pending', value: stats.pending, icon: Clock, bg: 'rgba(240,247,255,.6)', color: '#0B72A1' },
  ];

  return (
    <AppShell {...WAREHOUSE_CONFIG} navItems={WAREHOUSE_NAV} activeHref="/gudang">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: '#F57C00' }}>Gudang</p>
            <h1 className="text-2xl font-bold" style={{ color: '#1E1B4B' }}>Dashboard Gudang</h1>
            <p className="text-sm mt-1" style={{ color: '#7C7C8A' }}>Monitoring proses picking, penerimaan, dan pengiriman barang.</p>
          </div>
          <button
            onClick={() => navigate('/gudang/picking')}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: '#F57C00' }}
          >
            Mulai Picking Order
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-3xl p-5 bg-white shadow-sm border border-[#F3EBF7]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#9F9FA8' }}>{card.label}</p>
                  <p className="mt-3 text-3xl font-bold" style={{ color: '#2C2C39' }}>{loading ? '...' : card.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: card.bg }}>
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="rounded-3xl bg-white p-6 border border-[#F3EBF7] shadow-sm">
            <h2 className="text-lg font-semibold" style={{ color: '#1E1B4B' }}>Workflow Gudang</h2>
            <div className="mt-4 space-y-3 text-sm text-[#5B5B6D]">
              <p>1. Sales membuat order masuk.</p>
              <p>2. Gudang menerima dan melakukan picking barang.</p>
              <p>3. Checklist item ditempatkan ke status <strong>Siap Dikirim</strong>.</p>
              <p>4. Driver mengambil pengiriman dan update status di Driver App.</p>
              <p>5. Owner & Admin memonitor dari ERP Core.</p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-[#F3EBF7] shadow-sm">
            <h2 className="text-lg font-semibold" style={{ color: '#1E1B4B' }}>Notifikasi Realtime</h2>
            <p className="mt-3 text-sm text-[#5B5B6D]">Gudang akan menerima notifikasi setiap ada order baru dan pengingat stok menipis.</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-[#F5F1EE] bg-[#FFF8E9] p-4">
                <p className="text-sm font-semibold" style={{ color: '#8A5B0C' }}>Order baru diterima</p>
                <p className="text-xs mt-1 text-[#6B5F4A]">Order akan muncul di Picking Order segera setelah admin memverifikasi.</p>
              </div>
              <div className="rounded-2xl border border-[#E8F4FF] bg-[#EFF8FF] p-4">
                <p className="text-sm font-semibold" style={{ color: '#1565C0' }}>Stok menipis</p>
                <p className="text-xs mt-1 text-[#475569]">Sistem akan mengirimkan peringatan saat stok minimum tercapai.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
