import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { KledoService } from '../../integrations/kledo/kledo.service.js';
import { InventoryService } from '../inventory/inventory.service.js';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(KledoService) private readonly kledo: KledoService,
    @Inject(InventoryService) private readonly inventoryService: InventoryService,
  ) {}

  async getOrders(query: any) {
    const { search, status, salesName, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) where.namaCustomer = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (salesName) where.salesName = salesName;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where, skip, take: Number(limit),
        include: { customer: true, orderItems: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getOrder(id: number) {
    const o = await this.prisma.order.findUnique({
      where: { id },
      include: { customer: true, orderItems: { include: { product: true } } },
    });
    if (!o) throw new NotFoundException('Order tidak ditemukan');
    return o;
  }

  async createOrder(dto: any) {
    const { items, ...orderData } = dto;
    const dbItems = (items ?? []).map((it: any) => ({
      nama: it.nama ?? it.name ?? '',
      qty: Number(it.qty) || 1,
      harga: it.harga ?? it.price ?? 0,
      subtotal: it.subtotal ?? (Number(it.qty) * Number(it.harga ?? it.price ?? 0)),
      ...(it.productId ? { productId: it.productId } : {}),
    }));
    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        items: items ?? [],
        orderItems: dbItems.length ? { create: dbItems } : undefined,
      },
      include: { orderItems: { include: { product: true } } },
    });

    this.pushInvoiceToKledo(order, items ?? []).catch((e) =>
      this.logger.warn('Kledo invoice push gagal (non-fatal): ' + e.message),
    );

    return order;
  }

  private async pushInvoiceToKledo(order: any, items: any[]) {
    const kledoItems = items.map((it: any) => ({
      kledoProductId: it.kledoProductId ?? it.product?.kledoProductId ?? null,
      nama: it.nama ?? it.name ?? '',
      qty: Number(it.qty) || 1,
      harga: Number(it.harga) || Number(it.price) || 0,
      unitId: it.unitId ?? 1,
    }));

    const result = await this.kledo.createInvoice({
      namaCustomer: order.namaCustomer,
      noHp: order.noHp,
      orderId: order.id,
      items: kledoItems,
    });

    if (result.success && result.kledoInvoiceId) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { kledoInvoiceId: result.kledoInvoiceId?.toString() },
      }).catch(() => null);
    }

    this.logger.log(`Kledo invoice push: orderId=${order.id} result=${JSON.stringify(result)}`);
    return result;
  }

  async updateOrder(id: number, dto: any) {
    return this.prisma.order.update({ where: { id }, data: dto });
  }

  async deleteOrder(id: number) {
    return this.prisma.order.update({ where: { id }, data: { status: 'cancelled' } });
  }

  async updatePengiriman(id: number, dto: { statusPengiriman: string; driverName?: string }) {
    return this.prisma.order.update({ where: { id }, data: dto });
  }

  /**
   * SALES FLOW — STEP 3: Confirm Delivery → trigger StockMovement OUT
   *
   * Flow: Order → Invoice → [confirmOrderDelivery] → StockMovement OUT → Stock Updated
   *
   * For each OrderItem with a productId:
   *   - Calls InventoryService.updateStok(type: 'out') which creates StockMovement
   *   - Throws if stock is insufficient (no silent deduction)
   * Then updates Order status to 'delivered'.
   */
  async confirmOrderDelivery(id: number, warehouseId?: string, note?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    if (order.status === 'delivered') throw new BadRequestException('Order sudah dikonfirmasi pengirimannya');
    if (order.status === 'cancelled') throw new BadRequestException('Order sudah dibatalkan');

    const movements: any[] = [];

    if (warehouseId) {
      for (const item of order.orderItems) {
        if (!item.productId || item.qty <= 0) continue;
        const movement = await this.inventoryService.updateStok(
          item.productId,
          item.qty,
          'out',
          note ?? `Penjualan Order #${order.id} | ${order.namaCustomer}`,
          warehouseId,
          String(order.id),
        );
        movements.push(movement);
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: 'delivered', statusPengiriman: 'selesai' },
    });

    return { order: updatedOrder, movements, warehouseId };
  }

  async uploadBuktiTransfer(id: number, base64Data: string) {
    return this.prisma.order.update({
      where: { id },
      data: { buktiTransferData: base64Data },
    });
  }

  async getCustomerLocation(token: string) {
    const order = await this.prisma.order.findFirst({
      where: { lokasiToken: token },
      select: { lokasiLat: true, lokasiLng: true, namaCustomer: true },
    });
    if (!order) throw new NotFoundException('Token tidak valid');
    return order;
  }

  async saveCustomerLocation(token: string, lat: string, lng: string) {
    return this.prisma.order.updateMany({
      where: { lokasiToken: token },
      data: { lokasiLat: lat, lokasiLng: lng, lokasiUpdatedAt: new Date() },
    });
  }

  async sendWhatsAppNotification(order: any) {
    if (!process.env.FONNTE_TOKEN) return { skipped: true, reason: 'FONNTE_TOKEN tidak dikonfigurasi' };
    try {
      const resp = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { Authorization: process.env.FONNTE_TOKEN },
        body: JSON.stringify({
          target: order.nomorTelepon,
          message: `Halo ${order.namaCustomer}, pesanan Anda #${order.orderId ?? order.id} sedang diproses.`,
        }),
      });
      return await resp.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }

  async getSales(query: any) {
    const { search, status, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) where.noFaktur = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.sale.findMany({
        where, skip, take: Number(limit),
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sale.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getSalesSummary(query: any) {
    const { from, to } = query;
    const where: any = {};
    if (from) where.createdAt = { gte: new Date(from) };
    if (to) where.createdAt = { ...where.createdAt, lte: new Date(to) };
    const [totalOrders, totalRevenue, pendingOrders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({ _sum: { totalHarga: true }, where: { ...where, status: { not: 'cancelled' } } }),
      this.prisma.order.count({ where: { ...where, status: 'pending' } }),
    ]);
    return { totalOrders, totalRevenue: totalRevenue._sum.totalHarga ?? 0, pendingOrders };
  }

  async getSalesList() {
    const salesUsers = await this.prisma.user.findMany({
      where: { active: true, role: { name: { in: ['sales', 'Sales', 'sales manager', 'Sales Manager'] } } },
      select: { id: true, name: true, email: true },
    });
    return salesUsers.length > 0 ? salesUsers : [];
  }
}
