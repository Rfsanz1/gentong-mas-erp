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
