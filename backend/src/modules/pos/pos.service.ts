import { Inject, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PosService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async login(username: string, password: string) {
    const user = await this.prisma.posUser.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) throw new UnauthorizedException('Username/password salah');
    const session = await this.prisma.posCashierSession.create({ data: { posUserId: user.id, modalAwal: 0 } });
    return { user: { id: user.id, name: user.name, role: user.role }, sessionId: session.id };
  }

  async getProducts(query: any) {
    const { search, categoryId, page = 1, limit = 50 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { active: true };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (categoryId) where.categoryId = categoryId;
    const [data, total] = await Promise.all([
      this.prisma.posProduct.findMany({ where, skip, take: Number(limit), include: { category: true }, orderBy: { name: 'asc' } }),
      this.prisma.posProduct.count({ where }),
    ]);
    return { data, total };
  }

  async getSales(query: any) {
    const { sessionId, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    const [data, total] = await Promise.all([
      this.prisma.posSale.findMany({ where, skip, take: Number(limit), include: { items: { include: { posProduct: true } }, posUser: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.posSale.count({ where }),
    ]);
    return { data, total };
  }

  async createSale(dto: any) {
    const { items, ...saleData } = dto;
    const noStruk = `STR/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`;
    const kembalian = Number(saleData.bayar) - Number(saleData.grandTotal);
    return this.prisma.posSale.create({
      data: { ...saleData, noStruk, kembalian, items: { create: items ?? [] } },
      include: { items: { include: { posProduct: true } } },
    });
  }

  async getDashboard() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [todaySales, totalRevenue, openSessions] = await Promise.all([
      this.prisma.posSale.count({ where: { createdAt: { gte: today } } }),
      this.prisma.posSale.aggregate({ _sum: { grandTotal: true }, where: { createdAt: { gte: today } } }),
      this.prisma.posCashierSession.count({ where: { status: 'open' } }),
    ]);
    return { todaySales, todayRevenue: totalRevenue._sum.grandTotal ?? 0, openSessions };
  }

  async getCategories() { return this.prisma.posCategory.findMany({ where: { active: true }, orderBy: { name: 'asc' } }); }
  async createProduct(dto: any) { return this.prisma.posProduct.create({ data: dto }); }
  async updateProduct(id: string, dto: any) { return this.prisma.posProduct.update({ where: { id }, data: dto }); }

  // ─── Sessions ─────────────────────────────────────────────────────────────

  async getSessions(query: any) {
    const { page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.prisma.posCashierSession.findMany({
        skip, take: Number(limit),
        include: { posUser: { select: { id: true, name: true } }, _count: { select: { sales: true } } },
        orderBy: { openedAt: 'desc' },
      }),
      this.prisma.posCashierSession.count(),
    ]);
    return {
      data: data.map(s => ({
        id: s.id,
        openedAt: s.openedAt,
        closedAt: s.closedAt,
        cashierName: s.posUser?.name ?? 'Kasir',
        openingCash: Number(s.modalAwal),
        closingCash: s.modalAkhir ? Number(s.modalAkhir) : undefined,
        totalTransactions: s._count.sales,
        totalRevenue: 0,
        status: s.status === 'open' ? 'active' : 'closed',
      })),
      total,
    };
  }

  async getActiveSession(currentUser: any) {
    const session = await this.prisma.posCashierSession.findFirst({
      where: { status: 'open' },
      include: { posUser: { select: { id: true, name: true } }, _count: { select: { sales: true } } },
      orderBy: { openedAt: 'desc' },
    });
    if (!session) return null;
    const revenue = await this.prisma.posSale.aggregate({
      where: { sessionId: session.id },
      _sum: { grandTotal: true },
    });
    return {
      id: session.id,
      openedAt: session.openedAt,
      cashierName: session.posUser?.name ?? 'Kasir',
      openingCash: Number(session.modalAwal),
      totalTransactions: session._count.sales,
      totalRevenue: Number(revenue._sum.grandTotal ?? 0),
      status: 'active',
    };
  }

  async openSession(dto: any, currentUser: any) {
    const user = await this.prisma.posUser.findFirst({ where: { active: true } });
    if (!user) throw new Error('Tidak ada POS user aktif');
    return this.prisma.posCashierSession.create({
      data: { posUserId: user.id, modalAwal: dto.openingCash ?? 0 },
    });
  }

  async getSession(id: string) {
    const session = await this.prisma.posCashierSession.findUnique({
      where: { id },
      include: {
        posUser: { select: { id: true, name: true } },
        _count: { select: { sales: true } },
      },
    });
    if (!session) return null;
    const revenue = await this.prisma.posSale.aggregate({
      where: { sessionId: id },
      _sum: { grandTotal: true },
    });
    const byMethod = await this.prisma.posSale.groupBy({
      by: ['metodeBayar'],
      where: { sessionId: id },
      _sum: { grandTotal: true },
    });
    const breakdown: Record<string, number> = { cash: 0, transfer: 0, card: 0, qris: 0 };
    for (const m of byMethod) {
      const key = (m.metodeBayar ?? 'tunai').toLowerCase().replace('tunai', 'cash').replace('kartu', 'card');
      breakdown[key] = (breakdown[key] ?? 0) + Number(m._sum.grandTotal ?? 0);
    }
    return {
      id: session.id,
      openedAt: session.openedAt,
      closedAt: session.closedAt,
      cashierName: session.posUser?.name ?? 'Kasir',
      openingCash: Number(session.modalAwal),
      closingCash: session.modalAkhir ? Number(session.modalAkhir) : undefined,
      totalTransactions: session._count.sales,
      totalRevenue: Number(revenue._sum.grandTotal ?? 0),
      status: session.status === 'open' ? 'active' : 'closed',
      breakdown,
    };
  }

  async closeSession(id: string, dto: any) {
    return this.prisma.posCashierSession.update({
      where: { id },
      data: { closedAt: new Date(), modalAkhir: dto.closingCash ?? 0, status: 'closed' },
    });
  }

  // ─── Reports ──────────────────────────────────────────────────────────────

  async getTodayReport() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sales = await this.prisma.posSale.findMany({
      where: { tanggal: { gte: today } },
      select: { grandTotal: true, metodeBayar: true, tanggal: true },
    });
    const hourly = Array.from({ length: 24 }, (_, h) => {
      const bucket = sales.filter(s => new Date(s.tanggal).getHours() === h);
      return { hour: h, count: bucket.length, revenue: bucket.reduce((sum, s) => sum + Number(s.grandTotal), 0) };
    }).filter(h => h.count > 0);
    const byMethod: Record<string, number> = {};
    for (const s of sales) {
      const m = s.metodeBayar ?? 'tunai';
      byMethod[m] = (byMethod[m] ?? 0) + Number(s.grandTotal);
    }
    return {
      totalRevenue: sales.reduce((sum, s) => sum + Number(s.grandTotal), 0),
      totalTransactions: sales.length,
      hourly,
      byMethod,
    };
  }
}
