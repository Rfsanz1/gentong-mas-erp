// Inventory costing methods
export enum CostingMethod {
  FIFO = 'FIFO',
  AVERAGE = 'AVERAGE',
  STANDARD = 'STANDARD',
}

export enum LandedCostSplitMethod {
  BY_QTY = 'BY_QTY',
  BY_VALUE = 'BY_VALUE',
  BY_WEIGHT = 'BY_WEIGHT',
}

// Tax types
export enum TaxType {
  PPN = 'PPN',
  PPH21 = 'PPH21',
  PPH23 = 'PPH23',
  PPH25 = 'PPH25',
  PPH4A2 = 'PPH4A2',
}

export enum TaxLineType {
  COLLECTED = 'COLLECTED',
  PAID = 'PAID',
}

export enum EFakturStatus {
  DRAFT = 'DRAFT',
  UPLOADED = 'UPLOADED',
  APPROVED = 'APPROVED',
}

// Finance / accounting
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum JournalStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export enum FiscalStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

// Payroll
export enum PayrollComponentType {
  BASIC = 'BASIC',
  ALLOWANCE = 'ALLOWANCE',
  DEDUCTION = 'DEDUCTION',
  OVERTIME = 'OVERTIME',
}

export enum PayrollPeriodStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

export enum SlipStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

// Fixed assets
export enum DepreciasiMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  DECLINING_BALANCE = 'DECLINING_BALANCE',
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  DISPOSED = 'DISPOSED',
  SOLD = 'SOLD',
}

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
}
