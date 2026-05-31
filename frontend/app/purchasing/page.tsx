'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-service';
import { LoadingState } from '@/components/ui/LoadingState';

type PurchasingStats = {
  totalPO: number;
  nilaiPembelian: number;
  poMenungguApprove: number;
  poMenungguTerima: number;
};

const MENU_CARDS = [
  { label: 'RFQ', desc: 'Request for Quotation dari supplier', href: '/purchasing/rfq', color: 'border-violet-200 hover:border-violet-400' },
  { label: 'Purchase Order', desc: 'Daftar dan buat purchase order', href: '/purchasing/purchase-orders', color: 'border-sky-200 hover:border-sky-400' },
  { label: 'Penerimaan Barang', desc: 'Konfirmasi barang yang diterima', href: '/purchasing/goods-receipts', color: 'border-green-200 hover:border-green-400' },
  { label: 'Perbandingan Harga', desc: 'Bandingkan harga antar supplier', href: '/purchasing/price-comparison', color: 'border-amber-200 hover:border-amber-400' },
  { label: 'Approval Matrix', desc: 'Atur otorisasi persetujuan PO', href: '/purchasing/approval-matrix', color: 'border-rose-200 hover:border-rose-400' },
  { label: 'Supplier', desc: 'Kelola data dan kontak supplier', href: '/suppliers', color: 'border-slate-200 hover:border-slate-400' },
  { label: 'Laporan', desc: 'Laporan pembelian dan pengeluaran', href: '/purchasing/reports', color: 'border-teal-200 hover:border-teal-400' },
  { label: 'Pengaturan', desc: 'Konfigurasi modul purchasing', href: '/purchasing/settings', color: 'border-gray-200 hover:border-gray-400' },
];

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function PurchasingPage() {
  const statsQuery = useQuery<PurchasingStats>({
    queryKey: ['purchasing-stats'],
    queryFn: () => apiGet<PurchasingStats>('/api/purchasing/stats'),
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <p className="text-sm text-slate-500">Purchasing</p>
        <h1 className="text-3xl font-semibold text-slate-900 mt-1">Purchasing Hub</h1>
        <p className="mt-2 text-slate-600">Kelola seluruh proses pengadaan barang, dari permintaan hingga penerimaan.</p>
      </div>

      {statsQuery.isLoading ? (
        <LoadingState message="Memuat statistik..." />
      ) : statsQuery.data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total PO', value: String(statsQuery.data.totalPO), sub: 'purchase order' },
            { label: 'Nilai Pembelian', value: fmt(statsQuery.data.nilaiPembelian), sub: 'keseluruhan' },
            { label: 'Menunggu Approve', value: String(statsQuery.data.poMenungguApprove), sub: 'purchase order' },
            { label: 'Menunggu Terima', value: String(statsQuery.data.poMenungguTerima), sub: 'penerimaan barang' },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MENU_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`rounded-3xl border-2 bg-white p-6 shadow-sm transition-all hover:shadow-md ${card.color}`}
          >
            <h2 className="text-base font-semibold text-slate-900">{card.label}</h2>
            <p className="mt-2 text-sm text-slate-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
