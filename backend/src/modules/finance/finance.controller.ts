import { Controller, Get, Post, Put, Delete, Param, Body, Query, Inject, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { FinanceService } from './finance.service.js';
import { AccountService } from './accounts/account.service.js';
import { BudgetService } from './accounts/budget.service.js';
import { CreditLimitService } from './accounts/credit-limit.service.js';
import { JournalService } from './journals/journal.service.js';
import { LedgerService } from './journals/ledger.service.js';
import { FinancialReportService } from './reports/financial-report.service.js';
import { ARAgingService } from './aging/ar-aging.service.js';
import { APAgingService } from './aging/ap-aging.service.js';

@ApiTags('finance')
@ApiBearerAuth('JWT')
@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(
    @Inject(FinanceService) private readonly svc: FinanceService,
    @Inject(AccountService) private readonly accountSvc: AccountService,
    @Inject(JournalService) private readonly journalSvc: JournalService,
    @Inject(LedgerService) private readonly ledgerSvc: LedgerService,
    @Inject(FinancialReportService) private readonly reportSvc: FinancialReportService,
    @Inject(ARAgingService) private readonly arAgingSvc: ARAgingService,
    @Inject(APAgingService) private readonly apAgingSvc: APAgingService,
    @Inject(BudgetService) private readonly budgetSvc: BudgetService,
    @Inject(CreditLimitService) private readonly creditSvc: CreditLimitService,
  ) {}

  // ─── Stats ────────────────────────────────────────────────────────────
  @Get('stats') getStats() { return this.svc.getStats(); }

  // ─── Legacy journal entries (ChartOfAccount) ─────────────────────────
  @Get('journal-entries') getJournals(@Query() q: any) { return this.svc.getJournalEntries(q); }
  @Post('journal-entries') createJournalEntry(@Body() dto: any) { return this.svc.createJournalEntry(dto); }

  // ─── Legacy COA ───────────────────────────────────────────────────────
  @Get('coa') getCoa(@Query() q: any) { return this.svc.getCoa(q); }
  @Post('coa') createCoa(@Body() dto: any) { return this.svc.createCoa(dto); }
  @Put('coa/:id') updateCoa(@Param('id') id: string, @Body() dto: any) { return this.svc.updateCoa(id, dto); }

  // ─── Bank & Cash ──────────────────────────────────────────────────────
  @Get('bank-accounts') getBankAccounts() { return this.svc.getBankAccounts(); }
  @Get('bank-transactions') getBankTx(@Query() q: any) { return this.svc.getBankTransactions(q); }
  @Post('bank-transactions') createBankTx(@Body() dto: any) { return this.svc.createBankTransaction(dto); }
  @Get('cash-transactions') getCashTx(@Query() q: any) { return this.svc.getCashTransactions(q); }
  @Post('cash-transactions') createCashTx(@Body() dto: any) { return this.svc.createCashTransaction(dto); }
  @Get('cash-flow') getCashFlow(@Query() q: any) { return this.svc.getCashFlow(q); }

  // ─── Accounts (Chart of Accounts — double entry) ─────────────────────
  @Get('accounts') getAccounts(@Query() q: any) { return this.accountSvc.findAll(q); }
  @Get('accounts/tree') getAccountTree() { return this.accountSvc.getTree(); }
  @Get('accounts/:id') getAccount(@Param('id') id: string) { return this.accountSvc.findOne(id); }
  @Post('accounts') createAccount(@Body() dto: any) { return this.accountSvc.create(dto); }
  @Put('accounts/:id') updateAccount(@Param('id') id: string, @Body() dto: any) { return this.accountSvc.update(id, dto); }
  @Delete('accounts/:id') removeAccount(@Param('id') id: string) { return this.accountSvc.remove(id); }

  // ─── Journals (double entry) ──────────────────────────────────────────
  @Get('journals') getJournalList(@Query() q: any) { return this.journalSvc.findAll(q); }
  @Get('journals/:id') getJournal(@Param('id') id: string) { return this.journalSvc.findOne(id); }
  @Post('journals') createJournal(@Body() dto: any) { return this.journalSvc.createJournal(dto); }
  @Post('journals/:id/post') postJournal(@Param('id') id: string) { return this.journalSvc.postJournal(id); }
  @Post('journals/:id/cancel') cancelJournal(@Param('id') id: string) { return this.journalSvc.cancelJournal(id); }
  @Post('journals/:id/reverse') reverseJournal(@Param('id') id: string) { return this.journalSvc.reverseJournal(id); }

  // ─── Ledger ───────────────────────────────────────────────────────────
  @Get('ledger/:accountId') getGeneralLedger(@Param('accountId') accountId: string, @Query() q: any) {
    return this.ledgerSvc.getGeneralLedger(accountId, q.dateFrom, q.dateTo);
  }
  @Get('trial-balance') getTrialBalance(@Query() q: any) {
    return this.ledgerSvc.getTrialBalance(q.dateFrom, q.dateTo);
  }

  // ─── Financial Reports ────────────────────────────────────────────────
  @Get('reports/balance-sheet') getBalanceSheet(@Query() q: any) { return this.reportSvc.getBalanceSheet(q.date); }
  @Get('reports/income-statement') getIncomeStatement(@Query() q: any) { return this.reportSvc.getIncomeStatement(q.dateFrom, q.dateTo); }
  @Get('reports/cash-flow') getCashFlowReport(@Query() q: any) { return this.reportSvc.getCashFlow(q.dateFrom, q.dateTo); }

  // ─── AR/AP Aging ─────────────────────────────────────────────────────
  @Get('ar-aging') getARAgingReport(@Query() q: any) { return this.arAgingSvc.getARAgingReport(q.asOf ? new Date(q.asOf) : undefined, q.branchId); }
  @Get('ap-aging') getAPAgingReport(@Query() q: any) { return this.apAgingSvc.getAPAgingReport(q.asOf ? new Date(q.asOf) : undefined, q.branchId); }

  // ─── Credit Limit ─────────────────────────────────────────────────────
  @Get('credit-limits') getCreditLimits(@Query() q: any) { return this.creditSvc.getCreditLimits(q); }
  @Post('credit-limits/:customerId/set') setCreditLimit(@Param('customerId') id: string, @Body() dto: { creditLimit: number }) {
    return this.creditSvc.setCreditLimit(id, dto.creditLimit);
  }
  @Post('credit-limits/:customerId/check') checkCredit(@Param('customerId') id: string, @Body() dto: { amount: number }) {
    return this.creditSvc.checkCreditLimit(id, dto.amount);
  }
  @Post('credit-limits/bulk') setBulkCreditLimit(@Body() dto: { items: { customerId: string; creditLimit: number }[] }) {
    return this.creditSvc.setBulkCreditLimit(dto.items);
  }

  // ─── Budget ───────────────────────────────────────────────────────────
  @Get('budgets') getBudgets(@Query() q: any) { return this.budgetSvc.getBudgets(q); }
  @Get('budgets/:id') getBudget(@Param('id') id: string) { return this.budgetSvc.getBudget(id); }
  @Post('budgets') createBudget(@Body() dto: any) { return this.budgetSvc.createBudget(dto); }
  @Put('budgets/:id') updateBudget(@Param('id') id: string, @Body() dto: any) { return this.budgetSvc.updateBudget(id, dto); }
  @Post('budgets/:id/approve') approveBudget(@Param('id') id: string) { return this.budgetSvc.approveBudget(id); }
  @Get('budgets/:id/vs-actual') getBudgetVsActual(@Param('id') id: string) { return this.budgetSvc.getBudgetVsActual(id); }
  @Post('budgets/check-availability') checkBudget(@Body() dto: { accountId: string; amount: number; bulan: number; tahun: number }) {
    return this.budgetSvc.checkBudgetAvailability(dto.accountId, dto.amount, dto.bulan, dto.tahun);
  }

  // ─── Fixed Assets ─────────────────────────────────────────────────────
  @Get('fixed-assets') getAssets(@Query() q: any) { return { redirect: '/api/assets', q }; }
}
