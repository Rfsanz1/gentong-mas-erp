import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api-service';

export type Supplier = {
  id: string;
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SupplierListResponse = {
  data: Supplier[];
  total: number;
  page: number;
  totalPages: number;
};

export type SupplierCreateDto = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
};

export type SupplierUpdateDto = Partial<SupplierCreateDto>;

export async function getSuppliers(query: {
  search?: string;
  active?: string;
  page?: number;
  limit?: number;
}) {
  return apiGet<SupplierListResponse>('/api/purchasing/suppliers', { params: query });
}

export async function getSupplier(id: string) {
  return apiGet<Supplier>(`/api/purchasing/suppliers/${id}`);
}

export async function createSupplier(data: SupplierCreateDto) {
  return apiPost<Supplier>('/api/purchasing/suppliers', data);
}

export async function updateSupplier(id: string, data: SupplierUpdateDto) {
  return apiPut<Supplier>(`/api/purchasing/suppliers/${id}`, data);
}

export async function removeSupplier(id: string) {
  return apiDelete<Supplier>(`/api/purchasing/suppliers/${id}`);
}
