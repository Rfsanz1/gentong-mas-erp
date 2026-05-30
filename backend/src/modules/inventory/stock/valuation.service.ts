import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

export interface StockValuationRow {
  productId: string;
  sku: string;
  name: string;
  warehouse?: string;
  category?: string;
  stok: number;
  unitCost: number;
  totalValue: number;
  costingMethod: string;
}

export interface StockAgingRow {
  productId: string;
  sku: string;
  name: string;
  nomorLot: string;
  qtyAwal: number;
  qtySisa: number;
  unitCost: number;
  totalValue: number;
  ageDays: number;
  expiryDate?: Date;
  expiredIn?: number;
  ageCategory: 'fresh' | 'normal' | 'slow' | 'critical';
}

@Injectable()
export class ValuationService {
  constructor(private prisma: PrismaService) {}

  async getStockValuation(date?: Date, warehouseId?: string): Promise<{
    asOf: Date;
    totalValue: number;
    rows: StockValuationRow[];
  }> {
    const asOf = date ?? new Date();
    const stockWhere: any = { qty: { gt: 0 }, product: { active: true } };
    if (warehouseId) stockWhere.warehouseId = warehouseId;

    const stocks = await this.prisma.stock.findMany({
      where: stockWhere,
      include: { product: { include: { category: true } }, warehouse: true },
      orderBy: { product: { name: 'asc' } },
    });

    const rows: StockValuationRow[] = stocks.map((s) => {
      const p = s.product;
      const unitCost = Number(p.currentAvgCost) || Number(p.hargaBeli) || 0;
      const qty = Number(s.qty);
      return {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        warehouse: s.warehouse?.name,
        category: p.category?.name,
        stok: qty,
        unitCost,
        totalValue: qty * unitCost,
        costingMethod: p.costingMethod,
      };
    });

    const totalValue = rows.reduce((sum, r) => sum + r.totalValue, 0);
    return { asOf, totalValue, rows };
  }

  async getStockAgingReport(warehouseId?: string): Promise<StockAgingRow[]> {
    let productIdFilter: string[] | undefined;
    if (warehouseId) {
      const stocks = await this.prisma.stock.findMany({
        where: { warehouseId, qty: { gt: 0 } },
        select: { productId: true },
      });
      productIdFilter = stocks.map((s) => s.productId);
      if (productIdFilter.length === 0) return [];
    }

    const lots = await this.prisma.stockLot.findMany({
      where: {
        qtySisa: { gt: 0 },
        ...(productIdFilter ? { productId: { in: productIdFilter } } : {}),
      },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });

    const now = new Date();

    return lots.map((lot) => {
      const ageDays = Math.floor((now.getTime() - lot.createdAt.getTime()) / 86_400_000);
      const expiryDate = lot.expiryDate ?? undefined;
      const expiredIn = expiryDate
        ? Math.floor((expiryDate.getTime() - now.getTime()) / 86_400_000)
        : undefined;

      let ageCategory: StockAgingRow['ageCategory'] = 'fresh';
      if (ageDays > 180) ageCategory = 'critical';
      else if (ageDays > 90) ageCategory = 'slow';
      else if (ageDays > 30) ageCategory = 'normal';

      if (expiredIn !== undefined && expiredIn <= 30) ageCategory = 'critical';
      else if (expiredIn !== undefined && expiredIn <= 90) ageCategory = 'slow';

      return {
        productId: lot.productId,
        sku: lot.product.sku,
        name: lot.product.name,
        nomorLot: lot.nomorLot,
        qtyAwal: Number(lot.qtyAwal),
        qtySisa: Number(lot.qtySisa),
        unitCost: Number(lot.unitCost),
        totalValue: Number(lot.qtySisa) * Number(lot.unitCost),
        ageDays,
        expiryDate,
        expiredIn,
        ageCategory,
      };
    });
  }

  async getSlowMovingItems(days = 90, warehouseId?: string) {
    const cutoff = new Date(Date.now() - days * 86_400_000);
    const stockWhere: any = { qty: { gt: 0 }, product: { active: true } };
    if (warehouseId) stockWhere.warehouseId = warehouseId;

    const stocks = await this.prisma.stock.findMany({
      where: stockWhere,
      include: {
        product: {
          include: {
            category: true,
            stockMovements: { where: { createdAt: { gte: cutoff } }, take: 1 },
          },
        },
        warehouse: true,
      },
    });

    return stocks
      .filter((s) => s.product.stockMovements.length === 0)
      .map((s) => {
        const p = s.product;
        const unitCost = Number(p.currentAvgCost) || Number(p.hargaBeli);
        const qty = Number(s.qty);
        return {
          productId: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category?.name,
          warehouse: s.warehouse?.name,
          stok: qty,
          unitCost,
          totalValue: qty * unitCost,
          daysSinceMovement: days,
          costingMethod: p.costingMethod,
        };
      });
  }

  async getStockLots(query: any) {
    const { productId, page = 1, limit = 50 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (productId) where.productId = productId;

    const [data, total] = await Promise.all([
      this.prisma.stockLot.findMany({
        where, skip, take: Number(limit),
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockLot.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getValuationHistory(productId: string) {
    return this.prisma.stockValuation.findMany({
      where: { productId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getValuationStats(warehouseId?: string) {
    const valuation = await this.getStockValuation(undefined, warehouseId);
    const aging = await this.getStockAgingReport(warehouseId);

    const criticalLots = aging.filter((a) => a.ageCategory === 'critical').length;
    const slowLots = aging.filter((a) => a.ageCategory === 'slow').length;
    const totalLots = aging.length;

    return {
      totalInventoryValue: valuation.totalValue,
      totalProducts: valuation.rows.length,
      criticalLots,
      slowLots,
      totalLots,
      asOf: valuation.asOf,
    };
  }
}
