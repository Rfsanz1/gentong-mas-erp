import type { AxiosRequestConfig } from 'axios';
import { apiGet } from '@/lib/api-service';

export type DashboardRole = 'admin' | 'sales' | 'gudang' | 'pos' | 'driver';

export type RoleSummary = Record<string, unknown>;

export type CustomersSummary = { total: number; active: number; inactive: number };
export type SupplierListResponse = { data: unknown[]; total: number; page: number; totalPages: number };
export type InventoryStats = { totalProducts: number; lowStock: number; totalStok: number };
export type SalesSummary = { totalOrders: number; totalRevenue: number; pendingOrders: number };
export type RecentSale = { id: string; noFaktur?: string; customer?: { name?: string } | null; status?: string; createdAt?: string; totalHarga?: number };
export type PosSale = { id: string; noStruk?: string; grandTotal?: number; createdAt?: string; status?: string; posUser?: { name?: string } | null };
export type StockMovement = { id: string; type?: string; qty?: number; createdAt?: string; product?: { name?: string } | null; warehouse?: { name?: string } | null };
export type BankTransaction = { id: string; amount?: number; type?: string; description?: string; createdAt?: string };
export type AgingSummary = { asOf: string; grandTotal: { total: number; current: number; d30: number; d60: number; d90: number; over90: number }; rows: unknown[] };

const roleToEndpoint: Record<DashboardRole, string> = {
  admin: 'admin',
  sales: 'sales',
  gudang: 'gudang',
  pos: 'pos',
  driver: 'driver',
};

export async function getDashboardRoleSummary(role: DashboardRole) {
  const endpoint = roleToEndpoint[role] ?? 'admin';
  return apiGet<RoleSummary>(`/api/dashboard/${endpoint}`);
}

export async function getSalesSummary(query?: AxiosRequestConfig) {
  return apiGet<SalesSummary>('/api/sales/summary', query);
}

export async function getRecentSales(limit = 10) {
  return apiGet<{ data: RecentSale[] }>('/api/sales', { params: { limit } }).then((res) => res.data ?? []);
}

export async function getPosDashboardData() {
  return apiGet<{ todaySales?: number; todayRevenue?: number; openSessions?: number }>('/api/pos/dashboard');
}

export async function getRecentPosSales(limit = 8) {
  return apiGet<{ data: PosSale[] }>('/api/pos/sales', { params: { limit } }).then((res) => res.data ?? []);
}

export async function getInventoryStats() {
  return apiGet<InventoryStats>('/api/inventory/stats');
}

export async function getRecentStockMovements(limit = 20) {
  return apiGet<{ data: StockMovement[] }>('/api/inventory/stock-movements', { params: { limit } }).then((res) => res.data ?? []);
}

export async function getCustomerSummary() {
  return apiGet<CustomersSummary>('/api/customers/summary');
}

export async function getSupplierSummary() {
  return apiGet<SupplierListResponse>('/api/purchasing/suppliers', { params: { limit: 1 } });
}

export async function getBankTransactions(limit = 5) {
  return apiGet<{ data: BankTransaction[] }>('/api/finance/bank-transactions', { params: { limit } }).then((res) => res.data ?? []);
}

export async function getARAging() {
  return apiGet<AgingSummary>('/api/finance/ar-aging');
}

export async function getAPAging() {
  return apiGet<AgingSummary>('/api/finance/ap-aging');
}
