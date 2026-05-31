import { apiGet, apiPost, apiPut, apiPatch } from '@/lib/api-service';

export type PurchaseOrderItem = {
  id: string;
  productId?: string | null;
  nama: string;
  qty: number;
  hargaBeli: string;
  subtotal: string;
  qtyReceived?: number;
  product?: { id: string; name?: string | null } | null;
};

export type PurchaseOrder = {
  id: string;
  noPo: string;
  supplier?: { id: string; name: string } | null;
  warehouse?: { id: string; name?: string | null } | null;
  tanggal: string;
  tanggalKirim?: string | null;
  totalHarga: string;
  status: string;
  note?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: PurchaseOrderItem[];
  goodsReceipts?: Array<{ id: string; noGr: string; status: string }>;
};

export type PurchaseOrderListResponse = {
  data: PurchaseOrder[];
  total: number;
  page: number;
  totalPages: number;
};

export type CreatePurchaseOrderDto = {
  supplierId: string;
  warehouseId?: string;
  tanggal: string;
  tanggalKirim?: string;
  note?: string;
  discountPercentage?: number;
  items: Array<{
    productId?: string;
    nama: string;
    qty: number;
    hargaBeli: number;
    subtotal?: number;
  }>;
};

export type UpdatePurchaseOrderDto = Partial<CreatePurchaseOrderDto>;

export type CreateGoodsReceiptDto = {
  purchaseOrderId: string;
  tanggal: string;
  note?: string;
  items: Array<{
    productId?: string;
    nama: string;
    qtyOrdered: number;
    qtyReceived: number;
    hargaBeli?: number;
  }>;
};

export type ConfirmGoodsReceiptDto = {
  warehouseId?: string;
};

export type GoodsReceipt = {
  id: string;
  noGr: string;
  purchaseOrderId: string;
  purchaseOrder?: { id: string; noPo: string; supplier?: { id: string; name: string } };
  tanggal: string;
  status: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: Array<{
    id: string;
    productId?: string | null;
    nama: string;
    qtyOrdered: number;
    qtyReceived: number;
    hargaBeli?: string | null;
  }>;
};

export type GoodsReceiptListResponse = {
  data: GoodsReceipt[];
  total: number;
  page: number;
  totalPages: number;
};

export async function getPurchaseOrders(query: {
  search?: string;
  status?: string;
  supplierId?: string;
  page?: number;
  limit?: number;
}) {
  return apiGet<PurchaseOrderListResponse>('/api/purchasing/purchase-orders', { params: query });
}

export async function getPurchaseOrder(id: string) {
  return apiGet<PurchaseOrder>(`/api/purchasing/purchase-orders/${id}`);
}

export async function createPurchaseOrder(data: CreatePurchaseOrderDto) {
  return apiPost<PurchaseOrder>('/api/purchasing/purchase-orders', data);
}

export async function updatePurchaseOrder(id: string, data: UpdatePurchaseOrderDto) {
  return apiPut<PurchaseOrder>(`/api/purchasing/purchase-orders/${id}`, data);
}

export async function approvePurchaseOrder(id: string) {
  return apiPost<PurchaseOrder>(`/api/purchasing/purchase-orders/${id}/approve`, {});
}

export async function cancelPurchaseOrder(id: string) {
  return apiPost<PurchaseOrder>(`/api/purchasing/purchase-orders/${id}/cancel`, {});
}

export async function changePurchaseOrderStatus(id: string, status: string) {
  return apiPatch<PurchaseOrder>(`/api/purchasing/purchase-orders/${id}/status`, { status });
}

export async function getGoodsReceipts(query: {
  purchaseOrderId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return apiGet<GoodsReceiptListResponse>('/api/purchasing/goods-receipts', { params: query });
}

export async function createGoodsReceipt(data: CreateGoodsReceiptDto) {
  return apiPost<GoodsReceipt>('/api/purchasing/goods-receipts', data);
}

export async function confirmGoodsReceipt(id: string, data: ConfirmGoodsReceiptDto) {
  return apiPost<GoodsReceipt>(`/api/purchasing/goods-receipts/${id}/confirm`, data);
}
