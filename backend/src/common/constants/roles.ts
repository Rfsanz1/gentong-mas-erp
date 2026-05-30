export const ERP_ROLES = [
  'super admin',
  'owner',
  'admin',
  'sales',
  'sales manager',
  'gudang',
  'staff gudang',
  'kasir',
  'finance',
  'hr',
  'driver',
  'procurement',
  'manufacture',
] as const;

export type ErpRole = (typeof ERP_ROLES)[number];

export const ROLE_GROUPS = {
  superAdmins: ['super admin', 'owner', 'admin'] as const,
  sales: ['super admin', 'owner', 'admin', 'sales', 'sales manager'] as const,
  warehouse: ['super admin', 'owner', 'admin', 'gudang', 'staff gudang'] as const,
  finance: ['super admin', 'owner', 'admin', 'finance'] as const,
  hr: ['super admin', 'owner', 'admin', 'hr'] as const,
  pos: ['super admin', 'owner', 'admin', 'kasir'] as const,
  driver: ['super admin', 'owner', 'admin', 'driver'] as const,
  procurement: ['super admin', 'owner', 'admin', 'procurement'] as const,
  manufacture: ['super admin', 'owner', 'admin', 'manufacture'] as const,
} as const;
