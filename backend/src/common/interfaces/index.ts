// Pagination response shape used across all modules
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit?: number;
  totalPages: number;
}

// Authenticated user payload extracted from JWT
export interface JwtUser {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

// Standard API response envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Stock movement directions
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'SCRAP';

// Business flow reference types for stock movements / journals
export type ReferenceType = 'PURCHASE_ORDER' | 'SALES_ORDER' | 'STOCK_OPNAME' | 'SCRAP' | 'MANUAL';
