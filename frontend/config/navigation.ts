export type NavItem = {
  title: string;
  href: string;
  icon?: string;
  description?: string;
  roles?: string[];
  permissions?: string[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const navigationConfig: NavGroup[] = [
  {
    title: 'Core System',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        description: 'Executive summary and operational snapshots',
        permissions: ['dashboard.view'],
      },
    ],
  },
  {
    title: 'Sales & Revenue',
    items: [
      {
        title: 'Sales',
        href: '/sales',
        description: 'Sales orders, quotations, and revenue tracking',
        roles: ['sales', 'sales manager', 'admin'],
      },
      {
        title: 'Point of Sale',
        href: '/pos',
        description: 'Cashiering and POS checkout workflows',
        roles: ['kasir', 'admin'],
      },
    ],
  },
  {
    title: 'Purchasing',
    items: [
      {
        title: 'RFQ',
        href: '/purchasing/rfq',
        description: 'Request for Quotation dari supplier',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Purchase Order',
        href: '/purchasing/purchase-orders',
        description: 'Daftar dan buat purchase order',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Penerimaan Barang',
        href: '/purchasing/goods-receipts',
        description: 'Konfirmasi barang yang diterima dari supplier',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Perbandingan Harga',
        href: '/purchasing/price-comparison',
        description: 'Bandingkan harga antar supplier',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Approval Matrix',
        href: '/purchasing/approval-matrix',
        description: 'Atur otorisasi persetujuan purchase order',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Suppliers',
        href: '/suppliers',
        description: 'Manage supplier contacts and active vendor records',
        roles: ['admin', 'owner', 'super admin', 'sales manager'],
      },
      {
        title: 'Laporan Purchasing',
        href: '/purchasing/reports',
        description: 'Laporan pembelian dan pengeluaran per periode',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Pengaturan Purchasing',
        href: '/purchasing/settings',
        description: 'Konfigurasi modul purchasing',
        roles: ['admin', 'owner', 'super admin'],
      },
    ],
  },
  {
    title: 'Inventory',
    items: [
      {
        title: 'Warehouse',
        href: '/gudang',
        description: 'Stock control, transfers, and warehouse operations',
        roles: ['gudang', 'admin'],
      },
      {
        title: 'Lot Stok',
        href: '/inventory/lots',
        description: 'Daftar lot stok berdasarkan metode FIFO / Average',
        roles: ['admin', 'owner', 'super admin', 'gudang'],
      },
      {
        title: 'Valuasi Stok',
        href: '/inventory/stock-valuation',
        description: 'Nilai persediaan berdasarkan metode costing',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Aging Stok',
        href: '/inventory/stock-aging',
        description: 'Identifikasi stok lama dan slow-moving items',
        roles: ['admin', 'owner', 'super admin', 'gudang'],
      },
      {
        title: 'Reorder Rules',
        href: '/inventory/reorder-rules',
        description: 'Atur batas minimum stok dan otomasi reorder',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Manajemen Gudang',
        href: '/inventory/warehouses',
        description: 'Kelola lokasi dan detail setiap gudang',
        roles: ['admin', 'owner', 'super admin'],
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        title: 'Rekening Bank',
        href: '/finance/bank-accounts',
        description: 'Saldo dan riwayat transaksi rekening bank',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Rekonsiliasi Bank',
        href: '/finance/bank-reconciliation',
        description: 'Cocokkan saldo sistem dengan rekening koran',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Pengeluaran',
        href: '/finance/expenses',
        description: 'Catat dan kelola pengeluaran operasional',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Anggaran',
        href: '/finance/budget',
        description: 'Kelola anggaran bulanan dan tahunan',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Aset Tetap',
        href: '/finance/fixed-assets',
        description: 'Manajemen aset tetap dan penyusutan',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Piutang (AR Aging)',
        href: '/finance/aged-receivable',
        description: 'Analisis umur piutang pelanggan',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Hutang (AP Aging)',
        href: '/finance/aged-payable',
        description: 'Analisis umur hutang kepada supplier',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Jurnal Keuangan',
        href: '/finance/journal-entries',
        description: 'Semua entri jurnal keuangan',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Konfigurasi Pajak',
        href: '/finance/tax-config',
        description: 'Atur jenis pajak dan tarif berlaku',
        roles: ['admin', 'owner', 'super admin'],
      },
    ],
  },
  {
    title: 'Akuntansi',
    items: [
      {
        title: 'Chart of Accounts',
        href: '/accounting/chart-of-accounts',
        description: 'Daftar akun dalam hierarki buku besar',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Journal Entry',
        href: '/accounting/journal-entry',
        description: 'Buat dan kelola jurnal akuntansi',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'General Ledger',
        href: '/accounting/general-ledger',
        description: 'Riwayat transaksi per akun buku besar',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Trial Balance',
        href: '/accounting/trial-balance',
        description: 'Neraca saldo per tanggal tertentu',
        roles: ['admin', 'owner', 'super admin'],
      },
      {
        title: 'Laporan Keuangan',
        href: '/accounting/reports',
        description: 'Neraca, Laba Rugi, dan Arus Kas',
        roles: ['admin', 'owner', 'super admin'],
      },
    ],
  },
  {
    title: 'HR',
    items: [
      {
        title: 'Human Resources',
        href: '/coming-soon?section=HR',
        description: 'Employee records, attendance, and payroll setup',
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        title: 'Operations',
        href: '/coming-soon?section=Operations',
        description: 'Maintenance, fleet, and operational workflows',
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'CRM',
    items: [
      {
        title: 'CRM',
        href: '/coming-soon?section=CRM',
        description: 'Customer lifecycle, leads, and communication history',
        roles: ['admin'],
      },
      {
        title: 'Customers',
        href: '/customers',
        description: 'Customer management, credit limits, and active accounts',
        roles: ['admin', 'owner', 'super admin', 'sales', 'sales manager', 'kasir'],
      },
    ],
  },
  {
    title: 'Projects',
    items: [
      {
        title: 'Projects',
        href: '/coming-soon?section=Projects',
        description: 'Project planning, tasks, and milestones',
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'Administration',
        href: '/coming-soon?section=Administration',
        description: 'System settings, user roles, and security policies',
        roles: ['admin'],
      },
    ],
  },
];
