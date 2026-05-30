// Stock movement directions
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'SCRAP';

// Business flow reference types for stock movements / journals
export type ReferenceType =
  | 'PURCHASE_ORDER'
  | 'SALES_ORDER'
  | 'STOCK_OPNAME'
  | 'SCRAP'
  | 'MANUAL';

// Sort direction
export type SortOrder = 'asc' | 'desc';

// Generic ID type
export type EntityId = string;

// Nullable type utility
export type Nullable<T> = T | null;

// Optional type utility
export type Optional<T> = T | undefined;
