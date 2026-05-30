import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { InventoryService } from '../inventory/inventory.service.js';

@Injectable()
export class PurchasingService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(InventoryService) private readonly inventoryService: InventoryService,
  ) {}

  async generatePONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const nextMonth = Number(month) === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`;
    const latest = await this.prisma.purchaseOrder.findFirst({
      where: { createdAt: { gte: new Date(`${year}-${month}-01`), lt: new Date(nextMonth) } },
      orderBy: { createdAt: 'desc' },
    });
    const seq = latest ? Number(latest.noPo.split('/')[3]) + 1 : 1;
    return `PO/${year}/${month}/${String(seq).padStart(4, '0')}`;
  }

  async getPurchaseOrders(query: any) {
    const { search, status, supplierId, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) where.noPo = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where, skip, take: Number(limit),
        include: { supplier: true, warehouse: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getPurchaseOrder(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, warehouse: true, items: { include: { product: true } }, goodsReceipts: true },
    });
    if (!po) throw new NotFoundException('PO tidak ditemukan');
    return po;
  }

  async createPurchaseOrder(dto: any) {
    const { items = [], discountPercentage = 0, ...poData } = dto;
    const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.hargaBeli)), 0);
    const discount = subtotal * (Number(discountPercentage) / 100);
    const tax = (subtotal - discount) * 0.11;
    const totalHarga = subtotal - discount + tax;
    const noPo = await this.generatePONumber();
    const itemsWithSubtotal = items.map((it: any) => ({
      ...it,
      subtotal: it.subtotal ?? Number(it.qty) * Number(it.hargaBeli),
    }));
    return this.prisma.purchaseOrder.create({
      data: { ...poData, noPo, totalHarga, items: { create: itemsWithSubtotal } },
      include: { supplier: true, items: { include: { product: true } } },
    });
  }

  async updatePurchaseOrder(id: string, dto: any) {
    return this.prisma.purchaseOrder.update({ where: { id }, data: dto });
  }

  async approvePurchaseOrder(id: string, userId: string) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'approved', approvedBy: userId, approvedAt: new Date() },
    });
  }

  async cancelPurchaseOrder(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException('PO tidak ditemukan');
    if (po.status === 'received') throw new BadRequestException('PO yang sudah diterima tidak dapat dibatalkan');
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status: 'cancelled' } });
  }

  async changeStatus(id: string, status: string) {
    const allowed = ['sent', 'approved', 'partial', 'received', 'cancelled'];
    if (!allowed.includes(status)) throw new BadRequestException('Status tidak valid');
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status } });
  }

  async getGoodsReceipts(query: any) {
    const { poId, status, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (poId) where.purchaseOrderId = poId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.goodsReceipt.findMany({
        where, skip, take: Number(limit),
        include: { purchaseOrder: { include: { supplier: true } }, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.goodsReceipt.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async createGoodsReceipt(dto: any) {
    const { items, ...grData } = dto;
    const noGr = `GR/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`;
    return this.prisma.goodsReceipt.create({
      data: { ...grData, noGr, items: { create: items ?? [] } },
      include: { purchaseOrder: true, items: { include: { product: true } } },
    });
  }

  /**
   * PURCHASE FLOW — STEP 3: Confirm Goods Receipt → trigger StockMovement IN
   *
   * Flow: PurchaseOrder → GoodsReceipt → [confirmGoodsReceipt] → StockMovement IN → Stock Updated
   *
   * For each item with a productId and qtyReceived > 0:
   *   - Calls InventoryService.updateStok(type: 'in') which creates StockMovement
   *   - Updates PurchaseOrderItem.qtyReceived
   * Then updates GR status to 'confirmed' and PO status to 'received'.
   */
  async confirmGoodsReceipt(id: string, warehouseId?: string) {
    const gr = await this.prisma.goodsReceipt.findUnique({
      where: { id },
      include: {
        purchaseOrder: { include: { warehouse: true } },
        items: { include: { product: true } },
      },
    });
    if (!gr) throw new NotFoundException('Goods Receipt tidak ditemukan');
    if (gr.status === 'confirmed') throw new BadRequestException('Goods Receipt sudah dikonfirmasi');

    const targetWarehouseId = warehouseId ?? gr.purchaseOrder.warehouseId;
    if (!targetWarehouseId) {
      throw new BadRequestException('Warehouse harus ditentukan untuk penerimaan barang');
    }

    const movements: any[] = [];

    for (const item of gr.items) {
      if (!item.productId || item.qtyReceived <= 0) continue;

      const movement = await this.inventoryService.updateStok(
        item.productId,
        item.qtyReceived,
        'in',
        `Penerimaan: ${gr.noGr} | PO: ${gr.purchaseOrder.noPo}`,
        targetWarehouseId,
        gr.id,
      );
      movements.push(movement);

      await this.prisma.purchaseOrderItem.updateMany({
        where: { purchaseOrderId: gr.purchaseOrderId, productId: item.productId },
        data: { qtyReceived: { increment: item.qtyReceived } },
      });
    }

    const [confirmedGr] = await Promise.all([
      this.prisma.goodsReceipt.update({
        where: { id },
        data: { status: 'confirmed' },
        include: { items: { include: { product: true } }, purchaseOrder: true },
      }),
      this.prisma.purchaseOrder.update({
        where: { id: gr.purchaseOrderId },
        data: { status: 'received' },
      }),
    ]);

    return { goodsReceipt: confirmedGr, movements, warehouseId: targetWarehouseId };
  }

  async getStats() {
    const [total, pending, approved] = await Promise.all([
      this.prisma.purchaseOrder.count(),
      this.prisma.purchaseOrder.count({ where: { status: 'draft' } }),
      this.prisma.purchaseOrder.count({ where: { status: 'approved' } }),
    ]);
    const totalValue = await this.prisma.purchaseOrder.aggregate({ _sum: { totalHarga: true } });
    return { total, pending, approved, totalValue: totalValue._sum.totalHarga ?? 0 };
  }

  async getSuppliers(query: any) {
    const { search, active, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (active !== 'false') where.active = true;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({ where, skip, take: Number(limit), orderBy: { name: 'asc' } }),
      this.prisma.supplier.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async createSupplier(dto: any) { return this.prisma.supplier.create({ data: dto }); }
  async updateSupplier(id: string, dto: any) { return this.prisma.supplier.update({ where: { id }, data: dto }); }
  async deleteSupplier(id: string) { return this.prisma.supplier.update({ where: { id }, data: { active: false } }); }
}
