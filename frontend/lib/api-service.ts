import api, { unwrap } from '@/lib/api';
import type { AxiosRequestConfig } from 'axios';

export type ApiResponse<T> = T;

export async function apiGet<T>(path: string, config?: AxiosRequestConfig) {
  const response = await api.get<ApiResponse<T>>(path, config);
  return unwrap(response.data) as T;
}

export async function apiPost<T, B = unknown>(path: string, body: B, config?: AxiosRequestConfig) {
  const response = await api.post<ApiResponse<T>>(path, body, config);
  return unwrap(response.data) as T;
}

export async function apiPut<T, B = unknown>(path: string, body: B, config?: AxiosRequestConfig) {
  const response = await api.put<ApiResponse<T>>(path, body, config);
  return unwrap(response.data) as T;
}

export async function apiPatch<T, B = unknown>(path: string, body: B, config?: AxiosRequestConfig) {
  const response = await api.patch<ApiResponse<T>>(path, body, config);
  return unwrap(response.data) as T;
}

export async function apiDelete<T>(path: string, config?: AxiosRequestConfig) {
  const response = await api.delete<ApiResponse<T>>(path, config);
  return unwrap(response.data) as T;
}
