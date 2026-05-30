import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

@Injectable()
export class FinancialReportService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private async getBalancesUpTo(dateTo?: string): Promise<Map<string, number>> {
    const accounts = await this.prisma.account.findMany({ where: { isActive: true } });
    const where: any = { journal: { status: 'POSTED' } };
    if (dateTo) where.journal.tanggal = { lte: new Date(dateTo) };
    return this._buildMap(accounts, where);
  }

  private async getBalancesInPeriod(dateFrom: string, dateTo: string): Promise<Map<string, number>> {
    const accounts = await this.prisma.account.findMany({ where: { isActive: true } });
    const where: any = {
      journal: { status: 'POSTED', tanggal: { gte: new Date(dateFrom), lte: new Date(dateTo) } },
    };
    return this._buildMap(accounts, where);
  }

  private async _buildMap(accounts: any[], where: any): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    const results = await Promise.all(
      accounts.map((acc) =>
        this.prisma.journalLine
          .aggregate({ where: { ...where, accountId: acc.id }, _sum: { debit: true, kredit: true } })
          .then((agg) => ({
            id: acc.id,
            normalBalance: acc.normalBalance,
            d: Number(agg._sum.debit || 0),
            k: Number(agg._sum.kredit || 0),
          })),
      ),
    );
    for (const r of results) {
      map.set(r.id, r.normalBalance === 'DEBIT' ? r.d - r.k : r.k - r.d);
    }
    return map;
  }

  private groupByType(accounts: any[], balances: Map<string, number>) {
    return accounts.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      type: a.type,
      balance: balances.get(a.id) || 0,
    }));
  }

  async getBalanceSheet(date?: string) {
    const dateTo = date || new Date().toISOString().split('T')[0];
    const balances = await this.getBalancesUpTo(dateTo);

    const [assets, liabilities, equities] = await Promise.all([
      this.prisma.account.findMany({ where: { type: 'ASSET', isActive: true }, orderBy: { code: 'asc' } }),
      this.prisma.account.findMany({ where: { type: 'LIABILITY', isActive: true }, orderBy: { code: 'asc' } }),
      this.prisma.account.findMany({ where: { type: 'EQUITY', isActive: true }, orderBy: { code: 'asc' } }),
    ]);

    const aList = this.groupByType(assets, balances);
    const lList = this.groupByType(liabilities, balances);
    const eList = this.groupByType(equities, balances);

    const totalAssets = aList.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = lList.reduce((s, a) => s + a.balance, 0);
    const totalEquity = eList.reduce((s, a) => s + a.balance, 0);

    return {
      date: dateTo,
      assets: { items: aList, total: totalAssets },
      liabilities: { items: lList, total: totalLiabilities },
      equity: { items: eList, total: totalEquity },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1,
    };
  }

  async getIncomeStatement(dateFrom: string, dateTo: string) {
    const balances = await this.getBalancesInPeriod(dateFrom, dateTo);

    const [revenues, allExpenses] = await Promise.all([
      this.prisma.account.findMany({ where: { type: 'REVENUE', isActive: true }, orderBy: { code: 'asc' } }),
      this.prisma.account.findMany({ where: { type: 'EXPENSE', isActive: true }, orderBy: { code: 'asc' } }),
    ]);

    const revenueItems = this.groupByType(revenues, balances);
    const expenseItems = this.groupByType(allExpenses, balances);

    const hppItems = expenseItems.filter((e) => e.code.startsWith('5'));
    const opexItems = expenseItems.filter((e) => e.code.startsWith('6'));
    const otherExpItems = expenseItems.filter((e) => e.code.startsWith('7'));

    const totalRevenue = revenueItems.reduce((s, a) => s + a.balance, 0);
    const totalHPP = hppItems.reduce((s, a) => s + a.balance, 0);
    const grossProfit = totalRevenue - totalHPP;
    const totalOpex = opexItems.reduce((s, a) => s + a.balance, 0);
    const totalOtherExp = otherExpItems.reduce((s, a) => s + a.balance, 0);
    const netIncome = grossProfit - totalOpex - totalOtherExp;

    return {
      period: { dateFrom, dateTo },
      revenues: { items: revenueItems, total: totalRevenue },
      hpp: { items: hppItems, total: totalHPP },
      grossProfit,
      operationalExpenses: { items: opexItems, total: totalOpex },
      otherExpenses: { items: otherExpItems, total: totalOtherExp },
      netIncome,
    };
  }

  async getCashFlow(dateFrom: string, dateTo: string) {
    const income = await this.getIncomeStatement(dateFrom, dateTo);
    const balances = await this.getBalancesInPeriod(dateFrom, dateTo);

    const sumByPrefix = async (prefix: string) => {
      const accs = await this.prisma.account.findMany({
        where: { isActive: true, code: { startsWith: prefix } },
      });
      return accs.reduce((s, a) => s + (balances.get(a.id) || 0), 0);
    };

    const [deltaReceivables, deltaInventory, deltaPayables, deltaFixedAssets, deltaLoans] =
      await Promise.all([
        sumByPrefix('12'),
        sumByPrefix('14'),
        sumByPrefix('21'),
        sumByPrefix('15'),
        sumByPrefix('22'),
      ]);

    const operatingCF =
      income.netIncome - deltaReceivables - deltaInventory + deltaPayables;
    const investingCF = -deltaFixedAssets;
    const financingCF = deltaLoans;
    const netCF = operatingCF + investingCF + financingCF;

    return {
      period: { dateFrom, dateTo },
      operating: {
        netIncome: income.netIncome,
        adjustments: {
          perubahanPiutang: -deltaReceivables,
          perubahanPersediaan: -deltaInventory,
          perubahanHutangDagang: deltaPayables,
        },
        total: operatingCF,
      },
      investing: {
        perubahanAsetTetap: -deltaFixedAssets,
        total: investingCF,
      },
      financing: {
        perubahanHutangBank: deltaLoans,
        total: financingCF,
      },
      netCashFlow: netCF,
    };
  }
}
