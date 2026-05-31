import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api-service';

export type Customer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  npwp?: string | null;
  creditLimit: string;
  creditUsed: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  orders?: Array<{
    id: number;
    namaCustomer: string;
    status: string;
    totalHarga: string;
    createdAt: string;
  }>;
};

export type CustomerListResponse = {
  data: Customer[];
  total: number;
  page: number;
  totalPages: number;
};

export type CustomerCreateDto = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  npwp?: string;
  creditLimit?: number;
  active?: boolean;
};

export type CustomerUpdateDto = Partial<CustomerCreateDto>;

export async function getCustomers(query: {
  search?: string;
  active?: string;
  page?: number;
  limit?: number;
}) {
  return apiGet<CustomerListResponse>('/api/customers', { params: query });
}

export async function getCustomer(id: string) {
  return apiGet<Customer>(`/api/customers/${id}`);
}

export async function createCustomer(data: CustomerCreateDto) {
  return apiPost<Customer>('/api/customers', data);
}

export async function updateCustomer(id: string, data: CustomerUpdateDto) {
  return apiPut<Customer>(`/api/customers/${id}`, data);
}

export async function removeCustomer(id: string) {
  return apiDelete<Customer>(`/api/customers/${id}`);
}
