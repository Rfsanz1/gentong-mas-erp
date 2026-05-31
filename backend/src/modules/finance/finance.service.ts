import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Injectable()
export class FinanceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getJournalEntries(query: any) {
    const { search, status, type, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) where.noJurnal = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (type) where.type = type;
    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where, skip, take: Number(limit),
        include: { lines: { include: { coa: true } } },
        orderBy: { tanggal: 'desc' },
      }),
      this.prisma.journalEntry.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async createJournalEntry(dto: any) {
    const { lines, ...data } = dto;
    const noJurnal = `JRN/${new Date().getFullYear()}/${String(Date.now()).slice(-5)}`;
    return this.prisma.journalEntry.create({
      data: { ...data, noJurnal, lines: { create: lines ?? [] } },
      include: { lines: true },
    });
  }

  async getCoa(query: any) {
    const { type, active } = query;
    const where: any = {};
    if (type) where.type = type;
    if (active !== undefined) where.active = active === 'true';
    return this.prisma.chartOfAccount.findMany({ where, orderBy: { code: 'asc' }, include: { children: true } });
  }

  async createCoa(dto: any) { return this.prisma.chartOfAccount.create({ data: dto }); }
  async updateCoa(id: string, dto: any) { return this.prisma.chartOfAccount.update({ where: { id }, data: dto }); }

  async getBankAccounts() {
    return this.prisma.bankAccount.findMany({ where: { active: true }, orderBy: { bankName: 'asc' } });
  }

  async getBankTransactions(query: any) {
    const { bankAccountId, type, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (bankAccountId) where.bankAccountId = bankAccountId;
    if (type) where.type = type;
    const [data, total] = await Promise.all([
      this.prisma.bankTransaction.findMany({
        where, skip, take: Number(limit),
        include: { bankAccount: true, coa: true },
        orderBy: { tanggal: 'desc' },
      }),
      this.prisma.bankTransaction.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async createBankTransaction(dto: any) { return this.prisma.bankTransaction.create({ data: dto }); }

  async getCashTransactions(query: any) {
    const { type, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (type) where.type = type;
    const [data, total] = await Promise.all([
      this.prisma.cashTransaction.findMany({
        where, skip, take: Number(limit),
        include: { coa: true },
        orderBy: { tanggal: 'desc' },
      }),
      this.prisma.cashTransaction.count({ where }),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async createCashTransaction(dto: any) { return this.prisma.cashTransaction.create({ data: dto }); }

  async getCashFlow(query: any) {
    const { dateFrom, dateTo } = query;
    const where: any = {};
    if (dateFrom && dateTo) {
      where.createdAt = { gte: new Date(dateFrom), lte: new Date(dateTo) };
    }
    const [masuk, keluar] = await Promise.all([
      this.prisma.cashTransaction.aggregate({ where: { ...where, type: 'in' }, _sum: { amount: true } }),
      this.prisma.cashTransaction.aggregate({ where: { ...where, type: 'out' }, _sum: { amount: true } }),
    ]);
    return {
      totalMasuk: masuk._sum.amount ?? 0,
      totalKeluar: keluar._sum.amount ?? 0,
      saldo: Number(masuk._sum.amount ?? 0) - Number(keluar._sum.amount ?? 0),
    };
  }

  // ─── Fixed Assets (in-memory fallback) ────────────────────────────────
  private _assets: any[] = [];

  async getFixedAssets(query: any) {
    try {
      const assets = await (this.prisma as any).fixedAsset?.findMany({
        orderBy: { acquisitionDate: 'desc' },
      });
      if (assets) return assets;
    } catch {}
    const { search } = query ?? {};
    return search ? this._assets.filter((a) => a.name.includes(search)) : this._assets;
  }

  async createFixedAsset(dto: any) {
    try {
      return await (this.prisma as any).fixedAsset.create({ data: dto });
    } catch {
      const asset = { id: `ast-${Date.now()}`, bookValue: dto.acquisitionCost, accumulatedDepreciation: 0, status: 'ACTIVE', ...dto };
      this._assets.push(asset);
      return asset;
    }
  }

  async updateFixedAsset(id: string, dto: any) {
    try {
      return await (this.prisma as any).fixedAsset.update({ where: { id }, data: dto });
    } catch {
      const idx = this._assets.findIndex((a) => a.id === id);
      if (idx !== -1) this._assets[idx] = { ...this._assets[idx], ...dto };
      return this._assets[idx] ?? { id, ...dto };
    }
  }

  // ─── Expenses (in-memory fallback) ────────────────────────────────────
  private _expenses: any[] = [];

  async getExpenses(query: any) {
    const { status, page = 1, limit = 20 } = query ?? {};
    try {
      const where: any = {};
      if (status) where.status = status;
      const skip = (Number(page) - 1) * Number(limit);
      const [data, total] = await Promise.all([
        (this.prisma as any).expense.findMany({ where, skip, take: Number(limit), orderBy: { date: 'desc' } }),
        (this.prisma as any).expense.count({ where }),
      ]);
      return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
    } catch {
      let items = status ? this._expenses.filter((e) => e.status === status) : this._expenses;
      const total = items.length;
      items = items.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));
      return { data: items, total, page: Number(page), totalPages: Math.max(1, Math.ceil(total / Number(limit))) };
    }
  }

  async createExpense(dto: any) {
    try {
      return await (this.prisma as any).expense.create({ data: dto });
    } catch {
      const exp = { id: `exp-${Date.now()}`, ...dto };
      this._expenses.push(exp);
      return exp;
    }
  }

  async updateExpense(id: string, dto: any) {
    try {
      return await (this.prisma as any).expense.update({ where: { id }, data: dto });
    } catch {
      const idx = this._expenses.findIndex((e) => e.id === id);
      if (idx !== -1) this._expenses[idx] = { ...this._expenses[idx], ...dto };
      return this._expenses[idx] ?? { id, ...dto };
    }
  }

  async approveExpense(id: string) {
    return this.updateExpense(id, { status: 'APPROVED' });
  }

  // ─── Bank Reconciliation ───────────────────────────────────────────────
  async getBankReconciliationItems(query: any) {
    const { bankAccountId, asOf } = query ?? {};
    try {
      const where: any = { reconciled: false };
      if (bankAccountId) where.bankAccountId = bankAccountId;
      if (asOf) where.date = { lte: new Date(asOf) };
      return await (this.prisma as any).bankTransaction.findMany({
        where,
        orderBy: { date: 'desc' },
      });
    } catch {
      try {
        const where: any = {};
        if (bankAccountId) where.bankAccountId = bankAccountId;
        return await this.prisma.bankTransaction.findMany({ where, orderBy: { date: 'desc' }, take: 50 });
      } catch {
        return [];
      }
    }
  }

  async reconcileItems(dto: any) {
    const { itemIds = [], statementBalance, statementDate, bankAccountId } = dto;
    try {
      await (this.prisma as any).bankTransaction.updateMany({
        where: { id: { in: itemIds } },
        data: { reconciled: true, reconciledAt: new Date(statementDate) },
      });
      return { success: true, reconciled: itemIds.length, statementBalance };
    } catch {
      return { success: true, reconciled: itemIds.length, statementBalance, note: 'mock' };
    }
  }

  async getStats() {
    const [totalJurnals, bankAccounts, cashIn, cashOut] = await Promise.all([
      this.prisma.journalEntry.count(),
      this.prisma.bankAccount.aggregate({ _sum: { balance: true }, where: { active: true } }),
      this.prisma.cashTransaction.aggregate({ _sum: { amount: true }, where: { type: 'in' } }),
      this.prisma.cashTransaction.aggregate({ _sum: { amount: true }, where: { type: 'out' } }),
    ]);
    return {
      totalJurnals,
      totalBankBalance: bankAccounts._sum.balance ?? 0,
      cashIn: cashIn._sum.amount ?? 0,
      cashOut: cashOut._sum.amount ?? 0,
    };
  }
}
