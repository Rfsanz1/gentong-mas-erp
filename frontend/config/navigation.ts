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
        title: 'Inventory Planning',
        href: '/coming-soon?section=Inventory',
        description: 'Stock forecasting, replenishment, and bin management',
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        title: 'Finance Center',
        href: '/coming-soon?section=Finance',
        description: 'Invoices, payments, and accounting journals',
        roles: ['admin'],
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
