import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Injectable()
export class InventoryService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getProducts(query: any) {
    const { search, categoryId, warehouseId, active, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (categoryId) where.categoryId = categoryId;
    if (warehouseId) where.stocks = { some: { warehouseId } };
    if (active !== undefined) where.active = active === 'true';
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where, skip, take: Number(limit),
        include: { category: true, unit: true, stocks: { include: { warehouse: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getProduct(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
        stocks: { include: { warehouse: true } },
        stockMovements: { take: 20, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!p) throw new NotFoundException('Produk tidak ditemukan');
    return p;
  }

  async createProduct(dto: any) {
    return this.prisma.product.create({ data: dto });
  }

  async updateProduct(id: string, dto: any) {
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.update({ where: { id }, data: { active: false } });
  }

  /**
   * SINGLE POINT OF STOCK CHANGE.
   * ALL stock updates MUST go through this method — it always creates
   * an immutable StockMovement audit trail entry.
   *
   * @throws BadRequestException when stock is insufficient for 'out'/'transfer' type
   */
  async updateStok(
    productId: string,
    qty: number,
    type: 'in' | 'out' | 'adjustment' | 'transfer',
    note?: string,
    warehouseId?: string,
    referenceId?: string,
  ) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Produk ${productId} tidak ditemukan`);

    let newQty: number | null = null;

    if (warehouseId) {
      const existing = await this.prisma.stock.findUnique({
        where: { productId_warehouseId: { productId, warehouseId } },
      });
      const currentQty = Number(existing?.qty ?? 0);

      if (type === 'out' || type === 'transfer') {
        if (currentQty < qty) {
          throw new BadRequestException(
            `Stok tidak cukup untuk "${product.name}". Tersedia: ${currentQty}, Dibutuhkan: ${qty}`,
          );
        }
        newQty = currentQty - qty;
      } else if (type === 'in') {
        newQty = currentQty + qty;
      } else {
        newQty = qty;
      }

      await this.prisma.stock.upsert({
        where: { productId_warehouseId: { productId, warehouseId } },
        update: { qty: newQty },
        create: { productId, warehouseId, qty: newQty },
      });
    }

    await this.prisma.stockMovement.create({
      data: {
        productId,
        warehouseId: warehouseId ?? null,
        type,
        qty,
        note: note ?? '',
        referenceId: referenceId ?? null,
      },
    });

    return { productId, warehouseId, qty: newQty ?? qty, type };
  }

  /**
   * Transfer stock between two warehouses atomically.
   */
  async transferStock(
    productId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    qty: number,
    note?: string,
  ) {
    await this.updateStok(productId, qty, 'transfer', `${note ?? 'Transfer'} (OUT)`, fromWarehouseId);
    await this.updateStok(productId, qty, 'in', `${note ?? 'Transfer'} (IN)`, toWarehouseId);
    return { productId, fromWarehouseId, toWarehouseId, qty };
  }

  async getBrands() {
    const brands = await this.prisma.product.findMany({
      where: { brand: { not: null } },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    });
    return brands.map((b) => b.brand).filter(Boolean);
  }

  async getStockMovements(query: any) {
    const { productId, type, warehouseId, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (warehouseId) where.warehouseId = warehouseId;
    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where, skip, take: Number(limit),
        include: { product: true, warehouse: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getStockOpnames(query: any) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.stockOpname.findMany({
        where, skip, take: Number(limit),
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockOpname.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async createStockOpname(dto: any) {
    return this.prisma.stockOpname.create({
      data: {
        date: dto.date,
        warehouseId: dto.warehouseId,
        note: dto.note,
        items: { create: dto.items },
      },
      include: { items: { include: { product: true } } },
    });
  }

  async getWarehouses() {
    return this.prisma.warehouse.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
  }

  async getCategories() {
    return this.prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async getUnits() {
    return this.prisma.productUnit.findMany({ orderBy: { name: 'asc' } });
  }

  async getStats() {
    const totalProducts = await this.prisma.product.count({ where: { active: true } });
    const totalStokResult = await this.prisma.stock.aggregate({ _sum: { qty: true } });
    const productStocks = await this.prisma.stock.groupBy({
      by: ['productId'],
      _sum: { qty: true },
    });
    const lowStock = productStocks.filter((ps) => Number(ps._sum.qty ?? 0) <= 5).length;
    return { totalProducts, lowStock, totalStok: Number(totalStokResult._sum.qty ?? 0) };
  }

  async getStockSummary(warehouseId?: string) {
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    return this.prisma.stock.findMany({
      where,
      include: { product: { include: { category: true, unit: true } }, warehouse: true },
      orderBy: { product: { name: 'asc' } },
    });
  }
}
